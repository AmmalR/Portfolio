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

    // Add accessible labels and a small submit confirmation to the contact form.
    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        if (successMessage) {
            successMessage.textContent = 'Thanks! Your message is ready to send.';
            successMessage.classList.add('show');
        }
        form.reset();
    });

    // Project filter buttons (projects.html) — toggle grids by data-filter.
    const filterButtons = document.querySelectorAll('.filter-btn');
    const filterableGrids = document.querySelectorAll('.projects-grid, .design-gallery');
    const noProjects = document.querySelector('#no-projects');
    const getTargetId = (filter) => {
        if (filter === 'design') return 'design-gallery';
        if (filter === 'all') return null;
        return `${filter}-projects`;
    };

    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            const targetId = getTargetId(filter);
            let found = false;

            filterableGrids.forEach((grid) => {
                const matches = filter === 'all' ? true : grid.id === targetId;
                grid.classList.toggle('active', matches);
                if (matches) found = true;
            });

            if (noProjects) noProjects.style.display = found ? 'none' : 'block';
        });
    });

    const initialButton = document.querySelector('.filter-btn.active');
    initialButton?.click();

    // Sticky-stacking cards (.service-card-wrap / .experience-wrap / .project-wrap):
    // each is CSS `position: sticky` at its own top offset (base + i * step). A card is
    // "stacked" once it has scrolled past that offset and is sliding out from under the
    // next one — CSS alone can't detect that, so we compare each element's live top
    // against its intended sticky offset on scroll.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stackGroups = [
        { selector: '.service-card-wrap', base: 140, step: 14 },
        { selector: '.experience-wrap', base: 140, step: 14 },
        { selector: '.project-wrap', base: 140, step: 12 },
    ].map((cfg) => ({ ...cfg, items: [...document.querySelectorAll(cfg.selector)] }))
     .filter((cfg) => cfg.items.length);

    if (stackGroups.length && !prefersReducedMotion) {
        let ticking = false;
        const updateStacks = () => {
            stackGroups.forEach(({ items, base, step }) => {
                items.forEach((item, i) => {
                    const stickyTop = base + i * step;
                    const actualTop = item.getBoundingClientRect().top;
                    item.classList.toggle('is-stacked', actualTop < stickyTop - 4);
                });
            });
            ticking = false;
        };
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateStacks);
                ticking = true;
            }
        };
        updateStacks();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
    }

    // Make image tiles keyboard-friendly when they are interactive.
    document.querySelectorAll('.design-item').forEach((item) => {
        item.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') item.click();
        });
    });
})();