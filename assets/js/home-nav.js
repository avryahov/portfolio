(function () {
  var navLinks = document.querySelectorAll('.anchor-nav a[href^="#"]');
  if (!navLinks.length) {
    return;
  }

  var targets = Array.prototype.map.call(navLinks, function (link) {
    var href = link.getAttribute('href');
    return {
      href: href,
      node: document.querySelector(href)
    };
  }).filter(function (item) {
    return !!item.node;
  });

  function setActiveByHash(hash) {
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === hash);
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      var href = link.getAttribute('href');
      var target = document.querySelector(href);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveByHash(href);
      history.replaceState(null, '', href);
    });
  });

  function onScroll() {
    var scrollY = window.pageYOffset + 140;
    var current = targets.length ? targets[0].href : '#about';

    targets.forEach(function (item) {
      if (scrollY >= item.node.offsetTop) {
        current = item.href;
      }
    });

    setActiveByHash(current);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
