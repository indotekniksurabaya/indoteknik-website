// Frontend Scroll, Progress Bar & Parallax
export function initScroll() {
  const fab = document.getElementById('fabScrollTop');
  const scrollProgress = document.getElementById('scrollProgress');
  const parallaxImages = document.querySelectorAll('.parallax-img');
  const maskElements = document.querySelectorAll('.mask-reveal');
  const revealElements = document.querySelectorAll('.scroll-reveal');

  const updateScrollProgress = () => {
    if (!scrollProgress) return;
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollTotal > 0 ? (window.scrollY / scrollTotal) * 100 : 0;
    scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  let ticking = false;
  const updateParallax = () => {
    if (!parallaxImages || parallaxImages.length === 0) return;
    const vh = window.innerHeight;
    parallaxImages.forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.bottom >= 0 && rect.top <= vh) {
        const center = rect.top + rect.height / 2;
        const offset = ((center - vh / 2) / vh) * -20;
        img.style.setProperty('--parallax-y', `${offset.toFixed(1)}px`);
      }
    });
  };

  const handleScroll = () => {
    if (fab) {
      if (window.scrollY > 400) {
        fab.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-8');
        fab.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
      } else {
        fab.classList.add('opacity-0', 'pointer-events-none', 'translate-y-8');
        fab.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
      }
    }

    updateScrollProgress();

    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (fab) {
    fab.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    });

    window.__scrollObserver = observer;

    maskElements.forEach(el => observer.observe(el));
    revealElements.forEach(el => observer.observe(el));
  } else {
    maskElements.forEach(el => el.classList.add('is-visible'));
    revealElements.forEach(el => el.classList.add('is-visible'));
  }
}

export function refreshScrollReveal(root = document) {
  if (typeof window === 'undefined') return;
  if ('IntersectionObserver' in window && window.__scrollObserver) {
    const reveals = root.querySelectorAll ? root.querySelectorAll('.scroll-reveal:not(.is-visible)') : [];
    const masks = root.querySelectorAll ? root.querySelectorAll('.mask-reveal:not(.is-visible)') : [];
    reveals.forEach(el => window.__scrollObserver.observe(el));
    masks.forEach(el => window.__scrollObserver.observe(el));
  } else {
    root.querySelectorAll?.('.scroll-reveal, .mask-reveal').forEach(el => el.classList.add('is-visible'));
  }
}
