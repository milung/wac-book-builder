import path from "path";



export function rebaseReference(reference, sourceFile, opts) {
    const version = opts?.version || 'latest';
    const bookPrefix = opts?.bookPrefix || './book';
    const sourceDir = opts?.sourceDir || './book-src/';

    // test if reference starts with a protocol or absolute path
    if (reference.match(/^[a-zA-Z]+:\/\//) || reference.startsWith('/')) {
        return reference;
    }
    let rel = path.join(path.dirname(sourceFile), reference);
    rel = path.relative(sourceDir, rel);
    rel = rel.replace(/.md(?=$|#|\?)/, ".html");

    let ref = path.join(bookPrefix, rel).replaceAll("\\", "/",);
    if (ref.indexOf('?') >= 0) {
        ref = ref + '&version=' + version;
    } else {
        ref = ref + '?version=' + version;
    }
    return ref;
}
