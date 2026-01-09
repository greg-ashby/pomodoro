// Service worker for Pomodoro Timer PWA
// Import workbox from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js')

// Precache all assets (manifest will be injected by vite-plugin-pwa)
if (workbox.precaching) {
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || [])
}

// Cache strategy for the app
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'document',
  new workbox.strategies.NetworkFirst({
    cacheName: 'pomodoro-cache'
  })
)

// Timer notification logic
let timerEndTime = null
let timerMode = null

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TIMER_UPDATE') {
    timerEndTime = event.data.endTime
    timerMode = event.data.mode
  } else if (event.data && event.data.type === 'TIMER_CLEAR') {
    timerEndTime = null
    timerMode = null
  }
})

// Check for timer completion periodically
setInterval(() => {
  if (timerEndTime && timerMode) {
    const now = Date.now()
    
    if (now >= timerEndTime) {
      // Timer completed - show notification
      const modeNames = {
        focus: 'Focus Time',
        shortBreak: 'Short Break',
        longBreak: 'Long Break',
        custom: 'Custom Timer'
      }
      
      const title = `${modeNames[timerMode] || 'Timer'} Complete!`
      const body = timerMode === 'focus' 
        ? 'Time for a break! 🎉'
        : timerMode === 'longBreak'
        ? 'Ready to focus again? 🚀'
        : 'Break time is over!'
      
      self.registration.showNotification(title, {
        body: body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'pomodoro-timer',
        requireInteraction: false,
        vibrate: [200, 100, 200]
      })
      
      // Clear the timer
      timerEndTime = null
      timerMode = null
    }
  }
}, 1000) // Check every second

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

