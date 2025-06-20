export function mkdirCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { currentPath, resolvePath, getDirectory, saveFiles, error } = context;

    let output = [];
    if (operands.length === 0) return error.missing_operands;
    operands.forEach(operand => {
        const targetPath = operand;
        const newPath = resolvePath(currentPath, targetPath);
        const targetDir = getDirectory(newPath);
        if (targetDir) output.push(error.already_exist(newPath));

        const pathParts = newPath.split('/').filter(p => p.length > 0);
        let fileName;
        let parentPath;
        if (pathParts.length === 0) {
            fileName = '/';
            parentPath = '/';
        } else {
            fileName = pathParts[pathParts.length - 1];
            parentPath = '/' + pathParts.slice(0, -1).join('/');
        }
        const parentDir = getDirectory(parentPath);
        const havePFlag = flags.includes('p') || longFlags.includes('parents');
        if (!parentDir && havePFlag) output.push(saveFiles(parentPath, 'drwxu', {}, context));
        if (!targetDir) output.push(saveFiles(newPath, 'drwxu', {}, context));
    });
    return output.join('\n');
}

const usage = "mkdir [DIRECTORY]...";
const shortDescription = "mkdir\t\t- create a directory";
const fullDescription = `${shortDescription.replace('\t\t', ' ')}

Usage: ${usage}

Description:
  Create the DIRECTORY if not exist.

Options:
  -p, --parents      Create the parent directories, too.
`;

export const mkdirDoc = { usage, shortDescription, fullDescription };