// Check if file exist/available
function checkFileAvailable(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('HEAD', url, false);
  xhr.send();

  if (xhr.status == "404") {
    return false;
  } else {
    return true;
  }
}


// Area location
var locations = ['downtown', 'airport', 'kailua', 'ewa', 'wahiawa', 'manoa', 'kalihi', 'kahuku', 'all-of-oahu'];

// get current url location
function urlLocation() {
  var urlHash = window.location.hash;
  var normalizeHash = urlHash
      .replace(/#/g, '')
      .replace(/\s/g, '-')
      .toLowerCase();

  return normalizeHash;
}

// check if url hash matches one of the area locations
function isValidUrlHash() {
  if (locations.indexOf(urlLocation()) > -1) {
    return true;
  }
  return false;
}


$(function(){
  timeNow('.time-now');
  setInterval(function () {
    timeNow('.time-now');
  }, 30000);

  // If url has location hash
  if (isValidUrlHash()) {
    $('.location-name').html(urlLocation());
  }

  // Orientation landscape
  if (landscape()) {
    var windowHeight = $(window).height(),
        headerHeight = $('.gauge').siblings("h2").outerHeight();

    $('.gauge').height(windowHeight - headerHeight);
    $('.using-right-now').height((windowHeight / 2) - headerHeight);
    $('.usage-section').children('.right').height(windowHeight);
  }

  if(mobilePortrait()) {
    $('body').addClass('mobile-portrait');
  }

  $(window).resize(function(){
    $('.chart-slide').children().remove();
    waitForFinalEvent(function(){
      pulseBeat.init();

      var windowHeight = $(window).height(),
        headerHeight = $('.gauge').siblings("h2").outerHeight();

      if (landscape()) {
        $('.gauge').height(windowHeight - headerHeight);
        $('.using-right-now').height((windowHeight / 2) - headerHeight);
        $('.usage-section').children('.right').height(windowHeight);
      } else {
        $('.gauge').attr('style', '');
        $('.using-right-now').attr('style', '');
        $('.usage-section').children('.right').attr('style', '');
      }

      if(mobilePortrait()) {
        $('body').addClass('mobile-portrait');
      } else {
        $('body').removeClass('mobile-portrait');
      }
    }, 500, 'windowResize');
  });

  inlineSvgImg();
});

function numberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Check for null
function hasNull(target) {
  for (var i in target) {
    if (target[i] == null){
      return true;
    }
  }
  return false;
}

function landscape() {
  if (window.innerWidth > window.innerHeight && window.innerWidth > 769) {
    return true;
  }
  return false;
}

function mobilePortrait() {
  if (navigator.userAgent.match(/iPhone/i) !== null && window.screen.height == (960 / 2)){
    return false;
  } else if ( /webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && !landscape()) {
    return true;
  } else if ( /Android/i.test(navigator.userAgent) && /Mobile/i.test(navigator.userAgent) && !landscape()) {
    return true;
  } else if ( /Mobile/i.test(navigator.userAgent) && !landscape()) {
    return true;
  } else if ( /Android/i.test(navigator.userAgent) && !landscape()) {
    return true;
  }
  return false;
}

var waitForFinalEvent = (function () {
  var timers = {};
  return function (callback, ms, uniqueId) {
    if (!uniqueId) {
      uniqueId = "Don't call this twice without a uniqueId";
    }
    if (timers[uniqueId]) {
      clearTimeout (timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
})();

function inlineSvgImg() {
  // Replace SVG images with inline SVG
  $('img.isvg').each(function(){
    var $img = $(this),
      imgID = $img.attr('id'),
      imgClass = $img.attr('class'),
      imgURL = $img.attr('src');

    $.get(imgURL, function(data) {
      var $svg = $(data).find('svg');

      if(typeof imgID !== 'undefined') {
        $svg = $svg.attr('id', imgID);
      }

      if(typeof imgClass !== 'undefined') {
        $svg = $svg.attr('class', imgClass+' replaced-svg');
      }

      $svg = $svg.removeAttr('xmlns:a');
      $img.replaceWith($svg);

    }, 'xml');
  });
}

// Set time now
function timeNow(element) {
  var date = new Date(),
  formatDate = formatAMPM(date);
  $(element).html(" " + formatDate);
}

// Format date to minutes with AM/PM
function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ampm;
  return strTime;
}
