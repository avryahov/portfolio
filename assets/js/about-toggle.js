(function () {
  var root = document.querySelector('.about-structured');
  if (!root) {
    return;
  }

  var buttons = root.querySelectorAll('[data-about-view]');
  var panels = root.querySelectorAll('[data-about-panel]');

  if (!buttons.length || !panels.length) {
    return;
  }

  var storageKey = 'about-view-mode';

  function apply(mode, persist) {
    var targetMode = mode === 'compact' ? 'compact' : 'expanded';

    buttons.forEach(function (btn) {
      var active = btn.getAttribute('data-about-view') === targetMode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panels.forEach(function (panel) {
      var visible = panel.getAttribute('data-about-panel') === targetMode;
      panel.classList.toggle('is-hidden', !visible);
    });

    if (persist) {
      localStorage.setItem(storageKey, targetMode);
    }
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      apply(btn.getAttribute('data-about-view'), true);
    });
  });

  apply(localStorage.getItem(storageKey) || 'expanded', false);
})();
