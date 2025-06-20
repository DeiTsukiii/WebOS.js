export function pwdCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { currentPath } = context;
    return currentPath;
}

const usage = "pwd";
const shortDescription = "pwd\t\t- print the current working directory.";
const fullDescription = `${shortDescription.replace('\t\t', ' ')}

Usage: ${usage}

Description:
  Displays the absolute path of the current directory.
  It is useful for determining your exact location within the file system hierarchy.
  The command takes no operands or flags.
`;

export const pwdDoc = { usage, shortDescription, fullDescription };