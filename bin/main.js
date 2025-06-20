import { commandNames, getFiles } from "../hide/virtualFiles.js";
import { clc, colorCommand, sanitizeHtml } from "../libs/colors.js";
import { getDirectory, moveFiles, resolvePath, resolvePathParts, saveFiles } from "../libs/files.js";
import { parseCommand } from "../libs/parser.js";
import { error } from "../libs/errors.js";
import { CONFIG } from "../etc/config.js";

export const fileSystem = await getFiles();

const consoleOutput = document.getElementById('consoleOutput');
const currentCommandDisplay = document.getElementById('currentCommand');
const consoleCursor = document.getElementById('consoleCursor');
const cursorIcon = document.getElementById('cursorIcon');
const consolePrompt = document.getElementById('prompt');

let consoleBuffer = [ clc[CONFIG.mainMessageColor](CONFIG.mainMessage.join('\n')) ];
let currentCommand = '';
let cursorPosition = 0;
let isConsoleActive = false;

let currentPath = '/home/user';

let commandHistory = [];

let historyIndex = -1;

let isAwaitingInput = false;
let resolveAwaitingInput = null;


function setCurrentPath(newPath) {
    currentPath = newPath;
}

const commands = {};
const commandDocs = {};

function updateConsoleDisplay() {
    consoleOutput.innerHTML = sanitizeHtml(consoleBuffer.join('\n'), true);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

async function loadCommands() {
    for (const cmdName of commandNames) {
        try {
            const module = await import(`./${cmdName}.js`);
            const commandFunction = module[`${cmdName}Command`];
            const commandDoc = module[`${cmdName}Doc`];

            if (commandFunction) {
                if (commandDoc) commandDocs[cmdName] = commandDoc;

                commands[cmdName] = commandFunction;
            } else {
                console.warn(`Command function "${cmdName}Command" not found in ${cmdName}.js`);
            }
        } catch (error) {
            console.error(`Failed to load command ${cmdName}:`, error);
        }
    }
    updateConsolePrompt();
}

function setupConsoleKeyboardInput() {
    consoleCursor.style.display = 'inline';
    isConsoleActive = true;
    document.addEventListener('keydown', handleConsoleKeydown);
    updateConsoleDisplay(consoleBuffer.join('\n'));
}

function getElementWidthInPixels(element) {
    const computedStyle = getComputedStyle(element);
    return parseFloat(computedStyle.width);
}

function updateCommandDisplay(text) {
    let displayHtml = '';

    const fullColoredCommand = colorCommand(text, isAwaitingInput);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullColoredCommand;

    let nodes = Array.from(tempDiv.childNodes);
    let currentLength = 0;
    let newHtmlContent = [];
    let cursorCharFound = false;

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
            const nodeTextContent = node.textContent;
            if (!cursorCharFound && cursorPosition >= currentLength && cursorPosition < currentLength + nodeTextContent.length) {
                const relativeCursorPos = cursorPosition - currentLength;
                newHtmlContent.push(nodeTextContent.substring(0, relativeCursorPos));
                newHtmlContent.push(clc.black(nodeTextContent.charAt(relativeCursorPos)));
                newHtmlContent.push(nodeTextContent.substring(relativeCursorPos + 1));
                cursorCharFound = true;
            } else {
                newHtmlContent.push(nodeTextContent);
            }
            currentLength += nodeTextContent.length;
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
            const spanTextContent = node.textContent;
            if (!cursorCharFound && cursorPosition >= currentLength && cursorPosition < currentLength + spanTextContent.length) {
                const relativeCursorPos = cursorPosition - currentLength;
                const newSpan = document.createElement('span');
                newSpan.className = node.className;
                newSpan.innerHTML =
                    spanTextContent.substring(0, relativeCursorPos) +
                    clc.black(spanTextContent.charAt(relativeCursorPos)) +
                    spanTextContent.substring(relativeCursorPos + 1);
                newHtmlContent.push(newSpan.outerHTML);
                cursorCharFound = true;
            } else {
                newHtmlContent.push(node.outerHTML);
            }
            currentLength += spanTextContent.length;
        } else {
            newHtmlContent.push(node.outerHTML || node.textContent || '');
            currentLength += (node.textContent || '').length;
        }
    }

    if (cursorPosition === text.length && !cursorCharFound) {
        displayHtml = fullColoredCommand;
    } else if (text.length === 0) {
        displayHtml = '';
    } else {
        displayHtml = newHtmlContent.join('');
    }

    currentCommandDisplay.innerHTML = displayHtml;

    const promptWidth = getElementWidthInPixels(consolePrompt);
    const tempSpanMeasure = document.createElement('span');
    tempSpanMeasure.style.visibility = 'hidden';
    tempSpanMeasure.style.position = 'absolute';
    tempSpanMeasure.style.whiteSpace = 'pre';
    tempSpanMeasure.style.font = getComputedStyle(currentCommandDisplay).font;
    tempSpanMeasure.style.fontSize = getComputedStyle(currentCommandDisplay).fontSize;
    tempSpanMeasure.style.fontFamily = getComputedStyle(currentCommandDisplay).fontFamily;
    tempSpanMeasure.style.fontWeight = getComputedStyle(currentCommandDisplay).fontWeight;

    tempSpanMeasure.innerHTML = colorCommand(text.substring(0, cursorPosition), isAwaitingInput);
    document.body.appendChild(tempSpanMeasure);
    const cursorOffset = tempSpanMeasure.offsetWidth;
    document.body.removeChild(tempSpanMeasure);

    const cursorLeftPos = currentCommand.length > cursorPosition ? 0 : 2;

    consoleCursor.style.left = `${cursorLeftPos + getElementWidthInPixels(consolePrompt) + 20 + cursorOffset}px`;
    consoleCursor.style.display = 'inline';
    consoleCursor.style.animation = currentCommand.length > cursorPosition ? 'none' : 'blink-caret 1s step-end infinite'

    cursorIcon.style.height = currentCommand.length > cursorPosition ? '100%' : '8%';
}

async function input(promptText = '') {
    if (promptText) {
        consoleBuffer.push(promptText);
        updateConsoleDisplay();
    }

    isAwaitingInput = true;
    currentCommand = '';
    cursorPosition = 0;
    updateCommandDisplay('');

    return new Promise(resolve => {
        resolveAwaitingInput = (value) => {
            isAwaitingInput = false;
            resolveAwaitingInput = null;
            currentCommand = '';
            cursorPosition = 0;
            updateCommandDisplay('');
            consoleCursor.style.display = 'inline';
            updateConsoleDisplay();
            updateConsolePrompt();
            resolve(value);
        };
    });
}

async function handleConsoleKeydown(event) {
    if (!isConsoleActive) return;

    let key = event.key;

    if (key === 'Enter') {
        event.preventDefault();

        if (isAwaitingInput && resolveAwaitingInput) {
            consoleBuffer.push(`${`${clc.green("user@pc")}:${clc.blue(`${currentPath.replace('/home/user', '~')}`)}$ `} ${colorCommand(currentCommand, isAwaitingInput)}`);
            updateConsoleDisplay();
            resolveAwaitingInput(currentCommand);
            return;
        }

        if (currentCommand.trim() === '') return;
        commandHistory.push(currentCommand);
        if (commandHistory.length > 50) commandHistory.shift();
        historyIndex = commandHistory.length;

        consoleBuffer.push(`${`${clc.green("user@pc")}:${clc.blue(`${currentPath.replace('/home/user', '~')}`)}$ `} ${colorCommand(currentCommand, isAwaitingInput)}`);

        handleCommand(currentCommand).then(({ commandOutput, redirectToFile, appendMode }) => {
            if (commandOutput) {
                if (redirectToFile) {
                    const commandContext = getCommandContext();

                    const redirectPath = resolvePath(currentPath, redirectToFile);
                    const redirectFile = getDirectory(redirectPath);
                    if (!redirectFile) {
                        saveFiles(redirectPath, '-rw-u', commandOutput, commandContext).split('\n').forEach(line => consoleBuffer.push(line));
                    } else if (redirectFile.type[0] === '-') {
                        const redirectText = appendMode ? `${redirectFile.content}\n${commandOutput}` : commandOutput;
                        saveFiles(redirectPath, redirectFile.type, redirectText, commandContext).split('\n').forEach(line => consoleBuffer.push(line));
                    } else consoleBuffer.push(error.wrong_type);
                }
                commandOutput.split('\n').forEach(line => consoleBuffer.push(line));
            }

            currentCommand = '';
            cursorPosition = 0;
            updateCommandDisplay('');
            consoleCursor.style.display = 'inline';
            updateConsoleDisplay();
            updateConsolePrompt();
        }).catch(error => {
            console.error(error);
            consoleBuffer.push(clc.red(`ERROR: ${error}`));
            consoleBuffer.push("");
            updateConsoleDisplay();
            updateConsolePrompt();
            currentCommand = '';
            cursorPosition = 0;
            updateCommandDisplay('');
        });
    } else if (key === 'Backspace') {
        event.preventDefault();
        if (cursorPosition > 0) {
            if (event.ctrlKey) {
                currentCommand = "";
                cursorPosition = 0;
            } else {
                currentCommand = currentCommand.substring(0, cursorPosition - 1) + currentCommand.substring(cursorPosition);
                cursorPosition--;
            }
            updateCommandDisplay(currentCommand);
        }
    } else if (key === 'ArrowUp') {
        event.preventDefault();
        if (commandHistory.length > 0) {
            historyIndex = Math.max(0, historyIndex - 1);
            currentCommand = commandHistory[historyIndex];
            cursorPosition = currentCommand.length;
            updateCommandDisplay(currentCommand);
        }

    } else if (key === 'ArrowDown') {
        event.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            currentCommand = commandHistory[historyIndex];
            cursorPosition = currentCommand.length;
            updateCommandDisplay(currentCommand);
        } else if (historyIndex === commandHistory.length - 1) {
            historyIndex = commandHistory.length;
            currentCommand = '';
            updateCommandDisplay('');
        }

    } else if (event.ctrlKey && key.toLowerCase() === 'v') {
        event.preventDefault();

        try {
            const pastedText = await navigator.clipboard.readText();
            currentCommand += pastedText;
            cursorPosition = currentCommand.length;
            updateCommandDisplay(currentCommand);
            historyIndex = commandHistory.length;
        } catch (err) {
            console.error('Failed to read clipboard contents:', err);
        }

    } else if (key === 'ArrowLeft') {
        event.preventDefault();
        cursorPosition = Math[event.ctrlKey ? 'min' : 'max'](0, cursorPosition - 1);
        updateCommandDisplay(currentCommand);

    } else if (key === 'ArrowRight') {
        event.preventDefault();
        cursorPosition = Math[event.ctrlKey ? 'max' : 'min'](currentCommand.length, cursorPosition + 1);
        updateCommandDisplay(currentCommand);

    } else if (key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();

        currentCommand = currentCommand.substring(0, cursorPosition) + key + currentCommand.substring(cursorPosition);
        cursorPosition++;
        updateCommandDisplay(currentCommand);
        historyIndex = commandHistory.length;
    } else if (!(event.ctrlKey && key.toLowerCase() === 'c')) event.preventDefault();
}

function updateConsolePrompt() {
    if (!isAwaitingInput) {
        consolePrompt.innerHTML = `${clc.green("user@pc")}:${clc.blue(`${currentPath.replace('/home/user', '~')}`)}$ `;
    }
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

async function executeFile(cmdName, commandContext) {
    const {
        currentPath,
        resolvePath,
        getDirectory,
        consoleBuffer,
        updateConsoleDisplay,
        clc,
        handleCommand
    } = commandContext;

    let scriptPath = resolvePath(currentPath, cmdName);

    const pathParts = scriptPath.split('/');
    const fileName = pathParts.pop();
    const dirPath = pathParts.join('/') || '/';
    const parentDir = getDirectory(dirPath);

    if (parentDir && parentDir.contents && parentDir.contents[fileName]) {
        const file = parentDir.contents[fileName];

        if (file.type && file.type.startsWith('-') && file.type.includes('x')) {
            if (file.content) {
                const scriptLines = file.content.split('\n').filter(line => line.trim().length > 0 && !line.trim().startsWith('#'));

                updateConsoleDisplay();

                for (const line of scriptLines) {
                    updateConsoleDisplay();

                    const { commandOutput, redirectToFile, appendMode } = await handleCommand(line);

                    if (commandOutput) {
                        commandOutput.split('\n').forEach(outputLine => consoleBuffer.push(outputLine));
                    }
                    updateConsoleDisplay();
                    await new Promise(r => r());
                }
                consoleBuffer.push("");
                return "";
            } else {
                return error.corrupted(cmdName);
            }
        } else {
            return error.perms_denied;
        }
    } else {
        return error.no_found(cmdName);
    }
}

function getCommandContext() {
    return {
        consoleOutput,
        consoleBuffer,
        currentPath,
        commands,
        commandDocs,
        clc,
        error,
        setCurrentPath,
        resolvePath,
        getDirectory,
        updateConsolePrompt,
        input,
        saveFiles,
        moveFiles,
        handleCommand,
        updateConsoleDisplay,
        resolvePathParts
    };
}

async function handleCommand(command) {
    command = command.trim();
    if (command === '') return { commandOutput: "", redirectToFile: false, appendMode: false };

    const { operands, flags, longFlags, redirectToFile, appendMode } = parseCommand(command);

    let cmdName = operands.shift(0);

    const commandContext = getCommandContext();

    if (cmdName.startsWith('./') || cmdName.startsWith('../') || cmdName.startsWith('/')) {
        let scriptOutput = await executeFile(cmdName, commandContext);
        return { commandOutput: scriptOutput, redirectToFile, appendMode };
    }

    if (commands[cmdName]) {
        commandContext.currentPath = currentPath;

        let output = '';

        try {
            output = await commands[cmdName](operands, flags, longFlags, commandContext);
        } catch (err) {
            output = error.internal_error(err.message || err);
            console.error("Command execution error:", err);
        }
        return { commandOutput: output, redirectToFile, appendMode };
    } else {
        return { commandOutput: clc.red(`'${cmdName}' is not recognized as an internal or external command, operable program or executable file. Type 'help' to see available commands.`), redirectToFile, appendMode };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupConsoleKeyboardInput();
    loadCommands();
});

document.addEventListener('wheel', function(event) {
    if (event.ctrlKey) {
        event.preventDefault();
    }
}, { passive: false });