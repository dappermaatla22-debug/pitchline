var CACHE = 'pitchline-v2';
var ASSETS = [
  '/','index.html',
  'css/tokens.css','css/reset.css','css/components.css',
  'js/api.js','js/icons.js','js/components.js','js/screens.js',
  'js/subscreens.js','js/onboarding.js','js/app.js',
  'data/mock.js','data/store.js',
  'icon/pitchline-icon.svg','icon/icon-192.svg'
];
self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }));
  self.skipWaiting();
});
self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); })); }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e) {
  if (e.request.url.indexOf('/api/') > -1 || e.request.url.indexOf('worldcup26.ir') > -1 || e.request.url.indexOf('football-data.org') > -1 || e.request.url.indexOf('thesportsdb.com') > -1) {
    e.respondWith(fetch(e.request).catch(function(){ return new Response(JSON.stringify({error:'Offline'}),{status:503,headers:{'Content-Type':'application/json'}}); }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function(cached) {
    if (cached) return cached;
    return fetch(e.request).then(function(res) {
      if (res && res.status === 200) {
        var clone = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
      }
      return res;
    }).catch(function(){ return cached || new Response('Offline',{status:503}); });
  }));
});