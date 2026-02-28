(function () {
  var body = document.body;
  if (!body || !body.classList.contains('home-body')) {
    return;
  }

  var buttons = document.querySelectorAll('[data-hero-style]');
  if (!buttons.length) {
    return;
  }

  var storageKey = 'home-hero-style';

  function normalizeStyle(value) {
    var num = Number(value);
    if (!Number.isInteger(num) || num < 1 || num > 10) {
      return 1;
    }
    return num;
  }

  function applyStyle(value, persist) {
    var styleNum = normalizeStyle(value);

    for (var i = 1; i <= 10; i += 1) {
      body.classList.remove('home-style-' + i);
    }
    body.classList.add('home-style-' + styleNum);

    buttons.forEach(function (btn) {
      var current = Number(btn.getAttribute('data-hero-style'));
      btn.classList.toggle('is-active', current === styleNum);
      btn.setAttribute('aria-selected', current === styleNum ? 'true' : 'false');
    });

    if (persist) {
      localStorage.setItem(storageKey, String(styleNum));
    }
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyStyle(btn.getAttribute('data-hero-style'), true);
    });
  });

  var savedStyle = localStorage.getItem(storageKey);
  applyStyle(savedStyle || 1, false);
})();
