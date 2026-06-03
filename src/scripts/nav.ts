let isMenuOpen = false;
let scrollPosition = 0;
let scrollHandlerAttached = false;

function initNav() {
    const nav = document.getElementById('classic-nav');
    const navItems = document.querySelectorAll('.nav-item');
    const logoLink = document.querySelector('.nav-link-home');
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-cta');
    const hamburgerTop = document.getElementById('hamburger-top');
    const hamburgerMid = document.getElementById('hamburger-mid');
    const hamburgerBot = document.getElementById('hamburger-bot');

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        const body = document.body;

        if (isMenuOpen) {
            scrollPosition = window.scrollY;
            mobileMenu?.classList.remove('opacity-0', 'pointer-events-none');
            mobileMenu?.classList.add('opacity-100', 'pointer-events-auto');
            nav?.classList.remove('z-50');
            nav?.classList.add('z-[10000]');
            body.style.position = 'fixed';
            body.style.top = `-${scrollPosition}px`;
            body.style.width = '100%';
            body.style.overflow = 'hidden';
            mobileToggle?.setAttribute('aria-expanded', 'true');
            if (hamburgerTop && hamburgerMid && hamburgerBot) {
                hamburgerTop.classList.add('rotate-45', 'translate-y-2');
                hamburgerMid.classList.add('opacity-0');
                hamburgerBot.classList.add('-rotate-45', '-translate-y-2.5');
            }
            mobileToggle?.classList.add('text-white');
            mobileToggle?.classList.remove('text-obsidian');
        } else {
            mobileMenu?.classList.add('opacity-0', 'pointer-events-none');
            mobileMenu?.classList.remove('opacity-100', 'pointer-events-auto');
            nav?.classList.add('z-50');
            nav?.classList.remove('z-[10000]');
            body.style.position = '';
            body.style.top = '';
            body.style.width = '';
            body.style.overflow = '';
            window.scrollTo(0, scrollPosition);
            mobileToggle?.setAttribute('aria-expanded', 'false');
            if (hamburgerTop && hamburgerMid && hamburgerBot) {
                hamburgerTop.classList.remove('rotate-45', 'translate-y-2');
                hamburgerMid.classList.remove('opacity-0');
                hamburgerBot.classList.remove('-rotate-45', '-translate-y-2.5');
            }
        }
    }

    mobileToggle?.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => { if (isMenuOpen) toggleMenu(); });
    });

    function handleScroll() {
        const currentNav = document.getElementById('classic-nav');
        if (!currentNav) return;
        const currentScroll = isMenuOpen ? scrollPosition : window.scrollY;
        if (currentScroll > 20) {
            currentNav.classList.add('bg-obsidian/90', 'backdrop-blur-md', 'shadow-md');
            currentNav.classList.remove('bg-transparent', 'py-6');
            currentNav.classList.add('py-3');
        } else {
            currentNav.classList.remove('bg-obsidian/90', 'backdrop-blur-md', 'shadow-md');
            currentNav.classList.add('bg-transparent', 'py-6');
            currentNav.classList.remove('py-3');
        }
    }

    function handleScrollSpy() {
        if (isMenuOpen) return;
        let currentSection: string | null = null;
        const sections = ['home', 'projects', 'services', 'about', 'contact'];
        const hasSections = sections.some(id => !!document.getElementById(id));
        if (hasSections) {
            currentSection = 'home';
            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= window.innerHeight / 3 && rect.bottom >= 100) {
                        currentSection = sectionId;
                        break;
                    }
                }
            }
        }
        document.querySelectorAll('.nav-item').forEach((item) => {
            const section = item.getAttribute('data-section');
            const underline = item.querySelector('.nav-underline');
            if (currentSection && section === currentSection) {
                item.classList.add('text-lux-gold');
                item.classList.remove('text-white/70');
                underline?.classList.remove('scale-x-0');
            } else {
                item.classList.remove('text-lux-gold');
                item.classList.add('text-white/70');
                underline?.classList.add('scale-x-0');
            }
        });
    }

    function smoothScroll(e: Event) {
        e.preventDefault();
        const target = e.currentTarget as HTMLAnchorElement;
        const href = target.getAttribute('href');
        if (!href) return;
        const hashIndex = href.indexOf('#');
        if (hashIndex !== -1) {
            const hash = href.substring(hashIndex);
            const currentPath = window.location.pathname;
            const targetPath = href.substring(0, hashIndex);
            const cleanCurrent = currentPath.endsWith('/') && currentPath.length > 1 ? currentPath.slice(0, -1) : currentPath;
            const cleanTarget = targetPath.endsWith('/') && targetPath.length > 1 ? targetPath.slice(0, -1) : targetPath;
            const isSamePage = (cleanCurrent === cleanTarget) || (cleanCurrent === '/v1' && cleanTarget === '/v1') || (targetPath === '' && hash);
            if (isSamePage) {
                const element = document.querySelector(hash);
                if (element) {
                    if (isMenuOpen) toggleMenu();
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth' });
                        history.pushState(null, '', hash);
                    }, 10);
                }
            } else {
                window.location.href = href;
            }
        } else {
            window.location.href = href;
        }
    }

    // Language switch scroll persistence
    document.querySelectorAll('.lang-switch').forEach(link => {
        link.addEventListener('click', () => {
            sessionStorage.setItem('scrollPos', window.scrollY.toString());
        });
    });
    const savedScroll = sessionStorage.getItem('scrollPos');
    if (savedScroll) {
        window.scrollTo(0, parseInt(savedScroll));
        sessionStorage.removeItem('scrollPos');
    }

    if (!scrollHandlerAttached) {
        window.addEventListener('scroll', () => { handleScroll(); handleScrollSpy(); }, { passive: true });
        scrollHandlerAttached = true;
    }

    handleScroll();
    handleScrollSpy();
    navItems.forEach(item => item.addEventListener('click', smoothScroll));
    if (logoLink) (logoLink as HTMLElement).addEventListener('click', smoothScroll);
    mobileLinks.forEach(item => item.addEventListener('click', smoothScroll));
}

document.addEventListener('astro:page-load', initNav);
