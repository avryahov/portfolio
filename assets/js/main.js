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

  function markCurrentNav() {
    var path = window.location.pathname || '/';
    var navKey = 'home';

    if (path.indexOf('/orgmu/') === 0) {
      navKey = 'orgmu';
    } else if (path.indexOf('/inverter/') === 0) {
      navKey = 'inverter';
    } else if (path.indexOf('/open-solutions/') === 0) {
      navKey = 'open-solutions';
    } else if (path.indexOf('/teaching/') === 0) {
      navKey = 'teaching';
    } else if (path.indexOf('/education/') === 0) {
      navKey = 'education';
    } else if (path.indexOf('/qualification/') === 0) {
      navKey = 'qualification';
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
        target.innerHTML = markup.split('{{ROOT}}').join(root);
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
    initThemeToggle();
    applyYear();
  });
})();
