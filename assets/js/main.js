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

  function initStickyNavFallback() {
    var strip = document.querySelector('.anchor-strip');
    if (!strip) {
      return;
    }

    var hasNativeSticky = typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      (CSS.supports('position', 'sticky') || CSS.supports('position', '-webkit-sticky'));

    if (hasNativeSticky) {
      strip.classList.remove('is-fixed');
      return;
    }

    if (strip.nextElementSibling && strip.nextElementSibling.classList.contains('anchor-strip-placeholder')) {
      strip.nextElementSibling.remove();
    }

    var placeholder = document.createElement('div');
    placeholder.className = 'anchor-strip-placeholder';
    strip.insertAdjacentElement('afterend', placeholder);

    var startTop = strip.offsetTop;

    function update() {
      var fixed = window.pageYOffset >= startTop;
      strip.classList.toggle('is-fixed', fixed);
      if (fixed) {
        placeholder.style.height = strip.offsetHeight + 'px';
      } else {
        placeholder.style.height = '0px';
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', function () {
      startTop = placeholder.offsetTop - strip.offsetHeight;
      update();
    });

    update();
  }

  function initResponsiveNavMenus() {
    var strips = document.querySelectorAll('.anchor-strip');
    if (!strips.length) {
      return;
    }

    strips.forEach(function (strip) {
      var toggle = strip.querySelector('[data-nav-menu-toggle]');
      var nav = strip.querySelector('.anchor-nav');
      if (!toggle || !nav) {
        return;
      }

      function closeMenu(withAnimation) {
        nav.classList.toggle('is-animated', !!withAnimation);
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        document.body.classList.remove('nav-overlay-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Открыть меню навигации');
        toggle.innerHTML = '<span aria-hidden="true">☰</span>';
      }

      function openMenu() {
        nav.classList.add('is-animated');
        nav.classList.add('is-open');
        toggle.classList.add('is-open');
        document.body.classList.add('nav-overlay-open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Закрыть меню навигации');
        toggle.innerHTML = '<span aria-hidden="true">✕</span>';
      }

      toggle.addEventListener('click', function () {
        var opened = nav.classList.contains('is-open');
        if (opened) {
          closeMenu(true);
        } else {
          openMenu();
        }
      });

      nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          closeMenu(true);
        });
      });

      window.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          closeMenu(true);
        }
      });

      window.addEventListener('resize', function () {
        closeMenu(false);
      });

      closeMenu(false);
    });
  }

  function initContactModal() {
    var modal = document.querySelector('[data-contact-modal]');
    var openers = document.querySelectorAll('[data-contact-modal-open]');
    if (!modal || !openers.length) {
      return;
    }

    var closeControls = modal.querySelectorAll('[data-contact-modal-close]');
    var form = modal.querySelector('[data-contact-form]');
    var firstInput = form ? form.querySelector('input, select, textarea, button') : null;
    var lastFocused = null;

    function openModal() {
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('contact-modal-open');
      if (firstInput) {
        firstInput.focus();
      }
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove('contact-modal-open');
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    openers.forEach(function (opener) {
      opener.addEventListener('click', function (event) {
        event.preventDefault();
        openModal();
      });
    });

    closeControls.forEach(function (control) {
      control.addEventListener('click', closeModal);
    });

    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.hidden) {
        closeModal();
      }
    });

    if (!form) {
      return;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var data = new FormData(form);
      var type = (data.get('requestType') || '').toString();
      var name = (data.get('name') || '').toString();
      var contact = (data.get('contact') || '').toString();
      var message = (data.get('message') || '').toString();
      var topics = data.getAll('topics').map(function (item) {
        return String(item);
      });

      var subject = 'Обсуждение проекта: ' + (type || 'Запрос с сайта');
      var lines = [
        'Имя: ' + (name || 'Не указано'),
        'Контакт: ' + (contact || 'Не указан'),
        'Тип запроса: ' + (type || 'Не указан'),
        'Тематика: ' + (topics.length ? topics.join(', ') : 'Не выбрана'),
        '',
        'Описание:',
        message || 'Не заполнено'
      ];
      var body = lines.join('\n');
      var mailto = 'mailto:a.v.rjakhov@yandex.ru?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

      window.location.href = mailto;
      closeModal();
      form.reset();
    });
  }

  function initBackToTop() {
    var button = document.querySelector('[data-back-to-top]');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'back-to-top';
      button.setAttribute('data-back-to-top', '');
      button.setAttribute('aria-label', 'Вернуться наверх');
      button.innerHTML = '<span aria-hidden="true">↑</span>';
      document.body.appendChild(button);
    }

    function updateVisibility() {
      var scrolled = window.pageYOffset || document.documentElement.scrollTop || 0;
      var threshold = Math.max(240, Math.round(window.innerHeight * 0.35));
      button.classList.toggle('is-visible', scrolled > threshold);
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    updateVisibility();
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
      var isCurrent = link.getAttribute('data-nav-target') === navKey;
      if (isCurrent) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
      link.classList.toggle('active', isCurrent);
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
    initStickyNavFallback();
    initResponsiveNavMenus();
    initContactModal();
    initBackToTop();
  });
})();
