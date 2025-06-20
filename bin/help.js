export function helpCommand(operands, flags, longFlags, context) {
    const { commands, commandDocs } = context;

    const showUsageOnly = flags.includes('u') || longFlags.includes('usage');

    if (operands.length === 0) {
        let output = ["Available commands:"];
        const commandNames = Object.keys(commands).sort();

        for (const cmdName of commandNames) {
            const doc = commandDocs[cmdName];
            if (doc) {
                if (showUsageOnly) {
                    output.push(`  ${doc.usage}`);
                } else {
                    output.push(`  ${doc.shortDescription}`);
                }
            } else if (cmdName !== 'help') {
                output.push(`  ${cmdName}\t- No description available`);
            }
        }
        output.push("");
        output.push("For more information on a specific command, type 'help <command>' or '<command> --help'.");

        return output.join('\n');

    } else if (operands.length === 1) {
        const targetCommand = operands[0].toLowerCase();
        const doc = commandDocs[targetCommand];

        if (doc) {
            if (showUsageOnly) {
                return doc.usage;
            } else {
                return doc.fullDescription;
            }
        } else {
            return `ERROR: command '${targetCommand}' not found or no documentation available.`;
        }
    } else {
        return "ERROR: too many operands.";
    }
}