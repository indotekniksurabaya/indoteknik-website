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

  // Initialize scroll-direction-aware interactive marquee
  initInteractiveMarquee();
}

/**
 * Interactive Dynamic Marquee
 * Features:
 * - Idle cruising animation
 * - Scrolling DOWN turns/accelerates marquee to the RIGHT
 * - Scrolling UP turns/accelerates marquee to the LEFT
 * - Smooth physics inertia when changing direction (lerp)
 * - Infinite seamless wrap-around with zero seams
 */
export function initInteractiveMarquee() {
  const containers = document.querySelectorAll('.interactive-marquee');
  if (!containers.length) return;

  containers.forEach(container => {
    const track = container.querySelector('.marquee-track');
    if (!track) return;

    const BASE_SPEED = 1.4;     // Cruising speed (pixels per frame) - lively & elegant
    const MAX_BOOST = 8.0;      // Max additional velocity during fast scroll
    const LERP_FACTOR = 0.065;  // Responsive yet smooth turnaround factor

    let currentSpeed = -BASE_SPEED; // Cruising left initially (-X)
    let targetSpeed = -BASE_SPEED;
    let currentX = 0;
    let isHovered = false;
    let lastScrollY = window.scrollY;
    let scrollDebounce = null;

    const getGroupWidth = () => {
      const firstGroup = track.querySelector('.marquee-group');
      if (firstGroup && firstGroup.offsetWidth > 0) {
        return firstGroup.offsetWidth;
      }
      return track.scrollWidth / (track.children.length || 4);
    };

    let groupWidth = getGroupWidth();
    currentX = -groupWidth;

    window.addEventListener('resize', () => {
      const nw = getGroupWidth();
      if (nw > 0 && Math.abs(nw - groupWidth) > 5) {
        groupWidth = nw;
        currentX = -groupWidth;
      }
    }, { passive: true });

    // Listen to scroll to determine direction and velocity (sensitive yet smooth)
    const onScroll = () => {
      const nowY = window.scrollY;
      const delta = nowY - lastScrollY;
      lastScrollY = nowY;

      if (Math.abs(delta) < 0.5) return;

      const boost = Math.min(Math.abs(delta) * 0.32, MAX_BOOST);

      if (delta > 0) {
        // User scrolls DOWN -> marquee accelerates to the RIGHT (+X)
        targetSpeed = BASE_SPEED + boost;
      } else {
        // User scrolls UP -> marquee accelerates to the LEFT (-X)
        targetSpeed = -(BASE_SPEED + boost);
      }

      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(() => {
        // Smoothly settle back to cruising speed in the active direction
        targetSpeed = targetSpeed > 0 ? BASE_SPEED : -BASE_SPEED;
      }, 200);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    container.addEventListener('mouseenter', () => { isHovered = true; });
    container.addEventListener('mouseleave', () => { isHovered = false; });

    // Smooth animation frame loop
    const animate = () => {
      const activeTarget = isHovered ? (targetSpeed * 0.25) : targetSpeed;

      // Realistic inertia: gradually lerp currentSpeed toward targetSpeed
      // When direction changes, speed smoothly crosses zero with visible deceleration & acceleration
      currentSpeed += (activeTarget - currentSpeed) * LERP_FACTOR;
      currentX += currentSpeed;

      // Seamless mathematical wrap-around across groups
      if (groupWidth > 10) {
        if (currentX <= -2 * groupWidth) {
          currentX += groupWidth;
        } else if (currentX >= 0) {
          currentX -= groupWidth;
        }
      }

      track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0, 0)`;
      requestAnimationFrame(animate);
    };

    track.style.animation = 'none';
    requestAnimationFrame(animate);
  });
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
