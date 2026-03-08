(function () {
  var storageKey = 'portfolio-theme-v2';
  var legacyStorageKey = 'portfolio-theme';

  function setTheme(theme, persist) {
    var root = document.documentElement;
    root.classList.add('theme-switching');
    root.setAttribute('data-theme', theme);
    if (persist) {
      localStorage.setItem(storageKey, theme);
    }
    syncThemeToggle(theme);

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        root.classList.remove('theme-switching');
      });
    });
  }

  function syncThemeToggle(theme) {
    var toggles = document.querySelectorAll('[data-theme-toggle]');
    if (!toggles.length) {
      return;
    }

    toggles.forEach(function (toggle) {
      var icon = toggle.querySelector('[data-theme-icon]');
      if (!icon) {
        return;
      }

      if (theme === 'dark') {
        icon.textContent = '☀';
        toggle.setAttribute('aria-label', 'Переключить на светлую тему');
        toggle.setAttribute('title', 'Переключить на светлую тему');
      } else {
        icon.textContent = '☾';
        toggle.setAttribute('aria-label', 'Переключить на тёмную тему');
        toggle.setAttribute('title', 'Переключить на тёмную тему');
      }
    });
  }

  function initTheme() {
    var legacyValue = localStorage.getItem(legacyStorageKey);
    if (legacyValue !== null && localStorage.getItem(storageKey) === null) {
      localStorage.removeItem(legacyStorageKey);
    }

    var saved = localStorage.getItem(storageKey);
    var theme = saved === 'light' ? 'light' : 'dark';
    setTheme(theme, false);
  }

  function initThemeToggle() {
    var toggles = document.querySelectorAll('[data-theme-toggle]');
    if (!toggles.length) {
      return;
    }

    toggles.forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme') || 'dark';
        var next = current === 'dark' ? 'light' : 'dark';
        setTheme(next, true);
      });
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

  function detectBrowserInfo(userAgent) {
    var matchers = [
      { name: 'samsung-internet', regex: /SamsungBrowser\/([\d.]+)/i },
      { name: 'yandex-browser', regex: /YaBrowser\/([\d.]+)/i },
      { name: 'edge', regex: /EdgA?\/([\d.]+)/i },
      { name: 'opera', regex: /(?:OPR|OPiOS)\/([\d.]+)/i },
      { name: 'chrome', regex: /(?:CriOS|Chrome)\/([\d.]+)/i },
      { name: 'firefox', regex: /(?:FxiOS|Firefox)\/([\d.]+)/i },
      { name: 'safari', regex: /Version\/([\d.]+).*Safari/i }
    ];

    for (var i = 0; i < matchers.length; i += 1) {
      var match = userAgent.match(matchers[i].regex);
      if (match) {
        return {
          family: matchers[i].name,
          version: match[1] || ''
        };
      }
    }

    return {
      family: 'unknown',
      version: ''
    };
  }

  function evaluateBrowserContext() {
    var nav = window.navigator || {};
    var userAgent = nav.userAgent || '';
    var userAgentData = nav.userAgentData || null;
    var maxTouchPoints = Number(nav.maxTouchPoints || 0);
    var screenWidth = window.screen && window.screen.width ? window.screen.width : window.innerWidth;
    var screenHeight = window.screen && window.screen.height ? window.screen.height : window.innerHeight;
    var screenShortestSide = Math.min(screenWidth || 0, screenHeight || 0);
    var coarsePointer = window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(any-pointer: coarse)').matches;
    var noHover = window.matchMedia('(hover: none)').matches || window.matchMedia('(any-hover: none)').matches;
    var touchDevice = coarsePointer || noHover || maxTouchPoints > 0 || 'ontouchstart' in window;
    var mobileAgent = /Android.+Mobile|iPhone|iPod|Windows Phone|Opera Mini|IEMobile|BlackBerry|webOS|Mobile Safari/i.test(userAgent);
    var tabletAgent = /iPad|Tablet|Silk/i.test(userAgent) || ((nav.platform || '') === 'MacIntel' && maxTouchPoints > 1);
    var uaDataMobile = !!(userAgentData && userAgentData.mobile);
    var phoneLikeTouchDevice = touchDevice && screenShortestSide > 0 && screenShortestSide <= 540;
    var browser = detectBrowserInfo(userAgent);
    var deviceClass = mobileAgent || uaDataMobile ? 'phone' : (tabletAgent ? 'tablet' : 'desktop');
    var mobileUi = mobileAgent || uaDataMobile || phoneLikeTouchDevice;

    return {
      browserFamily: browser.family,
      browserVersion: browser.version,
      deviceClass: deviceClass,
      mobileUi: mobileUi
    };
  }

  function applyBrowserContext(context) {
    var root = document.documentElement;
    root.setAttribute('data-mobile-ui', context.mobileUi ? 'true' : 'false');
    root.setAttribute('data-device-class', context.deviceClass);
    root.setAttribute('data-browser-family', context.browserFamily);
    if (context.browserVersion) {
      root.setAttribute('data-browser-version', context.browserVersion);
    } else {
      root.removeAttribute('data-browser-version');
    }
  }

  var browserContext = null;

  function refreshBrowserContext() {
    browserContext = evaluateBrowserContext();
    applyBrowserContext(browserContext);
    return browserContext;
  }

  function isMobileUi() {
    if (!browserContext) {
      refreshBrowserContext();
    }
    return !!browserContext.mobileUi;
  }

  function initResponsiveNavMenus() {
    var strips = document.querySelectorAll('.anchor-strip');
    if (!strips.length) {
      return;
    }

    strips.forEach(function (strip) {
      var toggle = strip.querySelector('[data-nav-menu-toggle]');
      var nav = strip.querySelector('.anchor-nav');
      var navScroll = strip.querySelector('[data-nav-scroll]');
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
        if (isMobileUi()) {
          return;
        }
        var opened = nav.classList.contains('is-open');
        if (opened) {
          closeMenu(true);
        } else {
          openMenu();
        }
      });

      (navScroll || nav).querySelectorAll('a').forEach(function (link) {
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
        if (isMobileUi()) {
          toggle.setAttribute('aria-hidden', 'true');
          toggle.setAttribute('tabindex', '-1');
        } else {
          toggle.removeAttribute('aria-hidden');
          toggle.removeAttribute('tabindex');
        }
      });

      closeMenu(false);
      if (isMobileUi()) {
        toggle.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('tabindex', '-1');
      }
    });
  }

  function initNavSearchAccordion() {
    var strips = document.querySelectorAll('.anchor-strip');
    if (!strips.length) {
      return;
    }

    strips.forEach(function (strip) {
      var nav = strip.querySelector('.anchor-nav');
      var navScroll = strip.querySelector('[data-nav-scroll]');
      var controls = strip.querySelector('.anchor-nav-controls');
      var search = strip.querySelector('[data-nav-search]');
      var toggle = strip.querySelector('[data-nav-search-toggle]');
      var input = search ? search.querySelector('input[type="search"]') : null;
      var track = navScroll || nav;
      if (!nav || !track || !search || !toggle || !input) {
        return;
      }

      var closeTimer = 0;

      function setToggleState(opened) {
        toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        toggle.setAttribute('aria-label', opened ? 'Свернуть поиск по сайту' : 'Открыть поиск по сайту');
      }

      function closeSearch() {
        search.classList.remove('is-expanded');
        setToggleState(false);
      }

      function shouldCollapseSearch() {
        var navLinks = track.querySelectorAll('a');
        var overflowed = track.scrollWidth > track.clientWidth + 1;
        if (!navLinks.length) {
          return overflowed;
        }

        var edgeLink = navLinks[navLinks.length - 1];
        var linkRect = edgeLink.getBoundingClientRect();
        var controlsRect = controls ? controls.getBoundingClientRect() : search.getBoundingClientRect();
        return linkRect.right >= controlsRect.left - 8 || overflowed;
      }

      function scrollNavToEnd() {
        track.scrollTo({ left: track.scrollWidth, behavior: 'auto' });
      }

      function updateSearchLayout() {
        var compactViewport = window.innerWidth <= 1400;

        search.classList.remove('is-collapsed');
        closeSearch();

        if (compactViewport || shouldCollapseSearch()) {
          search.classList.add('is-collapsed');
          setToggleState(false);
        } else {
          setToggleState(true);
        }
      }

      toggle.addEventListener('click', function (event) {
        event.preventDefault();

        if (!search.classList.contains('is-collapsed')) {
          input.focus();
          return;
        }

        var opened = search.classList.toggle('is-expanded');
        setToggleState(opened);

        if (opened) {
          scrollNavToEnd();
          window.clearTimeout(closeTimer);
          closeTimer = window.setTimeout(function () {
            input.focus();
          }, 120);
        }
      });

      input.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          closeSearch();
          toggle.focus();
        }
      });

      document.addEventListener('click', function (event) {
        if (!search.classList.contains('is-expanded')) {
          return;
        }
        if (search.contains(event.target)) {
          return;
        }
        closeSearch();
      });

      window.addEventListener('resize', updateSearchLayout);
      updateSearchLayout();
    });
  }

  function initNavDragScroll() {
    var tracks = document.querySelectorAll('[data-nav-scroll]');
    if (!tracks.length) {
      return;
    }

    var finePointer = window.matchMedia('(pointer: fine)');
    if (!finePointer.matches) {
      return;
    }

    tracks.forEach(function (track) {
      var pressed = false;
      var dragging = false;
      var startX = 0;
      var startLeft = 0;
      var suppressClick = false;

      function startDragMode() {
        if (dragging) {
          return;
        }
        dragging = true;
        track.classList.add('is-dragging');
        document.body.classList.add('nav-dragging');
      }

      function stopDragMode() {
        if (!dragging) {
          return;
        }
        dragging = false;
        track.classList.remove('is-dragging');
        document.body.classList.remove('nav-dragging');
      }

      function stopDrag() {
        if (dragging) {
          suppressClick = true;
          window.setTimeout(function () {
            suppressClick = false;
          }, 0);
        }
        pressed = false;
        document.body.classList.remove('nav-drag-armed');
        stopDragMode();
      }

      track.addEventListener('mousedown', function (event) {
        if (event.button !== 0) {
          return;
        }

        if (event.target.closest('button, input, textarea, select')) {
          return;
        }

        pressed = true;
        document.body.classList.add('nav-drag-armed');
        startX = event.pageX;
        startLeft = track.scrollLeft;
      });

      window.addEventListener('mousemove', function (event) {
        if (!pressed) {
          return;
        }

        var delta = event.pageX - startX;
        if (!dragging && Math.abs(delta) > 4) {
          startDragMode();
        }

        if (!dragging) {
          return;
        }

        track.scrollLeft = startLeft - delta;
        event.preventDefault();
      });

      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('blur', stopDrag);
      track.addEventListener('mouseleave', stopDrag);
      track.addEventListener('dragstart', function (event) {
        if (dragging) {
          event.preventDefault();
        }
      });

      track.addEventListener('click', function (event) {
        if (!suppressClick) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      }, true);
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

      var summary = [
        'Имя: ' + (name || 'Не указано'),
        'Контакт: ' + (contact || 'Не указан'),
        'Тип запроса: ' + (type || 'Не указан'),
        'Тематика: ' + (topics.length ? topics.join(', ') : 'Не выбрана'),
        'Описание: ' + (message || 'Не заполнено')
      ].join(' | ');
      var vkLink = 'https://vk.com/itpuh';
      window.open(vkLink, '_blank', 'noopener,noreferrer');
      console.info('Заявка с формы:', summary);
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
    function placeButton() {
      var controls = document.querySelector('.anchor-nav-controls');
      if (isMobileUi() && controls) {
        if (button.parentElement !== controls) {
          controls.appendChild(button);
        }
        button.classList.add('is-in-mobile-nav');
      } else {
        if (button.parentElement !== document.body) {
          document.body.appendChild(button);
        }
        button.classList.remove('is-in-mobile-nav');
      }
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
    window.addEventListener('resize', function () {
      placeButton();
      updateVisibility();
    });
    placeButton();
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
    var componentVersion = '20260309-221';
    var url = root + '/components/' + componentPath + '?v=' + componentVersion;

    return fetch(url, { cache: 'no-store' })
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

  function detachPageNavStripFromHeaderHost() {
    var headerHost = document.querySelector('[data-component="header"]');
    if (!headerHost) {
      return;
    }

    var pageNavStrip = headerHost.querySelector('.page-nav-strip');
    if (!pageNavStrip || pageNavStrip.getAttribute('data-detached') === 'true') {
      return;
    }

    headerHost.insertAdjacentElement('afterend', pageNavStrip);
    pageNavStrip.setAttribute('data-detached', 'true');
  }

  initTheme();
  refreshBrowserContext();
  window.addEventListener('resize', refreshBrowserContext, { passive: true });
  window.addEventListener('orientationchange', refreshBrowserContext, { passive: true });

  Promise.all([
    loadComponent('header', 'header.html'),
    loadComponent('footer', 'footer.html')
  ]).then(function () {
    detachPageNavStripFromHeaderHost();
    syncThemeToggle(document.documentElement.getAttribute('data-theme') || 'light');
    markCurrentNav();
    initThemeToggle();
    applyYear();
    initStickyNavFallback();
    initResponsiveNavMenus();
    initNavSearchAccordion();
    initNavDragScroll();
    initContactModal();
    initBackToTop();
  });
})();
