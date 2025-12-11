// Theme initialization script - must run before interactive to prevent flash
// This script is loaded externally to avoid XSS vulnerabilities from dangerouslySetInnerHTML

(function() {
  'use strict';

  try {
    // Get theme colors from data attributes on the script tag
    const scriptTag = document.currentScript || document.querySelector('script[data-theme-colors]');
    const lightColor = scriptTag?.dataset?.lightColor || '#ffffff';
    const darkColor = scriptTag?.dataset?.darkColor || '#09090b';

    // Apply theme color based on user preference or system preference
    const themeMetaTag = document.querySelector('meta[name="theme-color"]');
    if (themeMetaTag) {
      const isDarkMode = localStorage.theme === 'dark' ||
        ((!('theme' in localStorage) || localStorage.theme === 'system') &&
         window.matchMedia('(prefers-color-scheme: dark)').matches);

      themeMetaTag.setAttribute('content', isDarkMode ? darkColor : lightColor);
    }

    // Apply layout preference if stored
    if (localStorage.layout) {
      const layoutClass = 'layout-' + localStorage.layout;
      // Validate layout class to prevent injection
      if (/^layout-[a-z0-9-]+$/i.test(layoutClass)) {
        document.documentElement.classList.add(layoutClass);
      }
    }
  } catch (_) {
    // Silent fail - theme will fall back to default
  }
})();
