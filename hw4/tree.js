const fsPromises = require("fs/promises");
const path = require("path");


const getTree = async (currentPath) => {
    try {
        const result = {
          files: [],
          dirs: [],
        };
        const resolvePath = path.resolve(currentPath);
        const files = await fsPromises.readdir(resolvePath, { withFileTypes: true });
        if (!files.length) return result;
        for (const file of files) {
            if (file.isDirectory()) {
                result.dirs.push(`${currentPath}${file.name}`);
                const res = await getTree(`${currentPath}${file.name}/`);
                result.dirs = result.dirs.concat(res.dirs);
                result.files = result.files.concat(res.files);
            }
            if (file.isFile()) {
                result.files.push(`${currentPath}${file.name}`);
            }
        }
        return result;
    } catch (e) {
        console.error("error", e);
    }
}

getTree(process.argv[process.argv.length - 1]).then(console.log);