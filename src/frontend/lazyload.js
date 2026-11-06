// Frontend Progressive Lazy Loading & Skeleton Observer
export function initLazyLoading(root = document) {
  const images = root.querySelectorAll('img[loading="lazy"], img.img-lazy');
  
  images.forEach(img => {
    if (!img.classList.contains('img-lazy')) {
      img.classList.add('img-lazy');
    }

    const parent = img.parentElement;
    if (parent && !parent.classList.contains('skeleton-loader') && !img.complete) {
      parent.classList.add('skeleton-loader');
    }

    if (img.complete && img.naturalWidth !== 0) {
      img.classList.add('loaded');
      if (parent) parent.classList.add('is-loaded');
    } else {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
        if (parent) parent.classList.add('is-loaded');
      }, { once: true });

      img.addEventListener('error', () => {
        img.classList.add('loaded');
        if (parent) parent.classList.add('is-loaded');
      }, { once: true });
    }
  });
}

// Global watcher for dynamic DOM additions (catalog/gallery pagination & filtering)
export function startLazyLoadWatcher() {
  initLazyLoading(document);

  if ('MutationObserver' in window) {
    const observer = new MutationObserver((mutations) => {
      let hasNewImages = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          hasNewImages = true;
          break;
        }
      }
      if (hasNewImages) {
        initLazyLoading(document);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}
