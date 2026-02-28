(function () {
  var navLinks = document.querySelectorAll('.anchor-nav a[href^="#"]');
  if (!navLinks.length) {
    return;
  }

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

  var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));

  function onScroll() {
    var scrollY = window.pageYOffset + 140;
    var current = '#about';

    sections.forEach(function (section) {
      if (scrollY >= section.offsetTop) {
        current = '#' + section.id;
      }
    });

    setActiveByHash(current);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
