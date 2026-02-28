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

  var experienceWrap = document.querySelector('.experience-scroll-wrap');
  var experienceGrid = experienceWrap ? experienceWrap.querySelector('.experience-grid') : null;

  function updateExperienceHints() {
    if (!experienceWrap || !experienceGrid) {
      return;
    }

    var maxScrollLeft = Math.max(0, experienceGrid.scrollWidth - experienceGrid.clientWidth);
    var scrollLeft = experienceGrid.scrollLeft;
    var edgeTolerance = 2;

    experienceWrap.classList.toggle('is-at-start', scrollLeft <= edgeTolerance);
    experienceWrap.classList.toggle('is-at-end', scrollLeft >= (maxScrollLeft - edgeTolerance));
  }

  if (experienceWrap && experienceGrid) {
    experienceGrid.addEventListener('scroll', updateExperienceHints, { passive: true });
    window.addEventListener('resize', updateExperienceHints);
    window.requestAnimationFrame(updateExperienceHints);
  }
})();
