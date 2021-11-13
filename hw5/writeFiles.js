const fs = require("fs");
const fsPromises = fs.promises;

function randomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

const writeToFile = async () => {
  try {
    const str = createArrNumbers();
    await fsPromises.writeFile("numbers.txt", str);
  } catch (e) {
    console.error("error", e);
  }
}

const createArrNumbers = () => {
  let str = "";
  while (str.length < 1 * 1000000) { //TODO поменять на 100
    str += `${randomInteger(1, 10999999)};`;
  }
  return str;
}

writeToFile();