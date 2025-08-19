if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      throw_error('Welcome to Audion!', true);
      console.log('SW registered:', registration.scope);

      if (registration.waiting && typeof throw_error === 'function') {
        throw_error('New version available - refresh to update', true);
      }

      registration.addEventListener('updatefound', () => {
        const nw = registration.installing;
        if (!nw) return;

        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              typeof throw_error === 'function'
                ? msg('<h3>There is a new version of Audion available - refresh to update</h3>')
                : console.log('New version available - refresh to update');
            } else {
              throw_error('Ready to work offline', true);
            }
          }
        });
      });
    } catch (error) {
      console.error('SW registration failed:', error);
      throw_error("Service worker failed to start");
    }
  });
}