var currentScreen = 'home';
var screenHistory = [];

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
  main.innerHTML = '<div class="screen active">' + html + '</div>';
  setTodayDate();
  attachScreenListeners();
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
  showToast('Refreshing matches...');
  Store.refreshMatches().then(function() {
    if (currentScreen === 'home') navigate('home');
    showToast('Matches updated');
  }).catch(function() {
    showToast('Refresh failed');
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
function sharePred(id)    { showToast('Share link copied'); }
function shareMatch(id)   { showToast('Share link copied'); }
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

function saveSettings()  { showToast('Settings saved'); }
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