const loadedScripts = new Map();
const loadedPreambles = new Set();

window.__IPG_HOST = true;

function ensureViteReactPreamble(origin) {
  if (loadedPreambles.has(origin)) return Promise.resolve();

  window.__vite_plugin_react_preamble_installed__ = true;
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;

  loadedPreambles.add(origin);
  return Promise.resolve();
}

async function loadScriptOnce(src) {
  if (loadedScripts.has(src)) return loadedScripts.get(src);

  const origin = new URL(src, window.location.href).origin;
  const promise = ensureViteReactPreamble(origin)
    .then(() => fetch(src))
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch ${src}`);
      const script = document.createElement('script');
      script.type = 'module';
      script.src = src;
      document.head.appendChild(script);
      return new Promise((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
      });
    });

  loadedScripts.set(src, promise);
  return promise;
}

async function hydrateMfe(placeholder) {
  const src = placeholder.dataset.src;
  const elementName = placeholder.dataset.element;
  if (!src || !elementName) return;

  await loadScriptOnce(src);

  const custom = document.createElement(elementName);
  for (const [key, value] of Object.entries(placeholder.dataset)) {
    if (key === 'element' || key === 'src') continue;
    custom.setAttribute(`data-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`, value);
  }

  placeholder.replaceWith(custom);
}

async function boot() {
  const targets = Array.from(document.querySelectorAll('ipg-mfe'));
  await Promise.all(targets.map((node) => hydrateMfe(node)));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
