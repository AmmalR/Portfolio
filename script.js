(() => {
    'use strict';

    const header = document.querySelector('.rounded-header');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const form = document.querySelector('#contactForm');
    const successMessage = document.querySelector('#formSuccess');

    // Recover gracefully if an older cached homepage stylesheet was rejected.
    const sharedStylesheet = [...document.styleSheets].find((sheet) => sheet.href?.includes('/style.css'));
    if (sharedStylesheet && sharedStylesheet.cssRules.length === 0) {
        const fallback = document.createElement('link');
        fallback.rel = 'stylesheet';
        fallback.href = `style.css?refresh=${Date.now()}`;
        document.head.appendChild(fallback);
    }

    // Keep the floating navigation compact while scrolling.
    const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 50);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    // Mobile nav toggle.
    hamburger?.addEventListener('click', () => {
        navLinks?.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    document.querySelectorAll('.nav-links a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinks?.classList.remove('active');
            hamburger?.classList.remove('active');
        });
    });

    // ===================================================================
    // Projects page — category filtering (only runs if the grids exist)
    // ===================================================================
    const projectGrids = {
        'oracle': document.getElementById('oracle-projects'),
        'web': document.getElementById('web-projects'),
        'mobile': document.getElementById('mobile-projects'),
        'database': document.getElementById('database-projects'),
        'wordpress': document.getElementById('wordpress-projects'),
        'uiux': document.getElementById('uiux-projects'),
        'design': document.getElementById('design-gallery')
    };
    const filterButtons = document.querySelectorAll('.filter-btn');
    const noProjectsMsg = document.getElementById('no-projects');

    const animateProjectCards = (container) => {
        if (!container) return;
        const cards = container.querySelectorAll('.project-card, .design-item');
        cards.forEach((card, index) => {
            setTimeout(() => card.classList.add('animate'), index * 80);
        });
    };

    const showCategory = (category) => {
        Object.values(projectGrids).forEach((grid) => {
            if (!grid) return;
            grid.classList.remove('active');
            grid.style.display = 'none';
        });

        const target = projectGrids[category];
        if (target) {
            target.style.display = 'grid';
            requestAnimationFrame(() => {
                target.classList.add('active');
                animateProjectCards(target);
            });
        }

        if (noProjectsMsg) {
            const hasItems = target?.querySelector('.project-card, .design-item');
            noProjectsMsg.style.display = hasItems ? 'none' : 'block';
        }
    };

    if (filterButtons.length) {
        filterButtons.forEach((button) => {
            button.addEventListener('click', () => {
                filterButtons.forEach((btn) => btn.classList.remove('active'));
                button.classList.add('active');
                showCategory(button.getAttribute('data-filter'));
            });
        });

        const initialCategory = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'oracle';
        showCategory(initialCategory);
    }

    // Reveal sections as they enter the viewport — one pass, no repeat.
    const revealTargets = document.querySelectorAll('.reveal');
    if (revealTargets.length) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            revealTargets.forEach((el) => el.classList.add('is-visible'));
        } else {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
            );
            revealTargets.forEach((el) => observer.observe(el));
        }
    }
    // ===================================================================
    // Sticky stacking cards — services, work experience, projects.
    // Each group stacks independently (no shared z-index/top math).
    // ===================================================================
    const initStackGroup = (selector) => {
        const wraps = [...document.querySelectorAll(selector)];
        if (wraps.length < 2) return null;

        const update = () => {
            for (let i = 0; i < wraps.length - 1; i++) {
                const current = wraps[i];
                const next = wraps[i + 1];
                const nextTop = next.getBoundingClientRect().top;
                const nextStickyTop = parseFloat(getComputedStyle(next).top) || 0;
                current.classList.toggle('is-stacked', nextTop <= nextStickyTop + 1);
            }
        };
        update();
        return update;
    };

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const stackUpdaters = [
            initStackGroup('.service-card-wrap'),
            initStackGroup('.experience-wrap'),
            initStackGroup('.project-wrap')
        ].filter(Boolean);

        if (stackUpdaters.length) {
            let stackTicking = false;
            const onStackScroll = () => {
                if (stackTicking) return;
                stackTicking = true;
                requestAnimationFrame(() => {
                    stackUpdaters.forEach((update) => update());
                    stackTicking = false;
                });
            };
            window.addEventListener('scroll', onStackScroll, { passive: true });
            window.addEventListener('resize', onStackScroll);
        }
    }

    // ===================================================================
    // Contact form -> pre-filled WhatsApp message
    // ===================================================================
    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const name = form.querySelector('#name')?.value.trim() || '';
        const email = form.querySelector('#email')?.value.trim() || '';
        const subject = form.querySelector('#subject')?.value.trim() || '';
        const message = form.querySelector('#message')?.value.trim() || '';

        const whatsappNumber = '923274968541'; // +92 327 4968541, no + or spaces
        const text =
            `New message from Ammal's Portfolio\n\n` +
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Subject: ${subject}\n\n` +
            `${message}`;

        const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

        if (successMessage) {
            successMessage.textContent = 'Opening WhatsApp with your message ready to send…';
            successMessage.classList.add('show');
        }

        window.open(waUrl, '_blank', 'noopener,noreferrer');
        form.reset();
    });

    // Make image tiles keyboard-friendly when they are interactive.
    document.querySelectorAll('.design-item').forEach((item) => {
        item.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') item.click();
        });
    });
})();