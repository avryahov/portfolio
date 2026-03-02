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

  function initDragScroll(track) {
    if (!track || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

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
      track.classList.add('is-dragging-track');
      document.body.classList.add('drag-scroll-armed');
    }

    function stopDragMode() {
      if (!dragging) {
        return;
      }
      dragging = false;
      track.classList.remove('is-dragging-track');
      document.body.classList.remove('drag-scroll-armed');
    }

    function stopDrag() {
      if (dragging) {
        suppressClick = true;
        window.setTimeout(function () {
          suppressClick = false;
        }, 0);
      }

      pressed = false;
      document.body.classList.remove('drag-scroll-armed');
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
      document.body.classList.add('drag-scroll-armed');
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
  }

  initDragScroll(experienceGrid);
  initDragScroll(document.querySelector('.lifecycle-flow-sync'));
})();
