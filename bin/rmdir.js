import { fileSystem } from "./main.js";

export function rmdirCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { resolvePath, getDirectory, currentPath, resolvePathParts, error } = context;

    if (operands.length < 1) return error.missing_operands;
    if (operands.length > 1) return error.many_operands;

    const resolvedPath = resolvePath(currentPath, operands[0]);
    const entry = getDirectory(resolvedPath);

    if (!entry) return error.not_found(resolvedPath);
    if (entry.type[0] !== 'd') return error.wrong_type;
    if (Object.keys(entry.contents).length !== 0) return error.not_empty(resolvedPath);
    if (entry.type[2] !== 'w') return error.perms_denied;

    const { fileName, parentDir } = resolvePathParts(resolvedPath, context);

    delete parentDir.contents[fileName];
    localStorage.setItem('WebOSFiles', JSON.stringify(fileSystem));

    return `'${resolvedPath}' deleted successfully`
}

const usage = "rmdir [DIRECTORY]";
const shortDescription = "rmdir\t\t- remove empty directories";
const fullDescription = `${shortDescription.replace('\t\t', ' ')}

Usage: ${usage}

Description:
  Removes (deletes) the specified empty DRECTORY.
  Use 'rm' to remove a file or not empty directory. Type 'rm --help' or 'help rm' for more informations.
`;

export const rmdirDoc = { usage, shortDescription, fullDescription };