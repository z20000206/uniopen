// Set global css variable
(function (document, window, undefined) {
    const setFillHeight = () => {
        // fixed ios css vh bug
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        // detect scrollbar width
        const scrollbar = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty('--scrollbar-width', `${scrollbar}px`);
    }
    window.addEventListener('resize', () => setFillHeight());
    setFillHeight();
})(document, window);

// header - hamburger
$('.l-header__hamburger').click(function () {
    var $hamburger = $(this).find('.o-hamburger');

    if (!$hamburger.hasClass('is-active')) {
        $hamburger.addClass('is-active');
    } else {
        setTimeout(function () {
            $hamburger.removeClass('is-active');
        }, 300);
    }

    $('.c-menu').toggleClass('is-active');
    $('.l-header').toggleClass('is-menuOpen');
    $('body').toggleClass('is-menuOpen');
});

// swiper common setting
const carouselSettings = {
    loop: true,
    fadeEffect: {
        crossFade: true
    },
    pagination: {
        clickable: true
    },
    autoplay: {
        delay: 5000,
        pauseOnMouseEnter: true
    }
};

// AOS
$(window).on('load', function () {
    AOS.init({
        offset: 120,
        delay: 0,
        duration: 700,
        once: true
    });

    $('[data-aos]').each(function () {
        const $el = $(this);
        const elTop = $el.offset().top;
        const elHeight = $el.outerHeight();
        const windowBottom = $(window).scrollTop() + $(window).height();

        if (windowBottom >= elTop + elHeight / 2) {
            $el.addClass('aos-animate');
        }
    });
});



// lottie 動畫
$('[data-lottie]').each(function () {
    lottie.loadAnimation({
        container: this,
        animType: 'svg',
        loop: true,
        autoplay: false,
        path: $(this).data('lottie'),
    }).play();
});

// loading (配合個人化調整，載入延遲800ms)
$(window).on('load', function () {
    setTimeout(() => {
        $('[data-loading]').fadeOut(300, function () {
            $(this).hide();
        });
    }, 800);
});

// hyperlink(延遲700ms)
$(document).on('click', '[data-link]', function (e) {
    e.preventDefault();

    const url = $(this).attr('href');
    const target = $(this).attr('target');

    $('[data-loading]').fadeIn(200);

    setTimeout(function () {
        $('[data-loading]').fadeOut(200, function () {
            if (target === '_blank') {
                window.open(url, '_blank');
            } else {
                window.location.href = url;
            }
        });
    }, 700);
});

// gotop
$(function () {

    $(window).scroll(function () {
        var scroll = $(window).scrollTop();

        if (scroll >= 70) {
            $('.o-gotop').addClass('is-show');

        } else {
            $('.o-gotop').removeClass('is-show');

        }
    });

    $('.o-gotop').click(function () {
        $('html,body').animate({
            scrollTop: $('html').offset().top
        })

        return false;
    });

})