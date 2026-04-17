importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCLDTTEnHJZDCcXv8Aq1AQfeEb32x20O-c",
  authDomain: "skill-barter-56a97.firebaseapp.com",
  projectId: "skill-barter-56a97",
  storageBucket: "skill-barter-56a97.firebasestorage.app",
  messagingSenderId: "308554090616",
  appId: "1:308554090616:web:a9b2fca1be8514fa79c58d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.svg'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
