// Frontend Navbar Controller
export function initNavbar() {
  const navbar = document.getElementById('navbar');

  if (navbar) {
    const handleNavbarStyle = () => {
      if (window.scrollY > 15) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    };
    window.addEventListener('scroll', handleNavbarStyle, { passive: true });
    handleNavbarStyle();
  }

  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn = document.getElementById('closeMobileMenuBtn');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-sublink');

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

    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeHandler();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        closeHandler();
      }
    });
  }
}
