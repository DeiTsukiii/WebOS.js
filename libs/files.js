import { fileSystem } from "../bin/main.js";

export function getDirectory(path, fs = fileSystem) {
    let normalizedPath = path;

    if (normalizedPath === '/') {
        return fs['/'];
    }

    const parts = normalizedPath.split('/').filter(p => p.length > 0);
    let currentDir = fs['/'];

    for (const part of parts) {

        if (!currentDir || !currentDir.type || !currentDir.type.startsWith('d') || !currentDir.contents || !currentDir.contents[part]) {
            return null;
        }
        currentDir = currentDir.contents[part];
    }
    return currentDir;
}

export function resolvePath(basePath, targetPath) {
    let normalizedTargetPath = targetPath.replace('~/', '/home/user/');

    let normalizedBasePath = basePath;


    const baseParts = normalizedBasePath.split('/').filter(p => p.length > 0);
    const targetParts = normalizedTargetPath.split('/').filter(p => p.length > 0);
    let resolvedParts = [...baseParts];

    if (normalizedTargetPath.startsWith('/')) {
        resolvedParts = [];
    }

    for (const part of targetParts) {
        if (part === '.') {
        } else if (part === '..') {
            if (resolvedParts.length > 0) {
                resolvedParts.pop();
            }
        } else {
            resolvedParts.push(part);
        }
    }
    
    return '/' + resolvedParts.join('/');
}

export function resolvePathParts(path, context) {
    const { getDirectory, resolvePath, currentPath } = context;
    const resolvedPath = resolvePath(currentPath, path);
    const pathParts = resolvedPath.split('/').filter(p => p.length > 0);
    let fileName;
    let parentPath;
    if (pathParts.length === 0) {
        fileName = '/';
        parentPath = '/';
    } else {
        fileName = pathParts[pathParts.length - 1];
        parentPath = '/' + pathParts.slice(0, -1).join('/');
    }
    const parentDir = getDirectory(parentPath);
    if (!parentDir || !parentDir.contents || parentDir.type[0] !== 'd') return `ERROR: Directory '${parentPath}' not found.`;
    return { fileName, parentPath, parentDir };
}

export function moveFiles(targetPath, destinationPath, context, canRename) {
    const { clc } = context;

    let target = resolvePathParts(targetPath, context);
    if (typeof target === 'string') return target;

    let destination = resolvePathParts(destinationPath, context); // { fileName, parentPath, parentDir }
    if (typeof destination === 'string') return destination;

    if (!destination.parentDir || !target.parentDir) return "ERROR: parent directory corrupted.";

    let targetEntry = target.parentDir.contents[target.fileName];
    if (!targetEntry) return `ERROR: '${targetPath}' not exist.`;

    let destinationEntry = destination.parentDir.contents[destination.fileName];
    if (!destinationEntry && !canRename) return `ERROR: '${destinationPath}' not exist.`;
    
    if (destination.parentDir.type[2] === '-') return clc.red(`Permission denied: Cannot write to existing entry '${destination.parentPath}'.`);

    if (!destinationEntry && canRename) {
        target.parentDir.contents[target.fileName].date[1] = Date.now();
        destination.parentDir.contents[destination.fileName] = target.parentDir.contents[target.fileName];
        delete target.parentDir.contents[target.fileName];
        localStorage.setItem('WebOSFiles', JSON.stringify(fileSystem));
        return `'${targetPath}' renamed successfully to ${destinationPath}.`;
    } else {
        if (destinationEntry.type[0] === '-' || !destinationEntry.contents) return "ERROR: cannot move file or directory into a file.";
        target.parentDir.contents[target.fileName].date[1] = Date.now();
        destination.parentDir.contents[destination.fileName].contents[target.fileName] = target.parentDir.contents[target.fileName];
        delete target.parentDir.contents[target.fileName];
        localStorage.setItem('WebOSFiles', JSON.stringify(fileSystem));
        return `'${targetPath}' moved successfully to ${destinationPath}.`;
    }
}

export function saveFiles(path, simplifiedPerms, content, context) {
    const { getDirectory, clc } = context;

    const resolvedPath = path;

    const pathParts = resolvedPath.split('/').filter(p => p.length > 0);

    let fileName;
    let parentPath;

    if (pathParts.length === 0) {
        fileName = '/';
        parentPath = '/';
    } else {
        fileName = pathParts[pathParts.length - 1];
        parentPath = '/' + pathParts.slice(0, -1).join('/');
    }

    const parentDir = getDirectory(parentPath);

    if (!parentDir || !parentDir.contents || parentDir.type[0] !== 'd') {
        return `ERROR: Directory '${parentPath}' not found.`;
    }

    if (!/^(d|-)[r-][w-][x-][us]$/.test(simplifiedPerms)) {
        return `ERROR: invalid permission string format. Expected 'drwxu' or '-rwxu' etc.`;
    }

    const inputFileType = simplifiedPerms[0];
    const inputOwnerType = simplifiedPerms[4];

    let targetEntry = parentDir.contents[fileName];
    const isNewEntry = !targetEntry;
    let okMessage;
    if (isNewEntry) okMessage = `'${resolvedPath}' created successfully.`;
    else okMessage = targetEntry.type === simplifiedPerms ? `'${resolvedPath}' updated successfully.` : `Permission updated successfully to '${simplifiedPerms}' for '${resolvedPath}'.`;

    if (targetEntry) {
        if (targetEntry.type[2] !== 'w') {
            return clc.red(`Permission denied: Cannot write '${fileName}'.`);
        }
        if (inputFileType === 'd' ? targetEntry.contents !== content : targetEntry.content !== content && targetEntry.type[2] !== 'w') {
            return clc.red(`Permission denied: Cannot write to existing entry '${fileName}'.`);
        }

        if (targetEntry.type[0] !== inputFileType) {
            return `ERROR: cannot change type of existing entry '${fileName}' from '${targetEntry.type[0]}' to '${inputFileType}'.`;
        }

        if (targetEntry.type !== simplifiedPerms && targetEntry.type[4] === 's' && inputOwnerType !== 's') {
            return clc.red(`Permission denied: Cannot change permissions or ownership of system-created entry '${fileName}'.`);
        }
        if (targetEntry.type[4] === 's' && simplifiedPerms !== targetEntry.type) {
            return clc.red(`Permission denied: Cannot modify system-created entry '${fileName}'.`);
        }

        targetEntry.type = simplifiedPerms;
        if (inputFileType === 'd') {
            if (content !== null && typeof content !== 'object') {
                return `ERROR: cannot save string content to existing directory '${fileName}'.`;
            }
            targetEntry.contents = targetEntry.contents || {};
            if (content) {
                Object.assign(targetEntry.contents, content);
            }
        } else {
            if (content === null) {
                targetEntry.content = '';
            } else if (typeof content === 'string') {
                targetEntry.content = content;
            } else {
                return `ERROR: cannot save non-string content to file '${fileName}'.`;
            }
        }
        targetEntry.date[1] = Date.now();
    } else {
        if (parentDir.type[0] !== 'd' || !parentDir.contents || parentDir.type[2] !== 'w') {
            return clc.red(`Permission denied: Cannot write to directory '${parentPath}'.`);
        }
        const allowedName = /[a-zA-Z][0-9a-bA-B()_.\- ]{0,29}$/;
        if (!allowedName.test(fileName)) {
            return `ERROR: invalid ${inputFileType === 'd' ? 'directory' : 'file'} name.\n${clc.red("The name must start with a letter and be followed by 0 to 29 characters, including letters, numbers, spaces, underscores (_), hyphens (-), '(', ')', or periods (.).")}`;
        }

        const newEntry = {
            type: simplifiedPerms,
        };

        if (inputFileType === 'd') {
            newEntry.contents = content || {};
        } else {
            newEntry.content = content || '';
        }
        newEntry.date = [Date.now(), Date.now()]
        parentDir.contents[fileName] = newEntry;
    }
    localStorage.setItem('WebOSFiles', JSON.stringify(fileSystem));
    return okMessage;
}