"use strict";
var swiper = new Swiper('.swiper-container', {
  pagination: '.swiper-pagination',
  paginationClickable: true,
  nextButton: '.swiper-button-next',
  prevButton: '.swiper-button-prev',
  spaceBetween: 30
});

$('a[href*="#"]:not([href="#"])').click(function() {
  if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
    var target = $(this.hash);
    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
    if (target.length) {
      $('html, body').animate({
        scrollTop: target.offset().top
      }, 1000);
      return false;
    }
  }
});

(function () {
  $(document).ready(function () {
    $('[data-toggle-en]').on('click', function (event) {
      event.preventDefault();
      $('[data-lang="it"]').addClass('hidden');
      $('[data-lang="en"]').removeClass('hidden');
    });

    $('[data-toggle-it]').on('click', function (event) {
      event.preventDefault();
      $('[data-lang="en"]').addClass('hidden');
      $('[data-lang="it"]').removeClass('hidden');
    });
  })
})();
