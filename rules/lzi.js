//片段不连续，且每段ts数量较少，可能是广告
function processM3u8_lzi(blocks, baseUrl) {
  const valid = [];
  const ads = [];
  let lastValidNum = -1;

  blocks.forEach((block, i) => {
    const tsFiles = block.filter((line) => line && !line.startsWith("#"));
    if (tsFiles.length === 0) {
      valid.push(block);
      return;
    }

    const firstTs = tsFiles[0];
    const match = firstTs.match(/(\d+)\.ts$/);
    let isAd = false;

    if (match) {
      const currentNum = parseInt(match[1], 10);
      if (i !== 0 && lastValidNum !== -1) {
        if (currentNum !== lastValidNum + 1) {
          isAd = true;
        }
      }
    } else {
      isAd = false;
    }

    if (!isAd) {
      valid.push(block);
      const lastTs = tsFiles[tsFiles.length - 1];
      const lastMatch = lastTs.match(/(\d+)\.ts$/);
      lastValidNum = lastMatch ? parseInt(lastMatch[1], 10) : -1;
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
