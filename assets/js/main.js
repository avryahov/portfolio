(function () {
  var storageKey = 'portfolio-theme';

  function setTheme(theme, persist) {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) {
      localStorage.setItem(storageKey, theme);
    }
    syncThemeToggle(theme);
  }

  function syncThemeToggle(theme) {
    var icon = document.querySelector('[data-theme-icon]');
    var label = document.querySelector('[data-theme-label]');
    if (!icon || !label) {
      return;
    }

    if (theme === 'dark') {
      icon.textContent = '☀';
      label.textContent = 'Светлая';
    } else {
      icon.textContent = '☾';
      label.textContent = 'Тёмная';
    }
  }

  function initTheme() {
    var saved = localStorage.getItem(storageKey);
    var theme = saved === 'dark' ? 'dark' : 'light';
    setTheme(theme, false);
  }

  function initThemeToggle() {
    var toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) {
      return;
    }

    toggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      setTheme(next, true);
    });
  }

  function applyYear() {
    var yearNodes = document.querySelectorAll('[data-year]');
    var year = new Date().getFullYear();
    yearNodes.forEach(function (node) {
      node.textContent = String(year);
    });
  }

  function applyFooterNote() {
    var note = document.body.getAttribute('data-footer-note');
    if (!note) {
      return;
    }
    var noteNode = document.querySelector('[data-footer-note]');
    if (noteNode) {
      noteNode.textContent = note;
    }
  }

  function markCurrentNav() {
    var navKey = document.body.getAttribute('data-nav');
    if (!navKey) {
      return;
    }

    var links = document.querySelectorAll('[data-nav-target]');
    links.forEach(function (link) {
      if (link.getAttribute('data-nav-target') === navKey) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function normalizeRootPath(path) {
    if (!path || path === '.') {
      return '.';
    }
    return path.replace(/\/$/, '');
  }

  function loadComponent(targetName, componentPath) {
    var target = document.querySelector('[data-component="' + targetName + '"]');
    if (!target) {
      return Promise.resolve();
    }

    var root = normalizeRootPath(document.body.getAttribute('data-root') || '.');
    var url = root + '/components/' + componentPath;

    return fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Cannot load component: ' + url);
        }
        return response.text();
      })
      .then(function (markup) {
        target.innerHTML = markup.replaceAll('{{ROOT}}', root);
      })
      .catch(function () {
        target.innerHTML = '';
      });
  }

  initTheme();

  Promise.all([
    loadComponent('header', 'header.html'),
    loadComponent('footer', 'footer.html')
  ]).then(function () {
    syncThemeToggle(document.documentElement.getAttribute('data-theme') || 'light');
    markCurrentNav();
    applyFooterNote();
    initThemeToggle();
    applyYear();
  });
})();
