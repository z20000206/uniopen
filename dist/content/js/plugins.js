// Avoid `console` errors in browsers that lack a console.
(function () {
  var method;
  var noop = function () {};
  var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'];
  var length = methods.length;
  var console = window.console = window.console || {};
  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if (!console[method]) {
      console[method] = noop;
    }
  }
})();

// Place any jQuery/helper plugins in here.
(function (targetWidth) {
  var deviceWidth = screen.width;
  var ratio = deviceWidth / targetWidth;
  var viewport = document.querySelector('meta[name="viewport"]');
  if (ratio < 1) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=' + ratio + ', minimum-scale=' + ratio + ', maximum-scale=' + ratio + ', user-scalable=yes');
  }
})(360);

// popup
(function ($, undefined) {
  'use strict';

  $.extend($.magnificPopup.defaults, {
    fixedBgPos: true,
    removalDelay: 0,
    showCloseBtn: false
  });
  let mfpInited = false;
  function initMagnificDelegated() {
    if (mfpInited) return;
    mfpInited = true;
    $(document).magnificPopup({
      type: 'inline',
      delegate: '[data-mfp-src]',
      midClick: true,
      callbacks: {
        beforeOpen: function (e) {
          const ev = this.st.el && this.st.el[0];
          if (ev && ev.tagName === 'A') {
            history.replaceState(null, '', location.pathname + location.search);
          }
        },
        open: function () {
          $('body').addClass('is-popupOpen');
          $(document).off('click.mfpClose').on('click.mfpClose', '[data-mfp-close]', function (e) {
            e.preventDefault();
            $.magnificPopup.close();
          });
          if (this.st.el && this.st.el.is('[data-mfp-alert]')) {
            $('.mfp-bg').addClass('mfp-bg--alert');
          }
        },
        close: function () {
          $(document).off('click.mfpClose');
          $('.mfp-bg').removeClass('mfp-bg--alert');
          $('body').removeClass('is-popupOpen');
        }
      }
    });
  }
  $(function () {
    initMagnificDelegated();
  });
})(jQuery);

// 錨點控制
(function ($) {
  'use strict';

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  const HASH_RE = /^#section=(.+)$/;
  const getHashKey = () => {
    const m = location.hash.match(HASH_RE);
    return m ? decodeURIComponent(m[1]) : '';
  };
  const setHashKey = key => {
    history.pushState(null, '', '#section=' + encodeURIComponent(key));
  };
  const getHeaderH = () => $('.l-header:visible').outerHeight() || 88;
  const findSectionEl = key => {
    return $('[data-section="' + key + '"], #' + CSS.escape(key)).first();
  };
  const closeMenuIfAny = () => {
    $('.o-hamburger, .c-menu').removeClass('is-active');
    $('.l-header').removeClass('is-menuOpen');
  };
  const getOffset = function (triggerEl, targetEl) {
    let extra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    function read($el, name) {
      if (!$el || !$el.length) return null;
      const raw = $el.attr(name);
      if (raw === undefined || raw === null || raw === '') return null;
      const n = Number(raw);
      return Number.isNaN(n) ? null : n;
    }
    const $trigger = triggerEl ? $(triggerEl).closest('[data-offset]') : $();
    const fromTrigger = read($trigger, 'data-offset');
    if (fromTrigger != null) return fromTrigger;
    const fromTarget = read($(targetEl), 'data-offset');
    if (fromTarget != null) return fromTarget;
    const fromBody = read($('body'), 'data-scroll-offset');
    if (fromBody != null) return fromBody;
    return typeof extra === 'number' ? extra : 0;
  };
  const scrollToSection = function (key) {
    let extra = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    let triggerEl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    let duration = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 500;
    const $t = findSectionEl(key);
    if (!$t.length) return false;
    const offset = getOffset(triggerEl ? $(triggerEl) : null, $t, extra);
    const top = Math.max(0, $t.offset().top - getHeaderH() + offset);
    $('html, body').stop(true).animate({
      scrollTop: top
    }, duration);
    return true;
  };
  const maybeScrollFromHash = function () {
    let extra = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    const key = getHashKey();
    if (!key) return;
    requestAnimationFrame(() => scrollToSection(key, extra));
  };
  $(document).on('click', '[data-title]', function (e) {
    const $el = $(this);
    const key = $el.attr('data-title');
    const page = $el.attr('data-page');
    const base = page || window.location.pathname;
    const url = base + '#section=' + encodeURIComponent(key);
    const same = new URL(base, location.origin).pathname === location.pathname;
    const wantBlank = $el.attr('target') === '_blank' || $el.attr('data-target') === '_blank';
    const byModifier = e.ctrlKey || e.metaKey || e.which === 2;
    const openInNewTab = wantBlank || byModifier;
    closeMenuIfAny();
    if (openInNewTab) {
      e.preventDefault();
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (same) {
      e.preventDefault();
      setHashKey(key);
      scrollToSection(key, 0, this);
    } else {
      location.assign(url);
    }
  });
  $(function () {
    maybeScrollFromHash();
  });
  $(window).on('hashchange popstate', function () {
    maybeScrollFromHash();
  });
})(jQuery);