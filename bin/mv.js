export function mvCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { moveFiles, error } = context;

    let canRename = false;
    if (operands.length <= 1) return error.missing_operands;
    if (operands.length === 2) canRename = true;
    const destination = operands[operands.length - 1];
    operands.pop();
    let output = [];
    operands.forEach(target => {
        output.push(`${moveFiles(target, destination, context, canRename)}`);
    });

    return output.join('\n');
}

const usage = "mv [SOURCE]... [DESTINATION]";
const shortDescription = "mv\t\t- move files and directories";
const fullDescription = `${shortDescription.replace('\t\t', ' ')}

Usage: ${usage}

Description:
  Move any SOURCE(s) to the DESTINATION directory.

  When moving multiple SOURCE items, the DESTINATION must be a directory.
  If only one SOURCE is provided and DESTINATION is an existing directory,
  SOURCE will be moved into DESTINATION. If DESTINATION is not a directory
  and does not exist, SOURCE will be renamed to DESTINATION.
`;

export const mvDoc = { usage, shortDescription, fullDescription };