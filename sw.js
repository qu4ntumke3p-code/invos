// InvOS Quantum Keep — Service Worker
// Handles background push notifications. This file must be served from
// the SAME origin/path scope as index.html (e.g. the root of your
// GitHub Pages site) for the browser to allow it to control that scope.

self.addEventListener('install', (event) => {
  self.skipWaiting(); // activate this SW immediately, don't wait for old tabs to close
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fired when a push message arrives from the server — this is what makes
// notifications appear even if no InvOS tab is currently open.
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {
    data = { title: 'InvOS', body: event.data ? event.data.text() : 'You have a new notification.' };
  }

  const title = data.title || 'InvOS Quantum Keep';
  const options = {
    body: data.body || '',
    icon: data.icon || undefined, // optional — add an icon URL if you have one hosted
    badge: data.badge || undefined,
    tag: data.tag || undefined, // same tag replaces a still-visible notification instead of stacking
    data: { url: data.url || '/' },
    vibrate: data.urgent ? [200, 100, 200, 100, 300] : [120],
    requireInteraction: !!data.urgent, // priority notifications stay on screen until dismissed
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Fired when the user taps the notification — focus an existing InvOS tab
// if one's open, otherwise open a new one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
