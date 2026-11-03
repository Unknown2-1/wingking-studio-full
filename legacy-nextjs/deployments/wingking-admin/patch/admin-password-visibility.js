/* Wingking Studio — accessible password visibility for admin pages.
   It never reads, logs, stores, or sends password values. */
(() => {
  const eye = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c4-7 16-7 20 0-4 7-16 7-20 0Z"/><circle cx="12" cy="12" r="3"/></svg>`;
  const eyeOff = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 3 18 18"/><path d="M2 12c4-7 16-7 20 0-1 2-3 4-5 5"/><path d="M6.4 6.4C3.5 8.4 2 12 2 12s3.5 7 10 7a11 11 0 0 0 5.6-1.5"/><path d="M10 10a3 3 0 0 0 4 4"/></svg>`;
  function setup() {
    document.querySelectorAll('input[type="password"]:not([data-wk-eye])').forEach((input) => {
      const holder = input.parentElement;
      if (!holder) return;
      input.dataset.wkEye = '1';
      if (getComputedStyle(holder).position === 'static') holder.style.position = 'relative';
      input.style.paddingRight = '54px';
      const button = document.createElement('button');
      button.type = 'button';
      button.title = 'Tampilkan password';
      button.setAttribute('aria-label', 'Tampilkan password');
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = eye;
      Object.assign(button.style, {
        position: 'absolute', right: '9px',
        top: `${input.offsetTop + Math.max(0, (input.offsetHeight - 36) / 2)}px`,
        width: '38px', height: '36px', display: 'grid', placeItems: 'center',
        background: 'transparent', color: '#e9b979', border: '0',
        cursor: 'pointer', zIndex: '10'
      });
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const visible = input.type === 'password';
        input.type = visible ? 'text' : 'password';
        button.innerHTML = visible ? eyeOff : eye;
        button.title = visible ? 'Sembunyikan password' : 'Tampilkan password';
        button.setAttribute('aria-label', button.title);
        button.setAttribute('aria-pressed', String(visible));
      });
      holder.appendChild(button);
    });
  }
  function start() { setup(); new MutationObserver(setup).observe(document.body, { childList: true, subtree: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();

})();
