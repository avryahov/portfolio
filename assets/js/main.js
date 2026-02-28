(function () {
  var yearNodes = document.querySelectorAll('[data-year]');
  var year = new Date().getFullYear();

  yearNodes.forEach(function (node) {
    node.textContent = String(year);
  });
})();
