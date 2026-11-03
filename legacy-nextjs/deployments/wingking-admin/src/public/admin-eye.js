/* Wingking Studio Admin — accessible visibility toggle for password inputs. */
(() => {
  const eye = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12c4-7 16-7 20 0-4 7-16 7-20 0Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const eyeOff = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 3 18 18"/><path d="M2 12c4-7 16-7 20 0-1 2-3 4-5 5"/><path d="M6.4 6.4C3.5 8.4 2 12 2 12s3.5 7 10 7a11 11 0 0 0 5.6-1.5"/><path d="M10 10a3 3 0 0 0 4 4"/></svg>';
  function attach() {
    document.querySelectorAll('input[type="password"]:not([data-wk-eye])').forEach(input => {
      const holder = input.parentElement;
      if (!holder) return;
      input.dataset.wkEye = '1';
      if (getComputedStyle(holder).position === 'static') holder.style.position = 'relative';
      input.style.paddingRight = '56px';
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.wkEyeButton = '1';
      button.title = 'Tampilkan password';
      button.setAttribute('aria-label', button.title);
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = eye;
      Object.assign(button.style, {
        position: 'absolute', zIndex: '10', right: '9px',
        top: (input.offsetTop + Math.max(0, (input.offsetHeight - 38) / 2)) + 'px',
        width: '40px', height: '38px', display: 'grid', placeItems: 'center',
        color: '#e9b979', border: '0', borderRadius: '6px',
        background: 'rgba(28,27,29,.95)', cursor: 'pointer'
      });
      button.addEventListener('click', e => {
        e.preventDefault();
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
  function init() {
    attach();
    new MutationObserver(attach).observe(document.body, {childList: true, subtree: true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();