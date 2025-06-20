export function exempleCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { clc } = context;

    let output = "Command output";
    output += clc.purpleblue("\nColored command output");
    output += clc.magenta(`\n\n - Operands: ${operands.join(", ")}.`);
    output += clc.cyan(`\n - Flags: ${flags.join(", ")}.`);
    output += clc.cyan2(`\n - Long flags: ${longFlags.join(", ")}.`);

    return output;
}

const usage = "exemple [OPTION]...";
const shortDescription = "exemple\t- exemple command";
const fullDescription = `${shortDescription.replace('\t', ' ')}

Usage: ${usage}

Description:
  Show the base structure of a command.

Options:
  -f, --longflags    flags, long flags exemple.
`;

export const exempleDoc = { usage, shortDescription, fullDescription };