export function javascriptCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { resolvePath, getDirectory, currentPath, error, clc } = context;

    if (operands.length === 0) return error.missing_operands;
    if (operands.length > 1) return error.many_operands;

    const filePath = resolvePath(currentPath, operands[0]);
    const fileEntry = getDirectory(filePath);

    if (!fileEntry) return error.not_exist(filePath);
    if (fileEntry.type.startsWith('d')) error.wrong_type;
    if (!filePath.toLowerCase().endsWith('.js')) return error.wrong_file_type('.js');
    if (!fileEntry.type.includes('x')) return error.perms_denied;
    if (!fileEntry.content) return error.corrupted(filePath);
    
    const scriptContent = fileEntry.content;

    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const capturedOutput = [];

    console.log = (...args) => {
        capturedOutput.push(args.map(arg => String(arg)).join(' '));
    };
    console.error = (...args) => {
        capturedOutput.push(clc.red(`Script Error: ${args.map(arg => String(arg)).join(' ')}`));
    };

    try {
        eval(scriptContent);
    } catch (e) {
        capturedOutput.push(clc.red(`Script Error: ${e}`));
    } finally {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
    }

    let output;
    if (capturedOutput.length > 0) {
        output = capturedOutput.join('\n');
    }

    return output;
}

const usage = "javascript [FILE.js]";
const shortDescription = "javascript\t- execute a JavaScript (.js) script";
const fullDescription = `${shortDescription.replace('\t', ' ')}

Usage: ${usage}

Description:
  Executes the content of a specified .js (JavaScript) file.
`;

export const javascriptDoc = { usage, shortDescription, fullDescription };