"use strict";
$('a[href*="#"]:not([href="#"])').click(function() {
  if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
    let target = $(this.hash);
    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
    if (target.length) {
      $('html, body').animate({
        scrollTop: target.offset().top
      }, 1000);
      return false;
    }
  }
});

$(function () {
  $.fn.extend({
    animateCss: function (animationName) {
      const animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
      this.addClass('animated ' + animationName).one(animationEnd, function() {
        $(this).removeClass('animated ' + animationName);
      });
      return this;
    }
  });

  const $grid = $('.albums-list');
  $grid.isotope({
    itemSelector: '.album-item',
    layoutMode: 'fitRows'
  });

  $grid.isotope({filter: '*'});
  const $filterList = $('.filters-list');

  $filterList.on( 'click', 'li', function() {
    $(this).addClass('active');
    $(this).siblings().removeClass('active');
  });

  $filterList.on( 'click', 'button', function() {
    const filterValue = $(this).attr('data-filter');
    $grid.isotope({ filter: filterValue });
  });

  $('.album-item').hover(function () {
    $('.album-info p').animateCss('fadeInDown');
  })
});
