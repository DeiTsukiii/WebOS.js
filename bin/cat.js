export function catCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { currentPath, resolvePath, getDirectory, error } = context;

    if (operands.length === 0) return error.missing_operands;

    let output = [];
    let lineNumber = 1;
    const showLineNumbers = flags.includes('n') || longFlags.includes('number');

    for (const filePath of operands) {
        const absolutePath = resolvePath(currentPath, filePath);
        const fileEntry = getDirectory(absolutePath);

        if (!fileEntry) output.push(error.not_found(filePath));
        if (fileEntry.type.startsWith('d')) output.push(error.wrong_file_type);
        if (!fileEntry.type.includes('r')) output.push(error.perms_denied);

        if (fileEntry.type.startsWith('-')) {
            const contentLines = fileEntry.content.split('\n');
            for (const line of contentLines) {
                if (showLineNumbers) {
                    output.push(`  ${String(lineNumber++)}. \t│  ${line}`);
                } else {
                    output.push(line);
                }
            }
        } else {
            output.push(error.unknown_type);
        }
    }

    return output.join('\n');
}

const usage = "cat [OPTION]... [FILE]...";

const shortDescription = "cat\t\t- concatenate files and print on the standard output";

const fullDescription = `${shortDescription.replace('\t\t', ' ')}

Usage: ${usage}

Description:
  Read a file and write it to the standard output.

Options:
  -n, --number      Number all output lines, starting at 1.
`;

export const catDoc = { usage, shortDescription, fullDescription }