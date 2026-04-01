const fs = require("fs");
const path = require("path");

const rulesDir = path.join(process.cwd(), "rules");
const distDir = path.join(process.cwd(), "dist");
const outputFile = path.join(distDir, "rules.json");

const tvJsonPath = path.join(process.cwd(), "tv.json");
const tvDemoJsonPath = path.join(process.cwd(), "tv-demo.json");
const configTxtPath = path.join(distDir, "config.txt");
const configDemoTxtPath = path.join(distDir, "config-demo.txt");

const result = {};

function base58Encode(buffer) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const result = [];

  for (const byte of buffer) {
    let carry = byte;
    for (let j = 0; j < result.length; j++) {
      const x = (result[j] << 8) + carry;
      result[j] = x % 58;
      carry = (x / 58) | 0;
    }
    while (carry > 0) {
      result.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    result.push(0);
  }

  return result
    .reverse()
    .map((index) => alphabet[index])
    .join("");
}

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
  // 4. 写入结果
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  console.log(`\n✨ JSON 已成功生成至: ${outputFile}`);
  if (fs.existsSync(tvDemoJsonPath)) {
    const tvDemoContent = fs.readFileSync(tvDemoJsonPath); // 读取为 Buffer
    const encodedDemo = base58Encode(tvDemoContent);
    fs.writeFileSync(configDemoTxtPath, encodedDemo);
    console.log(`✨ Base58 编码已生成至: ${configDemoTxtPath}`);
  } else {
    console.warn(`⚠️ 未找到 ${tvDemoJsonPath}，跳过生成 config-demo.txt`);
  }
  if (fs.existsSync(tvJsonPath)) {
    const tvContent = fs.readFileSync(tvJsonPath); // 读取为 Buffer
    const encoded = base58Encode(tvContent);
    fs.writeFileSync(configTxtPath, encoded);
    console.log(`✨ Base58 编码已生成至: ${configTxtPath}`);
  } else {
      console.warn(`⚠️ 未找到 ${tvJsonPath}，跳过生成 config.txt`);
  }
} catch (err) {
  console.error("执行出错:", err);
  process.exit(1);
}
