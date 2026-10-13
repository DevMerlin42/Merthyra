(() => {
  'use strict';
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('click', event => {
    document.querySelectorAll('.explore-menu[open]').forEach(menu => {
      if (!menu.contains(event.target)) menu.open = false;
    });
    if (nav?.classList.contains('is-open') && !event.target.closest('.site-header')) {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.explore-menu[open]').forEach(menu => { menu.open = false; });
    if (nav?.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.focus();
    }
  });
  const chips = [...document.querySelectorAll('[data-filter]')];
  const tiles = [...document.querySelectorAll('.feature-grid [data-category]')];
  chips.forEach(chip => chip.addEventListener('click', () => {
    const filter = chip.dataset.filter;
    chips.forEach(other => other.setAttribute('aria-pressed', String(other === chip)));
    tiles.forEach(tile => { tile.hidden = filter !== 'all' && tile.dataset.category !== filter; });
    const count = tiles.filter(tile => !tile.hidden).length;
    const status = document.querySelector('#filter-status');
    if (status) status.textContent = `Showing ${count} ${filter === 'all' ? '' : filter + ' '}features`;
  }));
  document.querySelectorAll('[data-plan]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-plan]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    const annual = button.dataset.plan === 'annual';
    document.querySelector('#plan-title').textContent = annual ? 'Your year. Your pace.' : 'Your month. Your pace.';
    document.querySelector('#plan-copy').textContent = `A ${annual ? 'yearly' : 'monthly'} subscription to your full day planning experience.`;
  }));
  const dialog = document.querySelector('.screenshot-dialog');
  document.querySelectorAll('[data-screen]').forEach(button => button.addEventListener('click', () => {
    const full = document.querySelector('#screenshot-full');
    full.src = button.dataset.screen;
    full.alt = button.dataset.caption;
    document.querySelector('#screenshot-caption').textContent = button.dataset.caption;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  const closeDialog = () => dialog?.close();
  document.querySelector('.dialog-close')?.addEventListener('click', closeDialog);
  dialog?.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog();
  });
  dialog?.addEventListener('close', () => { document.body.classList.remove('dialog-open'); });
  const config = window.MERTHYRA_SITE || {};
  if (config.downloadURL) {
    try {
      const url = new URL(config.downloadURL);
      if (url.protocol === 'https:' && ['apps.apple.com', 'testflight.apple.com'].includes(url.hostname)) {
        document.querySelectorAll('[data-download]').forEach(link => {
          link.href = url.href;
          link.textContent = url.hostname === 'testflight.apple.com' ? 'Join on TestFlight ↗' : 'View on the App Store ↗';
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        });
      }
    } catch { /* The existing Explore link stays usable. */ }
  }
  if (config.supportEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.supportEmail)) {
    document.querySelectorAll('[data-support]').forEach(link => {
      link.href = `mailto:${encodeURIComponent(config.supportEmail)}`;
      link.textContent = 'Contact support ↗';
    });
  }
})();
