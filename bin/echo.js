import { clc } from "../libs/colors.js";

export function echoCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { clc, error } = context;

    let output = operands.join('\n');
    let colorToApply = null;

    if (longFlags.length > 0 && flags.length > 0) return error.many_flags;
    if (longFlags.length > 1 || flags.length > 1) return error.many_flags;

    for (const flag of longFlags) {
        if (flag.startsWith('color=')) {
            colorToApply = flag.substring('color='.length);
            break;
        }
    }

    if (colorToApply && clc[colorToApply]) {
        output = clc[colorToApply](output);
    }

    return output;
}

const supportedColors = [];
Object.keys(clc).forEach(color => supportedColors.push(clc[color](color)))

const usage = "echo [OPTION]... [STRING]...";
const shortDescription = "echo\t\t- display a line of text";
const fullDescription = `${shortDescription.replace('\t\t', ' ')}

Usage: ${usage}

Description:
  Writes any specified strings to the standard output.

Options:
  --color=<color>      Color the output text with the specified color.
                       Supported colors: ${supportedColors.join(', ')}.
`;

export const echoDoc = { usage, shortDescription, fullDescription };