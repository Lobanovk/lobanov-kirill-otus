const fs = require("fs");
const fsPromises = fs.promises;

const sortedNumbers = ({ start, end }) => {
    return new Promise(resolve => {
        const stream = fs.createReadStream("numbers.txt", { start, end });
        let result = [];
        let lastEl = null;
        stream.on("data", (str) => {
            const chunk = str.toString();
            const arrChunk = chunk.split(";");
            if (lastEl) {
                arrChunk[0] = lastEl + arrChunk[0];
            }
            lastEl = null;
            if (chunk[chunk.length - 1] !== ";") {
                lastEl = arrChunk[arrChunk.length - 1];
                arrChunk.pop();
            }
            result = result.concat(arrChunk).sort((a, b) => a - b).filter(Boolean);
        });
        stream.on("end", () => {
           stream.close();
           const str = `${result.join(";")};`;
           resolve({
               data: str,
               lastEl
           });
        });
    })
}

const writeToFile = async () => {
    try {
        let part = 1;
        let start = 0;
        const chunk = 100000 //TODO 1000000
        let end = chunk;
        let lastElements = "";
        let lF = false;
        while (end < 10 * chunk) {
            let { data, lastEl } = await sortedNumbers({start, end});
            if (part > 1 && lF) {
                const last = data.substring(0, data.indexOf(";"));
                data = data.substring(data.indexOf(";") + 1);
                lastElements += `${last};`;
            }
            lF = false;
            if (lastEl) {
                lastElements += lastEl;
                lF = true;
            }
            await fsPromises.writeFile(`./sorted/part${part}.txt`, data);
            start = end + 1;
            end = start + chunk;
            part++;
        }
        const sortedArr = lastElements.split(";").sort((a, b) => a - b).join(";") + ";";
        part += 1;
        await fsPromises.writeFile(`./sorted/part${part}.txt`, sortedArr);
        return part;
    } catch (e) {
        console.error("error", e);
    }
}

const createReadableStream = (part) => {
    return new Promise(resolve => {
        const stream = fs.createReadStream(`./sorted/part${part}.txt`);
        stream.on("data", (buffer) => {
            stream.pause();
            const arr = buffer.toString().split(";").map(Number);
            resolve({
                status: "start",
                data: arr,
                resume: () => stream.resume()
            })
        });
        stream.on("end", () => {
            stream.close();
            resolve({
                status: "end",
                data: [],
            });
        })
    })
}

const writeToOutput = async () => {
    try {
        const stream = await createReadableStream(1);
    } catch (e) {
        console.error("error", e);
    }
}

writeToOutput().then(() => console.log("done"));