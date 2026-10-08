/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging 백그라운드 서비스워커.
 *
 * - public 정적 파일이라 process.env를 읽을 수 없다.
 *   → 등록 시 config를 쿼리스트링으로 주입받아 초기화한다.
 *   (firebase 웹 config는 모두 공개 가능한 식별자이므로 노출 문제 없음)
 * - importScripts 버전은 package.json의 firebase 버전과 맞춰 둔다.
 */
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js');

const params = new URL(self.location).searchParams;
const firebaseConfig = {
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
};

if (firebaseConfig.projectId && firebaseConfig.appId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // 앱이 백그라운드/종료 상태일 때 수신되는 메시지 처리
  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title ?? payload.data?.title ?? '위드';
    const options = {
      body: payload.notification?.body ?? payload.data?.body,
      icon: payload.notification?.icon ?? '/assets/og/og-image.png',
      data: payload.data ?? {},
    };
    self.registration.showNotification(title, options);
  });
}

// 알림 클릭 시 해당 링크(또는 홈)로 포커스/이동
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.link || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
