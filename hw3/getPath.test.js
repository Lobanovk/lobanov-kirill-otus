const { getPath } = require('./getPath');

test("should return uniq selector", () => {
  document.body.innerHTML = `
    <div class="first">
    <div class="content">
      <div class="text">text1</div>
    </div>
  </div>
  <div class="first">
    <div id="content" class="content">  
    </div>
  </div>
  `;
  const element = document.querySelector("div.first:nth-child(2) div.content")
  const path = getPath(element);
  expect(document.querySelectorAll(path).length).toBe(1);
  expect(element).toMatchObject(document.querySelectorAll(path)[0]);
});