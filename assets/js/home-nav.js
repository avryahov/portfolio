(function () {
  var navLinks = document.querySelectorAll('.anchor-nav a[href^="#"]');
  if (navLinks.length) {
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
  }

  var experienceWrap = document.querySelector('.experience-scroll-wrap');
  var experienceGrid = experienceWrap ? experienceWrap.querySelector('.experience-grid') : null;
  var prevButton = experienceWrap ? experienceWrap.querySelector('[data-exp-prev]') : null;
  var nextButton = experienceWrap ? experienceWrap.querySelector('[data-exp-next]') : null;

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
    function getStepSize() {
      var firstCard = experienceGrid.querySelector('.exp-card');
      if (!firstCard) {
        return Math.max(280, experienceGrid.clientWidth * 0.7);
      }
      return firstCard.getBoundingClientRect().width + 20;
    }

    function scrollByStep(direction) {
      var target = experienceGrid.scrollLeft + (getStepSize() * direction);
      experienceGrid.scrollLeft = target;
    }

    if (prevButton && nextButton) {
      prevButton.addEventListener('click', function () {
        scrollByStep(-1);
        updateExperienceHints();
      });

      nextButton.addEventListener('click', function () {
        scrollByStep(1);
        updateExperienceHints();
      });
    }

    experienceGrid.addEventListener('scroll', updateExperienceHints, { passive: true });
    window.addEventListener('resize', updateExperienceHints);
    window.requestAnimationFrame(updateExperienceHints);
  }
})();
