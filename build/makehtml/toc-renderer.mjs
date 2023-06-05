import { marked } from 'marked';
import  { rebaseReference } from './rebase-reference.mjs';
import { renderIcon } from './render-icon.mjs';
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";

class TocRenderer extends marked.Renderer {

    constructor(sourceFile, opts = {}) {
        super();
        this.sourceFile = sourceFile;
        this.opts = opts;
    }

    hr() {
        return `<md-divider inset></md-divider>`;
    }

    link(href, _title, text) {
        const { sourceDir } = this.opts;
        href = rebaseReference( href, this.sourceFile, this.opts)
        const match = text.match(/^([@$]?[a-z\-]+)&gt;/);
        let iconEl = `<md-icon slot="icon">bookmark</md-icon>`;
        let label = text;
        if (match && match[1]) {
            const icon = match[1];
            label = text.substring(match[0].length);
            iconEl = renderIcon(icon);
        
        }
        return `<book-sidebar-state href="${href}">${iconEl}${label}</book-sidebar-state>`;
    }
}

function preprocess_includes(content, sourceFilePath, opts = {}) {
    const { sourceDir } = opts;
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

let oldToc = null;
export async function convert_toc(opts = {}) {
    const { sourceDir, targetDir } = opts;
    const tocPath = path.join(sourceDir, '_toc.md');
    let content = fsSync.readFileSync(tocPath, 'utf8');
    content = preprocess_includes(content, tocPath, opts);
    if (oldToc === content) {
        return;
    }
    oldToc = content;
    const tocRenderer = new TocRenderer(tocPath, opts);
    const html = marked.parse(content, { renderer: tocRenderer, mangle: false, headerIds: false  });

    const targetPath = path.join(targetDir, '_toc.html');
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, html);
}

