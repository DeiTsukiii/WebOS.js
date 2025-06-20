import { rebootCommand } from "./reboot.js";

export async function resetCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { input, clc, consoleBuffer } = context;
    const reset = () => {
        const { consoleBuffer } = context;
        localStorage.removeItem('WebOSFiles');
        consoleBuffer.push(clc.yellow("System data cleared. Rebooting..."));
        return rebootCommand(operands, flags, longFlags, context);
    }
    if (longFlags.includes('confirm')) return reset();
    let run = true;
    while (run) {
        const userAnswer = await input("Reset the system (y/n)?");

        if (userAnswer.toLowerCase() === 'y') {
            run = false;
            return reset();
        } else if (userAnswer.toLowerCase() === 'n') {
            run = false;
            return "Reset cancelled.";
        } else {
            consoleBuffer.push(clc.red("Incorrect input."));
        }
    }
}

const usage = "reset";
const shortDescription = "reset\t\t- reset the system to its initial state";
const fullDescription = `${shortDescription.replace('\t\t', ' ')}

Usage: ${usage}

Description:
  Clears all user-specific data and restores the file system to its original, factory-default configuration. 
  This includes removing any files or directories created by the user and resetting system-generated content.
  After clearing the data, the system will automatically reboot to apply the changes.

  Use this command with caution, as all data and custom configurationswill be permanently lost.

Options:
  --confirm    Directly confirm the reset.
`;

export const resetDoc = { usage, shortDescription, fullDescription };