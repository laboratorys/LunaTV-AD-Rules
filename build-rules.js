const fs = require("fs");
const path = require("path");

// 修正点：使用 process.cwd()
const rulesDir = path.join(process.cwd(), "rules");
const distDir = path.join(process.cwd(), "dist");
const outputFile = path.join(distDir, "rules.json");

const result = {};

try {
  if (!fs.existsSync(rulesDir)) {
    console.error('Error: "rules" 目录不存在');
    process.exit(1);
  }

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const files = fs.readdirSync(rulesDir);

  files.forEach((file) => {
    if (file.endsWith(".ts")) {
      const key = path.parse(file).name;
      const content = fs.readFileSync(path.join(rulesDir, file), "utf8");

      // 提取第一个 { 和最后一个 } 之间的函数体
      const bodyMatch = content.match(/\{([\s\S]*)\}/);
      if (bodyMatch) {
        result[key] = bodyMatch[1].trim();
        console.log(`成功处理: ${file}`);
      }
    }
  });

  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  console.log(`JSON 已生成至: ${outputFile}`);
} catch (err) {
  console.error("执行出错:", err);
  process.exit(1);
}
