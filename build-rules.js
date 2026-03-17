const fs = require("fs");
const path = require("path");

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

  // 1. 加载映射配置 (如果存在)
  const configPath = path.join(rulesDir, "config.json");
  let mapping = {};
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    mapping = config.mapping || {};
    console.log("加载到映射配置，共", Object.keys(mapping).length, "条规则");
  }

  // 2. 预先处理映射关系 (多对一)
  Object.keys(mapping).forEach((sourceKey) => {
    const fileName = mapping[sourceKey];
    const filePath = path.join(rulesDir, fileName);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      const bodyMatch = content.match(/\{([\s\S]*)\}/);
      if (bodyMatch) {
        result[sourceKey] = bodyMatch[1].trim();
        console.log(`[映射] ${sourceKey} -> 使用文件 ${fileName}`);
      }
    }
  });

  // 3. 写入结果
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  console.log(`\n✨ JSON 已成功生成至: ${outputFile}`);
} catch (err) {
  console.error("执行出错:", err);
  process.exit(1);
}
