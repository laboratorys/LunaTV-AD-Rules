function processM3u8(blocks: string[][], baseUrl: string) {
  const valid: string[][] = [];
  const ads: string[] = [];
  blocks.forEach((block, i) => {
    const count = block.length / 2;
    if (i === 0 || count >= 8) {
      valid.push(block);
    } else {
      if (ads.length > 0) ads.push("#EXT-X-DISCONTINUITY");
      block.forEach((line, idx) => {
        if (line.startsWith("#EXTINF")) {
          ads.push(line);
          const ts = block[idx + 1];
          if (ts && !ts.startsWith("#")) {
            ads.push(ts.startsWith("http") ? ts : new URL(ts, baseUrl).href);
          }
        }
      });
    }
  });
  return { validBlocks: valid, adSegments: ads };
}
