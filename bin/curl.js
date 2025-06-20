export async function curlCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { currentPath, resolvePath, getDirectory, saveFiles, error, clc } = context;

    if (operands.length === 0) return error.missing_operands;


}

const usage = "curl [OPTION]... [URL]";
const shortDescription = "curl\t\t- transfer data from URLs";
const fullDescription = `${shortDescription.replace('\t\t', ' ')}

Usage: ${usage}

Description:
  Fetches content from a specified URL or reads content from a file.
  The content is displayed to standard output.

Options:
  -i, --include         Include HTTP response headers in the output.
`;

export const curlDoc = { usage, shortDescription, fullDescription };