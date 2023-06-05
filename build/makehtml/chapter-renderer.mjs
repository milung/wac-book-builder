import { marked } from 'marked';
import  { rebaseReference } from './rebase-reference.mjs';
import { renderIcon } from './render-icon.mjs';
import fs from "fs/promises";
import path from "path";
import { encode } from 'html-entities';

class ChapterRenderer extends marked.Renderer {

    imgCounter = 0;
    constructor(sourceFile, opts = {}) {
        super();
        this.sourceFile = sourceFile;
        this.opts = opts;
    }

    code(code, lang) {
        code = code.replaceAll('@_empty_line_@', '');
        return `<code-highlight language="${lang}">${encode(code)}</code-highlight>`;
    }
 
    hr() {
        return `<md-divider inset></md-divider>`;
    }

    image(href, title, text) {
        href = rebaseReference(href, this.sourceFile, this.opts);
        return `<book-img src="${href}" alt="${title || text}" counter="${++this.imgCounter}"></book-img>`;
    }

    link(href, _title, text) {
        href = rebaseReference(href, this.sourceFile, this.opts)
        return `<book-link href="${href}">${text}</book-link>`;
    }

    blockquote(quote) {
        const match = quote.match(/^<p>\s*(\$?[a-z_]+):&gt;/);
        if (match && quote.startsWith(match[0])) {
            quote = quote.substring(match[0].length);
            const icon = match[1];
            const iconEl = renderIcon(icon);
            return `<blockquote><p><book-hint-type>${iconEl}</book-hint-type>${quote}</blockquote>`;
        } else {
            return `<blockquote>${quote}</blockquote>`;
        }
    }
}

export async function convert_chapter(sourceFile, targetFile, opts = {}) {
    const chapterRenderer = new ChapterRenderer(sourceFile, opts);
    let source = await fs.readFile(sourceFile, 'utf8');
    source  = source + '\n\n' + opts.links;

    const html = marked.parse(source, { renderer: chapterRenderer, mangle: false, headerIds: false });

    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, html);
}