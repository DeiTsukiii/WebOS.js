export function cdCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { currentPath, resolvePath, getDirectory, updateConsolePrompt, setCurrentPath, error } = context;

    let targetPath;
    if (operands.length > 1) return error.many_operands;
    if (operands.length === 0) targetPath = '/home/user';
    else targetPath = operands[0];
    const newPath = resolvePath(currentPath, targetPath);
    const targetDir = getDirectory(newPath);

    if (targetDir && targetDir.type.startsWith('d')) {
        if (!targetDir.type.includes('r')) return error.perms_denied;
        setCurrentPath(newPath === '' ? '/' : newPath);
        updateConsolePrompt();
        return "";
    } else {
        return error.not_found(newPath);
    }
}

const usage = "cd [DIRECTORY]";
const shortDescription = "cd\t\t- change the current working directory";
const fullDescription = `${shortDescription.replace('\t\t', ' ')}

Usage: ${usage}

Description:
  Change the shell working directory to DIRECTORY.
`;

export const cdDoc = { usage, shortDescription, fullDescription };