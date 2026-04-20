// i18n for transload. Plain JS (no JSX) — loads before the Babel-transpiled components.
// Exposes window.__i18n and window.useT.
(function () {
  const STORAGE_KEY = 'transload_lang';
  const SUPPORTED = ['en', 'de'];
  const DEFAULT = 'en';

  const STRINGS = {
    en: {
      'nav.installation': 'Installation',
      'nav.comparison': 'Comparison',
      'nav.demo': 'Demo',
      'nav.phone': 'Phone',
      'nav.contact': 'Contact',

      'hero.progress.feed': 'CAMERA FEED',
      'hero.progress.recon': '3D RECONSTRUCTION',
      'hero.yc.backed_by': 'Backed by',
      'hero.headline.line1': 'Turn your security cameras',
      'hero.headline.into': 'into',
      'hero.headline.dimensioners': 'dimensioners',
      'hero.scroll': 'Scroll',

      'hero.chip.front': '31.9\u2033 \u00d7 46.9\u2033 \u00d7 40.2\u2033',
      'hero.chip.mid':   '31.1\u2033 \u00d7 47.6\u2033 \u00d7 78.0\u2033',
      'hero.chip.back':  '24.4\u2033 \u00d7 31.9\u2033 \u00d7 58.7\u2033',

      'trust.trusted_by': 'Trusted by',

      'install.eyebrow': 'How it installs',
      'install.headline.line1': 'No new hardware.',
      'install.headline.line2': 'No new workflows.',
      'install.headline.line3': 'Just your existing cameras.',
      'install.step1.title': 'Works with your existing cameras',
      'install.step1.body': 'We use what you have. Axis, Hikvision, Bosch, Dahua, Hanwha, or any IP camera.',
      'install.step2.title': 'Zero process changes',
      'install.step2.body': 'No workflow changes for your team. No new hardware. Optimize around speed.',
      'install.step3.title': 'From sampling to full coverage',
      'install.step3.body': 'Software\u2011only rollout. We connect to your WMS/TMS, calibrate and are ready to go.',
      'install.footnote': 'License Plate Numbers are linked to dimensions with timestamp of scan.',

      'comparison.eyebrow': 'What changes with transload',
      'comparison.headline': 'From a sample to full coverage.',
      'comparison.past.label': 'The past',
      'comparison.past.sublabel': 'Slow and manual',
      'comparison.past.row1': 'Dimensions for a sample',
      'comparison.past.row2': 'Forklift detours to dimensioner station',
      'comparison.past.row3': 'Drivers waiting at the dimensioner',
      'comparison.now.label': 'Now',
      'comparison.now.sublabel': 'Fast and automatic',
      'comparison.now.row1': 'Dimensions for every item',
      'comparison.now.row2': 'Measure everywhere on the terminal',
      'comparison.now.row3': 'Runs fully in the background \u2014 no extra steps',

      'book.eyebrow': 'Book a demo',
      'book.headline': 'Explore what transload can do for you.',
    },
    de: {
      'nav.installation': 'Installation',
      'nav.comparison': 'Vergleich',
      'nav.demo': 'Demo',
      'nav.phone': 'Telefon',
      'nav.contact': 'Kontakt',

      'hero.progress.feed': 'KAMERABILD',
      'hero.progress.recon': '3D-REKONSTRUKTION',
      'hero.yc.backed_by': 'Unterst\u00fctzt von',
      'hero.headline.line1': 'Nutzen Sie Ihre Sicherheitskameras',
      'hero.headline.into': 'zur',
      'hero.headline.dimensioners': 'Vermessung',
      'hero.scroll': 'Scrollen',

      'hero.chip.front': '81 \u00d7 119 \u00d7 102 cm',
      'hero.chip.mid':   '79 \u00d7 121 \u00d7 198 cm',
      'hero.chip.back':  '62 \u00d7 81 \u00d7 149 cm',

      'trust.trusted_by': 'Unsere Partner',

      'install.eyebrow': 'So l\u00e4uft die Installation',
      'install.headline.line1': 'Keine neue Hardware.',
      'install.headline.line2': 'Keine neuen Prozesse.',
      'install.headline.line3': 'Nur Ihre bestehenden Kameras.',
      'install.step1.title': 'Funktioniert mit Ihren Kameras',
      'install.step1.body': 'Wir nutzen, was Sie haben. Axis, Hikvision, Bosch, Dahua, Hanwha oder jede IP-Kamera.',
      'install.step2.title': 'Keine Prozess\u00e4nderungen',
      'install.step2.body': 'Ihr Team muss seine Prozesse nicht ver\u00e4ndern, um zu vermessen.',
      'install.step3.title': 'Live in Tagen, nicht Wochen',
      'install.step3.body': 'Reiner Software-Rollout. Wir binden Ihr WMS/TMS an, kalibrieren und sind startklar.',
      'install.footnote': 'Packst\u00fccknummer und Abmessung werden \u00fcber Scan-Zeitstempel verkn\u00fcpft.',

      'comparison.eyebrow': 'Was sich mit transload \u00e4ndert',
      'comparison.headline': 'Vermessung im Hintergrund.',
      'comparison.past.label': 'Fr\u00fcher',
      'comparison.past.sublabel': 'Langsam und manuell',
      'comparison.past.row1': 'Abmessungen nur f\u00fcr Stichproben',
      'comparison.past.row2': 'Gabelstapler-Umwege zur Messstation',
      'comparison.past.row3': 'Fahrer warten am Messger\u00e4t',
      'comparison.now.label': 'Heute',
      'comparison.now.sublabel': 'Schnell und automatisch',
      'comparison.now.row1': 'Abmessungen f\u00fcr jede Sendung',
      'comparison.now.row2': 'Abmessung \u00fcberall auf der Umschlaghalle',
      'comparison.now.row3': 'L\u00e4uft vollst\u00e4ndig im Hintergrund \u2014 keine zus\u00e4tzlichen Schritte',

      'book.eyebrow': 'Demo buchen',
      'book.headline': 'Erfahren Sie, was transload kann.',
    },
  };

  function detect() {
    try {
      const q = new URLSearchParams(window.location.search).get('lang');
      if (q && SUPPORTED.indexOf(q.toLowerCase()) !== -1) return q.toLowerCase();
    } catch (e) {}
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    const nav = (navigator.language || DEFAULT).slice(0, 2).toLowerCase();
    return SUPPORTED.indexOf(nav) !== -1 ? nav : DEFAULT;
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    try {
      const u = new URL(window.location.href);
      if (lang === DEFAULT) u.searchParams.delete('lang');
      else u.searchParams.set('lang', lang);
      window.history.replaceState({}, '', u.toString());
    } catch (e) {}
    try { document.documentElement.lang = lang; } catch (e) {}
    window.dispatchEvent(new CustomEvent('transload:langchange', { detail: { lang: lang } }));
  }

  function t(key, lang) {
    const l = lang || detect();
    const tbl = STRINGS[l] || STRINGS[DEFAULT];
    return tbl[key] != null ? tbl[key] : (STRINGS[DEFAULT][key] != null ? STRINGS[DEFAULT][key] : key);
  }

  // Set <html lang> on initial load
  try { document.documentElement.lang = detect(); } catch (e) {}

  window.__i18n = { STRINGS: STRINGS, SUPPORTED: SUPPORTED, detect: detect, setLang: setLang, t: t };

  // React hook usable from any Babel-transpiled component.
  window.useT = function useT() {
    const [lang, setLangState] = React.useState(detect());
    React.useEffect(function () {
      const handler = function (e) { setLangState(e.detail.lang); };
      window.addEventListener('transload:langchange', handler);
      return function () { window.removeEventListener('transload:langchange', handler); };
    }, []);
    return {
      lang: lang,
      t: function (key) { return t(key, lang); },
      setLang: setLang,
    };
  };
})();
