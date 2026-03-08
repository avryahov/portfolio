(function () {
  var toggle = document.querySelector('[data-about-toggle]');
  var details = document.querySelector('[data-about-details]');
  var summary = document.querySelector('[data-about-summary]');
  if (!toggle || !details || !summary) {
    return;
  }

  var labelExpand = 'Развернуть блок Обо мне';
  var labelCollapse = 'Свернуть блок Обо мне';

  function apply(expanded) {
    details.hidden = !expanded;
    summary.hidden = expanded;
    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    toggle.setAttribute('aria-label', expanded ? labelCollapse : labelExpand);
  }

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') !== 'true';
    apply(expanded);
  });

  apply(false);
})();
