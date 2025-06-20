export const commandNames = ['help', 'cls', 'echo', 'cd', 'ls', 'cat', 'reboot', 'javascript', 'reset', 'chmod', 'exemple', 'pwd', 'mkdir', 'mv', 'cp', 'rmdir', 'rm'];
const filesToLoad = ['bin/main.js', 'usr/share/css/style.css', 'etc/colors.css', 'etc/config.js', 'libs/colors.js', 'libs/errors.js', 'libs/files.js', 'libs/parser.js'];
commandNames.forEach((cmd) => filesToLoad.push(`bin/${cmd}.js`));

let files = {
    '/': {
        type: 'dr--s',
        date: [Date.now(), Date.now()],
        contents: {
            'bin': {
                type: 'dr--s',
                date: [Date.now(), Date.now()],
                contents: {}
            },
            'dev': {
                type: 'dr--s',
                date: [Date.now(), Date.now()],
                contents: {}
            },
            'etc': {
                type: 'dr--s',
                date: [Date.now(), Date.now()],
                contents: {}
            },
            'home': {
                type: 'dr--s',
                date: [Date.now(), Date.now()],
                contents: {
                    'user': {
                        type: 'drwxs',
                        date: [Date.now(), Date.now()],
                        contents: {
                            'Desktop': {
                                type: 'drwxs',
                                date: [Date.now(), Date.now()],
                                contents: {
                                    'README.md': { type: '-rwxu', content: '## README.md file', date: [Date.now(), Date.now()] },
                                    's.sh': { type: '-rwxu', content: '# exemple sh script\necho "/system/commands files and permissions :"\ncd /system/commands/\nls --long', date: [Date.now(), Date.now()] },
                                    'script.js': { type: '-rwxu', content: 'const a = 5;\nconst b = 2;\nif (a > b) {\n    console.log("a est plus grand que b");\n} else {\n    console.error("a n\'est pas plus grand que b");\n}', date: [Date.now(), Date.now()] },
                                }
                            },
                            'Downloads': {
                                type: 'drwxs',
                                date: [Date.now(), Date.now()],
                                contents: {}
                            },
                            'Documents': {
                                type: 'drwxs',
                                date: [Date.now(), Date.now()],
                                contents: {}
                            },
                        }
                    },
                }
            },
            'lib': {
                type: 'dr--s',
                date: [Date.now(), Date.now()],
                contents: {}
            },
            'proc': {
                type: 'dr--s',
                date: [Date.now(), Date.now()],
                contents: {}
            },
            'sbin': {
                type: 'dr--s',
                date: [Date.now(), Date.now()],
                contents: {}
            },
            'tmp': {
                type: 'dr--s',
                date: [Date.now(), Date.now()],
                contents: {}
            },
            'usr': {
                type: 'dr--s',
                date: [Date.now(), Date.now()],
                contents: {
                    'bin': {
                        type: 'dr--s',
                        date: [Date.now(), Date.now()],
                        contents: {}
                    },
                    'share': {
                        type: 'dr--s',
                        date: [Date.now(), Date.now()],
                        contents: {}
                    }
                }
            },
            'var': {
                type: 'dr--s',
                date: [Date.now(), Date.now()],
                contents: {}
            }
        }
    }
};

async function getFile(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error fetching ${path}:`, error);
        return null;
    }
}

async function initializeFiles() {
    if (localStorage.getItem('WebOSFiles')) {
        files = JSON.parse(localStorage.getItem('WebOSFiles'));
        return;
    }

    await Promise.all(filesToLoad.map(async filePath => {
        const content = await getFile(`../../${filePath}`);
        if (content !== null) {
            const parts = filePath.split('/');
            let currentDir = files['/'];

            for (let i = 0; i < parts.length - 1; i++) {
                const dirName = parts[i];
                if (!currentDir.contents[dirName]) {
                    currentDir.contents[dirName] = { type: 'dr--s', contents: {}, date: [Date.now(), Date.now()] };
                }
                currentDir = currentDir.contents[dirName];
            }

            const fileName = parts[parts.length - 1];
            currentDir.contents[fileName] = { type: '-r--s', content: content, date: [Date.now(), Date.now()] };
        }
    }));

    localStorage.setItem('WebOSFiles', JSON.stringify(files));
}

initializeFiles().catch(error => {
    console.error("Error during files initialization:", error);
});

export async function getFiles() {
    let filesToSend = localStorage.getItem('WebOSFiles');
    if (!filesToSend) return files;
    else return JSON.parse(filesToSend);
}