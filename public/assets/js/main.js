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

  const nav = $('.nav-list');

  nav.on('click', 'li', function (e) {
    $(this).addClass('active');
    $(this).siblings().removeClass('active');
  });

  const route = window.location.pathname.substr(1);
  switch (window.location.pathname) {
    case '/': {
      $('.nav-list li.home').addClass('active');
      break;
    }
    case '/aboutme': {
      $('.nav-list li.' + route).addClass('active');
      break;
    }
    case '/contacts': {
      $('.nav-list li.' + route).addClass('active');
      break;
    }
    case '/dashboard': {
      $('.nav-list li.' + route).addClass('active');
      break;
    }
    case '/categories': {
      $('.nav-list li.' + route).addClass('active');
      break;
    }
  }

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
  });

  $('.popup-gallery').magnificPopup({
    delegate: 'a',
    type: 'image',
    tLoading: 'Loading image #%curr%...',
    mainClass: 'mfp-img-mobile',
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0,1] // Will preload 0 - before current, and 1 after the current image
    },
    image: {
      tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
      titleSrc: function(item) {
        return item.el.attr('title') + '<small>by Andrei Kananovich</small>';
      }
    }
  });
});
