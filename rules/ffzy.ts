function processM3u8(content: string, baseUrl: string) {
  const lines: string[] = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  lines.forEach((line) => {
    if (line.startsWith("#EXTINF")) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
      }
      currentBlock = [line];
    } else if (currentBlock.length > 0) {
      currentBlock.push(line);
    }
  });

  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  const valid: string[][] = [];
  const ads: string[] = [];

  blocks.forEach((block, i) => {
    const count = block.length / 2;
    if (i === 0 || count >= 10) {
      valid.push(block);
    } else {
      if (ads.length > 0) ads.push("#EXT-X-DISCONTINUITY");
      block.forEach((line, idx) => {
        if (line.startsWith("#EXTINF")) {
          ads.push(line);
          const ts = block[idx + 1];
          if (ts && !ts.startsWith("#")) {
            ads.push(ts.startsWith("http") ? ts : baseUrl + ts);
          }
        }
      });
    }
  });

  return { validBlocks: valid, adSegments: ads };
}
