// Tab elements (added termsTab and termsPanel)
const privacyTab = document.getElementById('privacyTab');
const disputeTab = document.getElementById('disputeTab');
const termsTab = document.getElementById('termsTab');

const panels = {
  privacyPanel: document.getElementById('privacyPanel'),
  disputePanel: document.getElementById('disputePanel'),
  termsPanel: document.getElementById('termsPanel')
};

// Ensure provided static dates are preserved; do not overwrite if already set in HTML.
const lastPrivacyEl = document.getElementById('lastUpdatedPrivacy');
const lastDisputeEl = document.getElementById('lastUpdatedDispute');
if (lastPrivacyEl && !lastPrivacyEl.textContent.trim()) lastPrivacyEl.textContent = '2025-10-23';
if (lastDisputeEl && !lastDisputeEl.textContent.trim()) lastDisputeEl.textContent = '2025-10-23';

function activatePanel(panelId, tabBtn) {
  // hide all tab buttons (by class) and remove active state
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  // add active to clicked tab button
  if (tabBtn) tabBtn.classList.add('active');

  // hide all panels
  Object.values(panels).forEach(p => {
    if (p) p.classList.remove('active');
  });

  // show requested panel (if exists)
  const panel = panels[panelId];
  if (panel) panel.classList.add('active');

  // update bottom nav state if present
  document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
  const bnMatch = document.querySelector(`.bn-item[data-target="${panelId}"]`);
  if (bnMatch) bnMatch.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

privacyTab && privacyTab.addEventListener('click', () => activatePanel('privacyPanel', privacyTab));
disputeTab && disputeTab.addEventListener('click', () => activatePanel('disputePanel', disputeTab));
termsTab && termsTab.addEventListener('click', () => activatePanel('termsPanel', termsTab));

document.querySelectorAll('.bn-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-target');
    if (target && panels[target]) {
      // find corresponding tab button to set active style
      const tabBtn = document.querySelector(`.tab[aria-controls="${target}"]`);
      activatePanel(target, tabBtn);
    }
  });
});

// Accordion behavior (no-op if none)
document.querySelectorAll('.acc-head').forEach(head => {
  head.addEventListener('click', () => {
    const expanded = head.getAttribute('aria-expanded') === 'true';
    head.setAttribute('aria-expanded', String(!expanded));
    const body = head.parentElement.querySelector('.acc-body');
    const acc = head.parentElement;
    if (!body) return;
    if (expanded) {
      body.classList.remove('open');
      acc.classList.remove('highlight');
      const icon = head.querySelector('.acc-icons');
      if (icon) icon.textContent = '+';
    } else {
      body.classList.add('open');
      const icon = head.querySelector('.acc-icons');
      if (icon) icon.textContent = '–';
    }
  });
});

// Anchor links: smooth scroll and copy URL to clipboard (best-effort)
document.querySelectorAll('.anchor').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.getAttribute('href').replace('#', '');
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try {
        const url = `${location.origin}${location.pathname}#${id}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).catch(() => {/* ignore */});
        }
      } catch (err) {
        // ignore clipboard errors
      }
    }
  });
});

// Scroll to top
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  });
}

// Logo load check + fallback to inline SVG if PNG not accessible
(function(){
  const logoEl = document.getElementById('logoImg');
  const fallback = document.getElementById('logo-fallback');
  if(!logoEl) return;
  const tester = new Image();
  tester.onload = () => {
    logoEl.style.display = '';
    if(fallback) fallback.style.display = 'none';
    console.log('Logo loaded: veehive-logo.png');
  };
  tester.onerror = () => {
    console.warn('Logo failed to load: showing SVG fallback');
    logoEl.style.display = 'none';
    if(fallback) fallback.style.display = 'block';
  };
  tester.src = './veehive-logo.png';
})();

// Print / Save PDF — robust single handler: expand accordions, print, restore
(function(){
  const printBtn = document.getElementById('printBtn');

  function expandAllForPrint(){
    const bodies = Array.from(document.querySelectorAll('.acc-body'));
    window._accPrintStates = bodies.map(b => b.classList.contains('open'));
    bodies.forEach(b => {
      b.classList.add('open');
      const head = b.parentElement.querySelector('.acc-head');
      if (head) head.setAttribute('aria-expanded', 'true');
      const icon = head && head.querySelector('.acc-icons');
      if (icon) icon.textContent = '–';
    });
  }
  function restoreAccordionsAfterPrint(){
    const bodies = Array.from(document.querySelectorAll('.acc-body'));
    if (!window._accPrintStates) return;
    bodies.forEach((b, i) => {
      if (!window._accPrintStates[i]) {
        b.classList.remove('open');
        const head = b.parentElement.querySelector('.acc-head');
        if (head) head.setAttribute('aria-expanded', 'false');
        const icon = head && head.querySelector('.acc-icons');
        if (icon) icon.textContent = '+';
      }
    });
    window._accPrintStates = null;
  }

  // attach beforeprint/afterprint where supported, wrapped in try to avoid errors
  try {
    window.addEventListener('beforeprint', expandAllForPrint);
    window.addEventListener('afterprint', restoreAccordionsAfterPrint);
  } catch (e) {
    // ignore if not supported
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      expandAllForPrint();
      // allow layout to settle before opening print dialog
      setTimeout(() => {
        try {
          window.print();
        } catch (err) {
          console.error('Printing failed:', err);
        }
        // fallback restore if afterprint doesn't fire
        setTimeout(restoreAccordionsAfterPrint, 800);
      }, 120);
    });
  }
})();
