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

const content = fs.readFileSync('./src/index.html', 'utf8');
const newContent = content.replace(/<meta version="[^"]*">/g, `<meta version="${version}">`);
fs.writeFileSync('./src/index.html', newContent, 'utf8');