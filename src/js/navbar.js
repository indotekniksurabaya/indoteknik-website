export function initNavbar() {
  const navbar = document.getElementById('navbar');

  if (navbar) {
    const handleNavbarStyle = () => {
      if (window.scrollY > 10) {
        navbar.classList.add('shadow-sm', 'bg-white/90');
        navbar.classList.remove('bg-white/80');
      } else {
        navbar.classList.remove('shadow-sm', 'bg-white/90');
        navbar.classList.add('bg-white/80');
      }
    };
    window.addEventListener('scroll', handleNavbarStyle, { passive: true });
    handleNavbarStyle();
  }

  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn = document.getElementById('closeMobileMenuBtn');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });

    const closeHandler = () => {
      mobileMenu.classList.add('hidden');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeHandler);
    mobileLinks.forEach(link => link.addEventListener('click', closeHandler));
  }
}