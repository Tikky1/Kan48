/*
  common.js
  ---------
  - Loads partials/navbar.html and partials/footer.html into their placeholders
  - Handles navbar scroll state, mobile menu toggle, and active-link highlighting
  - Loads data/links.json and applies it to any [data-link] element site-wide
  - Exposes window.renderFooterSocials(extraLinks) so pages like press.html can
    merge page-specific social links (e.g. from press-data.json) with the site's
    default ones from links.json
  - Exposes window.partialsReady, a Promise that resolves once both the navbar
    and footer have been injected into the DOM (useful for pages that need to
    touch footer-socials only after the footer markup exists)

  Usage: place <div id="navbar-placeholder"></div> and
  <div id="footer-placeholder"></div> where the header/footer should go, and
  include this script near the end of <body> (after those placeholders).

  A page can opt out of the automatic footer-socials render (e.g. press.html,
  which needs to merge extra links first) by setting:
    window.SKIP_AUTO_FOOTER_SOCIALS = true;
  before this script runs.
*/
(function () {
  // Cache partials in sessionStorage so navigating between pages (which on
  // GitHub Pages is always a full page reload, since these are static .html
  // files) doesn't re-fetch + re-flash the navbar/footer every single time.
  // Cleared automatically when the tab is closed; bump PARTIALS_CACHE_VERSION
  // if you edit navbar.html/footer.html and want to force a refresh for
  // users mid-session (not usually needed -- a hard refresh / new tab is enough).
  var PARTIALS_CACHE_VERSION = 'v1';

  function loadPartial(placeholderId, url) {
    return new Promise(function (resolve) {
      var el = document.getElementById(placeholderId);
      if (!el) { resolve(); return; }

      var cacheKey = 'partial:' + PARTIALS_CACHE_VERSION + ':' + url;
      var cached;
      try { cached = sessionStorage.getItem(cacheKey); } catch (e) { cached = null; }

      if (cached) {
        el.outerHTML = cached;
        resolve();
        return;
      }

      fetch(url)
        .then(function (res) { return res.text(); })
        .then(function (html) {
          try { sessionStorage.setItem(cacheKey, html); } catch (e) { /* storage full/disabled, ignore */ }
          el.outerHTML = html;
          resolve();
        })
        .catch(function (err) {
          console.error('Failed to load partial: ' + url, err);
          resolve();
        });
    });
  }

  function initNavbar() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    var menuBtn = document.getElementById('menu-btn');
    var mobileMenu = document.getElementById('mobile-menu');
    var menuIcon = document.getElementById('menu-icon');
    var closeIcon = document.getElementById('close-icon');

    // Pages that don't have a transparent hero (minigames, countrydle, press)
    // can set data-navbar-solid="true" on <body> to render the navbar solid
    // from the very start instead of waiting for scroll.
    var solidFromStart = document.body.dataset.navbarSolid === 'true';

    function setSolid(on) {
      if (on) {
        navbar.classList.add('bg-background/95', 'backdrop-blur-xl', 'border-b', 'border-border', 'shadow-sm');
        navbar.classList.remove('bg-transparent');
      } else {
        navbar.classList.remove('bg-background/95', 'backdrop-blur-xl', 'border-b', 'border-border', 'shadow-sm');
        navbar.classList.add('bg-transparent');
      }
    }

    setSolid(solidFromStart || window.scrollY > 50);
    window.addEventListener('scroll', function () {
      setSolid(solidFromStart || window.scrollY > 50);
    });

    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', function () {
        mobileMenu.classList.toggle('hidden');
        menuIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
      });
    }

    document.querySelectorAll('.mobile-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      });
    });

    // Active link highlight: <body data-nav-active="press"> etc.
    var current = document.body.dataset.navActive;
    if (current) {
      document.querySelectorAll('[data-nav="' + current + '"]').forEach(function (el) {
        el.classList.remove('text-muted-foreground');
        el.classList.add('text-primary');
      });
    }
  }

  // ---- Footer social icons ----
  var FOOTER_ICONS = {
    github: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>',
    linkedin: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>',
    twitter: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>',
    instagram: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
    youtube: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>',
    tiktok: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.24 8.24 0 0 0 4.84 1.56V6.97a4.85 4.85 0 0 1-1.07-.28z"/></svg>',
    discord: '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
    bluesky: '<svg class="h-4 w-4" viewBox="0 0 600 530" fill="currentColor"><path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"/></svg>'
  };
  var FOOTER_LABELS = { github: 'GitHub', linkedin: 'LinkedIn', twitter: 'Twitter / X', instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok', discord: 'Discord', bluesky: 'Bluesky' };
  var FOOTER_ORDER = ['github', 'linkedin', 'twitter', 'instagram', 'youtube', 'tiktok', 'discord', 'bluesky'];

  function renderFooterSocials(extraLinks) {
    var el = document.getElementById('footer-socials');
    if (!el) return;
    fetch('data/links.json')
      .then(function (res) { return res.json(); })
      .then(function (siteLinks) {
        var merged = Object.assign({}, (siteLinks && siteLinks.social) || {}, extraLinks || {});
        el.innerHTML = FOOTER_ORDER
          .filter(function (k) { return merged[k]; })
          .map(function (k) {
            return '<a href="' + merged[k] + '" target="_blank" rel="noopener noreferrer" ' +
              'class="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all" ' +
              'aria-label="' + (FOOTER_LABELS[k] || k) + '">' + (FOOTER_ICONS[k] || '') + '</a>';
          })
          .join('');
      })
      .catch(function (err) { console.error('Failed to load links.json for footer', err); });
  }
  window.renderFooterSocials = renderFooterSocials;

  // ---- Site-wide [data-link] resolution (steam url, discord invite, etc.) ----
  function initLinks() {
    fetch('data/links.json')
      .then(function (res) { return res.json(); })
      .then(function (siteLinks) {
        window.siteLinks = siteLinks;

        if (siteLinks.favicon) {
          var favicon = document.createElement('link');
          favicon.rel = 'icon';
          favicon.href = siteLinks.favicon;
          favicon.type = 'image/png';
          document.head.appendChild(favicon);
        }

        function resolve(obj, path) {
          return path.split('.').reduce(function (acc, key) { return acc && acc[key]; }, obj);
        }

        document.querySelectorAll('[data-link]').forEach(function (el) {
          var value = resolve(siteLinks, el.dataset.link);
          if (value) el.href = value;
        });

        var steamBadge = document.getElementById('steam-badge');
        if (steamBadge && siteLinks.projects && siteLinks.projects.deepbound && siteLinks.projects.deepbound.steam) {
          steamBadge.remove();
        }

        document.dispatchEvent(new CustomEvent('sitelinks:loaded', { detail: siteLinks }));
      })
      .catch(function () {
        // Silently skip -- fetch fails on file:// protocol (use a local server to test)
      });
  }

  var navbarLoaded = loadPartial('navbar-placeholder', 'partials/navbar.html').then(initNavbar);
  var footerLoaded = loadPartial('footer-placeholder', 'partials/footer.html').then(function () {
    if (!window.SKIP_AUTO_FOOTER_SOCIALS) renderFooterSocials();
  });

  window.partialsReady = Promise.all([navbarLoaded, footerLoaded]);

  initLinks();
})();