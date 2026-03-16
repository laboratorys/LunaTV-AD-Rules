const fs = require("fs");
const path = require("path");

const rulesDir = path.join(__process.cwd(), "rules");
const distDir = path.join(__process.cwd(), "dist");
const result = {};

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

fs.readdirSync(rulesDir).forEach((file) => {
  if (file.endsWith(".ts")) {
    const fileName = path.parse(file).name;
    const content = fs.readFileSync(path.join(rulesDir, file), "utf8");

    // 匹配方法体：匹配第一个 '{' 到最后一个 '}' 之间的内容
    // 这种方式适用于导出单一函数的结构
    const match = content.match(/\{([\s\S]*)\}/);
    if (match) {
      result[fileName] = match[1].trim();
    }
  }
});

fs.writeFileSync(
  path.join(distDir, "rules.json"),
  JSON.stringify(result, null, 2),
);
