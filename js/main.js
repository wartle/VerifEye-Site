// --- Mobile navigation toggle ---
const hamburger = document.querySelector('.header__hamburger');
const nav = document.querySelector('.header__nav');

if (hamburger && nav) {
    const setOpen = (open) => {
        hamburger.classList.toggle('active', open);
        nav.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    hamburger.addEventListener('click', () => {
        const willOpen = !nav.classList.contains('open');
        setOpen(willOpen);
        if (willOpen) nav.querySelector('a')?.focus();
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header__inner') && nav.classList.contains('open')) {
            setOpen(false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
            setOpen(false);
            hamburger.focus();
        }
    });
}

// --- Smooth scroll for anchor links (offset for sticky header) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.pageYOffset - 76;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// --- Header shadow on scroll ---
const header = document.querySelector('.header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Scroll reveal animation ---
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length > 0) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
        fadeEls.forEach(el => el.classList.add('visible'));
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        fadeEls.forEach(el => observer.observe(el));
    }
}

// --- Image skeleton: fade in when decoded ---
document.querySelectorAll('.media-skeleton__img').forEach(img => {
    const wrap = img.closest('.media-skeleton');
    const markLoaded = () => wrap && wrap.classList.add('is-loaded');
    if (img.complete && img.naturalWidth > 0) {
        markLoaded();
    } else {
        img.addEventListener('load', markLoaded, { once: true });
        img.addEventListener('error', markLoaded, { once: true });
    }
});

// --- GPS coordinate "lock" count-up ---
const coordEls = document.querySelectorAll('.geo-num');
if (coordEls.length > 0 && !reduceMotion) {
    const run = (el) => {
        const to = parseFloat(el.dataset.to);
        const dec = parseInt(el.dataset.dec || '4', 10);
        if (Number.isNaN(to)) return;
        const duration = 1100;
        let start = null;
        const step = (ts) => {
            if (start === null) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = (to * eased).toFixed(dec);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = to.toFixed(dec);
        };
        requestAnimationFrame(step);
    };
    // brief beat so the capture settles before locking the read-out
    coordEls.forEach((el, i) => setTimeout(() => run(el), 250 + i * 140));
}
