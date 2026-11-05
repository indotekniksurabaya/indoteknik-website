// Frontend Main Entry Point
import { initNavbar } from './navbar.js';
import { initScroll } from './scroll.js';
import { initModal } from './modal.js';
import { initContactForm } from './form.js';
import { initGallery } from './gallery.js';
import { initKatalog } from './catalog.js';
import { initAbout } from './about.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScroll();
  initModal();
  initContactForm();
  initGallery();
  initKatalog();
  initAbout();
});
