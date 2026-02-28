(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) {
    return;
  }

  document.documentElement.classList.add('reveal-enabled');

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (item) {
      item.classList.add('is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  items.forEach(function (item) {
    observer.observe(item);
  });
})();
