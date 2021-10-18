const { getPath } = require('./getPath');

test("should return uniq selector", () => {
  document.body.innerHTML = `
    <div class="first">
    <div class="content">
      <div class="text">text1</div>
    </div>
  </div>
  <div class="first">
    <div class="content">  
    </div>
  </div>
  `;
  const element = document.querySelector("div.first:nth-child(2) div.content")
  expect(document.querySelectorAll(getPath(element)).length).toBe(1);
  expect(element).toMatchObject(document.querySelectorAll(getPath(element)[0]));
});