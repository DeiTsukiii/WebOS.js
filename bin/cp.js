export function cpCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { currentPath, resolvePath, getDirectory, error, saveFiles, resolvePathParts } = context;

    if (operands.length < 1) return error.missing_operands;
    
    const targetPath = resolvePath(currentPath, operands[0]);
    let destinationPath
    if (operands.length === 1) destinationPath = currentPath;
    else destinationPath = resolvePath(currentPath, operands[1]);

    const targetEntry = getDirectory(targetPath);
    const destinationEntry = getDirectory(destinationPath);

    if (!targetEntry) return error.not_found(operands[0]);
    if (targetEntry.type[0] !== '-') return error.not_a_file(operands[0]);

    const { fileName, parentPath, parentDir } = resolvePathParts(targetPath, context);

    let finalDestinationName = fileName;
    if (destinationEntry) {
        if (destinationEntry.type[0] === '-') {
            return saveFiles(destinationPath, targetEntry.type, targetEntry.content, context);

        } else if (destinationEntry.type[0] === 'd') {
            let newFileName = fileName;
            let copyIndex = 0;

            const lastDotIndex = fileName.lastIndexOf('.');
            const baseName = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
            const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
            const escapeRegExp = (string) => {
                return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            }
            Object.keys(destinationEntry.contents).forEach(existingContentName => {

                const regexPattern = new RegExp(`^${escapeRegExp(baseName)}(?:\\s\\((\\d+)\\))?${escapeRegExp(extension)}$`);
                const match = existingContentName.match(regexPattern);

                if (match) {
                    const capturedNumber = match[1];
                    if (capturedNumber !== undefined) {
                        const num = Number(capturedNumber);
                        if (!Number.isNaN(num) && num >= copyIndex) {
                            copyIndex = num + 1;
                        }
                    } else {
                        if (copyIndex === 0) copyIndex = 1;
                    }
                }
            });

            if (copyIndex > 0) {
                newFileName = `${baseName} (${copyIndex})${extension}`;
            }

            finalDestinationName = newFileName;
            const finalDestinationPath = `${destinationPath}/${finalDestinationName}`;
            return saveFiles(finalDestinationPath, targetEntry.type, targetEntry.content, context);
        }
    } else {
        const { fileName: destFileName, parentPath: destParentPath, parentDir: destParentDir } = resolvePathParts(destinationPath, context);

        if (!destParentDir || destParentDir.type[0] !== 'd') {
            return ERROR_MESSAGES.destinationParentNotDir(operands[1]);
        }

        finalDestinationName = destFileName;
        const finalDestinationPath = `${destParentPath}/${finalDestinationName}`;
        return saveFiles(finalDestinationPath, targetEntry.type, targetEntry.content, context);
    }
}

const usage = "cp [SOURCE] [DESTINATION]";
const shortDescription = "cp\t\t- copy SOURCE to DESTINATION";
const fullDescription = `${shortDescription.replace('\t\t', ' ')}

Usage: ${usage}

Description:
  Copy the content of the SOURCE file and paste it on the DESTINATION file.
`;

export const cpDoc = { usage, shortDescription, fullDescription };