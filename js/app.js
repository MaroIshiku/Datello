import { Auth } from './auth.js?v=meiku-20260629';
import { decryptJson, encryptJson } from './crypto.js?v=meiku-20260629';
import { formatIban, formatIbanRaw, normalizeAmount, QrPayload, renderQr } from './qr.js?v=meiku-20260629';
import { Store } from './store.js?v=meiku-20260629';

const FIELDS = [
  ['n', 'Full Name', 'text', true], ['m', 'Private Mobile', 'tel'], ['e1', 'Private Email', 'email'],
  ['s', 'Private Street / Number', 'text'], ['z', 'Private ZIP / City', 'text'],
  ['c', 'Company', 'text'], ['j', 'Position / Job Title', 'text'], ['cp', 'Office Phone', 'tel'], ['cm', 'Work Mobile', 'tel'], ['ce', 'Work Email', 'email'],
  ['w', 'Website', 'text'], ['cs', 'Business Street / Number', 'text'], ['cz', 'Business ZIP / City', 'text'], ['pp', 'PayPal Username', 'text'],
  ['ib', 'IBAN', 'text'], ['bic', 'BIC', 'text']
];
const SETUP_FIELDS = [['n', 'Full Name', 'text', true]];
const FIELD_LABELS = Object.fromEntries(FIELDS.map(([key, label]) => [key, label]));
const PROFILE_STEPS = [
  { id: 'privat', title: 'Private', hint: 'Name, private contact details and private address.', fields: ['n', 'm', 'e1', 's', 'z'] },
  { id: 'firma', title: 'Business', hint: 'Company, work contact details and separate business address.', fields: ['c', 'j', 'cp', 'cm', 'ce', 'w', 'cs', 'cz'] },
  { id: 'paypal', title: 'PayPal', hint: 'paypal.me username for payment links.', fields: ['pp'] },
  { id: 'bank', title: 'Bank', hint: 'SEPA details for GiroCode / EPC QR.', fields: ['ib', 'bic'] }
];
const AMOUNTS = ['5', '10', '20', '50', '100'];
const APP_NAME = 'Meiku';
const APP_TITLE = 'Meiku - Profile Share';
const APP_SUBTITLE = 'Profile Share';
const APP_ID = 'meiku';
const THEME_KEY = `${APP_ID}-theme`;
const MODE_KEY = `${APP_ID}-mode`;
const LEGACY_THEME_KEY = 'dv2.theme';
const LEGACY_MODE_KEY = 'dv2.mode';
const THEMES = ['lavender', 'mint', 'sky', 'amber', 'rose', 'graphite'];
const MODES = ['system', 'light', 'dark'];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const state = { token: '', updated: null, data: null, masterPassword: '', activeTab: 'privat', amount: sessionStorage.getItem('dv2.amount') || '', purpose: sessionStorage.getItem('dv2.purpose') || '', wakeLock: null, buildInfo: null };

init();

async function init() {
  applyTheme();
  bindThemeMode();
  renderSetupFields($('#setupFields'), {}, SETUP_FIELDS);
  buildPinPad();
  bindAuth();
  bindGlobal();
  registerServiceWorker();
  state.buildInfo = await loadBuildInfo();
  const loaded = await Store.loadData();
  state.token = loaded.token;
  state.updated = loaded.updated;
  if (!loaded.token) showSetup(loaded.offlineError);
  else showLogin();
}

function bindThemeMode() {
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (localStorage.getItem(MODE_KEY) === 'system') applyTheme();
  });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    location.reload();
  });
  navigator.serviceWorker.register('sw.js').then(registration => {
    activateWaitingWorker(registration.waiting);
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) activateWaitingWorker(worker);
      });
    });
  }).catch(console.warn);
}

function activateWaitingWorker(worker) {
  worker?.postMessage({ type: 'SKIP_WAITING' });
}

function bindAuth() {
  $('#passwordLogin').addEventListener('submit', async event => {
    event.preventDefault();
    await unlockWithPassword($('#masterPassword').value);
  });
  $('#masterPasswordToggle')?.addEventListener('click', () => {
    const input = $('#masterPassword');
    const toggle = $('#masterPasswordToggle');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(show));
    toggle.setAttribute('aria-label', show ? 'Hide master password' : 'Show master password');
  });
  $('#setupForm').addEventListener('submit', async event => {
    event.preventDefault();
    const data = collectForm(event.currentTarget);
    if (!data.n) return toast('Name is required.');
    const password = $('#setupPassword').value;
    const secret = $('#setupSecret').value;
    if (password.length < 8) return toast('Password must be at least 8 characters.');
    Store.setSecret(secret);
    try {
      const token = await encryptJson(normalizeData(data), password);
      const saved = await Store.saveToken(token);
      Object.assign(state, { token: saved.token, updated: saved.updated, data: normalizeData(data), masterPassword: password });
      showVault();
      openProfileProgress(0, true);
      toast('Vault saved.');
    } catch (error) { toast(error.message); }
  });
  $('#pinOpen').addEventListener('click', () => openPinPad(async pin => {
    try { await unlockWithPassword(await Auth.passwordFromPin(pin)); }
    catch (error) { toast(error.message); }
  }));
  $('#passkeyLogin').addEventListener('click', async () => {
    try { await unlockWithPassword(await Auth.passwordFromPasskey()); }
    catch (error) { toast(error.message); }
  });
}

function bindGlobal() {
  bindLogoFallback();
  $('#settingsBtn').addEventListener('click', openSettings);
  $('#heroAvatarWrap')?.addEventListener('click', openSettings);
  $$('.bottom-nav button').forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.tab)));
  $('#qrClose').addEventListener('click', closeQrOverlay);
  $('#qrOverlay').addEventListener('click', e => { if (e.target.id === 'qrOverlay') closeQrOverlay(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeQrOverlay(); closeSheet(); } });
  $('[data-close-sheet]')?.addEventListener('click', closeSheet);
}

function bindLogoFallback() {
  $$('.app-symbol img, .login-logo').forEach(img => {
    img.addEventListener('error', () => img.closest('.app-symbol')?.classList.add('logo-missing'));
  });
}

function showSetup(offlineError) {
  document.body.classList.remove('pin-active');
  document.body.dataset.authMode = 'setup';
  $('#authScreen').classList.remove('hidden');
  $('#vaultScreen').classList.add('hidden');
  $('#authTitle').textContent = 'Setup';
  $('#authHint').textContent = offlineError ? 'Token could not be loaded. You can still start locally and save later.' : 'Create the vault first. You can complete your profile step by step afterwards.';
  $('#setupForm').classList.remove('hidden');
  $('#passwordLogin').classList.add('hidden');
  $('#quickUnlock').classList.add('hidden');
}

function showLogin() {
  document.body.classList.remove('pin-active');
  document.body.dataset.authMode = 'login';
  $('#authScreen').classList.remove('hidden');
  $('#vaultScreen').classList.add('hidden');
  $('#authTitle').textContent = 'Welcome back';
  $('#authHint').textContent = 'Unlock your contact and payment vault.';
  $('#setupForm').classList.add('hidden');
  $('#passwordLogin').classList.remove('hidden');
  $('#quickUnlock').classList.toggle('hidden', !(Auth.hasPin() || Auth.hasPasskey()));
  $('#pinOpen').classList.toggle('hidden', !Auth.hasPin());
  $('#passkeyLogin').classList.toggle('hidden', !Auth.hasPasskey());
}

async function unlockWithPassword(password) {
  try {
    const data = await decryptJson(state.token, password);
    state.data = normalizeData(data);
    state.masterPassword = password;
    showVault();
  } catch (error) {
    console.error(error);
    toast('Password/PIN is wrong or the token is corrupted.');
  }
}

function showVault() {
  delete document.body.dataset.authMode;
  $('#authScreen').classList.add('hidden');
  $('#vaultScreen').classList.remove('hidden');
  updateVaultHeader();
  setTab(state.activeTab);
  Auth.startAutoLock(() => location.reload());
}

function updateVaultHeader() {
  $('#heroName').textContent = state.data.n || 'No Name';
  $('#heroInitials').textContent = initials(state.data.n);
  $('#updatedAt').textContent = state.updated ? `Updated ${formatDate(state.updated)}` : 'Not saved yet';
  updateAvatar();
}

function setTab(tab) {
  state.activeTab = tab;
  $$('.bottom-nav button').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  renderTab();
  requestAnimationFrame(() => { $('#tabContent').scrollTop = 0; });
}

function renderTab() {
  const root = $('#tabContent');
  if (!state.data) return;
  if (state.activeTab === 'firma') {
    renderContactTab(root, 'Company', 'Business contact details.', companyRows(), QrPayload.vcardCompany(state.data), 'Company vCard');
    return;
  }
  if (state.activeTab === 'privat') renderContactTab(root, 'Private', 'Phone, email and address.', privateRows(), QrPayload.vcard(state.data), 'Private vCard');
  if (state.activeTab === 'paypal') renderPaymentTab(root, 'paypal');
  if (state.activeTab === 'bank') renderPaymentTab(root, 'bank');
}

function renderContactTab(root, title, subtitle, rows, qrPayload, qrLabel) {
  root.className = `content-card tab-${state.activeTab}${qrPayload ? ' has-qr' : ''}`;
  root.innerHTML = `<div class="panel-head"><div><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div></div>`;
  const list = document.createElement('div');
  list.className = 'contact-list';
  const usableRows = rows.filter(row => row.value);
  if (!usableRows.length) list.innerHTML = '<div class="empty">No data yet.</div>';
  for (const row of usableRows) list.append(contactRow(row));
  root.append(list);
  if (qrPayload) root.append(qrCard(qrPayload, qrLabel));
}

function renderPaymentTab(root, kind) {
  root.className = `content-card tab-${kind} has-qr`;
  const isPayPal = kind === 'paypal';
  const title = isPayPal ? 'PayPal' : 'Bank';
  const payload = isPayPal ? QrPayload.paypal(state.data, state.amount) : QrPayload.girocode(state.data, state.amount, state.purpose);
  const link = QrPayload.paypal(state.data, state.amount);
  root.innerHTML = `<div class="panel-head"><div><h2>${title}</h2><p>${isPayPal ? 'paypal.me payment link.' : 'SEPA GiroCode / EPC QR.'}</p></div></div>`;
  const box = document.createElement('div');
  box.className = 'amount-card';
  box.innerHTML = `
    <label class="field"><span>Amount</span><input id="amountInput" inputmode="decimal" autocomplete="off" value="${esc(state.amount)}" placeholder="e.g. 12.50"></label>
    <div class="chips">${AMOUNTS.map(v => `<button class="chip ${normalizeAmount(state.amount) === Number(v).toFixed(2) ? 'active' : ''}" data-amount="${v}" type="button">${v} €</button>`).join('')}</div>
    <label class="field"><span>Payment reference</span><input id="purposeInput" autocomplete="off" value="${esc(state.purpose)}" placeholder="Optional"></label>`;
  root.append(box);
  const info = document.createElement('div');
  info.className = 'qr-caption';
  const qrWrap = qrCard(payload, isPayPal ? 'PayPal.me Link' : 'SEPA / EPC QR Code', info);
  root.append(qrWrap);
  const refreshPreview = () => updatePaymentPreview(kind, box, qrWrap, info);
  $('#amountInput', box).addEventListener('input', e => {
    state.amount = e.target.value;
    sessionStorage.setItem('dv2.amount', state.amount);
  });
  $('#amountInput', box).addEventListener('blur', refreshPreview);
  $$('.chip', box).forEach(chip => chip.addEventListener('click', () => {
    state.amount = Number(chip.dataset.amount).toFixed(2);
    sessionStorage.setItem('dv2.amount', state.amount);
    $('#amountInput', box).value = state.amount;
    refreshPreview();
  }));
  $('#purposeInput', box)?.addEventListener('input', e => {
    state.purpose = e.target.value;
    sessionStorage.setItem('dv2.purpose', state.purpose);
  });
  $('#purposeInput', box)?.addEventListener('blur', refreshPreview);
  refreshPreview();
}

function updatePaymentPreview(kind, box, qrWrap, info) {
  const isPayPal = kind === 'paypal';
  const payload = isPayPal ? QrPayload.paypal(state.data, state.amount) : QrPayload.girocode(state.data, state.amount, state.purpose);
  const link = QrPayload.paypal(state.data, state.amount);
  $$('.chip', box).forEach(chip => chip.classList.toggle('active', normalizeAmount(state.amount) === Number(chip.dataset.amount).toFixed(2)));
  const target = $('.qr-target', qrWrap);
  target.dataset.payload = payload;
  renderQr(target, payload, qrRenderOptions(false, 512));
  info.innerHTML = isPayPal
    ? `<b>Recipient:</b> ${esc(state.data.n || '—')}<br><span class="link-line">${esc(link)}</span>`
    : `<b>Recipient:</b> ${esc(state.data.n || '—')}<br><b>IBAN:</b> ${esc(formatIban(state.data.ib))}<br><b>BIC:</b> ${esc((state.data.bic || '').toUpperCase())}`;
}

function contactRow({ icon, label, value, href }) {
  const node = document.createElement(href ? 'a' : 'div');
  node.className = 'contact-row';
  if (href) node.href = href;
  node.innerHTML = `<span class="ico">${icon}</span><span><b>${esc(label)}</b><span>${esc(value)}</span></span>`;
  bindLongPress(node, () => copyText(value));
  return node;
}

function qrCard(payload, label, extraNode) {
  const wrap = document.createElement('div');
  wrap.className = 'qr-card qr-share-card';
  wrap.insertAdjacentHTML('beforeend', `<div class="qr-card-head"><h3>${esc(label)}</h3></div>`);
  const qrFrame = document.createElement('div');
  qrFrame.className = 'qr-frame';
  const qr = document.createElement('div');
  qr.className = 'qr-target';
  qr.dataset.payload = payload;
  renderQr(qr, payload, qrRenderOptions(false, 512));
  qr.addEventListener('click', () => openQrOverlay(qr.dataset.payload || payload));
  qrFrame.append(qr);
  wrap.append(qrFrame);
  if (extraNode) wrap.append(extraNode); else wrap.insertAdjacentHTML('beforeend', '<div class="qr-caption" aria-hidden="true"></div>');
  const actions = document.createElement('div');
  actions.className = 'qr-card-actions';
  const open = document.createElement('button');
  open.className = 'qr-icon-action qr-open-action';
  open.type = 'button';
  open.setAttribute('aria-label', 'Open QR code');
  open.title = 'Open QR code';
  open.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h6v2H8.4l3.7 3.7-1.4 1.4L7 7.4V10H5V4Zm8 0h6v6h-2V7.4l-3.7 3.7-1.4-1.4L15.6 6H13V4ZM5 14h2v2.6l3.7-3.7 1.4 1.4L8.4 18H11v2H5v-6Zm12 0h2v6h-6v-2h2.6l-3.7-3.7 1.4-1.4 3.7 3.7V14Z"/></svg>';
  open.addEventListener('click', () => openQrOverlay(qr.dataset.payload || payload));
  const share = document.createElement('button');
  share.className = 'qr-icon-action qr-share-action';
  share.type = 'button';
  share.setAttribute('aria-label', 'Share data');
  share.title = 'Share data';
  share.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16.1c-1 0-1.9.5-2.4 1.2L8.9 13.7a3.2 3.2 0 0 0 0-3.4l6.7-3.6A3 3 0 1 0 15 5c0 .2 0 .4.1.6L8.3 9.2a3 3 0 1 0 0 5.6l6.8 3.6a3 3 0 1 0 2.9-2.3Z"/></svg>';
  share.addEventListener('click', shareCurrentTab);
  actions.append(open, share);
  wrap.append(actions);
  return wrap;
}

async function openQrOverlay(payload) {
  const overlay = $('#qrOverlay');
  renderQr($('#qrBig'), payload, qrRenderOptions(true, 900));
  overlay.classList.remove('hidden');
  try { state.wakeLock = await navigator.wakeLock?.request('screen'); } catch {}
}
async function closeQrOverlay() {
  $('#qrOverlay').classList.add('hidden');
  try { await state.wakeLock?.release(); } catch {}
  state.wakeLock = null;
}

function privateRows() {
  const address = [state.data.s, state.data.z].filter(Boolean).join(', ');
  return [
    { icon: '📱', label: 'Mobile', value: state.data.m, href: state.data.m ? `tel:${state.data.m}` : '' },
    { icon: '✉️', label: 'E-Mail', value: state.data.e1, href: state.data.e1 ? `mailto:${state.data.e1}` : '' },
    { icon: '📍', label: 'Private address', value: address, href: address ? `https://maps.google.com/?q=${encodeURIComponent([state.data.s, state.data.z].filter(Boolean).join(' '))}` : '' }
  ];
}
function companyRows() {
  const companyAddress = [state.data.cs, state.data.cz].filter(Boolean).join(', ');
  return [
    { icon: '🏢', label: 'Company', value: state.data.c }, { icon: '💼', label: 'Position', value: state.data.j },
    { icon: '☎️', label: 'Office', value: state.data.cp, href: state.data.cp ? `tel:${state.data.cp}` : '' },
    { icon: '📲', label: 'Work Mobile', value: state.data.cm, href: state.data.cm ? `tel:${state.data.cm}` : '' },
    { icon: '✉️', label: 'Work Email', value: state.data.ce, href: state.data.ce ? `mailto:${state.data.ce}` : '' },
    { icon: '🌐', label: 'Website', value: state.data.w, href: state.data.w ? normalizeUrl(state.data.w) : '' },
    { icon: '📍', label: 'Business address', value: companyAddress, href: companyAddress ? `https://maps.google.com/?q=${encodeURIComponent([state.data.cs, state.data.cz].filter(Boolean).join(' '))}` : '' }
  ];
}

async function shareCurrentTab() {
  const text = buildShareText();
  try {
  if (navigator.share) await navigator.share({ title: APP_NAME, text });
    else await copyText(text);
  } catch (error) { if (error.name !== 'AbortError') toast(error.message); }
}
function buildShareText() {
  const d = state.data;
  if (state.activeTab === 'paypal') {
    return [
      `Recipient: ${d.n}`,
      `PayPal: ${QrPayload.paypal(d, state.amount)}`,
      normalizeAmount(state.amount) ? `Amount: ${normalizeAmount(state.amount)} EUR` : '',
      state.purpose ? `Payment reference: ${state.purpose}` : ''
    ].filter(Boolean).join('\n');
  }
  if (state.activeTab === 'privat') return [d.n, d.m, d.e1, [d.s, d.z].filter(Boolean).join(', ')].filter(Boolean).join('\n');
  if (state.activeTab === 'firma') return [d.n, d.c, d.j, d.cp, d.cm, d.ce, d.w, [d.cs, d.cz].filter(Boolean).join(', ')].filter(Boolean).join('\n');
  return [`Recipient: ${d.n}`, `IBAN: ${formatIban(d.ib)}`, `BIC: ${(d.bic || '').toUpperCase()}`, normalizeAmount(state.amount) ? `Amount: ${normalizeAmount(state.amount)} EUR` : '', state.purpose ? `Payment reference: ${state.purpose}` : ''].filter(Boolean).join('\n');
}

function openSettings() {
  const avatar = localStorage.getItem('dv2.avatar');
  const avatarNode = avatar
    ? `<img src="${esc(avatar)}" alt="">`
    : `<span>${esc(initials(state.data?.n))}</span>`;
  openSheet(APP_NAME, `
    <button class="profile-close" type="button" data-close-sheet aria-label="Close menu">×</button>
    <div class="profile-menu-content">
      <section class="profile-card">
        <button class="avatar-wrap profile-avatar" type="button" data-action="avatar-pick" aria-label="Change profile picture">
          ${avatarNode}
          <span class="avatar-camera" aria-hidden="true">📷</span>
        </button>
        <div class="profile-card-main">
          <h3>${esc(state.data?.n || `${APP_NAME} Profile`)}</h3>
          <p>${esc(state.data?.e1 || state.data?.ce || 'Local contact and payment vault')}</p>
        </div>
        <input id="avatarFile" type="file" accept="image/*" hidden>
      </section>

      <section class="profile-info-card" aria-label="Vault status">
        <div><b>Vault</b><span>End-to-end encrypted</span></div>
        <button class="debug-info-button" data-action="debug" type="button"><b>Debug</b><span>Build and repository information</span></button>
      </section>

      <div class="profile-actions">
        ${profileMenuRow('📝', 'Edit data', 'Maintain contact and payment details step by step', 'edit')}
        ${profileMenuRow('🖼️', 'Choose profile picture', 'Crop automatically and store locally', 'avatar-pick')}
        ${avatar ? profileMenuRow('🧹', 'Remove profile picture', 'Delete the local profile picture from this device', 'avatar-remove') : ''}
        ${profileMenuRow('🔐', 'Master Password', 'Re-encrypt vault', 'password')}
        ${profileMenuRow('🔢', 'PIN', 'Set up quick login on this device', 'pin')}
        ${profileMenuRow('🔑', 'Passkey / Biometrics', 'Only when Chrome provides a PRF key', 'passkey')}
      </div>

      <section class="settings-section compact-settings">
        <h3>Appearance</h3>
        <div class="option-grid">${THEMES.map(t => `<button class="btn small tonal" data-theme-pick="${t}">${labelTheme(t)}</button>`).join('')}</div>
        <div class="option-grid">${MODES.map(m => `<button class="btn small tonal" data-mode-pick="${m}">${labelMode(m)}</button>`).join('')}</div>
      </section>

      <section class="settings-section compact-settings">
        <h3>Backup & Server</h3>
        <button class="profile-row-button" data-action="export" type="button"><span>⬇️</span><b>Export Token</b></button>
        <label class="profile-row-button"><span>⬆️</span><b>Import Token</b><input id="importFile" type="file" accept="application/json,.json,.txt" hidden></label>
        <label class="field"><span>Server Secret</span><input id="secretInput" type="password" value="${esc(Store.getSecret())}"></label>
        <button class="btn tonal" data-action="secret" type="button">Save Secret</button>
      </section>

      <section class="profile-actions session-actions">
        ${profileMenuRow('⏻', 'Lock Vault', 'Return to unlock', 'lock')}
        ${profileMenuRow('↪', 'Sign Out', 'Remove secret and quick logins locally', 'logout')}
      </section>
    </div>`);
  $('#sheet').classList.add('profile-menu');
  $('#sheetBody').onclick = settingsClick;
  $('#sheetBody').onchange = settingsChange;
}

function profileMenuRow(icon, title, subtitle, action) {
  return `
    <button class="profile-menu-row" data-action="${action}" type="button">
      <span class="profile-row-icon" aria-hidden="true">${icon}</span>
      <span><b>${esc(title)}</b><small>${esc(subtitle)}</small></span>
    </button>`;
}

async function settingsClick(e) {
  if (e.target.closest('[data-close-sheet]')) { closeSheet(); return; }
  const action = e.target.closest('[data-action]')?.dataset.action;
  const theme = e.target.closest('[data-theme-pick]')?.dataset.themePick;
  const mode = e.target.closest('[data-mode-pick]')?.dataset.modePick;
  if (theme) { localStorage.setItem(THEME_KEY, theme); applyTheme(); return; }
  if (mode) { localStorage.setItem(MODE_KEY, mode); applyTheme(); return; }
  if (!action) return;
  if (action === 'edit') openProfileProgress(0, false);
  if (action === 'avatar-pick') { $('#avatarFile')?.click(); return; }
  if (action === 'password') openPasswordSheet();
  if (action === 'pin') openPinSetup(false);
  if (action === 'debug') openDebugInfo();
  if (action === 'passkey') setupPasskey();
  if (action === 'export') { Store.exportToken({ token: state.token, updated: state.updated }); toast('Export started.'); }
  if (action === 'lock') location.reload();
  if (action === 'logout') { Auth.clearPin(); Auth.clearPasskey(); localStorage.removeItem('dv2.sharedSecret'); location.reload(); }
  if (action === 'avatar-remove') { localStorage.removeItem('dv2.avatar'); updateAvatar(); toast('Profile picture removed.'); }
  if (action === 'secret') { Store.setSecret($('#secretInput').value); toast('Secret saved.'); }
}
async function settingsChange(e) {
  if (e.target.id === 'avatarFile' && e.target.files[0]) {
    try {
      await openAvatarCrop(e.target.files[0]);
      e.target.value = '';
    } catch (error) { toast(error.message); }
    return;
  }
  if (e.target.id !== 'importFile' || !e.target.files[0]) return;
  try {
    const imported = await Store.importToken(e.target.files[0]);
    const saved = await Store.saveToken(imported.token);
    state.token = saved.token; state.updated = saved.updated;
    closeSheet(); showLogin(); toast('Token imported. Please unlock.');
  } catch (error) { toast(error.message); }
}

function openDebugInfo() {
  const info = state.buildInfo || {};
  const forkRepos = Array.isArray(info.forkRepos) ? info.forkRepos : [];
  const rows = [
    ['App', info.app || APP_TITLE],
    ['Build SHA', shortSha(info.buildSha)],
    ['Full SHA', info.buildSha || 'local'],
    ['Repo updated', formatDebugDate(info.repoUpdatedAt)],
    ['Image built', formatDebugDate(info.builtAt)],
    ['Source', info.sourceRepo || 'MaroIshiku/meiku'],
    ['Ref', info.sourceRef || 'local'],
    ['Workflow Run', info.workflowRun || 'local'],
    ['Fork repositories', forkRepos.length ? `${forkRepos.length} included` : 'None included']
  ];
  openSheet('Debug Information', `
    <div class="debug-panel">
      <p class="muted">Technical information about the currently delivered build.</p>
      <div class="debug-list">
        ${rows.map(([label, value]) => `<div><b>${esc(label)}</b><span>${esc(value)}</span></div>`).join('')}
      </div>
      ${forkRepos.length ? `<div class="debug-list">${forkRepos.map(repo => `<div><b>${esc(repo.name || repo.repo || 'Repository')}</b><span>${esc(repo.version || repo.sha || 'unknown')}</span></div>`).join('')}</div>` : ''}
      <button class="btn tonal" type="button" data-close-sheet>Close</button>
    </div>`);
  $('#sheetBody').onclick = e => { if (e.target.closest('[data-close-sheet]')) closeSheet(); };
}

async function openAvatarCrop(file) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image.');
  const image = await loadImageFromFile(file);
  const crop = { zoom: 1, x: 0, y: 0 };
  openSheet('Crop Profile Picture', `
    <form id="avatarCropForm" class="avatar-crop stack">
      <canvas id="avatarPreview" width="280" height="280" aria-label="Profile picture preview"></canvas>
      <label class="field"><span>Zoom</span><input id="avatarZoom" type="range" min="1" max="3" step="0.01" value="1"></label>
      <label class="field"><span>Move horizontally</span><input id="avatarX" type="range" min="-100" max="100" step="1" value="0"></label>
      <label class="field"><span>Move vertically</span><input id="avatarY" type="range" min="-100" max="100" step="1" value="0"></label>
      <div class="inline-actions">
        <button class="btn tonal" type="button" data-close-sheet>Cancel</button>
        <button class="btn primary" type="submit">Save Profile Picture</button>
      </div>
    </form>`);

  const preview = $('#avatarPreview');
  const drawPreview = () => drawAvatarCanvas(preview, image, crop, 280, 0.9, false);
  $('#avatarZoom').addEventListener('input', e => { crop.zoom = Number(e.target.value); drawPreview(); });
  $('#avatarX').addEventListener('input', e => { crop.x = Number(e.target.value); drawPreview(); });
  $('#avatarY').addEventListener('input', e => { crop.y = Number(e.target.value); drawPreview(); });
  $('[data-close-sheet]', $('#avatarCropForm')).addEventListener('click', closeSheet);
  $('#avatarCropForm').addEventListener('submit', e => {
    e.preventDefault();
    try {
      saveAvatarCrop(image, crop);
      updateAvatar();
      closeSheet();
      toast('Profile picture saved.');
    } catch (error) {
      toast(error.message);
    }
  });
  drawPreview();
}

function openEditSheet() {
  openProfileProgress(0, false);
}

function openProfileProgress(stepIndex = 0, firstRun = false) {
  let index = Math.max(0, Math.min(PROFILE_STEPS.length - 1, stepIndex));
  let draft = normalizeData(state.data || {});

  const render = () => {
    const step = PROFILE_STEPS[index];
    const allStepFields = [...new Set(PROFILE_STEPS.flatMap(item => item.fields))];
    const filledFields = allStepFields.filter(field => String(draft[field] || '').trim()).length;
    const body = document.createElement('div');
    body.className = 'profile-progress';
    body.innerHTML = `
      <div class="progress-summary">
        <div>
          <p class="eyebrow">Progress</p>
          <h3>${esc(filledFields)} of ${allStepFields.length} fields</h3>
          <p class="muted">${firstRun ? 'Complete your profile in separate steps. Everything stays optional and encrypted.' : 'Edit each section separately. Changes are saved encrypted.'}</p>
        </div>
        <div class="progress-ring" aria-label="${esc(filledFields)} of ${allStepFields.length} fields completed">${esc(filledFields)}/${allStepFields.length}</div>
      </div>
      <div class="progress-track" aria-hidden="true"><span class="progress-fill progress-fill-${index + 1}"></span></div>
      <ol class="stepper" aria-label="Profile progress">
        ${PROFILE_STEPS.map((item, i) => {
          const status = stepCompletion(item, draft);
          const stateClass = i === index ? 'active' : i < index ? 'done' : '';
          return `<li class="${stateClass}"><span>${status.done ? '✓' : i + 1}</span><div><b>${esc(item.title)}</b><small>${status.count}/${item.fields.length} fields</small></div></li>`;
        }).join('')}
      </ol>
      <form id="profileStepForm" class="stack">
        <div class="step-panel">
          <p class="eyebrow">Step ${index + 1}</p>
          <h3>${esc(step.title)}</h3>
          <p class="muted">${esc(step.hint)}</p>
          <div class="setup-grid" id="profileStepFields"></div>
        </div>
        <div class="progress-actions">
          <button class="btn tonal" type="button" data-progress-back ${index === 0 ? 'disabled' : ''}>Back</button>
          <button class="btn ghost" type="button" data-progress-close>${firstRun ? 'Later' : 'Close'}</button>
          <button class="btn primary" type="submit">${index === PROFILE_STEPS.length - 1 ? 'Done' : 'Save & Continue'}</button>
        </div>
      </form>`;

    openSheet(firstRun ? 'Complete Profile' : 'Edit data', body);
    renderSetupFields($('#profileStepFields'), draft, fieldDefs(step.fields));

    $('#profileStepForm').addEventListener('submit', async event => {
      event.preventDefault();
      draft = normalizeData({ ...draft, ...collectForm(event.currentTarget) });
      try {
        await saveCurrentData(draft, false);
        if (index === PROFILE_STEPS.length - 1) {
          closeSheet();
          toast('Profile saved.');
        } else {
          index += 1;
          toast('Saved.');
          render();
        }
      } catch (error) {
        toast(error.message);
      }
    });
    $('[data-progress-back]')?.addEventListener('click', () => {
      draft = normalizeData({ ...draft, ...collectForm($('#profileStepForm')) });
      index = Math.max(0, index - 1);
      render();
    });
    $('[data-progress-close]')?.addEventListener('click', closeSheet);
  };

  render();
}

function openPasswordSheet() {
  openSheet('Change Password', `<form id="passwordChange" class="stack"><label class="field"><span>New Master Password</span><input id="newPassword" type="password" minlength="8" required></label><button class="btn primary" type="submit">Re-encrypt</button></form>`);
  $('#passwordChange').addEventListener('submit', async e => {
    e.preventDefault();
    const newPassword = $('#newPassword').value;
    if (newPassword.length < 8) return toast('Password must be at least 8 characters.');
    try {
      state.masterPassword = newPassword;
      await saveCurrentData(state.data);
      Auth.clearPin(); Auth.clearPasskey();
      closeSheet(); toast('Password changed. Please set up PIN/passkey again.');
    } catch (error) { toast(error.message); }
  });
}

function openPinSetup(firstRun) {
  openSheet('Set Up PIN', `<p class="muted">The PIN encrypts your master password locally. Only an AES-GCM blob is stored, never the plaintext password.</p><form id="pinSetupForm" class="stack"><label class="field"><span>New PIN (4-6 digits)</span><input id="newPin" inputmode="numeric" pattern="\\d{4,6}" autocomplete="off" required></label><button class="btn primary" type="submit">Save PIN</button>${firstRun ? '<button class="btn ghost" type="button" data-close-sheet>Later</button>' : ''}</form>`);
  $('#pinSetupForm').addEventListener('submit', async e => {
    e.preventDefault();
    try { await Auth.savePin($('#newPin').value, state.masterPassword); closeSheet(); toast('PIN saved.'); }
    catch (error) { toast(error.message); }
  });
  $$('[data-close-sheet]', $('#sheet')).forEach(n => n.addEventListener('click', closeSheet));
}

async function setupPasskey() {
  try { await Auth.setupPasskey(state.masterPassword); toast('Passkey set up.'); }
  catch (error) { toast(error.message); }
}

async function saveCurrentData(data, refresh = true) {
  const token = await encryptJson(data, state.masterPassword);
  const saved = await Store.saveToken(token);
  state.data = data; state.token = saved.token; state.updated = saved.updated;
  if (refresh) showVault();
  else {
    updateVaultHeader();
    renderTab();
  }
}

function openSheet(title, body) {
  $('#sheet').classList.remove('profile-menu');
  $('#sheetTitle').textContent = title;
  const sheetBody = $('#sheetBody');
  if (typeof body === 'string') sheetBody.innerHTML = body;
  else sheetBody.replaceChildren(body);
  $('#sheet').classList.remove('hidden');
}
function closeSheet() { $('#sheet').classList.add('hidden'); $('#sheet').classList.remove('profile-menu'); $('#sheetBody').replaceChildren(); }

function renderSetupFields(root, data = {}, fields = FIELDS) {
  const frag = document.createDocumentFragment();
  for (const [key, label, type, required] of fields) {
    const field = document.createElement('label');
    field.className = 'field';
    field.innerHTML = `<span>${esc(label)}${required ? ' *' : ''}</span><input name="${key}" type="${type || 'text'}" value="${esc(data[key] || '')}" ${required ? 'required' : ''}>`;
    frag.append(field);
  }
  root.replaceChildren(frag);
}
function fieldDefs(keys) { return keys.map(key => FIELDS.find(([field]) => field === key)).filter(Boolean); }
function stepCompletion(step, data) {
  const count = step.fields.filter(field => String(data[field] || '').trim()).length;
  return { count, done: count === step.fields.length };
}
function collectForm(form) {
  const data = {};
  new FormData(form).forEach((value, key) => { if (FIELD_LABELS[key]) data[key] = String(value).trim(); });
  return data;
}
function normalizeData(data) {
  const out = {};
  for (const [key] of FIELDS) out[key] = String(data[key] || '').trim();
  out.ib = formatIbanRaw(out.ib);
  out.bic = out.bic.toUpperCase();
  out.pp = out.pp.replace(/^@/, '');
  return out;
}

function updateAvatar() {
  const wrap = $('#heroAvatarWrap');
  const img = $('#heroAvatar');
  const initialsNode = $('#heroInitials');
  const avatar = localStorage.getItem('dv2.avatar') || '';
  initialsNode.textContent = initials(state.data?.n);
  if (!avatar) {
    wrap.classList.remove('has-image');
    img.removeAttribute('src');
    img.hidden = true;
    return;
  }
  img.src = avatar;
  img.hidden = false;
  img.onerror = () => {
    wrap.classList.remove('has-image');
    img.hidden = true;
    img.removeAttribute('src');
  };
  img.onload = () => {
    wrap.classList.add('has-image');
    img.hidden = false;
  };
  if (img.complete && img.naturalWidth > 0) {
    wrap.classList.add('has-image');
    img.hidden = false;
  }
}

function qrRenderOptions(fullscreen, size) {
  if (fullscreen) {
    return {
      size,
      className: 'qr-canvas qr-canvas-fullscreen',
      light: '#fffaff',
      finderLight: '#fffaff',
      dark: '#24113f',
      accent: '#6f55c8',
      border: 6
    };
  }
  return {
    size,
    light: '#ffffff',
    finderLight: '#ffffff',
    dark: '#111111',
    accent: '#111111',
    border: 6
  };
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image could not be read.')); };
    img.src = url;
  });
}

function saveAvatarCrop(image, crop) {
  const sizes = [384, 320, 256, 192];
  let lastError;
  for (const size of sizes) {
    try {
      const canvas = document.createElement('canvas');
      drawAvatarCanvas(canvas, image, crop, size, size >= 320 ? 0.84 : 0.78, true);
      const dataUrl = canvas.toDataURL('image/webp', size >= 320 ? 0.84 : 0.78);
      const fallback = dataUrl.startsWith('data:image/webp') ? dataUrl : canvas.toDataURL('image/jpeg', 0.82);
      localStorage.setItem('dv2.avatar', fallback);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(lastError?.name === 'QuotaExceededError' ? 'Profile picture is still too large for this browser storage.' : 'Profile picture could not be saved.');
}

function drawAvatarCanvas(canvas, image, crop, size, quality = 0.84, final = false) {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = final ? 'high' : 'medium';
  ctx.clearRect(0, 0, size, size);
  const cropSize = Math.min(image.naturalWidth, image.naturalHeight) / Math.max(1, crop.zoom || 1);
  const maxX = Math.max(0, image.naturalWidth - cropSize);
  const maxY = Math.max(0, image.naturalHeight - cropSize);
  const sx = clamp((image.naturalWidth - cropSize) / 2 + (crop.x || 0) / 100 * maxX / 2, 0, maxX);
  const sy = clamp((image.naturalHeight - cropSize) / 2 + (crop.y || 0) / 100 * maxY / 2, 0, maxY);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(image, sx, sy, cropSize, cropSize, 0, 0, size, size);
}

function buildPinPad() {
  const grid = $('.pin-grid');
  const chars = ['1','2','3','4','5','6','7','8','9','←','0','OK'];
  let value = '';
  let handler = null;
  const paint = () => $('#pinDots').innerHTML = Array.from({ length: 6 }, (_, i) => `<span class="${i < value.length ? 'filled' : ''}"></span>`).join('');
  for (const ch of chars) {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.textContent = ch;
    btn.addEventListener('click', async () => {
      vibrate();
      if (/\d/.test(ch) && value.length < 6) value += ch;
      if (ch === '←') value = value.slice(0, -1);
      if (ch === 'OK' && handler) { const pin = value; value = ''; paint(); $('#pinPad').classList.add('hidden'); document.body.classList.remove('pin-active'); await handler(pin); }
      paint();
    });
    grid.append(btn);
  }
  $('#pinCancel').addEventListener('click', () => { value = ''; $('#pinPad').classList.add('hidden'); document.body.classList.remove('pin-active'); paint(); });
  window.openPinPad = cb => { handler = cb; value = ''; paint(); document.body.classList.add('pin-active'); $('#pinPad').classList.remove('hidden'); };
}
function openPinPad(callback) { window.openPinPad(callback); }

function bindLongPress(node, callback) {
  let timer;
  node.addEventListener('pointerdown', () => timer = setTimeout(() => { callback(); vibrate(); }, 520));
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(e => node.addEventListener(e, () => clearTimeout(timer)));
}
async function copyText(text) { await navigator.clipboard.writeText(text); toast('Copied.'); }
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.remove('hidden'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.add('hidden'), 2600); }
function vibrate() { if (navigator.vibrate) navigator.vibrate(8); }
function applyTheme() {
  const legacyTheme = normalizeTheme(
    localStorage.getItem(THEME_KEY) ||
    localStorage.getItem(LEGACY_THEME_KEY)
  );
  const legacyMode = normalizeMode(
    localStorage.getItem(MODE_KEY) ||
    localStorage.getItem(LEGACY_MODE_KEY)
  );
  const theme = THEMES.includes(legacyTheme) ? legacyTheme : 'lavender';
  const mode = MODES.includes(legacyMode) ? legacyMode : 'system';
  const resolvedMode = mode === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;

  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.mode = mode;
  document.documentElement.dataset.resolvedMode = resolvedMode;
  document.body.dataset.theme = theme;
  document.body.dataset.mode = mode;
  localStorage.setItem(THEME_KEY, theme);
  localStorage.setItem(MODE_KEY, mode);
}
function initials(name = '') { return name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('') || 'MK'; }
function formatDate(value) { try { return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); } catch { return value; } }
function formatDebugDate(value) { return value ? formatDate(value) : 'Not set in local build'; }
function shortSha(value) { return value && value !== 'local' ? `${value.slice(0, 12)}…` : 'local'; }
async function loadBuildInfo() {
  try {
    const response = await fetch(`build-info.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Build info is not available.');
    return await response.json();
  } catch {
    return { app: APP_TITLE, buildSha: 'local', repoUpdatedAt: null, builtAt: null, sourceRepo: 'MaroIshiku/meiku', sourceRef: 'local', workflowRun: null, forkRepos: [] };
  }
}
function normalizeUrl(url) { return /^https?:\/\//i.test(url) ? url : `https://${url}`; }
function normalizeTheme(theme) {
  return ({ lavendel: 'lavender', lavender: 'lavender', teal: 'mint', wald: 'mint', mint: 'mint', ozean: 'sky', sky: 'sky', amber: 'amber', rose: 'rose', graphit: 'graphite', graphite: 'graphite' })[theme] || theme;
}
function normalizeMode(mode) {
  return ({ auto: 'system', system: 'system', light: 'light', dark: 'dark' })[mode] || mode;
}
function labelTheme(t) { return ({ lavender: 'Lavender', mint: 'Mint', sky: 'Sky', amber: 'Amber', rose: 'Rose', graphite: 'Graphite' })[t] || t; }
function labelMode(m) { return ({ system: 'System', light: 'Light', dark: 'Dark' })[m] || m; }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function cssVar(name) { return getComputedStyle(document.body).getPropertyValue(name).trim(); }
function esc(value) { return String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[ch]); }
