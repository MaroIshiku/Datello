const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
const MIN_TOKEN_LENGTH = 64;
const TOKEN_RE = /^[A-Za-z0-9+/=._:-]+$/;

export const Store = {
  async loadData() {
    try {
      const response = await fetchWithFallback(['api/data', 'data.json'], { cache: 'no-store' });
      if (!response.ok) throw new Error(`Token load HTTP ${response.status}`);
      const data = await response.json();
      return { token: data.token || '', updated: data.updated || null };
    } catch (error) {
      console.warn(error);
      return { token: '', updated: null, offlineError: true };
    }
  },

  getSecret() { return localStorage.getItem('dv2.sharedSecret') || ''; },
  setSecret(secret) { localStorage.setItem('dv2.sharedSecret', secret.trim()); },

  async saveToken(token) {
    const secret = Store.getSecret();
    if (!secret) throw new Error('Server secret is missing. Open settings and save it.');
    if (typeof token !== 'string' || token.length < MIN_TOKEN_LENGTH || !TOKEN_RE.test(token)) {
      throw new Error('Token is missing or invalid.');
    }
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': secret },
      cache: 'no-store',
      body: JSON.stringify({ token })
    };
    const response = await fetchWithFallback(['api/token', 'save.php'], options);
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
    if (!response.ok || data.ok === false) throw new Error(data.error || `Save failed (${response.status}).`);
    return { token, updated: data.updated || new Date().toISOString() };
  },

  exportToken(dataState) {
    const payload = JSON.stringify(dataState, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meiku-token-${new Date().toISOString().slice(0,10)}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  importToken(file) {
    return new Promise((resolve, reject) => {
      if (!file || file.size > MAX_IMPORT_BYTES) {
        reject(new Error('Token file is too large or invalid.'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('File could not be read.'));
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          const token = String(parsed.token || '');
          if (token.length < MIN_TOKEN_LENGTH || !TOKEN_RE.test(token)) {
            throw new Error('Import does not contain a valid token.');
          }
          resolve({ token, updated: parsed.updated || null });
        } catch (error) { reject(error); }
      };
      reader.readAsText(file);
    });
  }
};

async function fetchWithFallback(urls, options) {
  let lastError;
  for (const url of urls) {
    try {
      const response = await fetch(url, options);
      if (response.status === 404 && url !== urls.at(-1)) continue;
      return response;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Server is not reachable.');
}
