const getPath = (el) => {
  const getAllParents = (el) => {
    const parents = [];
    let element = el;
    while (element.parentElement) {
      let selector = `${element.tagName}`;
      for (let attribute of element.getAttributeNames()) {
        if (attribute === "id") {
          selector += `#${element.getAttribute(attribute)}`;
        } else if (attribute === "class") {
          const classesStr = element.getAttribute(attribute)?.replace(/^\b|\s/g, ".");
          if (classesStr) selector += classesStr;
        } else {
          selector += `[${attribute}='${element.getAttribute(attribute)}']`
        }
      }
      const indexElement = Array.from(element.parentElement.children).indexOf(element);
      selector += `:nth-child(${indexElement + 1})`;
      parents.push(selector);
      element = element.parentElement;
    }
    return parents.reverse();
  }
  const parents = getAllParents(el);
  return parents.join(" ");
}

module.exports = {
  getPath
}