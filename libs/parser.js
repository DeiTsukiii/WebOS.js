export function parseCommand(commandString) {
    const operands = [];
    const flags = [];
    const longFlags = [];
    let redirectToFile = null;
    let appendMode = false;
    const regex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|>>|>|--[a-zA-Z0-9=_-]+|-[a-zA-Z0-9]+|\S+)/g;
    let match;
    let expectingRedirectTarget = false;

    while ((match = regex.exec(commandString)) !== null) {
        let arg = match[1];

        if (expectingRedirectTarget) {
            redirectToFile = arg;
            if (arg.startsWith('"') && arg.endsWith('"')) {
                redirectToFile = arg.substring(1, arg.length - 1);
            } else if (arg.startsWith("'") && arg.endsWith("'")) {
                redirectToFile = arg.substring(1, arg.length - 1);
            }
            expectingRedirectTarget = false;
            continue;
        }

        if (arg === '>') {
            appendMode = false;
            expectingRedirectTarget = true;
            continue;
        } else if (arg === '>>') {
            appendMode = true;
            expectingRedirectTarget = true;
            continue;
        }

        if (arg.startsWith('"') && arg.endsWith('"')) {
            operands.push(arg.substring(1, arg.length - 1));
        } else if (arg.startsWith("'") && arg.endsWith("'")) {
            operands.push(arg.substring(1, arg.length - 1));
        } else if (arg.startsWith('--')) {
            longFlags.push(arg.substring(2));
        } else if (arg.startsWith('-') && arg.length > 1) {
            for (let i = 1; i < arg.length; i++) {
                flags.push(arg[i]);
            }
        } else {
            operands.push(arg);
        }
    }

    if (expectingRedirectTarget) {
        return { operands, flags, longFlags, redirectToFile: undefined, appendMode };
    }

    return { operands, flags, longFlags, redirectToFile, appendMode };
}

export function parseCommandColor(commandString) {
    const parsedSegments = [];
    let lastIndex = 0;

    const regex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|>>|>|--[a-zA-Z0-9=_-]+|-[a-zA-Z0-9]+|\S+)/g;
    regex.lastIndex = 0;

    let match;
    while ((match = regex.exec(commandString)) !== null) {
        if (match.index > lastIndex) {
            parsedSegments.push({ type: 'whitespace', value: commandString.substring(lastIndex, match.index) });
        }

        let arg = match[1];
        if (arg.startsWith('"') || arg.startsWith("'")) {
            parsedSegments.push({ type: 'operand', value: arg });
        } else if (arg.startsWith('--')) {
            parsedSegments.push({ type: 'longFlag', value: arg });
        } else if (arg.startsWith('-')) {
            parsedSegments.push({ type: 'shortFlag', value: arg });
        } else if (arg === '>' || arg === '>>') {
            parsedSegments.push({ type: 'redirectOperator', value: arg });
        } else {
            parsedSegments.push({ type: 'operand', value: arg });
        }
        lastIndex = regex.lastIndex;
    }
    if (commandString.length > lastIndex) {
        parsedSegments.push({ type: 'whitespace', value: commandString.substring(lastIndex) });
    }

    return parsedSegments;
}