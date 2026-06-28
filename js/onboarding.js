var onboardStep = 1;
var ONBOARD_TOTAL = 5;
var selectedTeams = [];
var selectedLeagues = [];

var ONBOARD_CONTENT = [
  { icon:'target', title:'Welcome to Pitchline', body:'The smartest way to find high-confidence football predictions. Built on multiple AI models working in agreement.', action:null },
  { icon:'heart',  title:'Pick Your Teams',      body:'Follow the teams you care about for personalised predictions and alerts.', action:'team-select' },
  { icon:'globe',  title:'Select Your Leagues',  body:'Focus your feed on the competitions that matter most to you.', action:'league-select' },
  { icon:'bell',   title:'Enable Alerts',         body:'Get notified when elite picks drop \u2014 before the match starts.', action:'notif-enable' },
  { icon:'zap',    title:"You're all set",        body:'Pitchline is ready. Your first picks are waiting.', action:null }
];

var TEAM_OPTIONS = ['Arsenal','Chelsea','Liverpool','Man City','Man United','Real Madrid','Barcelona','Bayern Munich','PSG','Inter Milan','Juventus','Dortmund'];
var LEAGUE_OPTIONS = [
  {name:'Premier League',flag:'\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f'},{name:'La Liga',flag:'\ud83c\uddea\ud83c\uddf8'},
  {name:'Bundesliga',flag:'\ud83c\udde9\ud83c\uddea'},{name:'Serie A',flag:'\ud83c\uddee\ud83c\uddf9'},
  {name:'Ligue 1',flag:'\ud83c\uddeb\ud83c\uddf7'},{name:'Champions League',flag:'\ud83c\udfc6'},
  {name:'MLS',flag:'\ud83c\uddfa\ud83c\uddf8'},{name:'Eredivisie',flag:'\ud83c\uddf3\ud83c\uddf1'}
];

function showOnboarding() {
  onboardStep = 1;
  renderOnboardStep();
  document.getElementById('onboarding').style.display = 'flex';
  document.querySelector('.bottom-nav').style.display = 'none';
}

function hideOnboarding() {
  document.getElementById('onboarding').style.display = 'none';
  document.querySelector('.bottom-nav').style.display = 'flex';
  localStorage.setItem('pitchline-onboarded','1');
}

function renderOnboardStep() {
  var step = ONBOARD_CONTENT[onboardStep - 1];
  var el = document.getElementById('onboarding');
  var dots = '';
  for (var i = 0; i < ONBOARD_TOTAL; i++) {
    dots += '<div class="step-dot '+(i+1===onboardStep?'active':'')+'"></div>';
  }

  var actionHtml = '';
  if (step.action === 'team-select') {
    actionHtml = '<div style="width:100%;margin:8px 0 16px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">'
      + TEAM_OPTIONS.map(function(t){ return '<button class="chip '+(selectedTeams.indexOf(t)>-1?'active':'')+'" onclick="toggleTeam(\''+t+'\')">'+t+'</button>'; }).join('')
      + '</div>';
  } else if (step.action === 'league-select') {
    actionHtml = '<div style="width:100%;margin:8px 0 16px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">'
      + LEAGUE_OPTIONS.map(function(l){ return '<button class="chip '+(selectedLeagues.indexOf(l.name)>-1?'active':'')+'" onclick="toggleLeague(\''+l.name+'\')">'+l.flag+' '+l.name+'</button>'; }).join('')
      + '</div>';
  } else if (step.action === 'notif-enable') {
    actionHtml = '<div style="width:100%;margin:8px 0 16px;"><div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;"><div class="settings-row"><div><div class="settings-label">Elite Pick Alerts</div></div><label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label></div><div class="settings-row"><div><div class="settings-label">Upset Alerts</div></div><label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label></div><div class="settings-row"><div><div class="settings-label">Match Reminders</div></div><label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label></div></div></div>';
  }

  var iconInner = (ICONS[step.icon]||'').replace(/<svg[^>]*>/,'').replace(/<\/svg>/,'');

  el.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;width:100%;max-width:360px;">'
    +'<div style="display:flex;gap:6px;margin-bottom:48px;">'+dots+'</div>'
    +'<div style="width:72px;height:72px;background:var(--accent-dim);border:1px solid rgba(255,77,125,0.3);border-radius:var(--r-xl);display:flex;align-items:center;justify-content:center;margin-bottom:28px;"><svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" width="32" height="32">'+iconInner+'</svg></div>'
    +'<h1 style="font-size:26px;font-weight:700;letter-spacing:-0.8px;margin-bottom:14px;">'+step.title+'</h1>'
    +'<p style="font-size:16px;color:var(--text-secondary);line-height:1.6;max-width:300px;margin-bottom:28px;">'+step.body+'</p>'
    +actionHtml
    +'<div style="display:flex;flex-direction:column;gap:10px;width:100%;margin-top:auto;">'
    +'<button class="btn btn-primary btn-full" onclick="nextOnboardStep()" style="font-size:16px;padding:14px;">'+(onboardStep===ONBOARD_TOTAL?'Get Started':'Continue')+'</button>'
    +(onboardStep < ONBOARD_TOTAL ? '<button class="btn btn-ghost btn-full" onclick="skipOnboard()">Skip</button>' : '')
    +(onboardStep > 1 ? '<button class="btn btn-ghost btn-full" onclick="prevOnboardStep()">Back</button>' : '')
    +'</div></div>';
}

function nextOnboardStep() { if (onboardStep >= ONBOARD_TOTAL) { hideOnboarding(); return; } onboardStep++; renderOnboardStep(); }
function prevOnboardStep() { if (onboardStep <= 1) return; onboardStep--; renderOnboardStep(); }
function skipOnboard() { hideOnboarding(); }
function toggleTeam(t) { var i = selectedTeams.indexOf(t); if(i>-1) selectedTeams.splice(i,1); else selectedTeams.push(t); renderOnboardStep(); }
function toggleLeague(l) { var i = selectedLeagues.indexOf(l); if(i>-1) selectedLeagues.splice(i,1); else selectedLeagues.push(l); renderOnboardStep(); }