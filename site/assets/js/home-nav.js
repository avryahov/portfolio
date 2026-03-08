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

  var experienceGrid = document.querySelector('.experience-grid');

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function initDesktopWheelHorizontalScroll(track) {
    if (!track) {
      return;
    }

    var desktopViewport = window.matchMedia('(min-width: 768px)');
    if (!desktopViewport.matches) {
      return;
    }

    track.addEventListener('wheel', function (event) {
      if (!desktopViewport.matches) {
        return;
      }

      var maxScrollLeft = track.scrollWidth - track.clientWidth;
      if (maxScrollLeft <= 0) {
        return;
      }

      var dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (dominantDelta === 0) {
        return;
      }

      var nextLeft = clamp(track.scrollLeft + dominantDelta, 0, maxScrollLeft);
      if (nextLeft === track.scrollLeft) {
        return;
      }

      track.scrollLeft = nextLeft;
      event.preventDefault();
    }, { passive: false });
  }

  function initDragScroll(track) {
    if (!track) {
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
      event.preventDefault();
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
    track.addEventListener('dragstart', function (event) {
      event.preventDefault();
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
  initDesktopWheelHorizontalScroll(experienceGrid);
  initDragScroll(document.querySelector('.lifecycle-flow-sync'));
})();
