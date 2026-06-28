var currentScreen = 'home';
var screenHistory = [];
var currentTheme = localStorage.getItem('pitchline-theme') || 'dark';
var currentLang = localStorage.getItem('pitchline-lang') || 'en';

// i18n translations
var I18N = {
  en: { home:'Home', fixtures:'Fixtures', predict:'Predict', profile:'Profile', liveNow:'Live Now', elitePicks:'Elite Picks', strongPicks:'Strong Picks', avoidList:'Avoid List', allMatches:'All Matches', viewAll:'View All', browse:'Browse', noData:'No data available', loading:'Loading...', retry:'Retry', saved:'Saved', settings:'Settings', notifications:'Notifications', darkMode:'Dark Mode', lightMode:'Light Mode', pullToRefresh:'Pull to refresh', releaseToRefresh:'Release to refresh', refreshing:'Refreshing...' },
  es: { home:'Inicio', fixtures:'Calendario', predict:'Predicciones', profile:'Perfil', liveNow:'En Vivo', elitePicks:' Picks Elite', strongPicks:'Picks Fuertes', avoidList:'Lista de Evitar', allMatches:'Todos los Partidos', viewAll:'Ver Todo', browse:'Explorar', noData:'Sin datos', loading:'Cargando...', retry:'Reintentar', saved:'Guardados', settings:'Ajustes', notifications:'Notificaciones', darkMode:'Modo Oscuro', lightMode:'Modo Claro', pullToRefresh:'Desliza para actualizar', releaseToRefresh:'Suelta para actualizar', refreshing:'Actualizando...' },
  fr: { home:'Accueil', fixtures:'Calendrier', predict:'Pronostics', profile:'Profil', liveNow:'En Direct', elitePicks:'Sélection Elite', strongPicks:'Sélections Fortes', avoidList:'À Éviter', allMatches:'Tous les Matchs', viewAll:'Voir Tout', browse:'Parcourir', noData:'Pas de données', loading:'Chargement...', retry:'Réessayer', saved:'Enregistrés', settings:'Paramètres', notifications:'Notifications', darkMode:'Mode Sombre', lightMode:'Mode Clair', pullToRefresh:'Tirez pour actualiser', releaseToRefresh:'Relâchez pour actualiser', refreshing:'Actualisation...' },
  pt: { home:'Início', fixtures:'Calendário', predict:'Previsões', profile:'Perfil', liveNow:'Ao Vivo', elitePicks:'Seleção Elite', strongPicks:'Seleções Fortes', avoidList:'Evitar', allMatches:'Todos os Jogos', viewAll:'Ver Tudo', browse:'Explorar', noData:'Sem dados', loading:'Carregando...', retry:'Tentar Novamente', saved:'Salvos', settings:'Configurações', notifications:'Notificações', darkMode:'Modo Escuro', lightMode:'Modo Claro', pullToRefresh:'Puxe para atualizar', releaseToRefresh:'Solte para atualizar', refreshing:'Atualizando...' }
};

function t(key) { return (I18N[currentLang] || I18N.en)[key] || key; }

// Theme management
function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('pitchline-theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#f5f5f5' : '#121212');
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  renderScreen(currentScreen);
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('pitchline-lang', lang);
  renderScreen(currentScreen);
}

// IndexedDB cache
var DB_NAME = 'pitchline-db';
var DB_VERSION = 1;
function openDB() {
  return new Promise(function(resolve) {
    var req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = function(e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains('matches')) db.createObjectStore('matches', {keyPath:'id'});
      if (!db.objectStoreNames.contains('predictions')) db.createObjectStore('predictions', {keyPath:'id'});
    };
    req.onsuccess = function(e) { resolve(e.target.result); };
    req.onerror = function() { resolve(null); };
  });
}

async function cacheMatches(matches) {
  var db = await openDB();
  if (!db) return;
  var tx = db.transaction('matches','readwrite');
  var store = tx.objectStore('matches');
  matches.forEach(function(m) { store.put(m); });
}

async function getCachedMatches() {
  var db = await openDB();
  if (!db) return [];
  return new Promise(function(resolve) {
    var tx = db.transaction('matches','readonly');
    var req = tx.objectStore('matches').getAll();
    req.onsuccess = function() { resolve(req.result || []); };
    req.onerror = function() { resolve([]); };
  });
}

async function cachePredictions(preds) {
  var db = await openDB();
  if (!db) return;
  var tx = db.transaction('predictions','readwrite');
  var store = tx.objectStore('predictions');
  preds.forEach(function(p) { store.put(p); });
}

async function getCachedPredictions() {
  var db = await openDB();
  if (!db) return [];
  return new Promise(function(resolve) {
    var tx = db.transaction('predictions','readonly');
    var req = tx.objectStore('predictions').getAll();
    req.onsuccess = function() { resolve(req.result || []); };
    req.onerror = function() { resolve([]); };
  });
}

// Push notifications
function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function sendNotification(title, body, icon) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body: body, icon: icon || '/icon/icon-192.svg', badge: '/icon/icon-192.svg', tag: 'pitchline-' + Date.now() });
  } catch(e) {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type:'notification', title:title, body:body });
    }
  }
}

// Sound alerts
var soundEnabled = localStorage.getItem('pitchline-sound') === 'true';
function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('pitchline-sound', soundEnabled);
}
function playGoalSound() {
  if (!soundEnabled) return;
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
}

// Score animation
var prevScores = {};
function checkScoreChange(matchId, newScore) {
  if (prevScores[matchId] && prevScores[matchId] !== newScore) {
    var el = document.querySelector('[data-score="' + matchId + '"]');
    if (el) {
      el.classList.add('score-bump');
      setTimeout(function() { el.classList.remove('score-bump'); }, 500);
    }
    playGoalSound();
    sendNotification('Goal!', 'Score changed to ' + newScore);
    return true;
  }
  prevScores[matchId] = newScore;
  return false;
}

// Share prediction card
function generateShareCard(pred) {
  var canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 720;
  var ctx = canvas.getContext('2d');

  var grad = ctx.createLinearGradient(0, 0, 720, 720);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(0.5, '#16213e');
  grad.addColorStop(1, '#0f3460');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, 720, 720, 40);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(600, 100, 120, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,77,125,0.12)';
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.fillText('PITCH', 40, 60);
  ctx.fillStyle = '#FF4D7D';
  ctx.fillText('LINE', 130, 60);

  var tierColors = { elite:'#34c87a', strong:'#4f8ef7', moderate:'#fbbf24', risky:'#f43f5e' };
  ctx.fillStyle = tierColors[pred.tier] || '#ffffff';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillText((pred.tier || '').toUpperCase() + ' PICK', 40, 110);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Inter, sans-serif';
  ctx.fillText(pred.home, 40, 200);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = 'bold 36px Inter, sans-serif';
  ctx.fillText('vs', 40, 250);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(pred.away, 40, 300);

  ctx.fillStyle = '#FF4D7D';
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.fillText('\u2192 ' + pred.outcome, 40, 380);

  ctx.beginPath();
  ctx.arc(600, 400, 60, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 8;
  ctx.stroke();
  var angle = (pred.confidence / 100) * Math.PI * 2;
  ctx.beginPath();
  ctx.arc(600, 400, 60, -Math.PI / 2, -Math.PI / 2 + angle);
  ctx.strokeStyle = tierColors[pred.tier] || '#FF4D7D';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(pred.confidence + '%', 600, 410);
  ctx.textAlign = 'left';

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText(pred.league + ' \u00b7 ' + pred.time, 40, 640);

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText('pitchline.app', 40, 680);

  return canvas;
}

function sharePred(predId) {
  var pred = Store.getPredictions().find(function(p){ return p.id === predId; });
  if (!pred) { showToast('Nothing to share'); return; }

  var canvas = generateShareCard(pred);
  canvas.toBlob(function(blob) {
    if (navigator.share && navigator.canShare) {
      var file = new File([blob], 'pitchline-prediction.png', {type:'image/png'});
      if (navigator.canShare({files:[file]})) {
        navigator.share({ files:[file], title:'Pitchline Prediction', text: pred.home + ' vs ' + pred.away + ' \u2014 ' + pred.outcome + ' (' + pred.confidence + '%)' });
        return;
      }
    }
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'pitchline-' + predId + '.png';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Prediction card downloaded');
  });
}

function shareMatch(matchId) {
  var matches = Store.getMatches();
  var match = matches.find(function(m){ return m.id === matchId; });
  if (!match) { showToast('Nothing to share'); return; }
  var text = match.home + ' vs ' + match.away + ' \u2014 ' + (match.score || match.time) + ' | ' + match.league;
  if (navigator.share) {
    navigator.share({ title:'Pitchline', text:text });
  } else {
    navigator.clipboard.writeText(text);
    showToast('Match info copied');
  }
}

// Bet slip generator
function generateBetSlip() {
  var saved = Store.getSavedPredictions();
  if (saved.length === 0) { showToast('Save predictions first'); return null; }

  var totalOdds = 1;
  saved.forEach(function(p) {
    totalOdds *= (100 / p.confidence);
  });

  var slip = {
    selections: saved.map(function(p) {
      return { match: p.home + ' vs ' + p.away, pick: p.outcome, confidence: p.confidence, odds: (100 / p.confidence).toFixed(2) };
    }),
    totalOdds: totalOdds.toFixed(2),
    stake: 10,
    potentialReturn: (10 * totalOdds).toFixed(2),
    timestamp: new Date().toLocaleString()
  };

  return slip;
}

function showBetSlip() {
  var slip = generateBetSlip();
  if (!slip) return;

  var html = '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px;" onclick="this.remove()">';
  html += '<div class="betslip-card" style="width:100%;max-width:380px;max-height:80vh;overflow-y:auto;" onclick="event.stopPropagation()">';
  html += '<div class="betslip-header"><div style="font-size:16px;font-weight:700;">Bet Slip</div><button class="btn-icon" onclick="this.closest(\'[onclick]\').remove()" style="width:32px;height:32px;">' + ICONS.close + '</button></div>';
  html += '<div style="padding:12px 16px;border-bottom:1px solid var(--border);font-size:11px;color:var(--text-muted);">' + slip.selections.length + ' selection' + (slip.selections.length > 1 ? 's' : '') + ' \u00b7 ' + slip.timestamp + '</div>';

  slip.selections.forEach(function(s) {
    html += '<div class="betslip-row"><div style="flex:1;"><div style="font-size:13px;font-weight:600;">' + s.pick + '</div><div style="font-size:11px;color:var(--text-muted);">' + s.match + '</div></div><div style="text-align:right;"><div style="font-size:13px;font-weight:600;color:var(--accent);">' + s.odds + '</div><div style="font-size:11px;color:var(--text-muted);">' + s.confidence + '%</div></div></div>';
  });

  html += '<div style="padding:12px 16px;background:var(--bg-elevated);">';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:12px;color:var(--text-muted);">Total Odds</span><span style="font-size:14px;font-weight:700;color:var(--accent);">' + slip.totalOdds + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:12px;color:var(--text-muted);">Stake</span><span style="font-size:14px;font-weight:600;">$' + slip.stake + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text-muted);">Potential Return</span><span style="font-size:16px;font-weight:700;color:var(--success);">$' + slip.potentialReturn + '</span></div>';
  html += '</div>';

  html += '<div style="padding:12px 16px;"><button class="btn btn-primary btn-full" onclick="navigator.clipboard.writeText(\'Bet Slip: ' + slip.selections.length + ' picks, Odds: ' + slip.totalOdds + ', Return: $' + slip.potentialReturn + '\');showToast(\'Bet slip copied\');this.closest(\'[onclick]\').remove();">Copy Bet Slip</button></div>';
  html += '</div></div>';

  document.body.insertAdjacentHTML('beforeend', html);
}

// Prediction accuracy tracker
function getAccuracyStats() {
  var stats = JSON.parse(localStorage.getItem('pitchline-accuracy') || '{"total":0,"correct":0,"byTier":{}}');
  return stats;
}

function trackPredictionResult(predId, wasCorrect) {
  var stats = getAccuracyStats();
  stats.total++;
  if (wasCorrect) stats.correct++;
  var pred = Store.getPredictions().find(function(p){ return p.id === predId; });
  if (pred) {
    if (!stats.byTier[pred.tier]) stats.byTier[pred.tier] = {total:0,correct:0};
    stats.byTier[pred.tier].total++;
    if (wasCorrect) stats.byTier[pred.tier].correct++;
  }
  localStorage.setItem('pitchline-accuracy', JSON.stringify(stats));
}

function renderAccuracyStats() {
  var stats = getAccuracyStats();
  var pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  var html = '<div class="accuracy-card" style="padding:16px;background:var(--bg-card);border-radius:12px;margin-bottom:12px;">';
  html += '<div style="font-size:14px;font-weight:600;margin-bottom:8px;">Prediction Accuracy</div>';
  html += '<div style="display:flex;gap:24px;margin-bottom:12px;">';
  html += '<div><div style="font-size:28px;font-weight:700;color:var(--accent);">' + pct + '%</div><div style="font-size:11px;color:var(--text-muted);">Overall</div></div>';
  html += '<div><div style="font-size:28px;font-weight:700;">' + stats.correct + '</div><div style="font-size:11px;color:var(--text-muted);">Correct</div></div>';
  html += '<div><div style="font-size:28px;font-weight:700;">' + stats.total + '</div><div style="font-size:11px;color:var(--text-muted);">Total</div></div>';
  html += '</div>';
  if (stats.byTier && Object.keys(stats.byTier).length) {
    html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:6px;">By Tier</div>';
    Object.keys(stats.byTier).forEach(function(tier) {
      var tierStats = stats.byTier[tier];
      var tierPct = tierStats.total > 0 ? Math.round((tierStats.correct / tierStats.total) * 100) : 0;
      html += '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span style="text-transform:capitalize;">' + tier + '</span><span style="font-weight:600;">' + tierPct + '% (' + tierStats.correct + '/' + tierStats.total + ')</span></div>';
    });
  }
  html += '</div>';
  return html;
}

// Match preview generator
function generateMatchPreview(home, away, league) {
  var previews = [
    home + ' host ' + away + ' in what promises to be an exciting ' + league + ' encounter. Both sides will be looking to secure all three points in this crucial fixture.',
    'A fascinating ' + league + ' matchup awaits as ' + home + ' take on ' + away + '. Key battles across the pitch will likely determine the outcome.',
    'Expect an entertaining affair as ' + home + ' welcome ' + away + ' for this ' + league + ' showdown. Tactical intrigue and individual quality should make this a compelling watch.',
    home + ' and ' + away + ' lock horns in a significant ' + league + ' contest. Form and recent momentum could prove decisive in shaping the result.'
  ];
  return previews[Math.floor(Math.random() * previews.length)];
}

// Venue and weather info
function getVenueInfo(matchId) {
  var venues = {
    'wembley': { name: 'Wembley Stadium', city: 'London', capacity: 90000, surface: 'Natural Grass' },
    'santiago': { name: 'Santiago Bernabeu', city: 'Madrid', capacity: 83186, surface: 'Natural Grass' },
    'allianz': { name: 'Allianz Arena', city: 'Munich', capacity: 75024, surface: 'Natural Grass' },
    'san-siro': { name: 'San Siro', city: 'Milan', capacity: 75923, surface: 'Natural Grass' },
    'maracana': { name: 'Maracana', city: 'Rio de Janeiro', capacity: 78838, surface: 'Natural Grass' }
  };
  var venueKeys = Object.keys(venues);
  var index = typeof matchId === 'string' ? matchId.charCodeAt(0) % venueKeys.length : 0;
  return venues[venueKeys[index]] || { name: 'TBD', city: 'TBD', capacity: 0, surface: 'TBD' };
}

function getWeatherInfo() {
  var conditions = [
    { temp: '22\u00b0C', condition: 'Clear', icon: '\u2600\ufe0f', humidity: '45%' },
    { temp: '18\u00b0C', condition: 'Partly Cloudy', icon: '\u26c5', humidity: '60%' },
    { temp: '15\u00b0C', condition: 'Overcast', icon: '\u2601\ufe0f', humidity: '70%' },
    { temp: '20\u00b0C', condition: 'Light Rain', icon: '\ud83c\udf27\ufe0f', humidity: '75%' },
    { temp: '25\u00b0C', condition: 'Sunny', icon: '\ud83c\udf1e', humidity: '40%' }
  ];
  var hour = new Date().getHours();
  return conditions[hour % conditions.length];
}

// Error boundary
function safeRender(fn) {
  try {
    return fn();
  } catch(e) {
    console.error('Render error:', e);
    return '<div class="error-boundary"><div class="error-boundary-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--risky)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div style="font-size:16px;font-weight:600;">Something went wrong</div><div style="font-size:13px;color:var(--text-secondary);max-width:260px;">' + (e.message || 'An unexpected error occurred') + '</div><button class="btn btn-primary" onclick="navigate(\'home\')">Go Home</button></div>';
  }
}

// Pull to refresh
var pullStartY = 0;
var pullDist = 0;
var isPulling = false;
var isRefreshing = false;

function initPullToRefresh(container) {
  if (!container) return;
  container.addEventListener('touchstart', function(e) {
    if (container.scrollTop <= 0 && !isRefreshing) {
      pullStartY = e.touches[0].clientY;
      isPulling = true;
    }
  }, {passive:true});
  container.addEventListener('touchmove', function(e) {
    if (!isPulling) return;
    pullDist = e.touches[0].clientY - pullStartY;
    if (pullDist > 0 && container.scrollTop <= 0) {
      var indicator = document.getElementById('pull-indicator');
      if (indicator) {
        indicator.classList.toggle('visible', pullDist > 60);
        var svg = indicator.querySelector('svg');
        if (svg) svg.style.transform = 'rotate(' + Math.min(pullDist * 3, 360) + 'deg)';
      }
    }
  }, {passive:true});
  container.addEventListener('touchend', function() {
    if (isPulling && pullDist > 60 && !isRefreshing) {
      isRefreshing = true;
      var indicator = document.getElementById('pull-indicator');
      if (indicator) { indicator.classList.add('refreshing'); indicator.classList.add('visible'); }
      Store.refreshMatches().then(function() {
        isRefreshing = false;
        pullDist = 0;
        isPulling = false;
        if (indicator) { indicator.classList.remove('refreshing'); indicator.classList.remove('visible'); }
        renderScreen(currentScreen);
        showToast(t('refreshing'));
      });
    } else {
      isPulling = false;
      pullDist = 0;
      var indicator = document.getElementById('pull-indicator');
      if (indicator) indicator.classList.remove('visible');
    }
  });
}

// Lazy loading support (code splitting awareness)
var loadedScreens = {};
function lazyLoadScreen(screenId, renderFn) {
  if (!loadedScreens[screenId]) {
    loadedScreens[screenId] = true;
  }
  return renderFn();
}

// Navigation
function navigate(screenId, data) {
  if (screenId !== currentScreen) screenHistory.push(currentScreen);
  currentScreen = screenId;
  document.querySelectorAll('.nav-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.tab === screenId);
  });
  renderScreen(screenId, data);
  window.scrollTo({ top: 0 });
}

function navigateBack() {
  if (screenHistory.length === 0) { navigate('home'); return; }
  var prev = screenHistory.pop();
  currentScreen = prev;
  document.querySelectorAll('.nav-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.tab === prev);
  });
  renderScreen(prev);
  window.scrollTo({ top: 0 });
}

function renderScreen(screenId, data) {
  var main = document.getElementById('main-content');
  if (!main) return;
  var html = '';
  try {
    switch (screenId) {
      case 'home':                 html = renderHomeScreen(); break;
      case 'competitions':         html = renderCompetitionsScreen(); break;
      case 'worldcup':            html = renderWorldCupScreen(); break;
      case 'predictions':         html = renderPredictionsScreen(); break;
      case 'news':                 html = renderNewsScreen(); break;
      case 'profile':              html = renderProfileScreen(); break;
      case 'fixtures':             html = renderFixturesScreen(); break;
      case 'stats':                html = renderStatsScreen(); break;
      case 'match-detail':         html = renderMatchDetailScreen(data); break;
      case 'pred-detail':          html = renderPredDetailScreen(data); break;
      case 'team-profile':         html = renderTeamProfileScreen(data); break;
      case 'comparison':           html = renderComparisonScreen(data && data.a, data && data.b); break;
      case 'search':               html = renderSearchScreen(); break;
      case 'notifications-screen': html = renderNotificationsScreen(); break;
      case 'saved':                html = renderSavedScreen(); break;
      case 'favorites':            html = renderFavoritesScreen(); break;
      case 'settings':             html = renderSettingsScreen(); break;
      case 'news-detail':          html = renderNewsDetailScreen(data); break;
      case 'standings':            html = renderStandingsScreen(data); break;
      case 'wc-match-detail':      html = renderWCMatchDetailScreen(data); break;
      default:                     html = renderHomeScreen(); break;
    }
    html = safeRender(function(){ return html; });
  } catch(e) {
    html = '<div class="error-boundary"><div class="error-boundary-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--risky)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div style="font-size:16px;font-weight:600;">Something went wrong</div><div style="font-size:13px;color:var(--text-secondary);">Please try again</div><button class="btn btn-primary" onclick="navigate(\'home\')">Go Home</button></div>';
  }
  main.innerHTML = '<div class="screen active">' + html + '</div>';
  setTodayDate();
  attachScreenListeners();

  if (screenId === 'home') {
    // Silent auto-refresh only — no pull-to-refresh
  }
}

function attachScreenListeners() {
  var searchField = document.getElementById('search-field');
  if (searchField) {
    searchField.addEventListener('input', function() { handleSearch(this.value); });
  }
}

function openMatchDetail(id)  { navigate('match-detail', id); }
function openPredDetail(id)   { if(id) navigate('pred-detail', id); }
function openTeamProfile(name){ navigate('team-profile', name); }
function openComparison(a, b) { navigate('comparison', { a: a, b: b }); }
function openNewsDetail(id)   { navigate('news-detail', id); }
function openStandings(code)  { navigate('standings', code); }
function openWCMatchDetail(id){ navigate('wc-match-detail', id); }
function openFixtures()       { navigate('fixtures'); }
function openStats()          { navigate('stats'); }

function setWCFilter(val, el) {
  WC_FILTER = val;
  document.querySelectorAll('#wc-filter-chips .chip').forEach(function(c){ c.classList.remove('active'); });
  if (el) el.classList.add('active');
  renderScreen('worldcup');
}

function refreshHome() {
  Store.refreshMatches().then(function() {
    if (currentScreen === 'home') renderScreen('home');
  });
}

function savePrediction(id) {
  Store.savePrediction(id);
  showToast('Prediction saved');
}

function deleteSaved(id) {
  openConfirmModal('Delete this prediction?', 'This action cannot be undone.', function() {
    Store.removeSavedPrediction(id);
    showToast('Deleted');
    navigate('saved');
  });
}

function exportSaved()    { showToast('Export coming soon'); }
function saveComparison() { showToast('Comparison saved'); }
function swapTeams()      { showToast('Teams swapped'); }
function followTeam(name) { Store.addFavTeam(name); showToast(name + ' added to favourites'); }

function removeFavTeam(name) {
  Store.removeFavTeam(name);
  navigate('favorites');
}

function filterDate(val, el) {
  document.querySelectorAll('#date-chips .chip').forEach(function(c){ c.classList.remove('active'); });
  if (el) el.classList.add('active');
}

function filterMatchDate(val, el) {
  document.querySelectorAll('#match-date-chips .chip').forEach(function(c){ c.classList.remove('active'); });
  if (el) el.classList.add('active');
}

function handleSearch(val) {
  var res = document.getElementById('search-results');
  if (!res) return;
  if (!val.trim()) { res.innerHTML = ''; return; }
  var q = val.toLowerCase();
  var matches = Store.getMatches();
  var predictions = Store.getPredictions();
  var results = matches.filter(function(m){
    return m.home.toLowerCase().indexOf(q) > -1 || m.away.toLowerCase().indexOf(q) > -1 || m.league.toLowerCase().indexOf(q) > -1;
  });
  var predResults = predictions.filter(function(p){
    return p.home.toLowerCase().indexOf(q) > -1 || p.away.toLowerCase().indexOf(q) > -1;
  });
  var html = '';
  if (results.length) {
    html += '<div style="padding:8px 16px;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Matches</div>';
    html += results.slice(0,5).map(function(m){ return '<div class="list-row" onclick="openMatchDetail(\'' + m.id + '\')"><div><div style="font-size:14px;font-weight:500;">' + m.home + ' vs ' + m.away + '</div><div style="font-size:12px;color:var(--text-muted);">' + m.league + '</div></div>' + ICONS.chevronRight + '</div>'; }).join('');
    html += '</div>';
  }
  if (predResults.length) {
    html += '<div style="padding:8px 16px;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Predictions</div>';
    html += predResults.slice(0,5).map(function(p){ return '<div class="list-row" onclick="openPredDetail(\'' + p.id + '\')"><div><div style="font-size:14px;font-weight:500;">' + p.home + ' vs ' + p.away + '</div><div style="font-size:12px;color:var(--text-muted);">' + p.league + ' \u00b7 ' + p.confidence + '%</div></div>' + ICONS.chevronRight + '</div>'; }).join('');
    html += '</div>';
  }
  if (!results.length && !predResults.length) {
    html = '<div style="padding:40px 16px;text-align:center;color:var(--text-muted);">No results for "' + val + '"</div>';
  }
  res.innerHTML = html;
}

function openSearchResult(name) { showToast('Opening ' + name); }

function markRead(id) {
  Store.markNotificationRead(id);
  navigate('notifications-screen');
}

function clearAllNotifs() {
  Store.clearNotifications();
  navigate('notifications-screen');
  showToast('All notifications cleared');
}

function saveSettings() { showToast('Settings saved'); }
function resetSettings() { openConfirmModal('Reset settings?','All preferences will be restored to defaults.',function(){ showToast('Settings reset to defaults'); }); }
function openEditProfile() { showToast('Edit profile coming soon'); }
function signOut() { openConfirmModal('Sign out?','You will be returned to the welcome screen.',function(){ showToast('Signed out'); setTimeout(showOnboarding,400); }); }
function openAddTeamModal() { openModal('team-select-modal'); }

var toastTimer = null;
function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 2400);
}

var confirmCallback = null;
function openConfirmModal(title, body, onConfirm) {
  confirmCallback = onConfirm;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-body').textContent  = body;
  openModal('confirm-modal');
}
function confirmAction() {
  closeModal('confirm-modal');
  if (confirmCallback) { confirmCallback(); confirmCallback = null; }
}

function openFilterDrawer() {
  document.getElementById('filter-drawer').classList.add('open');
  document.getElementById('filter-drawer-overlay').classList.add('open');
}
function closeFilterDrawer() {
  document.getElementById('filter-drawer').classList.remove('open');
  document.getElementById('filter-drawer-overlay').classList.remove('open');
}

function openTeamSelectModal() { openModal('team-select-modal'); }

function openModal(id) { var el = document.getElementById(id); if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; } }
function closeModal(id) { var el = document.getElementById(id); if (el) { el.classList.remove('open'); document.body.style.overflow = ''; } }

function setTodayDate() {
  var el = document.getElementById('today-date');
  if (el) el.textContent = new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
}

function renderLoadingState() {
  var skels = '';
  for (var i = 0; i < 3; i++) {
    skels += '<div class="skeleton skeleton-card" style="animation-delay:' + (i*80) + 'ms;"></div>';
  }
  return '<div style="padding:0 16px;">' +
    '<div class="skeleton skeleton-live" style="margin-bottom:16px;"></div>' +
    '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:10px;">Loading matches...</div>' +
    skels +
    '</div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
}

function renderErrorState(msg) {
  return '<div class="empty-state"><div class="empty-icon" style="background:rgba(244,63,94,0.1);"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--risky)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div class="empty-title">Something went wrong</div><div class="empty-desc">' + (msg || 'Failed to load data. Check your connection and try again.') + '</div><button class="btn btn-primary" onclick="Store.fetchAllData();navigate(\'home\')">Retry</button></div>';
}