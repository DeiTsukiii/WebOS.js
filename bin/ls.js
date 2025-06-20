export function lsCommand(operands, flags, longFlags, context) {
    if (longFlags.includes('help')) return fullDescription;
    const { resolvePath, getDirectory, currentPath, error } = context;

    if (operands.length > 1) return error.many_operands;
    
    const lsPath = operands[0] ? resolvePath(currentPath, operands[0]) : currentPath;
    const dirToList = getDirectory(lsPath);

    let output = '';

    if (!dirToList) return error.not_found(lsPath);
    if (!dirToList.type.startsWith('d')) output = `${dirToList.name || lsPath.split('/').pop()}`;
    else {
        const contents = Object.keys(dirToList.contents).sort();
        const isLongFormat = flags.includes('l') || longFlags.includes('long');

        if (contents.length === 0) {
            output = "";
        } else {
            if (isLongFormat) {
                output = "Perms:\t\tCreation:\t\t\tLast modif:\t\t\tSize:\t\t\tName:\n";
                const formattedContents = contents.map(name => {
                    const item = dirToList.contents[name];
                    const displayName = item.type.startsWith('d') ? `${name}/` : name;
                    const dates = item.date;
                    let length;
                    if (item.type.startsWith('d')) {
                        length = Object.keys(item.contents).length;
                    } else {
                        let fileLength = item.content.length;
                        if (fileLength >= 10**12) length = `${Math.floor(fileLength / 10**12)}TB`;
                        else if (fileLength >= 10**9) length = `${Math.floor(fileLength / 10**9)}GB`;
                        else if (fileLength >= 10**6) length = `${Math.floor(fileLength / 10**6)}MB`;
                        else if (fileLength >= 10**3) length = `${Math.floor(fileLength / 10**3)}KB`;
                        else length = `${fileLength}B`;
                    }
                    return `${item.type}\t\t${new Date(dates[0]).toLocaleString()}\t\t${new Date(dates[1]).toLocaleString()}\t\t${length}\t\t\t${displayName}`;
                });
                output += formattedContents.join('\n');
            } else {
                for (let i = 0; i < contents.length; i++) {
                    if (dirToList.contents[contents[i]].type.startsWith('d')) {
                        contents[i] += '/';
                    }
                }
                output = contents.join('    ');
            }
        }
    }
    return output;
}

const usage = "ls [OPTION]... [FILE]...";
const shortDescription = "ls\t\t- list directory contents";
const fullDescription = `${shortDescription.replace('\t\t', ' ')}

Usage: ${usage}

Description:
  Lists the contents of the given directory. If no directory
  is specified, it lists the contents of the current working directory.
  Directory names are suffixed with a '/'.

Options:
  -l, --long    Use a long listing format, showing file type and permissions.
`;

export const lsDoc = { usage, shortDescription, fullDescription };