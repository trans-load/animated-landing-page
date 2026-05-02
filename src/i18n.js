// i18n for transload. Plain JS (no JSX) — loads before the Babel-transpiled components.
// Exposes window.__i18n and window.useT.
(function () {
  const STORAGE_KEY = 'transload_lang';
  const SUPPORTED = ['en', 'de'];
  const DEFAULT = 'en';

  const STRINGS = {
    en: {
      'nav.installation': 'Integration',
      'nav.comparison': 'Benefits',
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
      'install.step2.title': 'Zero process changes',
      'install.step3.title': 'Live in days, not weeks',

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

      'founders.title': "transload's founders",
      'founders.role': 'Co-Founder',
      'founders.email': 'Email',

      'book.eyebrow': 'Book a demo',
      'book.headline': 'Explore what transload can do for you.',

      'faq.eyebrow': 'FAQ',
      'faq.headline': 'Frequently asked questions',
      'faq.q1.q': 'Does transload work with our existing cameras?',
      'faq.q1.a': 'Yes. transload runs on standard IP cameras you already have — Axis, Hikvision, Bosch, Dahua, Hanwha, and most others. No new hardware is required.',
      'faq.q2.q': 'How accurate are the dimensions?',
      'faq.q2.a': 'transload measures pallets and parcels with accuracy comparable to legacy dimensioner stations, and it covers every shipment in the terminal — not just samples.',
      'faq.q3.q': 'How long does setup take?',
      'faq.q3.a': 'A typical rollout is days, not weeks. Because it is software-only, we connect to your WMS or TMS, calibrate against the camera positions, and you are live.',
      'faq.q4.q': 'Does it integrate with our WMS or TMS?',
      'faq.q4.a': 'Yes. Dimensions are linked to license plate numbers via scan timestamps and pushed into your WMS, TMS, or ERP through a standard integration.',
      'faq.q5.q': 'How does transload handle data protection?',
      'faq.q5.a': 'transload processes data in line with the applicable local data-protection requirements — GDPR for European customers, and the equivalent frameworks elsewhere.',
      'faq.q6.q': 'Do drivers or forklift operators need to change anything?',
      'faq.q6.a': 'No. Measurement runs in the background on the cameras you already operate. There are no detours to a dimensioner station and no waiting at a measuring booth.',
    },
    de: {
      'nav.installation': 'Anbindung',
      'nav.comparison': 'Vorteile',
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
      'install.step2.title': 'Keine Prozess\u00e4nderungen',
      'install.step3.title': 'Live in Tagen, nicht Wochen',

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

      'founders.title': 'Die Gr\u00fcnder von transload',
      'founders.role': 'Mitgr\u00fcnder',
      'founders.email': 'E-Mail',

      'book.eyebrow': 'Demo buchen',
      'book.headline': 'Erfahren Sie, was transload kann.',

      'faq.eyebrow': 'FAQ',
      'faq.headline': 'Häufige Fragen',
      'faq.q1.q': 'Funktioniert transload mit unseren bestehenden Kameras?',
      'faq.q1.a': 'Ja. transload läuft auf Standard-IP-Kameras, die Sie bereits einsetzen — Axis, Hikvision, Bosch, Dahua, Hanwha und die meisten anderen. Neue Hardware ist nicht erforderlich.',
      'faq.q2.q': 'Wie genau sind die Abmessungen?',
      'faq.q2.a': 'transload misst Paletten und Packstücke mit einer Genauigkeit, die klassischen Messstationen entspricht — und erfasst dabei jede Sendung im Terminal, nicht nur Stichproben.',
      'faq.q3.q': 'Wie lange dauert die Inbetriebnahme?',
      'faq.q3.a': 'Ein typischer Rollout dauert Tage, keine Wochen. Da es sich um eine reine Softwarelösung handelt, binden wir Ihr WMS oder TMS an, kalibrieren die Kamerapositionen und Sie sind startklar.',
      'faq.q4.q': 'Lässt sich transload an unser WMS oder TMS anbinden?',
      'faq.q4.a': 'Ja. Abmessungen werden über Scan-Zeitstempel mit Packstücknummern verknüpft und über eine Standard-Schnittstelle in Ihr WMS, TMS oder ERP übertragen.',
      'faq.q5.q': 'Wie geht transload mit dem Datenschutz um?',
      'faq.q5.a': 'transload verarbeitet Daten gemäß den jeweils geltenden lokalen Datenschutzanforderungen — DSGVO für europäische Kunden und die entsprechenden Regelwerke in anderen Regionen.',
      'faq.q6.q': 'Müssen Fahrer oder Staplerfahrer ihren Ablauf ändern?',
      'faq.q6.a': 'Nein. Die Vermessung läuft im Hintergrund auf den Kameras, die Sie bereits betreiben. Keine Umwege zur Messstation, kein Warten am Messgerät.',
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
