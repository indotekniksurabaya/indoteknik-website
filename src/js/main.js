import { initNavbar } from './navbar.js';
import { initScroll } from './scroll.js';
import { initContactForm } from './form.js';
import { initGallery } from './gallery.js';
import { initKatalog } from './katalog.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScroll();
  initContactForm();
  initGallery();
  initKatalog();
});
