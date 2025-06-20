export function clsCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { consoleBuffer } = context;
    consoleBuffer.splice(0, consoleBuffer.length);
    return;
}

const usage = "cls";
const shortDescription = "cls\t\t- clear the console screen";
const fullDescription = `${shortDescription.replace('\t\t', ' ')}

Usage: ${usage}

Description:
  Clear the standard output.
`;

export const clsDoc = { usage, shortDescription, fullDescription };