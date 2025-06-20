export function rebootCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { clc } = context;

    setTimeout(() => {
        window.location.reload();
    }, 200);

    return clc.yellow("Rebooting system... Please wait.");
}

const usage = "reboot";
const shortDescription = "reboot\t- restart the terminal session";
const fullDescription = `${shortDescription.replace('\t', ' ')}

Usage: ${usage}

Description:
  Restart the system.
  All unsaved data will be lost.
`;

export const rebootDoc = { usage, shortDescription, fullDescription };