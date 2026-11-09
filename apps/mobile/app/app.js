'use strict';

const sheet = document.getElementById('sheet');
const sheetBody = document.getElementById('sheetBody');
const sheetTitle = document.getElementById('sheetTitle');
const closeButton = document.getElementById('closeSheet');
const panelButtons = document.querySelectorAll('[data-panel]');
const sheetPages = document.querySelectorAll('[data-sheet-page]');
const titles = {place:'地区', terrain:'地形与视角', history:'历史地图', layers:'图层与工具', install:'安装中国地形'};
let currentPanel = '';
let panelOpener;

function showPanel(name, opener) {
  const previousOpener = panelOpener;
  const focusWasInside = sheet.contains(document.activeElement);
  currentPanel = name;
  panelOpener = opener;
  sheet.hidden = !name;
  document.body.classList.toggle('sheet-open', Boolean(name));
  for (const page of sheetPages) page.hidden = page.id !== 'panel-' + name;
  for (const button of panelButtons) button.setAttribute('aria-expanded', String(button.dataset.panel === name));
  if (name) {
    sheetTitle.textContent = titles[name];
    sheetBody.scrollTop = 0;
  } else if (focusWasInside) {
    previousOpener?.focus({preventScroll:true});
  }
}

for (const button of panelButtons) {
  button.addEventListener('click', () => showPanel(currentPanel === button.dataset.panel ? '' : button.dataset.panel, button));
}
closeButton.addEventListener('click', () => showPanel(''));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && currentPanel) showPanel('');
});
for (const button of document.querySelectorAll('[data-preset]')) {
  button.addEventListener('click', () => showPanel(''));
}

const installButton = document.getElementById('installApp');
const nativeInstall = document.getElementById('nativeInstall');
const standalone = matchMedia('(display-mode: standalone)');
const platform = navigator.platform || '';
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
document.getElementById('iosInstall').hidden = !isIOS && /Android/.test(navigator.userAgent);
document.getElementById('androidInstall').hidden = isIOS;
let installPrompt;

function syncInstallation() {
  const installed = standalone.matches || navigator.standalone === true;
  installButton.hidden = installed;
  if (installed && currentPanel === 'install') showPanel('');
}
syncInstallation();
standalone.addEventListener('change', syncInstallation);
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  nativeInstall.hidden = false;
});
window.addEventListener('appinstalled', () => {
  installPrompt = null;
  nativeInstall.hidden = true;
  if (currentPanel === 'install') showPanel('');
  installButton.hidden = true;
});
nativeInstall.addEventListener('click', async () => {
  if (!installPrompt) return;
  const prompt = installPrompt;
  installPrompt = null;
  nativeInstall.hidden = true;
  try {
    await prompt.prompt();
  } catch (err) {
    console.warn('Browser installation prompt unavailable.', err);
  }
});

document.getElementById('retryMap').addEventListener('click', () => location.reload());
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => console.warn('App cache unavailable.', error));
  });
}
