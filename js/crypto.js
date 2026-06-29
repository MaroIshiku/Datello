const enc = new TextEncoder();
const dec = new TextDecoder();
const TOKEN_VERSION = 2;
const DEFAULT_ITERATIONS = 250000;

export function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function writeUint32(value) {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, value, false);
  return out;
}

function readUint32(bytes, offset) {
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, false);
}

async function deriveAesKey(password, salt, iterations = DEFAULT_ITERATIONS, usages = ['encrypt', 'decrypt']) {
  const material = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    usages
  );
}

export async function encryptJson(payload, masterPassword) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveAesKey(masterPassword, salt);
  const plaintext = enc.encode(JSON.stringify(payload));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext));
  const header = new Uint8Array([TOKEN_VERSION, ...writeUint32(DEFAULT_ITERATIONS)]);
  const token = new Uint8Array(header.length + salt.length + iv.length + ciphertext.length);
  token.set(header, 0);
  token.set(salt, header.length);
  token.set(iv, header.length + salt.length);
  token.set(ciphertext, header.length + salt.length + iv.length);
  return bytesToBase64(token);
}

export async function decryptJson(token, masterPassword) {
  if (!token) throw new Error('No token available.');
  const bytes = base64ToBytes(token);
  if (bytes.length < 1 + 4 + 16 + 12 + 17) throw new Error('Token is incomplete.');
  const version = bytes[0];
  if (version !== TOKEN_VERSION) throw new Error(`Unsupported token version: ${version}`);
  const iterations = readUint32(bytes, 1);
  const salt = bytes.slice(5, 21);
  const iv = bytes.slice(21, 33);
  const ciphertext = bytes.slice(33);
  const key = await deriveAesKey(masterPassword, salt, iterations);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return JSON.parse(dec.decode(plaintext));
}

export async function encryptStringWithPin(secret, pin) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveAesKey(pin, salt, DEFAULT_ITERATIONS);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(secret)));
  return JSON.stringify({ v: TOKEN_VERSION, kdf: 'PBKDF2-SHA256', iter: DEFAULT_ITERATIONS, salt: bytesToBase64(salt), iv: bytesToBase64(iv), ct: bytesToBase64(ciphertext) });
}

export async function decryptStringWithPin(blob, pin) {
  const box = JSON.parse(blob);
  if (box.v !== TOKEN_VERSION) throw new Error('PIN blob version does not match.');
  const salt = base64ToBytes(box.salt);
  const iv = base64ToBytes(box.iv);
  const ciphertext = base64ToBytes(box.ct);
  const key = await deriveAesKey(pin, salt, Number(box.iter || DEFAULT_ITERATIONS));
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return dec.decode(plaintext);
}

export async function encryptStringWithRawKey(secret, rawKeyBytes) {
  const iv = randomBytes(12);
  const key = await crypto.subtle.importKey('raw', rawKeyBytes, { name: 'AES-GCM' }, false, ['encrypt']);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(secret)));
  return JSON.stringify({ v: TOKEN_VERSION, alg: 'AES-GCM-PRF', iv: bytesToBase64(iv), ct: bytesToBase64(ciphertext) });
}

export async function decryptStringWithRawKey(blob, rawKeyBytes) {
  const box = JSON.parse(blob);
  const key = await crypto.subtle.importKey('raw', rawKeyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(box.iv) }, key, base64ToBytes(box.ct));
  return dec.decode(plaintext);
}
