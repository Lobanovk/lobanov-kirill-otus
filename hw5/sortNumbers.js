const fs = require("fs");
const fsPromises = fs.promises;

const sortedNumbers = ({
  start,
  end
}) => {
  return new Promise(resolve => {
    const stream = fs.createReadStream("numbers.txt", {
      start,
      end
    });
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
        lastEl = arrChunk.pop();
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

const prepareSortedFiles = async () => {
  try {
    let part = 1;
    let start = 0;
    const chunk = 100000 //TODO 1000000
    let end = chunk;
    let lastElements = "";
    let lF = false;
    while (end < 10 * chunk) {
      let {
        data,
        lastEl
      } = await sortedNumbers({
        start,
        end
      });
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
    if (lastElements.length) {
      const sortedArr = lastElements.split(";").sort((a, b) => a - b).join(";") + ";";
      await fsPromises.writeFile(`./sorted/part${part}.txt`, sortedArr);
    }
    return part;
  } catch (e) {
    console.error("error", e);
  }
}

const createReadableStream = (part) => {
  const stream = fs.createReadStream(`./sorted/part${part}.txt`);
  return stream;
}

const watchToStream = (stream) => {
  let count = 0;
  let lastEl = null;
  return {
    resume: () => stream.resume(),
    getData: () => new Promise(resolve => {
      stream.on("data", (buffer) => {
        stream.pause();
        const numberStr = buffer.toString();
        const numberChunks = numberStr.split(";");
        if (lastEl !== null) {
          numberChunks[0] = lastEl + numberChunks[0];
          lastEl = null;
        }
        if (numberStr[numberStr.length - 1] !== ";") {
          lastEl = numberChunks.pop();
        }
        resolve({
          status: count ? "update" : "start",
          data: numberChunks.map(Number),
        });
        count++;
      });
      stream.on("end", () => {
        stream.close();
        resolve({
          status: "end",
          data: []
        });
      });
      stream.on("close", () => {
        resolve({
          status: "close",
          data: []
        })
      })
    })
  }
}

const writeToOutput = async () => {
  try {
    const path = "sortedNumbers.txt";
    const counts = await prepareSortedFiles();
    const streams = [];
    const writableStream = fs.createWriteStream(path);
    for (let index = 1; index <= counts; index++) {
      streams.push(watchToStream(createReadableStream(index)));
    }
    const data = await Promise.all(streams.map(stream => stream.getData()));
    let allLength = 0;
    while (true) {
      allLength = 0;
      const minimal = data.reduce((acc, item, index) => {
        allLength += item.data.length;
        if (item.data[0] !== undefined) {
          acc[item.data[0]] = index;
        }
        return acc;
      } ,{});
      if (allLength === 0) {
        break;
      }
      const min = Math.min(...Object.keys(minimal).map(Number));
      writableStream.write(`${min};`)
      if (data[minimal[min]]?.data?.length) {
        const key = minimal[min];
        data[key].data.shift();
        if (!data[key].data.length) {
          streams[key].resume();
          data[key] = await streams[key].getData();
        }
      }
    }
    writableStream.close();
  } catch (e) {
    console.error("error", e);
  }
}

writeToOutput().then(() => console.log("done"));