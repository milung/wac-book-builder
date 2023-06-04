import fs from "fs/promises";
import path from "path";
import Gaze from 'gaze';
import { readOptions } from './read-options.mjs';
import { convert_chapter } from './chapter-renderer.mjs';
import { convert_toc } from './toc-renderer.mjs';


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


async function walkFiles(opts = {}) {
    const { sourceDir, targetDir, verbose } = opts;

    const linksPath = path.join(sourceDir, '_links.md');
    opts.links = await fs.readFile(linksPath, 'utf8');;

    for await (const file of walk(sourceDir)) {
        let targetPath = rebase_path(sourceDir, targetDir, file);
        /* compare files timestamps */
        const sourceStat = await fs.stat(file);

        if (file.endsWith('.md')) {
            if (file.endsWith('_toc.md')) {
                continue
            }

            targetPath = targetPath.replace('.md', '.html');
            try {
                const targetStat = await fs.stat(targetPath);
                if (sourceStat.mtimeMs <= targetStat.mtimeMs && !opts.force) {
                    continue;
                }
            } catch (e) {
                // file does not exist
            }

            if (verbose) {
                console.log(`Converting ${file} to ${targetPath}`);
            }

            await convert_chapter(file, targetPath, opts);

        } else {
            try {
                const targetStat = await fs.stat(targetPath);
                if (sourceStat.mtimeMs <= targetStat.mtimeMs) {
                    continue;
                }
            } catch (e) {
                // file does not exist
            }
            if (verbose) {
                console.log(`Copying ${file} to ${targetPath}`);
            }
            await fs.mkdir(path.dirname(targetPath), { recursive: true });
            await fs.copyFile(file, targetPath);
        }
    }
}

async function convert(options) {
    await walkFiles(options);
    await convert_toc(options);
}

async function main() {
    const args = readOptions();

    const options = {
        sourceDir: args.source || './book-src/',
        targetDir: args.target || './src/book/',
        watch: args.watch || false,
        verbose: args.verbose || false,
        bookPrefix: args.bookPrefix || './book',
        version: args.version || 'latest',
        force: args.force || false,
    };

    try {
        await convert(options); // first run        
        if (options.watch) {
            console.log('watching');
            var gaze = new Gaze(`${options.sourceDir}/**/*`);
            gaze.on('all', async function (event, filepath) {
                await convert(options); // run on watch change
                console.log('done - still watching');
            });

            function sleep(ms) {
                return new Promise((resolve) => {
                    setTimeout(resolve, ms);
                });
            }
            while (true) { // keep alive
                await sleep(300);
            }
        }
    } catch (e) {
        console.error(e);
    };
}
main().then();