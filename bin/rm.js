import { fileSystem } from "./main.js";

export async function rmCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { resolvePath, getDirectory, currentPath, resolvePathParts, error, input, clc, consoleBuffer } = context;

    const force = flags.includes('f') || longFlags.includes('force');
    const recursive = flags.includes('r') || longFlags.includes('recursive');

    if (operands.length < 1) return error.missing_operands;
    if (operands.length > 1) return error.many_operands;

    const resolvedPath = resolvePath(currentPath, operands[0]);
    const entry = getDirectory(resolvedPath);

    if (!entry) return error.not_found(resolvedPath);
    if (entry.type[0] === 'd' && Object.keys(entry.contents).length !== 0 && !recursive) return error.not_empty(resolvedPath);
    if (entry.type[2] !== 'w') return error.perms_denied;

    const { fileName, parentDir } = resolvePathParts(resolvedPath, context);

    const rm = () => {
        delete parentDir.contents[fileName];
        localStorage.setItem('WebOSFiles', JSON.stringify(fileSystem));

        return `'${resolvedPath}' deleted successfully`
    }

    if (!force) {
        let run = true;
        const inputText = entry.type[0] === 'd' ? `Remove directory '${resolvedPath}' and all his contents (y/n)?` : `Remove regular file '${resolvedPath}' (y/n)?` ;
        while (run) {
            const userAnswer = await input(inputText);
            if (userAnswer.toLowerCase() === 'y') {
                run = false;
                return rm();
            } else if (userAnswer.toLowerCase() === 'n') {
                run = false;
                return "Remove cancelled.";
            } else {
                consoleBuffer.push(clc.red("Incorrect input."));
            }
        }
    } else return rm();
}

const usage = "rm [FILE]";
const shortDescription = "rm\t\t- remove files and directories";
const fullDescription = `${shortDescription.replace('\t\t', ' ')}

Usage: ${usage}

Description:
  Removes (deletes) the specified FILE.
  You can also use 'rmdir' to remove an empty directory. Type 'rmdir --help' or 'help rmdir' for more informations.

Options:
  -r, --recursive       Remove directories and their contents recursively.
                        This option is required to remove non-empty directories.
  -f, --force           Force the removal. Do not prompt for confirmation.
                        Ignores non-existent files and arguments.
`;

export const rmDoc = { usage, shortDescription, fullDescription };