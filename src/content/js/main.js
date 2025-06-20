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
    $('.o-hamburger').toggleClass('is-active')
    $('.c-menu').toggleClass('is-active')
    $('.l-header').toggleClass('is-menuOpen')
})

$('[data-burger-close]').click(function () {
    $('.c-menu').toggleClass('is-active')
    $('.l-header').toggleClass('is-menuOpen')
    $('.o-hamburger').toggleClass('is-active')
})

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

// loading
$(window).on('load', function () {
    $('[data-loading]').fadeOut(300, function () {
        $(this).remove();
    });
});