import { parseCommandColor } from "./parser.js";

const colors = [ 'red', 'green', 'yellow', 'purpleblue', 'cyan', 'cyan2', 'blue', 'magenta', 'white', 'black', 'bold' ]

function colorText(text, colorClass) {
    return `<span class="${colorClass}">${text}</span>`;
}

export const clc = {};
colors.forEach(color => clc[color] = (text) => colorText(text, `color-${color}`));

export function sanitizeHtml(text, linkAuthorized) {
    let sanitizedText = text
        .replaceAll(/&/g, '&amp;')
        .replaceAll(/</g, '&lt;')
        .replaceAll(/>/g, '&gt;');

    const allowedSpanRegex = /&lt;span class="color-(.*?)"&gt;(.*?)&lt;\/span&gt;/gs;
    const allowedARegex = /&lt;a href="(.*?)"&gt;(.*?)&lt;\/a&gt;/gs;

    sanitizedText = sanitizedText.replace(allowedSpanRegex, (match, color, content) => {
        return `<span class="color-${color}">${content}</span>`;
    });

    if (linkAuthorized) sanitizedText = sanitizedText.replace(allowedARegex, (match, href, content) => {
        return `<a href="${href}"${href.startsWith('javascript') ? '' : 'target="_blank"'}>${content}</a>`;
    });

    return sanitizedText.replaceAll('&lt;', '‹').replaceAll('&gt;', '>');
}

export function colorCommand(text, isAwaitingInput) {
    if (!text.trim() && !isAwaitingInput) return '';

    if (isAwaitingInput) {
        return sanitizeHtml(clc.purpleblue(text), false);
    }

    const parsedSegments = parseCommandColor(text);
    const finalColoredParts = [];

    let isFirstWord = true;

    let lastSegment;
    for (const segment of parsedSegments) {
        if (segment.type === 'whitespace') {
            finalColoredParts.push(segment.value);
            continue;
        }

        const valueToColor = segment.value;

        if (isFirstWord) {
            finalColoredParts.push(clc.yellow(valueToColor));
            isFirstWord = false;
        } else if (segment.type === 'longFlag') {
            finalColoredParts.push(clc.cyan2(valueToColor));
        } else if (segment.type === 'shortFlag') {
            finalColoredParts.push(clc.cyan(valueToColor));
        } else if (segment.type === 'redirectOperator') {
            finalColoredParts.push(clc.yellow(valueToColor));
        }
        else {
            if (valueToColor.startsWith('\\')) {
                finalColoredParts.push(clc.magenta(valueToColor));
            } else {
                finalColoredParts.push(clc.magenta(valueToColor));
            }
        }
    }

    return sanitizeHtml(finalColoredParts.join(""), false);
}