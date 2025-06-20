export function chmodCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { clc, getDirectory, resolvePath, currentPath, saveFiles, error } = context;

    if (operands.length < 2) {
        return error.missing_operands;
    }
    if (operands.length > 2) return error.many_operands;

    const newPermsModifier = operands[0];
    const targetPath = operands[1];

    const permsModifierRegex = /^\+([r-][w-][x-])$/;

    const match = newPermsModifier.match(permsModifierRegex);

    if (!match) {
        return error.invalid_format("The modifier must start with '+' followed by r/w/x or '-' for each permission");
    }

    const [ , permsToApply ] = match;

    const resolvedPath = resolvePath(currentPath, targetPath);
    const pathParts = resolvedPath.split('/').filter(p => p.length > 0);

    let targetName;
    let parentDir;
    let parentPath;
    if (pathParts.length === 0) {
        targetName = '/';
        parentPath = '/';
        parentDir = getDirectory('/');
    } else {
        targetName = pathParts[pathParts.length - 1];
        parentPath = '/' + pathParts.slice(0, -1).join('/');
        parentDir = getDirectory(parentPath);
    }

    if (!parentDir) return error.not_found(parentPath);
    if (!parentDir.contents && targetName !== '/') {
        return error.wrong_type(parentPath);
    }

    let targetEntry;
    if (targetName === '/') {
        targetEntry = parentDir;
    } else {
        targetEntry = parentDir.contents[targetName];
    }

    if (!targetEntry) {
        return error.not_found(targetPath);
    }

    const existingPermsString = targetEntry.type;

    const existingPermsParts = existingPermsString.split('');
    if (existingPermsParts.length !== 5) {
        return error.corrupted(targetPath);
    }

    if (existingPermsString.endsWith('s')) return error.perms_denied;

    existingPermsParts[1] = permsToApply[0];
    existingPermsParts[2] = permsToApply[1];
    existingPermsParts[3] = permsToApply[2];

    const updatedPermsString = existingPermsParts.join('');

    return saveFiles(resolvedPath, updatedPermsString, targetEntry.type.startsWith('-') ? targetEntry.content : targetEntry.contents, context);
}

const usage = "chmod <permissions_modifier> <file/directory>";
const shortDescription = "chmod\t\t- change file or directory permissions";
const fullDescription = `${shortDescription.replace('\t\t', ' ')}

Usage: ${usage}

Description:
  Modifies the read, write, and execute permissions of a specified file or directory.

Permissions Modifier Format:
  The <permissions_modifier> argument must start with '+' followed by
  exactly three characters representing read, write, and execute permissions.

  - Each permission slot can be 'r', 'w', 'x' to enable, or '-' to disable.
`;

export const chmodDoc = { usage, shortDescription, fullDescription };