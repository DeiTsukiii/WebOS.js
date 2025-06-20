function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

export async function curlCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;

    const { currentPath, resolvePath, getDirectory, saveFiles, error, clc, resolvePathParts } = context;

    if (operands.length === 0) return error.missing_operands;

    const urlOrPath = operands[0];
    let includeHeaders = flags.includes('i') || longFlags.includes('include');

    let outputContent = '';
    try {
        const response = await fetch(urlOrPath);

        if (includeHeaders) {
            outputContent += '--- HTTP Headers ---\n';
            response.headers.forEach((value, name) => {
                outputContent += `${name}: ${value}\n`;
            });
            outputContent += '--- End Headers ---\n\n';
        }

        if (!response.ok) {
            outputContent += error.failed_fetch(urlOrPath);
            return outputContent;
        }

        const contentType = response.headers.get('content-type') || '';
        let fetchedBody = '';

        if (contentType.includes('application/json')) {
            fetchedBody = JSON.stringify(await response.json(), null, 2);
        } else if (contentType.includes('text/')) {
            fetchedBody = await response.text();
        } else {
            fetchedBody = `(Binary content or unsupported type: ${contentType} - cannot display directly)`;
        }

        return outputContent + escapeHTML(fetchedBody);

    } catch (e) {
        let errorMessage = error.failed_fetch(urlOrPath);
        console.error("Curl network error:", e);
        return errorMessage;
    }
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