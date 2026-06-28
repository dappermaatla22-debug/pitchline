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
    case 'news':                 html = renderNewsScreen(); break;
    case 'profile':              html = renderProfileScreen(); break;
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

function filterConf(val, el) {
  document.querySelectorAll('#conf-chips .chip').forEach(function(c){ c.classList.remove('active'); });
  if (el) el.classList.add('active');
}

function filterMatchDate(val, el) {
  document.querySelectorAll('#match-date-chips .chip').forEach(function(c){ c.classList.remove('active'); });
  if (el) el.classList.add('active');
}

function filterWCStatus(val, el) {
  document.querySelectorAll('.chip-row .chip').forEach(function(c){ c.classList.remove('active'); });
  if (el) el.classList.add('active');
}

function handleSearch(val) {
  var res = document.getElementById('search-results');
  if (!res) return;
  if (!val.trim()) { res.innerHTML = ''; return; }
  var q = val.toLowerCase();
  var matches = Store.getMatches();
  var results = matches.filter(function(m){
    return m.home.toLowerCase().indexOf(q) > -1 || m.away.toLowerCase().indexOf(q) > -1 || m.league.toLowerCase().indexOf(q) > -1;
  });
  if (results.length) {
    res.innerHTML = '<div style="padding:8px 16px;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Results</div>'
      + results.slice(0,10).map(function(m){ return '<div class="list-row" onclick="openMatchDetail(\'' + m.id + '\')"><div><div style="font-size:14px;font-weight:500;">' + m.home + ' vs ' + m.away + '</div><div style="font-size:12px;color:var(--text-muted);">' + m.league + '</div></div>' + ICONS.chevronRight + '</div>'; }).join('')
      + '</div>';
  } else {
    res.innerHTML = '<div style="padding:40px 16px;text-align:center;color:var(--text-muted);">No results for "' + val + '"</div>';
  }
}

function openSearchResult(name) {
  showToast('Opening ' + name);
}

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
  return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;"><div style="width:40px;height:40px;border:3px solid var(--bg-elevated);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:16px;"></div><div style="font-size:14px;color:var(--text-muted);">Loading matches...</div></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
}

function renderErrorState(msg) {
  return '<div class="empty-state"><div class="empty-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--risky)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div class="empty-title">Something went wrong</div><div class="empty-desc">' + (msg || 'Failed to load data. Please try again.') + '</div><button class="btn btn-primary" onclick="    Store.fetchAllData();
    Store.fetchWorldCupData();navigate(\'home\')">Retry</button></div>';
}

function renderEmptyState(icon, title, desc, btnLabel, btnAction) {
  return '<div class="empty-state"><div class="empty-icon">' + (ICONS[icon] || '') + '</div><div class="empty-title">' + title + '</div><div class="empty-desc">' + desc + '</div>' + (btnLabel ? '<button class="btn btn-primary" onclick="' + btnAction + '">' + btnLabel + '</button>' : '') + '</div>';
}