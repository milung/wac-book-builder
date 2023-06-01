var showdown = require('showdown');
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
var Gaze = require('gaze');

function readOptions() {
    const args = process.argv.slice(2);
    const options = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const key = arg.substring(2);
            const value = args[i + 1];
            if (value && value.startsWith('--')) {
                options[key] = value;
                i++;
            }
            else {
                options[key] = true;
            }
        }
    }
    return options;
}


const args = readOptions();

const sourceDir = args.source || './book-src/';
const targetDir = args.target || './src/book/';
const referenceSuffix = '.html';
const bookPrefix = args.prefix || './book';
const version = args.version || 'v0.0';
const watch = args.watch || false;

const options = {
    customizedHeaderId: true,
    ghCompatibleHeaderId: true,
    emoji: true,
    encodeEmails: true,
    ghMentions: true,
    headerLevelStart: 2,
    disableForced4SpacesIndentedSublists: true,
    smartIndentationFix: true,
    tables: true,
}

function rebaseReference(sourceFile, reference) {
    // test if reference starts with a protocol or absolute path
    if (reference.match(/^[a-zA-Z]+:\/\//) || reference.startsWith('/')) {
        return reference;
    }
    let rel = path.join(path.dirname(sourceFile), reference);
    rel = path.relative(sourceDir, rel);
    rel = rel.replace(/.md(?=$|#|\?)/, referenceSuffix);

    let ref = path.join(bookPrefix, rel).replaceAll("\\", "/",);
    if (ref.indexOf('?') >= 0) {
        ref = ref + '&version=' + version;
    } else {
        ref = ref + '?version=' + version;
    }
    return ref;
}

function preprocess_includes(content, sourceFilePath) {
    const dirname = path.dirname(sourceFilePath);
    return content.replaceAll(/^\[#include ([^\]]*)\]/gm, (match, file) => {
        file.trim();
        const filePath = path.join(dirname, file);
        const localDirname = path.dirname(filePath);
        let relativeDir = path.relative(sourceDir, localDirname).replaceAll("\\", "/");
        let localContent = fsSync.readFileSync(filePath, 'utf8');
        localContent = localContent.replaceAll(/\]\(([^\)]*)\)/g, (match, ref) => {
            if (ref.startsWith('http')) {
                return match;
            }
            return '](' + path.join(relativeDir, ref).replaceAll("\\", "/") + ')';
        });

        return `<book-section path="${relativeDir}">\r\n` + preprocess_includes(localContent, filePath) + "\r\n</book-section>";
    });
}

function renderIcon(icon) {
    if (!icon) return '';
    if (icon.startsWith('@') || icon.startsWith('$')) {
        icon = icon.substring(1);
        return `<awesome-icon slot="icon">${icon}</awesome-icon>`;
    } else {
        icon = icon?.replaceAll('-', '_');
        return `<md-icon slot="icon">${icon}</md-icon>`;
    };
}

const toc = (filePath) => {
    return () => [{
        type: 'output',
        regex: /<a href="([^"]*)">(([@$]?[a-z\-]+)>)?(((?!<\/a>).)*)<\/a>/gm,
        replace: (text, ref, _, icon, label) => {

            let iconEl = renderIcon(icon);
            if (!iconEl) {
                iconEl = `<md-icon slot="icon">bookmark</md-icon>`;
            }
            return `<book-sidebar-state href="${rebaseReference(filePath, ref)}">${iconEl}${label}</book-sidebar-state>`;
        }
    },
    {
        type: 'output',
        regex: /<\/?p>/g,
        replace: ``,
    },
    {
        type: 'output',
        regex: /<hr \/>/g,
        replace: `<md-divider inset></md-divider>`,
    },
    {
        // remove unused link definitions
        type: 'output',
        regex: /(\[[^\]]*]:.*\s*)/gm,
        replace: ``,
    }
    ]
};

const chapter = (filePath) => {
    let pictureCounter = 1;
    return () => [
        {
            type: 'output',
            regex: /<a href="([^"]*)">(((?!<\/a>).)*)<\/a>/gm,
            replace: (text, ref, label) => {
                return `<book-link href="${rebaseReference(filePath, ref)}">${label}</book-link>`;
            }
        },
        {
            type: 'output',
            regex: /<img src="([^"]*)"\s*(alt="([^"]*)"\s*)?\/>/g,
            replace: (text, ref, _, alt) => {
                return `<book-img src="${rebaseReference(filePath, ref)}" alt="${alt}" counter="${pictureCounter++}"></img>`;
            }
        },
        {
            type: 'output',
            regex: /<pre><code\s+class="([^"]*)">/g,
            replace: (text, lang) => {
                lang = lang.split(' ')[0]
                return `<code-highlight language="${lang}">`;
            }
        },
        {
            type: 'output',
            regex: /<\/code><\/pre>/g,
            replace: (text, lang, code) => {
                return `</code-highlight>`;
            }
        },
        {
            type: 'output',
            regex: /<hr \/>/g,
            replace: `<md-divider inset></md-divider>`,
        },
        {
            // remove unused link definitions
            type: 'output',
            regex: /<p>(\[[^\]]*]:.*\s*)+<\/p>/gm,
            replace: ``,
        },
        {
            type: 'output',
            regex: /<blockquote>\s*<p>(\$?[a-z_]+):&gt;/gm,
            replace: (text, icon) => {
                const iconEl = renderIcon(icon);
                return `<blockquote><book-hint-type>${iconEl}</book-hint-type><p>`;
            }
        },
        {
            type: 'output',
            regex: /@_empty_line_@/gm,
            replace: ``,
        },

    ]
};

async function* walk(dir) {
    for await (const d of await fs.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory()) yield* walk(entry);
        else if (d.isFile()) yield entry;
    }
}

function rebase_path(sourceDir, targetDir, file) {
    const rel = path.relative(sourceDir, file);
    return path.join(targetDir, rel);
}

async function convert() {
    const linksPath = path.join(sourceDir, '_links.md');
    const links = await fs.readFile(linksPath, 'utf8');

    for await (const file of walk(sourceDir)) {
        let targetPath = rebase_path(sourceDir, targetDir, file);
        if (file.endsWith('.md')) {
            let converter = new showdown.Converter({ extensions: [chapter(file)], ...options });
            let md = await fs.readFile(file, 'utf8');
            if (file.endsWith('_toc.md')) {
                continue
            }
            targetPath = targetPath.replace('.md', '.html');
            console.log(`Converting ${file} to ${targetPath}`);

            md = md + '\n\n' + links;
            let html = converter.makeHtml(md);
            await fs.mkdir(path.dirname(targetPath), { recursive: true });
            await fs.writeFile(targetPath, html);
        } else {
            console.log(`Copying ${file} to ${targetPath}`);
            await fs.mkdir(path.dirname(targetPath), { recursive: true });
            await fs.copyFile(file, targetPath);
        }
    }
}

async function convert_toc() {
    const tocPath = path.join(sourceDir, '_toc.md');
    let content = fsSync.readFileSync(tocPath, 'utf8');
    content = preprocess_includes(content, tocPath);
    const converter = new showdown.Converter({ extensions: [toc(tocPath)], ...options });
    const html = converter.makeHtml(content);
    const targetPath = path.join(targetDir, '_toc.html');
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, html);
}

async function doit() {

    try {
        await convert();
        await convert_toc();
        console.log('watching');
        if (watch) {
            var gaze = new Gaze(`${sourceDir}/**/*`);
            gaze.on('all', async function (event, filepath) {
                await convert();
                await convert_toc();
                console.log('done - still watching');
            });
            function sleep(ms) {
                return new Promise((resolve) => {
                    setTimeout(resolve, ms);
                });
            }
            while (true) {
                await sleep(300);
            }
        }
    } catch (e) {
        console.error(e);
    };
}
doit().then();