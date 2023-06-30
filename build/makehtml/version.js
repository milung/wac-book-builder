const fs = require("fs");

const args = readOptions();
function readOptions() {
    const args = process.argv.slice(2);
    const options = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const key = arg.substring(2);
            const value = args[i + 1];
            if (value && !value.startsWith('--')) {
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

const version = args.version || 'v0.0';
const author = args.author || 'unknown';
const email = args.email || 'unknown';
const emailB64 = Buffer.from(email).toString('base64');
const title = args.title || 'Textbook';
const description = args.description || 'Textbook';
const imageCaption = args["image-caption"] || 'Figure %d.';

let content = fs.readFileSync('./www/index.html', 'utf8');
content = content.replace(/<meta name="version" content="[^"]*">/g, `<meta name="version" content="${version}">`);
content = content.replace(/<meta name="author" content="[^"]*">/g, `<meta name="author" content="${author}">`);
content = content.replace(/<meta name="email" content="[^"]*">/g, `<meta name="email" content="${emailB64}">`);
content = content.replace(/<meta name="description" content="[^"]*">/g, `<meta name="description" content="${description}">`);
content = content.replace(/<meta name="image-caption" content="[^"]*">/g, `<meta name="image-caption" content="${imageCaption}">`);
content = content.replace(/<title>[^>]*<\/title>/g, `<title>${title}</title>`);

fs.writeFileSync('./www/index.html', content, 'utf8');

let manifest = fs.readFileSync('./www/manifest.json', 'utf8');
manifest = manifest.replace(/"name": "[^"]*"/g, `"name": "${description}"`);
manifest = manifest.replace(/"short_name": "[^"]*"/g, `"short_name": "${title}"`);

fs.writeFileSync('./www/manifest.json', manifest, 'utf8');