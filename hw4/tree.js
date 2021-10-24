const fsPromises = require("fs/promises");
const path = require("path");

const getTree = (_path) => {
    const files = [];
    const dirs = [_path];
    const realPath = path.dirname(__dirname);
    const helper = async (_path) => {
        try {
            const _files = await fsPromises.readdir(`${realPath}/${_path}`, { withFileTypes: true });
            if (_files.length === 0) return;
            for (const file of _files) {
                if (file.isDirectory()) {
                    dirs.push(`${_path}${file.name}`);
                    await helper(`${_path}${file.name}/`);
                }
                if (file.isFile()) {
                    files.push(`${_path}${file.name}`);
                }
            }
        } catch (e) {
            console.error("error", e);
        }
    }

    helper(_path).then(() => {
        console.log({
            files,
            dirs,
        })
    });
}

getTree("hw4/");
