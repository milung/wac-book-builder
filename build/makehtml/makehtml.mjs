import fs from "fs/promises";
import path from "path";
import { readOptions } from './read-options.mjs';
import { convert_chapter } from './chapter-renderer.mjs';
import { convert_toc } from './toc-renderer.mjs';
import * as watcher from '@parcel/watcher';


async function* walk(dir) {
    for await (const d of await fs.opendir(dir)) {
        const entry = path.join(dir, d.name);
        let dstat = d
        while( dstat.isSymbolicLink() ) {
            const real = await fs.realpath(entry);
            dstat = await fs.stat(real);
        }
        if (dstat.isDirectory()) yield* walk(entry);
        else if (dstat.isFile()) yield entry;
    }
}

function rebase_path(sourceDir, targetDir, file) {
    const rel = path.relative(sourceDir, file);
    return path.join(targetDir, rel);
}


async function walkFiles(opts = {}) {
    const { sourceDir, targetDir, verbose } = opts;

    const linksPath = path.join(sourceDir, '_links.md');
    opts.links = await fs.readFile(linksPath, 'utf8');

    const fileIterator = opts.files || walk(sourceDir)

    for await (const file of fileIterator) {
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
                if (sourceStat.mtimeMs <= targetStat.mtimeMs && !opts.force && !opts.files?.findIndex(file) === -1) {
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
        while (options.watch) {

            let error = false;
            let subscription = await watcher.subscribe(options.sourceDir, async (err, events) => {
                if (err) {
                    console.error(err);
                    return
                }
                if (events.length === 0) {
                    return;
                }
                for( const event of events) {
                    console.log(`File ${event.path} was ${event.type}`);
                    if (event.type === 'delete') {
                        continue;
                    }
                    await convert({ ...options, files: [event.path]}); // run on watch change
                    console.log('done - still watching');
                }
            });

            console.log('watching');

            function sleep(ms) {
                return new Promise((resolve) => {
                    setTimeout(resolve, ms);
                });
            }
            while (!error) { // keep alive
                await sleep(300);
            }
            await subscription.unsubscribe();
        }
    } catch (e) {
        console.error(e);
    };
}
main().then();