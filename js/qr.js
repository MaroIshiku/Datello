const RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12, 7, 37, 13], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];
const PATTERN_POSITION_TABLE = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]];
const ERROR_CORRECT_M = 0;
const MODE_8BIT_BYTE = 4;
const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | 1;
const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | 1;
const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
const PAD0 = 0xec;
const PAD1 = 0x11;
const enc = new TextEncoder();

const EXP_TABLE = new Array(256);
const LOG_TABLE = new Array(256);
for (let i = 0; i < 8; i++) EXP_TABLE[i] = 1 << i;
for (let i = 8; i < 256; i++) EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
for (let i = 0; i < 255; i++) LOG_TABLE[EXP_TABLE[i]] = i;

function gexp(n) { return EXP_TABLE[((n % 255) + 255) % 255]; }
function glog(n) { if (n < 1) throw new Error('glog'); return LOG_TABLE[n]; }
function gfMul(a, b) { return a === 0 || b === 0 ? 0 : gexp(glog(a) + glog(b)); }
function rsBlocks(version, errorCorrection = ERROR_CORRECT_M) {
  const offset = {1: 0, 0: 1, 3: 2, 2: 3}[errorCorrection];
  const spec = RS_BLOCK_TABLE[(version - 1) * 4 + offset];
  const blocks = [];
  for (let i = 0; i < spec.length; i += 3) {
    const [count, totalCount, dataCount] = spec.slice(i, i + 3);
    for (let j = 0; j < count; j++) blocks.push({ totalCount, dataCount });
  }
  return blocks;
}
function lengthInBits(version) { return version < 10 ? 8 : 16; }
function bitLimit(version) { return rsBlocks(version).reduce((sum, block) => sum + block.dataCount * 8, 0); }
function chooseVersion(dataBytes) {
  for (let version = 1; version <= 40; version++) {
    const needed = 4 + lengthInBits(version) + dataBytes.length * 8;
    if (needed <= bitLimit(version)) return version;
  }
  throw new Error('QR-Daten sind zu lang.');
}

class BitBuffer {
  constructor() { this.buffer = []; this.length = 0; }
  put(num, length) { for (let i = 0; i < length; i++) this.putBit(((num >>> (length - i - 1)) & 1) === 1); }
  putBit(bit) {
    const index = Math.floor(this.length / 8);
    if (this.buffer.length <= index) this.buffer.push(0);
    if (bit) this.buffer[index] |= 0x80 >>> (this.length % 8);
    this.length++;
  }
}

function generatorPoly(ecCount) {
  let poly = [1];
  for (let i = 0; i < ecCount; i++) poly = polyMultiply(poly, [1, gexp(i)]);
  return poly;
}
function polyMultiply(a, b) {
  const out = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) out[i + j] ^= gfMul(a[i], b[j]);
  return out;
}
function rsRemainder(data, ecCount) {
  const gen = generatorPoly(ecCount);
  const msg = data.concat(new Array(ecCount).fill(0));
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef === 0) continue;
    for (let j = 0; j < gen.length; j++) msg[i + j] ^= gfMul(gen[j], coef);
  }
  return msg.slice(msg.length - ecCount);
}

function createData(version, dataBytes) {
  const buffer = new BitBuffer();
  buffer.put(MODE_8BIT_BYTE, 4);
  buffer.put(dataBytes.length, lengthInBits(version));
  for (const byte of dataBytes) buffer.put(byte, 8);
  const limit = bitLimit(version);
  for (let i = 0; i < Math.min(limit - buffer.length, 4); i++) buffer.putBit(false);
  const delimit = buffer.length % 8;
  if (delimit) for (let i = 0; i < 8 - delimit; i++) buffer.putBit(false);
  const bytesToFill = Math.floor((limit - buffer.length) / 8);
  for (let i = 0; i < bytesToFill; i++) buffer.put(i % 2 === 0 ? PAD0 : PAD1, 8);
  return createBytes(buffer.buffer, rsBlocks(version));
}
function createBytes(buffer, blocks) {
  let offset = 0;
  let maxDc = 0;
  let maxEc = 0;
  const dcdata = [];
  const ecdata = [];
  for (const block of blocks) {
    const dcCount = block.dataCount;
    const ecCount = block.totalCount - dcCount;
    maxDc = Math.max(maxDc, dcCount);
    maxEc = Math.max(maxEc, ecCount);
    const dc = buffer.slice(offset, offset + dcCount).map(v => v & 0xff);
    offset += dcCount;
    const ec = rsRemainder(dc, ecCount);
    dcdata.push(dc); ecdata.push(ec);
  }
  const out = [];
  for (let i = 0; i < maxDc; i++) for (const dc of dcdata) if (i < dc.length) out.push(dc[i]);
  for (let i = 0; i < maxEc; i++) for (const ec of ecdata) if (i < ec.length) out.push(ec[i]);
  return out;
}

function BCHTypeInfo(data) {
  let d = data << 10;
  while (BCHDigit(d) - BCHDigit(G15) >= 0) d ^= G15 << (BCHDigit(d) - BCHDigit(G15));
  return ((data << 10) | d) ^ G15_MASK;
}
function BCHTypeNumber(data) {
  let d = data << 12;
  while (BCHDigit(d) - BCHDigit(G18) >= 0) d ^= G18 << (BCHDigit(d) - BCHDigit(G18));
  return (data << 12) | d;
}
function BCHDigit(data) { let digit = 0; while (data !== 0) { digit++; data >>>= 1; } return digit; }
function maskFunc(pattern, i, j) {
  switch (pattern) {
    case 0: return (i + j) % 2 === 0;
    case 1: return i % 2 === 0;
    case 2: return j % 3 === 0;
    case 3: return (i + j) % 3 === 0;
    case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
    case 5: return ((i * j) % 2 + (i * j) % 3) === 0;
    case 6: return (((i * j) % 2 + (i * j) % 3) % 2) === 0;
    case 7: return (((i * j) % 3 + (i + j) % 2) % 2) === 0;
    default: throw new Error('Bad mask');
  }
}

function blankModules(version) {
  const count = version * 4 + 17;
  const modules = Array.from({ length: count }, () => Array(count).fill(null));
  setupPositionProbe(modules, 0, 0);
  setupPositionProbe(modules, count - 7, 0);
  setupPositionProbe(modules, 0, count - 7);
  setupPositionAdjust(modules, version);
  setupTiming(modules);
  return modules;
}
function setupPositionProbe(modules, row, col) {
  const count = modules.length;
  for (let r = -1; r <= 7; r++) {
    if (row + r < 0 || row + r >= count) continue;
    for (let c = -1; c <= 7; c++) {
      if (col + c < 0 || col + c >= count) continue;
      modules[row + r][col + c] = (0 <= r && r <= 6 && (c === 0 || c === 6)) || (0 <= c && c <= 6 && (r === 0 || r === 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4);
    }
  }
}
function setupPositionAdjust(modules, version) {
  const pos = PATTERN_POSITION_TABLE[version - 1];
  for (const row of pos) for (const col of pos) {
    if (modules[row][col] !== null) continue;
    for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) modules[row + r][col + c] = r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0);
  }
}
function setupTiming(modules) {
  const count = modules.length;
  for (let r = 8; r < count - 8; r++) if (modules[r][6] === null) modules[r][6] = r % 2 === 0;
  for (let c = 8; c < count - 8; c++) if (modules[6][c] === null) modules[6][c] = c % 2 === 0;
}
function setupTypeInfo(modules, maskPattern, test) {
  const count = modules.length;
  const data = (ERROR_CORRECT_M << 3) | maskPattern;
  const bits = BCHTypeInfo(data);
  for (let i = 0; i < 15; i++) {
    const mod = !test && ((bits >> i) & 1) === 1;
    if (i < 6) modules[i][8] = mod;
    else if (i < 8) modules[i + 1][8] = mod;
    else modules[count - 15 + i][8] = mod;
  }
  for (let i = 0; i < 15; i++) {
    const mod = !test && ((bits >> i) & 1) === 1;
    if (i < 8) modules[8][count - i - 1] = mod;
    else if (i < 9) modules[8][15 - i - 1 + 1] = mod;
    else modules[8][15 - i - 1] = mod;
  }
  modules[count - 8][8] = !test;
}
function setupTypeNumber(modules, version, test) {
  const count = modules.length;
  const bits = BCHTypeNumber(version);
  for (let i = 0; i < 18; i++) modules[Math.floor(i / 3)][i % 3 + count - 8 - 3] = !test && ((bits >> i) & 1) === 1;
  for (let i = 0; i < 18; i++) modules[i % 3 + count - 8 - 3][Math.floor(i / 3)] = !test && ((bits >> i) & 1) === 1;
}
function mapData(modules, data, maskPattern) {
  const count = modules.length;
  let inc = -1;
  let row = count - 1;
  let bitIndex = 7;
  let byteIndex = 0;
  for (let col = count - 1; col > 0; col -= 2) {
    if (col <= 6) col--;
    while (true) {
      for (const c of [col, col - 1]) {
        if (modules[row][c] === null) {
          let dark = false;
          if (byteIndex < data.length) dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
          if (maskFunc(maskPattern, row, c)) dark = !dark;
          modules[row][c] = dark;
          bitIndex--;
          if (bitIndex === -1) { byteIndex++; bitIndex = 7; }
        }
      }
      row += inc;
      if (row < 0 || row >= count) { row -= inc; inc = -inc; break; }
    }
  }
}
function makeImpl(version, data, maskPattern, test = false) {
  const modules = blankModules(version);
  setupTypeInfo(modules, maskPattern, test);
  if (version >= 7) setupTypeNumber(modules, version, test);
  mapData(modules, data, maskPattern);
  return modules;
}
function lostPoint(modules) {
  const n = modules.length;
  let lost = 0;
  for (let row = 0; row < n; row++) {
    let same = 1;
    for (let col = 1; col < n; col++) {
      if (modules[row][col] === modules[row][col - 1]) same++; else { if (same >= 5) lost += same - 2; same = 1; }
    }
    if (same >= 5) lost += same - 2;
  }
  for (let col = 0; col < n; col++) {
    let same = 1;
    for (let row = 1; row < n; row++) {
      if (modules[row][col] === modules[row - 1][col]) same++; else { if (same >= 5) lost += same - 2; same = 1; }
    }
    if (same >= 5) lost += same - 2;
  }
  for (let row = 0; row < n - 1; row++) for (let col = 0; col < n - 1; col++) {
    const sum = [modules[row][col], modules[row + 1][col], modules[row][col + 1], modules[row + 1][col + 1]].filter(Boolean).length;
    if (sum === 0 || sum === 4) lost += 3;
  }
  const patternA = '10111010000';
  const patternB = '00001011101';
  for (let row = 0; row < n; row++) {
    const s = modules[row].map(v => v ? '1' : '0').join('');
    for (let i = 0; i <= n - 11; i++) if (s.slice(i, i + 11) === patternA || s.slice(i, i + 11) === patternB) lost += 40;
  }
  for (let col = 0; col < n; col++) {
    let s = '';
    for (let row = 0; row < n; row++) s += modules[row][col] ? '1' : '0';
    for (let i = 0; i <= n - 11; i++) if (s.slice(i, i + 11) === patternA || s.slice(i, i + 11) === patternB) lost += 40;
  }
  let dark = 0;
  for (const row of modules) for (const v of row) if (v) dark++;
  const ratio = Math.abs(100 * dark / (n * n) - 50) / 5;
  lost += Math.floor(ratio) * 10;
  return lost;
}

export function makeQrMatrix(text) {
  const bytes = enc.encode(String(text || ' '));
  const version = chooseVersion(bytes);
  const data = createData(version, bytes);
  let bestMask = 0;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const score = lostPoint(makeImpl(version, data, mask, true));
    if (score < bestScore) { bestScore = score; bestMask = mask; }
  }
  return makeImpl(version, data, bestMask, false);
}

export function renderQr(target, text, options = {}) {
  const modules = makeQrMatrix(text);
  const border = options.border ?? 4;
  const size = options.size ?? 512;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  canvas.className = options.className || 'qr-canvas';
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = options.style !== 'classic';
  ctx.imageSmoothingQuality = 'high';
  if (options.light) {
    ctx.fillStyle = options.light;
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.clearRect(0, 0, size, size);
  }
  const cells = modules.length + border * 2;
  const cell = size / cells;
  renderStyledModules(ctx, modules, cell, border, {
    dark: options.dark || '#000000',
    accent: options.accent || options.dark || '#000000',
    light: options.light || 'transparent',
    finderLight: options.finderLight || options.light || '#ffffff',
    dense: modules.length >= 45,
    classic: options.style === 'classic'
  });
  target.replaceChildren(canvas);
  return canvas;
}

function renderStyledModules(ctx, modules, cell, border, palette) {
  if (palette.classic) {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = palette.dark;
    for (let r = 0; r < modules.length; r++) {
      for (let c = 0; c < modules.length; c++) {
        if (modules[r][c]) ctx.fillRect(Math.round((c + border) * cell), Math.round((r + border) * cell), Math.ceil(cell), Math.ceil(cell));
      }
    }
    return;
  }

  const n = modules.length;
  const radius = cell * (palette.dense ? 0.43 : 0.46);
  const finderZones = [[0, 0], [0, n - 7], [n - 7, 0]];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!modules[r][c] || isFinderZone(r, c, n)) continue;
      ctx.fillStyle = moduleColor(r, c, palette);
      ctx.beginPath();
      ctx.arc((c + border + 0.5) * cell, (r + border + 0.5) * cell, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (const [row, col] of finderZones) drawFinder(ctx, row, col, cell, border, palette);
}

function drawFinder(ctx, row, col, cell, border, palette) {
  const x = (col + border) * cell;
  const y = (row + border) * cell;
  const outer = cell * 7;
  const mid = cell * 5;
  const inner = cell * 3;
  ctx.fillStyle = palette.dark;
  roundRect(ctx, x, y, outer, outer, cell * 1.15);
  ctx.fill();
  ctx.fillStyle = palette.finderLight;
  roundRect(ctx, x + cell, y + cell, mid, mid, cell * 0.75);
  ctx.fill();
  ctx.fillStyle = palette.dark;
  roundRect(ctx, x + cell * 2, y + cell * 2, inner, inner, cell * 0.55);
  ctx.fill();
}

function isFinderZone(row, col, n) {
  return (row < 7 && col < 7) || (row < 7 && col >= n - 7) || (row >= n - 7 && col < 7);
}

function moduleColor(row, col, palette) {
  return ((row * 17 + col * 11) % 7 === 0) ? palette.accent : palette.dark;
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.closePath();
}

export const QrPayload = {
  vcard(data) {
    const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeVcard(data.n)}`];
    if (data.m) lines.push(`TEL;TYPE=CELL:${sanitizePhone(data.m)}`);
    if (data.e1) lines.push(`EMAIL;TYPE=HOME:${data.e1}`);
    const adr = [data.s, data.z].filter(Boolean).join(' ');
    if (adr) lines.push(`ADR;TYPE=HOME:;;${escapeVcard(data.s)};${escapeVcard(data.z)};;;;`);
    lines.push('END:VCARD');
    return lines.join('\n');
  },
  vcardCompany(data) {
    const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeVcard(data.n)}`];
    if (data.c) lines.push(`ORG:${escapeVcard(data.c)}`);
    if (data.j) lines.push(`TITLE:${escapeVcard(data.j)}`);
    if (data.cp) lines.push(`TEL;TYPE=WORK,VOICE:${sanitizePhone(data.cp)}`);
    if (data.cm) lines.push(`TEL;TYPE=WORK,CELL:${sanitizePhone(data.cm)}`);
    if (data.ce) lines.push(`EMAIL;TYPE=WORK:${data.ce}`);
    if (data.w) lines.push(`URL:${normalizeUrl(data.w)}`);
    const adr = [data.cs, data.cz].filter(Boolean).join(' ');
    if (adr) lines.push(`ADR;TYPE=WORK:;;${escapeVcard(data.cs)};${escapeVcard(data.cz)};;;;`);
    lines.push('END:VCARD');
    return lines.join('\n');
  },
  paypal(data, amount) {
    const user = String(data.pp || '').replace(/^@/, '').trim();
    if (!user) return 'https://paypal.me/';
    const cleanAmount = normalizeAmount(amount);
    return `https://paypal.me/${encodeURIComponent(user)}${cleanAmount ? '/' + cleanAmount : ''}`;
  },
  girocode(data, amount, purpose) {
    const cleanAmount = normalizeAmount(amount);
    return [
      'BCD', '002', '1', 'SCT', (data.bic || '').trim().toUpperCase(), (data.n || '').trim(), formatIbanRaw(data.ib), cleanAmount ? `EUR${cleanAmount}` : '', '', (purpose || '').trim()
    ].join('\n');
  }
};

export function normalizeAmount(value) {
  const raw = String(value || '').replace(/[^0-9,.]/g, '').replace(',', '.');
  if (!raw) return '';
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) return '';
  return num.toFixed(2);
}
export function formatIbanRaw(iban) { return String(iban || '').replace(/\s+/g, '').toUpperCase(); }
export function formatIban(iban) { return formatIbanRaw(iban).replace(/(.{4})/g, '$1 ').trim(); }
function sanitizePhone(phone) { return String(phone || '').replace(/[^+0-9]/g, ''); }
function normalizeUrl(url) { return /^https?:\/\//i.test(url) ? url : `https://${url}`; }
function escapeVcard(value = '') { return String(value).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
