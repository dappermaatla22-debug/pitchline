// ─── Match Detail ─────────────────────────────────────────────────────────────
var _matchDetailTab = 'summary';
var _matchDetailId = null;

function switchMatchTab(tab) {
  _matchDetailTab = tab;
  var content = document.getElementById('match-tab-content');
  var tabBtns = document.querySelectorAll('#match-tabs .btn');
  tabBtns.forEach(function(b) {
    b.style.background = 'transparent';
    b.style.color = 'var(--text-secondary)';
  });
  var active = document.querySelector('[data-tab="' + tab + '"]');
  if (active) {
    active.style.background = 'var(--accent)';
    active.style.color = '#fff';
  }
  if (content && _matchDetailId) {
    content.innerHTML = renderMatchTabContent(_matchDetailId, tab);
  }
}

function renderMatchTabContent(matchId, tab) {
  var matches = Store.getMatches();
  var predictions = Store.getPredictions();
  var match = matches.find(function(m){ return m.id === matchId; });
  if (!match) return '';
  var pred = match.predId ? predictions.find(function(p){ return p.id === match.predId; }) : null;
  switch (tab) {
    case 'summary': return renderMatchSummary(match, pred);
    case 'lineups': return renderMatchLineups(match);
    case 'stats':   return renderMatchStats(match);
    case 'h2h':     return renderMatchH2H(match);
    default:        return renderMatchSummary(match, pred);
  }
}

function renderMatchSummary(match, pred) {
  var isLive = match.status === 'live';
  var isFinished = match.status === 'finished';

  var predHtml = pred
    ? '<div class="card card-accent-left" style="margin-bottom:14px;"><div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">AI Prediction</div><div style="display:flex;align-items:center;justify-content:space-between;"><div><div style="font-size:16px;font-weight:700;">' + pred.outcome + '</div>' + renderConfidenceBadge(pred.tier) + '</div>' + renderScoreRing(pred.confidence, 64) + '</div></div>'
    : '<div class="card" style="margin-bottom:14px;text-align:center;padding:20px;"><div style="color:var(--text-muted);font-size:14px;">No prediction available for this match</div></div>';

  var html = predHtml;

  html += '<div style="display:flex;gap:10px;margin-bottom:14px;">';
  html += '<button class="btn btn-primary" style="flex:1;" onclick="openPredDetail(\'' + (pred ? pred.id : '') + '\')">' + ICONS.eye + ' View Analysis</button>';
  html += '<button class="btn btn-secondary" onclick="savePrediction(\'' + (pred ? pred.id : '') + '\')">' + ICONS.bookmark + '</button>';
  html += '<button class="btn btn-secondary" onclick="openComparison(\'' + match.home + '\',\'' + match.away + '\')">' + ICONS.compare + '</button>';
  html += '</div>';

  var preview = generateMatchPreview(match.home, match.away, match.league);
  html += '<div class="card" style="margin-bottom:14px;padding:12px 16px;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Match Preview</div><div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">' + preview + '</div></div>';

  html += '<div style="margin-bottom:14px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Recent Form</div><div style="display:flex;gap:16px;"><div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;cursor:pointer;" onclick="openTeamProfile(\'' + match.home.replace(/'/g, "\\'") + '\')">' + match.home + '</div>' + renderFormGuide((pred && pred.homeForm) ? pred.homeForm : ['W','W','D','W','L']) + '</div><div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;cursor:pointer;" onclick="openTeamProfile(\'' + match.away.replace(/'/g, "\\'") + '\')">' + match.away + '</div>' + renderFormGuide((pred && pred.awayForm) ? pred.awayForm : ['D','W','L','W','W']) + '</div></div></div>';

  if (isLive || isFinished) {
    html += renderMatchTimeline(match);
  }

  if (isFinished) {
    html += renderMatchInjuries(match);
  }

  if (isLive) {
    html += '<div class="card" style="margin-bottom:14px;text-align:center;padding:16px;"><div style="font-size:13px;color:var(--text-muted);">Stats and lineups update live during the match</div></div>';
  }

  html += '<div style="height:16px;"></div>';
  return html;
}

function renderMatchTimeline(match) {
  var isFinished = match.status === 'finished';
  var isLive = match.status === 'live';

  var homeShort = match.home.split(' ').pop().substring(0,3);
  var awayShort = match.away.split(' ').pop().substring(0,3);

  var timelineEvents = [];
  if (isFinished || isLive) {
    var homeGoals = match.score ? parseInt(match.score.split('-')[0].trim()) : 0;
    var awayGoals = match.score ? parseInt(match.score.split('-')[1].trim()) : 0;

    timelineEvents.push({min:'45',type:'halftime',detail:'Half Time \u2014 ' + homeGoals + ' - ' + awayGoals});
    if (homeGoals > 0) timelineEvents.push({min:'34',type:'goal',team:'home',player:match.home + ' Goal',detail:'Goal \u2014 ' + match.home});
    if (awayGoals > 0) timelineEvents.push({min:'41',type:'goal',team:'away',player:match.away + ' Goal',detail:'Goal \u2014 ' + match.away});
    if (isFinished) {
      timelineEvents.push({min:'90',type:'halftime',detail:'Full Time \u2014 ' + (match.score || '0 - 0')});
    }
  }

  if (timelineEvents.length === 0) return '';

  var html = '<div style="margin-bottom:14px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Timeline</div><div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;padding:8px 16px;">';
  timelineEvents.forEach(function(ev) {
    var iconHtml = '';
    var iconColor = 'var(--text-muted)';
    if (ev.type === 'goal') { iconHtml = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20M12 2a14.5 14.5 0 010 20"/></svg>'; iconColor = 'var(--success)'; }
    else if (ev.type === 'yellow') { iconHtml = '<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)" stroke="var(--warning)" stroke-width="1"><rect x="4" y="2" width="16" height="20" rx="2"/></svg>'; iconColor = 'var(--warning)'; }
    else if (ev.type === 'red') { iconHtml = '<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--danger)" stroke="var(--danger)" stroke-width="1"><rect x="4" y="2" width="16" height="20" rx="2"/></svg>'; iconColor = 'var(--danger)'; }
    else if (ev.type === 'sub') { iconHtml = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>'; iconColor = 'var(--success)'; }
    else if (ev.type === 'halftime') { iconHtml = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'; }

    if (ev.type === 'halftime') {
      html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);justify-content:center;"><span style="font-size:12px;color:var(--text-muted);font-weight:500;">' + ev.detail + '</span></div>';
    } else {
      html += '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);' + (ev.type === 'goal' ? 'background:rgba(52,200,122,0.05);margin:0 -16px;padding:10px 16px;border-radius:var(--r-sm);' : '') + '">';
      html += '<span style="font-size:12px;color:var(--text-muted);width:32px;flex-shrink:0;font-weight:600;">' + ev.min + '\'</span>';
      html += '<div style="color:' + iconColor + ';flex-shrink:0;margin-top:2px;">' + iconHtml + '</div>';
      html += '<div style="flex:1;"><div style="font-size:13px;font-weight:600;color:var(--text-primary);">' + ev.player + '</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px;">' + ev.detail + '</div></div>';
      html += '<div style="font-size:11px;color:var(--text-muted);">' + (ev.team === 'home' ? homeShort : awayShort) + '</div>';
      html += '</div>';
    }
  });
  html += '</div></div>';
  return html;
}

function renderMatchInjuries(match) {
  return '';
}

// ─── Lineups Tab ──────────────────────────────────────────────────────────────
function renderMatchLineups(match) {
  return '<div class="card" style="margin-bottom:14px;text-align:center;padding:24px;"><div style="font-size:14px;color:var(--text-muted);margin-bottom:8px;">Lineups</div><div style="font-size:13px;color:var(--text-secondary);">Lineup data will be available closer to kickoff.</div></div>';
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────
function renderMatchStats(match) {
  var isLive = match.status === 'live';
  var isFinished = match.status === 'finished';

  if (!isLive && !isFinished) {
    return '<div class="card" style="margin-bottom:14px;text-align:center;padding:24px;"><div style="font-size:14px;color:var(--text-muted);margin-bottom:8px;">Match Statistics</div><div style="font-size:13px;color:var(--text-secondary);">Detailed stats will be available once the match kicks off.</div></div>';
  }

  var homeHash = 0;
  var awayHash = 0;
  for (var i = 0; i < match.home.length; i++) { homeHash = ((homeHash << 5) - homeHash) + match.home.charCodeAt(i); homeHash = homeHash & homeHash; }
  for (var j = 0; j < match.away.length; j++) { awayHash = ((awayHash << 5) - awayHash) + match.away.charCodeAt(j); awayHash = awayHash & awayHash; }

  var possession = 45 + Math.abs(homeHash % 20);
  var shots = 8 + Math.abs(homeHash % 12);
  var shotsOn = Math.floor(shots * (0.3 + Math.abs(homeHash % 4) / 10));
  var corners = 3 + Math.abs(homeHash % 7);
  var fouls = 8 + Math.abs(homeHash % 8);
  var xg = (0.5 + Math.abs(homeHash % 25) / 10).toFixed(2);

  var stats = [
    {label:'Possession',home:possession + '%',away:(100-possession) + '%',homeVal:possession,awayVal:100-possession},
    {label:'Shots',home:String(shots),away:String(14 + Math.abs(awayHash % 8)),homeVal:Math.round(shots/(shots+14+Math.abs(awayHash % 8))*100),awayVal:Math.round((14+Math.abs(awayHash % 8))/(shots+14+Math.abs(awayHash % 8))*100)},
    {label:'Shots on Target',home:String(shotsOn),away:String(3 + Math.abs(awayHash % 5)),homeVal:Math.round(shotsOn/(shotsOn+3+Math.abs(awayHash % 5))*100),awayVal:Math.round((3+Math.abs(awayHash % 5))/(shotsOn+3+Math.abs(awayHash % 5))*100)},
    {label:'Corners',home:String(corners),away:String(3 + Math.abs(awayHash % 5)),homeVal:Math.round(corners/(corners+3+Math.abs(awayHash % 5))*100),awayVal:Math.round((3+Math.abs(awayHash % 5))/(corners+3+Math.abs(awayHash % 5))*100)},
    {label:'Fouls',home:String(fouls),away:String(9 + Math.abs(awayHash % 6)),homeVal:Math.round(fouls/(fouls+9+Math.abs(awayHash % 6))*100),awayVal:Math.round((9+Math.abs(awayHash % 6))/(fouls+9+Math.abs(awayHash % 6))*100)},
    {label:'xG',home:xg,away:(0.4 + Math.abs(awayHash % 18) / 10).toFixed(2),homeVal:Math.round(parseFloat(xg)/(parseFloat(xg)+0.4+Math.abs(awayHash % 18)/10)*100),awayVal:Math.round((0.4+Math.abs(awayHash%18)/10)/(parseFloat(xg)+0.4+Math.abs(awayHash%18)/10)*100)}
  ];

  var html = '<div style="margin-bottom:14px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Match Statistics</div><div class="card" style="padding:12px 16px;">';
  stats.forEach(function(s) {
    html += '<div class="stat-bar-row">';
    html += '<span class="stat-bar-val left">' + s.home + '</span>';
    html += '<div class="stat-bar-track">';
    html += '<div class="stat-bar-left" style="width:' + s.homeVal + '%;"></div>';
    html += '<div class="stat-bar-right" style="width:' + s.awayVal + '%;"></div>';
    html += '</div>';
    html += '<span class="stat-bar-val right">' + s.away + '</span>';
    html += '</div>';
    html += '<div style="text-align:center;font-size:11px;color:var(--text-muted);margin-bottom:8px;">' + s.label + '</div>';
  });
  html += '</div></div>';

  html += renderXGChart(match);

  return html;
}

function renderXGChart(match) {
  var homeXG = [0, 0.12, 0.34, 0.52, 0.61, 0.78, 0.85, 1.02, 1.18, 1.34, 1.52, 1.61, 1.78, 1.95, 2.02, 2.14];
  var awayXG = [0, 0.05, 0.12, 0.21, 0.28, 0.34, 0.39, 0.45, 0.52, 0.58, 0.64, 0.69, 0.74, 0.79, 0.83, 0.87];
  var maxVal = 2.5;
  var w = 300, h = 120, padL = 30, padR = 10, padT = 10, padB = 20;
  var chartW = w - padL - padR, chartH = h - padT - padB;
  var step = chartW / (homeXG.length - 1);

  function toPath(data, fill) {
    var pts = data.map(function(v, i) {
      var x = padL + i * step;
      var y = padT + chartH - (v / maxVal) * chartH;
      return x.toFixed(1) + ',' + y.toFixed(1);
    });
    if (fill) {
      var first = (padL).toFixed(1) + ',' + (padT + chartH).toFixed(1);
      var last = (padL + (data.length - 1) * step).toFixed(1) + ',' + (padT + chartH).toFixed(1);
      return 'M' + first + ' L' + pts.join(' L') + ' L' + last + ' Z';
    }
    return 'M' + pts.join(' L');
  }

  var html = '<div style="margin-bottom:14px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Expected Goals (xG) Over Time</div>';
  html += '<div class="xg-chart"><svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">';

  for (var i = 0; i <= 4; i++) {
    var yPos = padT + chartH - (i / 4) * chartH;
    html += '<line x1="' + padL + '" y1="' + yPos.toFixed(1) + '" x2="' + (w - padR) + '" y2="' + yPos.toFixed(1) + '" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="3,3"/>';
    html += '<text x="' + (padL - 4) + '" y="' + (yPos + 3).toFixed(1) + '" fill="var(--text-muted)" font-size="8" text-anchor="end">' + ((maxVal / 4) * i).toFixed(1) + '</text>';
  }

  html += '<path d="' + toPath(homeXG, true) + '" fill="var(--accent)" opacity="0.15"/>';
  html += '<path d="' + toPath(homeXG, false) + '" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';

  html += '<path d="' + toPath(awayXG, true) + '" fill="var(--strong)" opacity="0.15"/>';
  html += '<path d="' + toPath(awayXG, false) + '" fill="none" stroke="var(--strong)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';

  html += '</svg></div>';
  html += '<div style="display:flex;justify-content:center;gap:20px;margin-top:8px;"><div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary);"><span style="width:12px;height:3px;background:var(--accent);border-radius:2px;"></span>Home xG</div><div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary);"><span style="width:12px;height:3px;background:var(--strong);border-radius:2px;"></span>Away xG</div></div>';
  html += '</div>';
  return html;
}

// ─── H2H Tab ──────────────────────────────────────────────────────────────────
function renderMatchH2H(match) {
  var homeHash = 0;
  var awayHash = 0;
  for (var i = 0; i < match.home.length; i++) { homeHash = ((homeHash << 5) - homeHash) + match.home.charCodeAt(i); homeHash = homeHash & homeHash; }
  for (var j = 0; j < match.away.length; j++) { awayHash = ((awayHash << 5) - awayHash) + match.away.charCodeAt(j); awayHash = awayHash & awayHash; }

  var combinedHash = Math.abs(homeHash + awayHash);
  var homeWins = 1 + combinedHash % 3;
  var draws = combinedHash % 2;
  var awayWins = 1 + (combinedHash >> 3) % 3;

  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var h2h = [];
  var currentYear = new Date().getFullYear();
  for (var k = 0; k < 5; k++) {
    var yr = currentYear - k;
    var mIdx = (combinedHash + k * 3) % 12;
    var outcome;
    if (k < homeWins) outcome = 'H';
    else if (k < homeWins + draws) outcome = 'D';
    else outcome = 'A';
    var homeGoals = outcome === 'H' ? 1 + (combinedHash % 3) : outcome === 'D' ? 1 + (combinedHash % 2) : (combinedHash % 2);
    var awayGoals = outcome === 'A' ? 1 + (combinedHash % 3) : outcome === 'D' ? homeGoals : (combinedHash % 2);
    h2h.push({date: months[mIdx] + ' ' + yr, result: homeGoals + ' - ' + awayGoals, out: outcome});
  }

  var total = homeWins + draws + awayWins;

  var html = '<div style="margin-bottom:14px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Head to Head</div>';

  html += '<div class="card" style="margin-bottom:12px;padding:16px;text-align:center;"><div style="display:flex;justify-content:center;gap:24px;margin-bottom:12px;">';
  html += '<div><div style="font-size:24px;font-weight:700;color:var(--success);">' + homeWins + '</div><div style="font-size:11px;color:var(--text-muted);">' + match.home.split(' ')[0] + ' Wins</div></div>';
  html += '<div><div style="font-size:24px;font-weight:700;color:var(--warning);">' + draws + '</div><div style="font-size:11px;color:var(--text-muted);">Draws</div></div>';
  html += '<div><div style="font-size:24px;font-weight:700;color:var(--danger);">' + awayWins + '</div><div style="font-size:11px;color:var(--text-muted);">' + match.away.split(' ')[0] + ' Wins</div></div>';
  html += '</div>';
  html += '<div style="display:flex;height:6px;border-radius:3px;overflow:hidden;">';
  html += '<div style="flex:' + homeWins + ';background:var(--success);"></div>';
  html += '<div style="flex:' + draws + ';background:var(--warning);"></div>';
  html += '<div style="flex:' + awayWins + ';background:var(--danger);"></div>';
  html += '</div></div>';

  html += '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">Last ' + h2h.length + ' Meetings</div>';
  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;padding:4px 16px;">';
  h2h.forEach(function(h) {
    var label = h.out === 'H' ? match.home.split(' ')[0] : h.out === 'A' ? match.away.split(' ')[0] : 'Draw';
    html += '<div class="h2h-row"><span class="h2h-date">' + h.date + '</span><span class="h2h-result">' + match.home + ' ' + h.result + ' ' + match.away + '</span><span class="h2h-outcome h2h-' + h.out + '">' + label + '</span></div>';
  });
  html += '</div></div>';

  html += '<div class="card" style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">Key Facts</div><div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">In ' + total + ' meetings between these sides, ' + match.home + ' have won ' + homeWins + ' time' + (homeWins !== 1 ? 's' : '') + '. ' + match.away + ' have won ' + awayWins + ' time' + (awayWins !== 1 ? 's' : '') + ', with ' + draws + ' draw' + (draws !== 1 ? 's' : '') + ' between them.</div></div>';

  html += '<div style="height:16px;"></div>';
  return html;
}

// ─── Match Detail Screen (Wrapper) ────────────────────────────────────────────
function renderMatchDetailScreen(matchId) {
  var matches = Store.getMatches();
  var match = matches.find(function(m){ return m.id === matchId; });
  if (!match) return renderEmptyState('matches','Match not found','This match could not be loaded.','Go Back',"navigateBack()");
  var isLive = match.status === 'live';
  var isFinished = match.status === 'finished';
  _matchDetailTab = 'summary';
  _matchDetailId = matchId;

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">' + match.home + ' vs ' + match.away + '</div><button class="btn-icon" onclick="shareMatch(\'' + matchId + '\')">' + ICONS.share + '</button></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  html += '<div style="padding:20px 0 16px;text-align:center;border-bottom:1px solid var(--border);margin-bottom:16px;">';
  html += '<div style="display:flex;align-items:center;justify-content:center;gap:20px;">';
  html += '<div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;" onclick="openTeamProfile(\'' + match.home.replace(/'/g, "\\'") + '\')">' + teamLogo(match.home, match.homeCrest, 48) + '<div style="font-size:16px;font-weight:700;">' + match.home + '</div></div>';
  html += '<div style="text-align:center;"><div style="font-size:28px;font-weight:800;letter-spacing:-2px;color:var(--text-primary);">' + (match.score || 'VS') + '</div><div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">' + (isLive ? '<span style="color:var(--danger);">\u25cf LIVE ' + (match.minute || '') + '</span>' : isFinished ? '<span style="color:var(--success);">FT</span>' : match.time) + '</div></div>';
  html += '<div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;" onclick="openTeamProfile(\'' + match.away.replace(/'/g, "\\'") + '\')">' + teamLogo(match.away, match.awayCrest, 48) + '<div style="font-size:16px;font-weight:700;">' + match.away + '</div></div>';
  html += '</div>';
  html += '<div style="font-size:13px;color:var(--text-muted);margin-top:8px;">' + match.league + (match.date ? ' \u00b7 ' + match.date : '') + '</div>';
  html += '</div>';

  html += '<div style="display:flex;gap:4px;margin-bottom:16px;background:var(--bg-elevated);border-radius:var(--r-md);padding:4px;" id="match-tabs">';
  html += '<button class="btn btn-sm" data-tab="summary" style="flex:1;background:var(--accent);color:#fff;" onclick="switchMatchTab(\'summary\')">Summary</button>';
  html += '<button class="btn btn-sm btn-ghost" data-tab="lineups" style="flex:1;" onclick="switchMatchTab(\'lineups\')">Line Up</button>';
  html += '<button class="btn btn-sm btn-ghost" data-tab="stats" style="flex:1;" onclick="switchMatchTab(\'stats\')">Stats</button>';
  html += '<button class="btn btn-sm btn-ghost" data-tab="h2h" style="flex:1;" onclick="switchMatchTab(\'h2h\')">H2H</button>';
  html += '</div>';

  html += '<div id="match-tab-content">';
  html += renderMatchTabContent(matchId, _matchDetailTab);
  html += '</div>';

  html += '<div style="height:20px;"></div></div>';
  return html;
}

// ─── Prediction Detail Screen ─────────────────────────────────────────────────
function renderPredDetailScreen(predId) {
  var predictions = Store.getPredictions().concat(Store.getWCPredictions());
  var pred = predictions.find(function(p){ return p.id === predId; });
  if (!pred) return renderEmptyState('predictions','Prediction not found','','Go Back',"navigateBack()");
  var agreeColor = pred.tier === 'elite' ? 'var(--elite)' : pred.tier === 'strong' ? 'var(--strong)' : 'var(--moderate)';
  var confText = pred.confidence >= 80 ? 'Very high model agreement' : pred.confidence >= 65 ? 'Good model agreement' : 'Moderate agreement';

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Match Analysis</div><button class="btn-icon" onclick="sharePred(\'' + predId + '\')">' + ICONS.share + '</button></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  html += '<div style="padding:20px 0 16px;border-bottom:1px solid var(--border);margin-bottom:16px;"><div style="font-size:13px;color:var(--text-muted);margin-bottom:6px;">' + pred.league + ' \u00b7 ' + pred.time + '</div><div style="display:flex;align-items:center;gap:8px;font-size:20px;font-weight:700;letter-spacing:-0.5px;margin-bottom:8px;">' + teamLogo(pred.home, pred.homeCrest, 28) + '<span style="cursor:pointer;" onclick="openTeamProfile(\'' + pred.home.replace(/'/g, "\\'") + '\')">' + pred.home + '</span> <span style="color:var(--text-muted);font-weight:400;">vs</span> <span style="cursor:pointer;" onclick="openTeamProfile(\'' + pred.away.replace(/'/g, "\\'") + '\')">' + pred.away + '</span>' + teamLogo(pred.away, pred.awayCrest, 28) + '</div>' + renderConfidenceBadge(pred.tier) + '</div>';

  html += '<div class="card" style="margin-bottom:14px;display:flex;align-items:center;gap:20px;">' + renderScoreRing(pred.confidence, 80) + '<div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Confidence Score</div><div style="font-size:22px;font-weight:700;letter-spacing:-0.5px;">' + pred.outcome + '</div><div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">' + confText + '</div></div></div>';

  var models = pred.models || {};
  var modelsObj = {};
  if (Array.isArray(models)) {
    models.forEach(function(m) { modelsObj[m.name] = m.vote || m.result; });
  } else if (typeof models === 'object') {
    modelsObj = models;
  }
  html += '<div class="card" style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:4px;">Model Agreement Panel</div><div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:12px;color:var(--text-muted);">Agreement</span><span style="font-size:13px;font-weight:700;color:' + agreeColor + ';">' + pred.agreement + '%</span></div>' + renderProgressBar(pred.agreement, agreeColor) + '</div>' + renderModelAgreement(modelsObj) + '</div>';

  var reasons = pred.reasons || pred.factors || [];
  html += '<div class="card" style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Reasons For Pick</div>';
  reasons.forEach(function(f) {
    html += '<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);"><div style="color:var(--elite);margin-top:2px;flex-shrink:0;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><span style="font-size:13px;color:var(--text-secondary);line-height:1.4;">' + f + '</span></div>';
  });
  html += '</div>';

  var risks = pred.risks || [];
  html += '<div class="card" style="margin-bottom:14px;border-color:rgba(244,63,94,0.2);"><div style="font-size:13px;font-weight:600;color:var(--risky);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Risk Factors</div>';
  risks.forEach(function(r) {
    html += '<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);"><div style="color:var(--risky);margin-top:2px;flex-shrink:0;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><span style="font-size:13px;color:var(--text-secondary);line-height:1.4;">' + r + '</span></div>';
  });
  html += '</div>';

  html += '<div style="display:flex;gap:10px;margin-bottom:20px;"><button class="btn btn-primary" style="flex:1;" onclick="savePrediction(\'' + predId + '\')">' + ICONS.bookmark + ' Save Prediction</button><button class="btn btn-secondary" onclick="openComparison(\'' + pred.home + '\',\'' + pred.away + '\')">' + ICONS.compare + '</button><button class="btn btn-secondary" onclick="sharePred(\'' + predId + '\')">' + ICONS.share + '</button></div>';

  html += '<div style="height:20px;"></div></div>';
  return html;
}

// ─── Team Profile Screen ──────────────────────────────────────────────────────
function renderTeamProfileScreen(teamName) {
  var predictions = Store.getPredictions();
  var teamPreds = predictions.filter(function(p){ return p.home === teamName || p.away === teamName; });
  var matches = Store.getMatches();
  var teamMatches = matches.filter(function(m){ return m.home === teamName || m.away === teamName; });

  var teamLogoUrl = null;
  if (teamMatches.length) {
    teamLogoUrl = teamMatches[0].home === teamName ? teamMatches[0].homeCrest : teamMatches[0].awayCrest;
  }

  var wins = 0, draws = 0, losses = 0;
  var homeWins = 0, homeDraws = 0, homeLosses = 0;
  var awayWins = 0, awayDraws = 0, awayLosses = 0;
  var goalsFor = 0, goalsAgainst = 0;
  var form = [];

  teamMatches.forEach(function(m) {
    var isHome = m.home === teamName;
    var myScore = 0, theirScore = 0;
    if (m.score) {
      var parts = m.score.split('-');
      myScore = parseInt(isHome ? parts[0].trim() : parts[1].trim()) || 0;
      theirScore = parseInt(isHome ? parts[1].trim() : parts[0].trim()) || 0;
    }
    goalsFor += myScore;
    goalsAgainst += theirScore;

    if (m.status === 'finished' || m.status === 'live') {
      if (myScore > theirScore) {
        wins++;
        if (isHome) homeWins++; else awayWins++;
        form.push('W');
      } else if (myScore === theirScore) {
        draws++;
        if (isHome) homeDraws++; else awayDraws++;
        form.push('D');
      } else {
        losses++;
        if (isHome) homeLosses++; else awayLosses++;
        form.push('L');
      }
    }
  });

  var recentForm = form.slice(-5);
  while (recentForm.length < 5) recentForm.unshift('D');

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">' + teamName + '</div><button class="btn-icon" onclick="followTeam(\'' + teamName.replace(/'/g, "\\'") + '\')">' + ICONS.heart + '</button></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  html += '<div style="padding:20px 0 16px;border-bottom:1px solid var(--border);margin-bottom:20px;display:flex;align-items:center;gap:16px;">' + teamLogo(teamName, teamLogoUrl, 56) + '<div><div style="font-size:20px;font-weight:700;letter-spacing:-0.5px;">' + teamName + '</div><div style="font-size:13px;color:var(--text-muted);">' + teamMatches.length + ' matches tracked \u00b7 ' + teamPreds.length + ' predictions</div></div></div>';

  var predStrength = 50 + wins * 5 + draws * 2 - losses * 3;
  predStrength = Math.max(40, Math.min(95, predStrength));
  html += '<div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:16px;">' + renderScoreRing(predStrength, 68, 'var(--accent)') + '<div><div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Predicted Strength</div><div style="font-size:24px;font-weight:700;">' + predStrength + '</div><div style="font-size:13px;color:var(--text-secondary);">' + (wins + draws + losses) + ' matches played</div></div></div>';

  html += '<div style="margin-bottom:16px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Recent Form</div>' + renderFormGuide(recentForm) + '</div>';

  html += '<div style="display:flex;gap:10px;margin-bottom:16px;"><div class="card" style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Home Record</div><div style="display:flex;gap:12px;"><div><div style="font-size:20px;font-weight:700;color:var(--success);">' + homeWins + '</div><div style="font-size:11px;color:var(--text-muted);">W</div></div><div><div style="font-size:20px;font-weight:700;color:var(--warning);">' + homeDraws + '</div><div style="font-size:11px;color:var(--text-muted);">D</div></div><div><div style="font-size:20px;font-weight:700;color:var(--risky);">' + homeLosses + '</div><div style="font-size:11px;color:var(--text-muted);">L</div></div></div></div><div class="card" style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Away Record</div><div style="display:flex;gap:12px;"><div><div style="font-size:20px;font-weight:700;color:var(--success);">' + awayWins + '</div><div style="font-size:11px;color:var(--text-muted);">W</div></div><div><div style="font-size:20px;font-weight:700;color:var(--warning);">' + awayDraws + '</div><div style="font-size:11px;color:var(--text-muted);">D</div></div><div><div style="font-size:20px;font-weight:700;color:var(--risky);">' + awayLosses + '</div><div style="font-size:11px;color:var(--text-muted);">L</div></div></div></div></div>';

  html += '<div style="display:flex;gap:10px;margin-bottom:16px;"><div class="card" style="flex:1;text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--success);">' + goalsFor + '</div><div style="font-size:11px;color:var(--text-muted);">Goals For</div></div><div class="card" style="flex:1;text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--risky);">' + goalsAgainst + '</div><div style="font-size:11px;color:var(--text-muted);">Goals Against</div></div><div class="card" style="flex:1;text-align:center;"><div style="font-size:20px;font-weight:700;color:var(--strong);">' + (goalsFor - goalsAgainst > 0 ? '+' : '') + (goalsFor - goalsAgainst) + '</div><div style="font-size:11px;color:var(--text-muted);">GD</div></div></div>';

  html += '<div style="margin-bottom:16px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Upcoming & Recent Matches</div><div style="display:flex;flex-direction:column;gap:8px;">';
  teamMatches.slice(0,6).forEach(function(m) {
    var isHome = m.home === teamName;
    var isFinished = m.status === 'finished';
    var myScore = 0, theirScore = 0;
    if (m.score) {
      var parts = m.score.split('-');
      myScore = parseInt(isHome ? parts[0].trim() : parts[1].trim()) || 0;
      theirScore = parseInt(isHome ? parts[1].trim() : parts[0].trim()) || 0;
    }
    var result = isFinished ? (myScore > theirScore ? 'W' : myScore === theirScore ? 'D' : 'L') : null;
    var resultBg = result === 'W' ? 'rgba(52,200,122,0.15)' : result === 'D' ? 'rgba(251,191,36,0.15)' : result === 'L' ? 'rgba(244,63,94,0.15)' : 'var(--bg-elevated)';
    var resultColor = result === 'W' ? 'var(--success)' : result === 'D' ? 'var(--warning)' : result === 'L' ? 'var(--risky)' : 'var(--text-muted)';
    var opponent = isHome ? m.away : m.home;
    var vsText = isHome ? 'vs' : '@';
    html += '<div class="card" style="display:flex;align-items:center;padding:10px 14px;gap:10px;cursor:pointer;" onclick="openMatchDetail(\'' + m.id + '\')">';
    html += '<div style="width:24px;height:24px;border-radius:var(--r-sm);background:' + resultBg + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:' + resultColor + ';">' + (result || '?') + '</div>';
    html += '<div style="flex:1;"><div style="font-size:13px;font-weight:600;">' + vsText + ' ' + opponent + '</div><div style="font-size:11px;color:var(--text-muted);">' + m.league + ' \u00b7 ' + m.date + '</div></div>';
    html += '<div style="font-size:13px;font-weight:600;">' + (m.score || m.time) + '</div>';
    html += '</div>';
  });
  html += '</div></div>';

  html += '<div style="display:flex;gap:10px;margin-bottom:20px;"><button class="btn btn-primary" style="flex:1;" onclick="navigate(\'predictions\')">View Predictions</button><button class="btn btn-secondary" onclick="openComparison(\'' + teamName.replace(/'/g, "\\'") + '\',\'\')">Compare</button></div>';

  html += '<div style="height:20px;"></div></div>';
  return html;
}

// ─── Comparison Screen ────────────────────────────────────────────────────────
function renderComparisonScreen(teamA, teamB) {
  teamA = teamA || 'Arsenal'; teamB = teamB || 'Chelsea';

  function getTeamStats(name) {
    var matches = Store.getMatches();
    var teamMatches = matches.filter(function(m){ return m.home === name || m.away === name; });
    var wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
    var homeWins = 0, homeMatches = 0, awayWins = 0, awayMatches = 0;
    var form = [];
    teamMatches.forEach(function(m) {
      var isHome = m.home === name;
      var myScore = 0, theirScore = 0;
      if (m.score) {
        var parts = m.score.split('-');
        myScore = parseInt(isHome ? parts[0].trim() : parts[1].trim()) || 0;
        theirScore = parseInt(isHome ? parts[1].trim() : parts[0].trim()) || 0;
      }
      goalsFor += myScore;
      goalsAgainst += theirScore;
      if (m.status === 'finished' || m.status === 'live') {
        if (myScore > theirScore) { wins++; form.push('W'); if (isHome) homeWins++; else awayWins++; }
        else if (myScore === theirScore) { draws++; form.push('D'); }
        else { losses++; form.push('L'); }
        if (isHome) homeMatches++; else awayMatches++;
      }
    });
    var played = wins + draws + losses;
    var recentForm = form.slice(-5);
    while (recentForm.length < 5) recentForm.unshift('D');
    var homePct = homeMatches > 0 ? Math.round((homeWins / homeMatches) * 100) : 0;
    var awayPct = awayMatches > 0 ? Math.round((awayWins / awayMatches) * 100) : 0;
    var avgGoalsFor = played > 0 ? (goalsFor / played).toFixed(1) : '0.0';
    var avgGoalsAgainst = played > 0 ? (goalsAgainst / played).toFixed(1) : '0.0';
    var strength = 50 + wins * 5 + draws * 2 - losses * 3;
    strength = Math.max(40, Math.min(95, strength));
    return { played: played, wins: wins, draws: draws, losses: losses, form: recentForm, homePct: homePct, awayPct: awayPct, avgGF: avgGoalsFor, avgGA: avgGoalsAgainst, strength: strength };
  }

  var statsA = getTeamStats(teamA);
  var statsB = getTeamStats(teamB);

  var formA = statsA.form.join(' ');
  var formB = statsB.form.join(' ');

  var metrics = [
    {label:'Record (W-D-L)',a:statsA.wins + '-' + statsA.draws + '-' + statsA.losses,b:statsB.wins + '-' + statsB.draws + '-' + statsB.losses},
    {label:'Goals Scored',a:statsA.avgGF + '/g',b:statsB.avgGF + '/g'},
    {label:'Goals Conceded',a:statsA.avgGA + '/g',b:statsB.avgGA + '/g'},
    {label:'Home Win %',a:statsA.homePct + '%',b:statsB.homePct + '%'},
    {label:'Away Win %',a:statsA.awayPct + '%',b:statsB.awayPct + '%'},
    {label:'Strength Rating',a:String(statsA.strength),b:String(statsB.strength)},
    {label:'Recent Form',a:formA,b:formB}
  ];

  var verdict = statsA.strength > statsB.strength ? teamA : statsB.strength > statsA.strength ? teamB : 'Even';
  var verdictText = verdict === 'Even' ? 'Teams are evenly matched' : verdict + ' rated higher based on current form and results';

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Team Comparison</div><div style="width:40px;flex-shrink:0;"></div></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  html += '<div style="display:flex;gap:10px;padding:16px 0;"><div style="flex:1;background:var(--bg-card);border:1px solid var(--accent);border-radius:var(--r-md);padding:12px;text-align:center;cursor:pointer;" onclick="openTeamProfile(\'' + teamA.replace(/'/g, "\\'") + '\')"><div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">Team A</div><div style="font-size:16px;font-weight:700;">' + teamA + '</div><div style="font-size:12px;color:var(--text-muted);margin-top:4px;">' + statsA.played + ' matches</div></div><div style="display:flex;align-items:center;">' + ICONS.swap + '</div><div style="flex:1;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:12px;text-align:center;cursor:pointer;" onclick="openTeamProfile(\'' + teamB.replace(/'/g, "\\'") + '\')"><div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">Team B</div><div style="font-size:16px;font-weight:700;">' + teamB + '</div><div style="font-size:12px;color:var(--text-muted);margin-top:4px;">' + statsB.played + ' matches</div></div></div>';

  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;padding:0 16px;">';
  metrics.forEach(function(m) {
    html += '<div class="compare-row"><span class="compare-val-a">' + m.a + '</span><span class="compare-label">' + m.label + '</span><span class="compare-val-b">' + m.b + '</span></div>';
  });
  html += '</div>';

  html += '<div class="card card-accent-left" style="margin-top:16px;"><div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Model Verdict</div><div style="font-size:15px;font-weight:600;margin-bottom:4px;">' + verdictText + '</div><div style="font-size:13px;color:var(--text-secondary);">Based on current form, goals scored/conceded, and home/away records.</div></div>';

  html += '<div style="height:20px;"></div></div>';
  return html;
}

// ─── Search Screen ────────────────────────────────────────────────────────────
function renderSearchScreen() {
  var matches = Store.getMatches();
  var allTeams = {};
  matches.forEach(function(m) {
    if (m.home && !allTeams[m.home]) allTeams[m.home] = {name:m.home, crest:m.homeCrest, league:m.league};
    if (m.away && !allTeams[m.away]) allTeams[m.away] = {name:m.away, crest:m.awayCrest, league:m.league};
  });
  var teamList = Object.values(allTeams).sort(function(a,b){ return a.name.localeCompare(b.name); });
  var topTeams = teamList.slice(0, 12);

  var favTeams = Store.getFavTeams();

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Search</div><div style="width:40px;flex-shrink:0;"></div></div>';

  html += '<div style="overflow-y:auto;flex:1;">';

  html += '<div class="search-input-wrap"><div class="search-icon">' + ICONS.search + '</div><input class="search-input" id="search-field" type="text" placeholder="Teams, leagues, matches\u2026" autofocus oninput="handleSearch(this.value)"></div>';

  html += '<div id="search-results">';

  if (favTeams.length > 0) {
    html += '<div style="padding:8px 16px;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Your Favourites</div><div style="display:flex;flex-wrap:wrap;gap:8px;">';
    favTeams.forEach(function(t) {
      var info = allTeams[t];
      html += '<div class="chip" style="cursor:pointer;" onclick="openTeamProfile(\'' + t.replace(/'/g, "\\'") + '\')">' + teamLogo(t, info ? info.crest : '', 16) + ' ' + t + '</div>';
    });
    html += '</div></div>';
  }

  html += '<div style="padding:8px 16px;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">All Teams</div>';
  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;">';
  topTeams.forEach(function(t) {
    html += '<div class="list-row" onclick="openTeamProfile(\'' + t.name.replace(/'/g, "\\'") + '\')"><div style="display:flex;align-items:center;gap:12px;">' + teamLogo(t.name, t.crest, 28) + '<div><div style="font-size:14px;font-weight:500;">' + t.name + '</div><div style="font-size:12px;color:var(--text-muted);">' + t.league + '</div></div></div>' + ICONS.chevronRight + '</div>';
  });
  if (teamList.length > 12) {
    html += '<div class="list-row" style="justify-content:center;color:var(--accent);font-size:13px;font-weight:600;" onclick="document.getElementById(\'search-field\').value=\'\';handleSearch(\'\')">Show All ' + teamList.length + ' Teams</div>';
  }
  html += '</div></div>';

  var leagues = [{name:'Premier League',code:'PL'},{name:'La Liga',code:'PD'},{name:'Bundesliga',code:'BL1'},{name:'Serie A',code:'SA'},{name:'Ligue 1',code:'FL1'}];
  html += '<div style="padding:8px 16px;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Leagues</div><div style="display:flex;flex-wrap:wrap;gap:8px;">';
  leagues.forEach(function(l) {
    html += '<div class="chip" style="cursor:pointer;" onclick="openStandings(\'' + l.code + '\')">' + l.name + '</div>';
  });
  html += '</div></div>';

  html += '</div></div>';

  return html;
}

// ─── Notifications Screen ─────────────────────────────────────────────────────
function renderNotificationsScreen() {
  var notifs = Store.getNotifications();
  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Notifications</div>' + (notifs.length > 0 ? '<button class="btn btn-sm btn-ghost" onclick="clearAllNotifs()">Clear All</button>' : '') + '</div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;"><div style="margin-top:16px;display:flex;flex-direction:column;gap:8px;">';

  if (notifs.length === 0) {
    html += renderEmptyState('bell','No notifications','You\'re all caught up. Elite picks and alerts will appear here.', '','');
  } else {
    notifs.forEach(function(n) {
      html += '<div class="card ' + (n.read ? '' : 'card-accent-left') + '" style="' + (n.read ? '' : 'border-color:rgba(255,77,125,0.25);') + '"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;"><div style="flex:1;cursor:pointer;" onclick="markRead(\'' + n.id + '\')"><div style="font-size:14px;font-weight:' + (n.read ? '500' : '600') + ';margin-bottom:3px;">' + n.title + '</div><div style="font-size:13px;color:var(--text-secondary);">' + n.body + '</div><div style="font-size:12px;color:var(--text-muted);margin-top:6px;">' + n.time + '</div></div><div style="display:flex;flex-direction:column;align-items:center;gap:6px;">' + (!n.read ? '<div style="width:8px;height:8px;background:var(--accent);border-radius:50%;flex-shrink:0;"></div>' : '') + '<button onclick="deleteNotif(\'' + n.id + '\')" style="background:none;border:none;cursor:pointer;padding:4px;color:var(--text-muted);">' + ICONS.trash + '</button></div></div></div>';
    });
  }

  html += '</div><div style="height:20px;"></div></div>';
  return html;
}

// ─── Saved Screen ─────────────────────────────────────────────────────────────
function renderSavedScreen() {
  var saved = Store.getSavedPredictions();
  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Saved Predictions</div><button class="btn-icon" onclick="exportSaved()">' + ICONS.download + '</button></div>';

  html += '<div class="chip-row" id="saved-chips"><div class="chip active" onclick="filterSaved(\'active\',this)">Active</div><div class="chip" onclick="filterSaved(\'past\',this)">Past</div><div class="chip" onclick="filterSaved(\'history\',this)">History</div></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  if (saved.length === 0) {
    html += renderEmptyState('bookmark','No saved predictions','Save predictions you want to track and revisit them here.','Browse Predictions',"navigate('competitions')");
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">';
    saved.forEach(function(p) {
      html += '<div style="position:relative;">' + renderPredCard(p) + '<button onclick="deleteSaved(\'' + p.id + '\')" style="position:absolute;top:12px;right:12px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--r-sm);padding:4px;cursor:pointer;color:var(--risky);">' + ICONS.trash + '</button></div>';
    });
    html += '</div>';
  }

  html += '<div style="height:20px;"></div></div>';
  return html;
}

// ─── Favorites Screen ─────────────────────────────────────────────────────────
function renderFavoritesScreen() {
  var favs = Store.getFavTeams();
  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Favourite Teams</div><button class="btn-icon" onclick="openTeamSelectModal()">' + ICONS.plus + '</button></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;"><div style="margin-top:16px;">';

  if (favs.length === 0) {
    html += renderEmptyState('heart','No favourite teams','Add teams you follow to get personalised predictions and alerts.','Add Team',"openTeamSelectModal()");
  } else {
    html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;">';
    favs.forEach(function(t) {
      html += '<div class="list-row"><div style="display:flex;align-items:center;gap:12px;">' + teamLogo(t, null, 36) + '<span style="font-size:14px;font-weight:500;">' + t + '</span></div><button onclick="removeFavTeam(\'' + t + '\')" style="background:none;border:none;color:var(--risky);cursor:pointer;">' + ICONS.close + '</button></div>';
    });
    html += '</div>';
    html += '<button class="btn btn-secondary btn-full" style="margin-top:12px;" onclick="openTeamSelectModal()">' + ICONS.plus + ' Add Team</button>';
  }

  html += '</div><div style="height:20px;"></div></div>';
  return html;
}

// ─── Settings Screen ──────────────────────────────────────────────────────────
function renderSettingsScreen() {
  var isDark = currentTheme === 'dark';
  var lang = currentLang || 'en';
  var soundOn = localStorage.getItem('pitchline-sound') === 'true';

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Settings</div></div>';

  html += '<div style="overflow-y:auto;flex:1;">';

  html += '<div style="padding:16px 16px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);">Appearance</div>';
  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin:10px 16px;">';
  html += '<div class="settings-row"><div><div class="settings-label">' + (isDark ? 'Dark Mode' : 'Light Mode') + '</div><div class="settings-sub">Toggle between themes</div></div><label class="toggle"><input type="checkbox" ' + (isDark ? 'checked' : '') + ' onchange="toggleTheme()"><span class="toggle-slider"></span></label></div>';
  html += '</div>';

  html += '<div style="padding:8px 16px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);">Language</div>';
  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin:10px 16px;">';
  var langs = [{code:'en',label:'English',flag:'\ud83c\uddec\ud83c\udde7'},{code:'es',label:'Espa\u00f1ol',flag:'\ud83c\uddea\ud83c\uddf8'},{code:'fr',label:'Fran\u00e7ais',flag:'\ud83c\uddeb\ud83c\uddf7'},{code:'pt',label:'Portugu\u00eas',flag:'\ud83c\udde7\ud83c\uddf7'}];
  langs.forEach(function(l) {
    html += '<div class="settings-row" style="cursor:pointer;" onclick="setLang(\'' + l.code + '\')"><div style="display:flex;align-items:center;gap:10px;"><span style="font-size:18px;">' + l.flag + '</span><div><div class="settings-label">' + l.label + '</div></div></div>' + (lang === l.code ? '<div style="color:var(--accent);">' + ICONS.check + '</div>' : '<div style="color:var(--text-muted);">' + ICONS.chevronRight + '</div>') + '</div>';
  });
  html += '</div>';

  html += '<div style="padding:8px 16px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);">Notifications</div>';
  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin:10px 16px;">';
  html += '<div class="settings-row"><div><div class="settings-label">Elite Pick Alerts</div><div class="settings-sub">Get notified of 80%+ picks</div></div><label class="toggle"><input type="checkbox" checked onchange="saveSettings()"><span class="toggle-slider"></span></label></div>';
  html += '<div class="settings-row"><div><div class="settings-label">Upset Alerts</div><div class="settings-sub">Flagged risky matches</div></div><label class="toggle"><input type="checkbox" checked onchange="saveSettings()"><span class="toggle-slider"></span></label></div>';
  html += '<div class="settings-row"><div><div class="settings-label">Match Reminders</div><div class="settings-sub">30 min before kick-off</div></div><label class="toggle"><input type="checkbox" onchange="saveSettings()"><span class="toggle-slider"></span></label></div>';
  html += '</div>';

  html += '<div style="padding:8px 16px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);">Sound</div>';
  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin:10px 16px;">';
  html += '<div class="settings-row"><div><div class="settings-label">Goal Sound</div><div class="settings-sub">Play sound on score change</div></div><label class="toggle"><input type="checkbox" ' + (soundOn ? 'checked' : '') + ' onchange="toggleSound()"><span class="toggle-slider"></span></label></div>';
  html += '</div>';

  html += '<div style="padding:8px 16px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);">Data</div>';
  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin:10px 16px;">';
  html += '<div class="list-row" onclick="refreshHome()"><span class="settings-label">Refresh Matches</span>' + ICONS.chevronRight + '</div>';
  html += '<div class="list-row" style="cursor:default;"><span class="settings-label">Last updated</span><span style="font-size:13px;color:var(--text-muted);">' + (Store.state && Store.state.lastFetch ? new Date(Store.state.lastFetch).toLocaleTimeString() : 'Never') + '</span></div>';
  html += '</div>';

  html += '<div style="padding:8px 16px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);">About</div>';
  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin:10px 16px;">';
  html += '<div class="list-row" style="cursor:default;"><span class="settings-label">Version</span><span style="font-size:13px;color:var(--text-muted);">1.0.0</span></div>';
  html += '<div class="list-row" onclick="showToast(\'Privacy policy opened\')"><span class="settings-label">Privacy Policy</span>' + ICONS.chevronRight + '</div>';
  html += '<div class="list-row" onclick="showToast(\'Terms opened\')"><span class="settings-label">Terms of Use</span>' + ICONS.chevronRight + '</div>';
  html += '</div>';

  html += '<div style="padding:0 16px;margin-top:4px;margin-bottom:20px;"><button class="btn btn-ghost btn-full" onclick="resetSettings()">Reset Settings</button></div>';

  html += '<div style="height:20px;"></div></div>';
  return html;
}

// ─── News Detail Screen ───────────────────────────────────────────────────────
var NEWS_DATA = [
  { id:'n1', category:'Transfer', catColor:'var(--accent)', title:'Man City eyeing January move for midfield target', summary:'Manchester City are reportedly monitoring a key midfield target ahead of the January transfer window. The club has been tracking the player for several months and a move could be imminent if negotiations go smoothly.', time:'15 min ago', image:'transfer' },
  { id:'n2', category:'Analysis', catColor:'var(--success)', title:'Champions League predictions updated after draw', summary:'Following the latest Champions League group stage draw, our prediction models have been recalibrated. Several teams now face tougher paths to the knockout rounds, while others have been handed favourable draws.', time:'1 hr ago', image:'analysis' },
  { id:'n3', category:'Injury', catColor:'var(--warning)', title:'Key striker doubts for weekend showdown', summary:'A crucial striker is facing a race to be fit for this weekend\'s important fixture. The player picked up a knock in training and will be assessed closer to kick-off. His absence could significantly impact the team\'s attacking options.', time:'3 hrs ago', image:'injury' },
  { id:'n4', category:'Tactics', catColor:'var(--strong)', title:'How Arsenal\'s new formation could change the title race', summary:'Arsenal\'s tactical shift to a 3-4-3 formation has been producing impressive results. The change allows for better ball progression through midfield and creates overloads on the wings, making them serious title contenders.', time:'5 hrs ago', image:'tactics' },
  { id:'n5', category:'Transfer', catColor:'var(--accent)', title:'Barcelona targeting Premier League defender', summary:'Barcelona have reportedly identified a Premier League defender as their top transfer target. The player\'s contract situation could allow for a cut-price deal in the upcoming window.', time:'8 hrs ago', image:'transfer' },
  { id:'n6', category:'Analysis', catColor:'var(--success)', title:'xG breakdown: Which teams are overperforming?', summary:'Our latest expected goals analysis reveals some surprising overperformers across Europe\'s top five leagues. Several teams are scoring significantly more than their xG would suggest, raising questions about sustainability.', time:'12 hrs ago', image:'analysis' }
];

function renderNewsDetailScreen(newsId) {
  var article = NEWS_DATA.find(function(n){ return n.id === newsId; });
  if (!article) return renderEmptyState('news','Article not found','This article could not be loaded.','Go Back',"navigateBack()");

  var iconSvg = '';
  if (article.image === 'transfer') iconSvg = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="' + article.catColor + '" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>';
  else if (article.image === 'analysis') iconSvg = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="' + article.catColor + '" stroke-width="1.5"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/><polyline points="9 12 12 15 15 12"/></svg>';
  else if (article.image === 'injury') iconSvg = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="' + article.catColor + '" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>';
  else iconSvg = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="' + article.catColor + '" stroke-width="1.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>';

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Article</div><button class="btn-icon" onclick="shareNews(\'' + newsId + '\')">' + ICONS.share + '</button></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  html += '<div style="padding:20px 0 16px;border-bottom:1px solid var(--border);margin-bottom:20px;">';
  html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><span style="font-size:11px;font-weight:600;color:' + article.catColor + ';text-transform:uppercase;letter-spacing:0.5px;">' + article.category + '</span><span style="font-size:12px;color:var(--text-muted);">\u00b7 ' + article.time + '</span></div>';
  html += '<div style="width:100%;height:160px;background:var(--bg-elevated);border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;margin-bottom:16px;">' + iconSvg + '</div>';
  html += '<div style="font-size:20px;font-weight:700;letter-spacing:-0.5px;line-height:1.3;margin-bottom:12px;">' + article.title + '</div>';
  html += '<div style="font-size:14px;color:var(--text-secondary);line-height:1.7;">' + article.summary + '</div>';

  html += '<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);"><div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Related Predictions</div>';
  var relatedPreds = Store.getPredictions().slice(0, 2);
  relatedPreds.forEach(function(p) {
    html += '<div class="card" style="margin-bottom:8px;cursor:pointer;" onclick="openPredDetail(\'' + p.id + '\')"><div style="display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:13px;font-weight:600;">' + p.home + ' vs ' + p.away + '</div><div style="font-size:12px;color:var(--text-muted);">' + p.league + '</div></div>' + renderConfidenceBadge(p.tier) + '</div></div>';
  });
  html += '</div>';

  html += '<div style="display:flex;gap:10px;margin-top:16px;margin-bottom:20px;"><button class="btn btn-primary" style="flex:1;" onclick="navigate(\'news\')">Back to News</button><button class="btn btn-secondary" onclick="shareNews(\'' + newsId + '\')">' + ICONS.share + '</button></div>';

  html += '<div style="height:20px;"></div></div>';
  return html;
}

// ─── Standings Screen ─────────────────────────────────────────────────────────
var _standingsData = {};
var _standingsLoading = false;

function renderStandingsScreen(leagueCode) {
  var code = leagueCode || 'PL';
  var leagueNames = { 'PL':'Premier League', 'PD':'La Liga', 'BL1':'Bundesliga', 'SA':'Serie A', 'FL1':'Ligue 1', 'CL':'Champions League' };

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">' + (leagueNames[code] || code) + ' Standings</div></div>';

  html += '<div class="chip-row" id="standings-chips">';
  html += '<div class="chip' + (STANDINGS_FILTER==='overall'?' active':'') + '" onclick="filterStandings(\'overall\',this)">Overall</div>';
  html += '<div class="chip' + (STANDINGS_FILTER==='home'?' active':'') + '" onclick="filterStandings(\'home\',this)">Home</div>';
  html += '<div class="chip' + (STANDINGS_FILTER==='away'?' active':'') + '" onclick="filterStandings(\'away\',this)">Away</div>';
  html += '</div>';

  html += '<div class="chip-row" style="padding-top:0;" id="standings-league-chips">';
  var leagues = [{c:'PL',f:'\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f',n:'PL'},{c:'PD',f:'\ud83c\uddea\ud83c\uddf8',n:'La Liga'},{c:'BL1',f:'\ud83c\udde9\ud83c\uddea',n:'Bundesliga'},{c:'SA',f:'\ud83c\uddee\ud83c\uddf9',n:'Serie A'},{c:'FL1',f:'\ud83c\uddeb\ud83c\uddf7',n:'Ligue 1'}];
  leagues.forEach(function(l) {
    html += '<div class="chip' + (code===l.c?' active':'') + '" onclick="openStandings(\'' + l.c + '\')">' + l.f + ' ' + l.n + '</div>';
  });
  html += '</div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;" id="standings-content">';

  var cached = _standingsData[code];
  if (cached && cached.length > 0) {
    html += renderStandingsTable(cached, code);
  } else if (_standingsLoading) {
    html += '<div style="margin-top:12px;">';
    for (var i = 0; i < 10; i++) {
      html += '<div class="skeleton" style="height:42px;border-radius:var(--r-sm);margin-bottom:4px;"></div>';
    }
    html += '</div>';
  } else {
    html += '<div style="margin-top:12px;">';
    for (var i2 = 0; i2 < 10; i2++) {
      html += '<div class="skeleton" style="height:42px;border-radius:var(--r-sm);margin-bottom:4px;"></div>';
    }
    html += '</div>';
    _standingsLoading = true;
    API.fetchStandings(code).then(function(data) {
      _standingsData[code] = data;
      _standingsLoading = false;
      if (currentScreen === 'standings') {
        var el = document.getElementById('standings-content');
        if (el && data && data.length > 0) {
          el.innerHTML = renderStandingsTable(data, code);
        } else if (el) {
          el.innerHTML = renderDefaultStandings(code);
        }
      }
    }).catch(function() {
      _standingsLoading = false;
      if (currentScreen === 'standings') {
        var el = document.getElementById('standings-content');
        if (el) el.innerHTML = renderDefaultStandings(code);
      }
    });
  }

  html += '<div style="height:20px;"></div></div>';
  return html;
}

function renderStandingsTable(standings, code) {
  var html = '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin-top:12px;">';
  html += '<div style="display:grid;grid-template-columns:32px 1fr 28px 28px 28px 28px 36px;padding:8px 12px;border-bottom:1px solid var(--border);font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;"><span>#</span><span>Team</span><span style="text-align:center;">W</span><span style="text-align:center;">D</span><span style="text-align:center;">L</span><span style="text-align:center;">GD</span><span style="text-align:center;">Pts</span></div>';

  standings.forEach(function(row, i) {
    var pos = row.position || (i + 1);
    var team = row.team || '';
    var pts = row.pts || 0;
    var w = row.won || 0;
    var d = row.drawn != null ? row.drawn : (row.draw || 0);
    var l = row.lost || 0;
    var gdVal = row.gd || 0;
    var gdStr = gdVal > 0 ? '+' + gdVal : String(gdVal);
    var crest = row.crest || '';
    var zoneColor = pos <= 4 ? 'var(--elite)' : pos <= 6 ? 'var(--strong)' : pos >= 18 ? 'var(--risky)' : 'transparent';
    html += '<div style="display:grid;grid-template-columns:32px 1fr 28px 28px 28px 28px 36px;padding:10px 12px;border-bottom:1px solid var(--border);align-items:center;cursor:pointer;" onclick="openTeamProfile(\'' + team.replace(/'/g, "\\'") + '\')">';
    html += '<span style="font-size:12px;font-weight:600;color:var(--text-muted);border-left:2px solid ' + zoneColor + ';padding-left:6px;">' + pos + '</span>';
    html += '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:13px;font-weight:600;">' + team + '</span></div>';
    html += '<span style="font-size:13px;text-align:center;color:var(--text-secondary);">' + w + '</span>';
    html += '<span style="font-size:13px;text-align:center;color:var(--text-secondary);">' + d + '</span>';
    html += '<span style="font-size:13px;text-align:center;color:var(--text-secondary);">' + l + '</span>';
    html += '<span style="font-size:13px;text-align:center;color:var(--text-secondary);">' + gdStr + '</span>';
    html += '<span style="font-size:13px;font-weight:700;text-align:center;">' + pts + '</span>';
    html += '</div>';
  });

  html += '</div>';
  html += '<div style="display:flex;gap:12px;margin:16px 0;font-size:11px;color:var(--text-muted);"><div style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--elite);"></span> Champions League</div><div style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--strong);"></span> Europa League</div><div style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--risky);"></span> Relegation</div></div>';
  return html;
}

function renderDefaultStandings(code) {
  var defaults = {
    'PL': [
      {pos:1,team:'Arsenal',w:24,d:5,l:3,gd:'+52',pts:77},{pos:2,team:'Liverpool',w:23,d:6,l:3,gd:'+45',pts:75},
      {pos:3,team:'Man City',w:22,d:5,l:5,gd:'+40',pts:71},{pos:4,team:'Aston Villa',w:18,d:6,l:8,gd:'+18',pts:60},
      {pos:5,team:'Tottenham',w:17,d:5,l:10,gd:'+13',pts:56},{pos:6,team:'Newcastle',w:16,d:7,l:9,gd:'+20',pts:55},
      {pos:7,team:'Chelsea',w:15,d:8,l:9,gd:'+8',pts:53},{pos:8,team:'Man United',w:15,d:5,l:12,gd:'-2',pts:50},
      {pos:9,team:'West Ham',w:14,d:6,l:12,gd:'-5',pts:48},{pos:10,team:'Brighton',w:13,d:8,l:11,gd:'+4',pts:47}
    ]
  };
  var rows = defaults[code] || defaults['PL'];
  var html = '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin-top:12px;">';
  html += '<div style="display:grid;grid-template-columns:32px 1fr 28px 28px 28px 28px 36px;padding:8px 12px;border-bottom:1px solid var(--border);font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;"><span>#</span><span>Team</span><span style="text-align:center;">W</span><span style="text-align:center;">D</span><span style="text-align:center;">L</span><span style="text-align:center;">GD</span><span style="text-align:center;">Pts</span></div>';
  rows.forEach(function(row) {
    var zoneColor = row.pos <= 4 ? 'var(--elite)' : row.pos <= 6 ? 'var(--strong)' : row.pos >= 18 ? 'var(--risky)' : 'transparent';
    html += '<div style="display:grid;grid-template-columns:32px 1fr 28px 28px 28px 28px 36px;padding:10px 12px;border-bottom:1px solid var(--border);align-items:center;cursor:pointer;" onclick="openTeamProfile(\'' + row.team + '\')">';
    html += '<span style="font-size:12px;font-weight:600;color:var(--text-muted);border-left:2px solid ' + zoneColor + ';padding-left:6px;">' + row.pos + '</span>';
    html += '<span style="font-size:13px;font-weight:600;">' + row.team + '</span>';
    html += '<span style="font-size:13px;text-align:center;color:var(--text-secondary);">' + row.w + '</span>';
    html += '<span style="font-size:13px;text-align:center;color:var(--text-secondary);">' + row.d + '</span>';
    html += '<span style="font-size:13px;text-align:center;color:var(--text-secondary);">' + row.l + '</span>';
    html += '<span style="font-size:13px;text-align:center;color:var(--text-secondary);">' + row.gd + '</span>';
    html += '<span style="font-size:13px;font-weight:700;text-align:center;">' + row.pts + '</span>';
    html += '</div>';
  });
  html += '</div>';
  html += '<div style="display:flex;gap:12px;margin:16px 0;font-size:11px;color:var(--text-muted);"><div style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--elite);"></span> Champions League</div><div style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--strong);"></span> Europa League</div><div style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--risky);"></span> Relegation</div></div>';
  return html;
}

// ─── World Cup Match Detail Screen ────────────────────────────────────────────
var _wcDetailTab = 'summary';
var _wcDetailId = null;

function switchWCTab(tab) {
  _wcDetailTab = tab;
  var content = document.getElementById('wc-tab-content');
  var tabBtns = document.querySelectorAll('#wc-tabs .btn');
  tabBtns.forEach(function(b) {
    b.style.background = 'transparent';
    b.style.color = 'var(--text-secondary)';
  });
  var active = document.querySelector('#wc-tabs [data-tab="' + tab + '"]');
  if (active) {
    active.style.background = 'var(--accent)';
    active.style.color = '#fff';
  }
  if (content && _wcDetailId) {
    content.innerHTML = renderWCTabContent(_wcDetailId, tab);
  }
}

function renderWCTabContent(gameId, tab) {
  var wc = Store.getWorldCup();
  var game = (wc.games || []).find(function(g){ return g.id === gameId; });
  if (!game) return '';
  var pred = (wc.predictions || []).find(function(p){ return p.matchId === gameId || p.id === 'wcpred_' + gameId; });
  switch (tab) {
    case 'summary': return renderWCSummary(game, pred);
    case 'lineups': return renderWCLineups(game);
    case 'stats':   return renderWCMatchStats(game);
    case 'h2h':     return renderWCH2H(game);
    default:        return renderWCSummary(game, pred);
  }
}

function renderWCSummary(game, pred) {
  var isFinished = game.status === 'finished';
  var isLive = game.status === 'live';

  var formattedDate = '';
  try {
    var d = new Date(game.date);
    if (!isNaN(d.getTime())) {
      var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      formattedDate = days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
    }
  } catch(e) {}

  var predHtml = pred
    ? '<div class="card card-accent-left" style="margin-bottom:14px;"><div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">AI Prediction</div><div style="display:flex;align-items:center;justify-content:space-between;"><div><div style="font-size:16px;font-weight:700;">' + pred.outcome + '</div>' + renderConfidenceBadge(pred.tier) + '</div>' + renderScoreRing(pred.confidence, 64) + '</div></div>'
    : '<div class="card" style="margin-bottom:14px;text-align:center;padding:20px;"><div style="color:var(--text-muted);font-size:14px;">No prediction available</div></div>';

  var html = predHtml;

  html += '<div style="display:flex;gap:10px;margin-bottom:14px;">';
  html += '<button class="btn btn-primary" style="flex:1;" onclick="openPredDetail(\'' + (pred ? pred.id : '') + '\')">' + ICONS.eye + ' View Analysis</button>';
  html += '<button class="btn btn-secondary" onclick="savePrediction(\'' + (pred ? pred.id : '') + '\')">' + ICONS.bookmark + '</button>';
  html += '</div>';

  html += '<div style="margin-bottom:14px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Recent Form</div><div style="display:flex;gap:16px;"><div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;cursor:pointer;" onclick="openTeamProfile(\'' + game.home.replace(/'/g, "\\'") + '\')">' + game.home + '</div>' + renderFormGuide(['W','W','D','W','L']) + '</div><div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;cursor:pointer;" onclick="openTeamProfile(\'' + game.away.replace(/'/g, "\\'") + '\')">' + game.away + '</div>' + renderFormGuide(['D','W','L','W','W']) + '</div></div></div>';

  if (isFinished || isLive) {
    var timelineEvents = [];
    var homeGoals = game.homeScore ? parseInt(game.homeScore) : 0;
    var awayGoals = game.awayScore ? parseInt(game.awayScore) : 0;
    if (homeGoals > 0 || awayGoals > 0) {
      for (var gi = 0; gi < homeGoals; gi++) {
        var gMin = Math.floor(Math.random() * 80) + 10;
        timelineEvents.push({min:gMin,type:'goal',team:'home',icon:'⚽',detail:game.home + ' Goal',color:'var(--success)'});
      }
      for (var gj = 0; gj < awayGoals; gj++) {
        var gMin2 = Math.floor(Math.random() * 80) + 10;
        timelineEvents.push({min:gMin2,type:'goal',team:'away',icon:'⚽',detail:game.away + ' Goal',color:'var(--success)'});
      }
    }
    timelineEvents.push({min:45,type:'ht',team:'',icon:'⏱',detail:'Half Time ' + (game.score || '0 - 0'),color:'var(--text-muted)'});
    if (isFinished) {
      timelineEvents.push({min:90,type:'ft',team:'',icon:'🏁',detail:'Full Time ' + (game.score || '0 - 0'),color:'var(--text-primary)'});
    }
    var yellowMins = [12, 28, 34, 55, 67, 78];
    for (var yi = 0; yi < 2; yi++) {
      var yTeam = yi === 0 ? game.home : game.away;
      timelineEvents.push({min:yellowMins[yi + (yi === 0 ? 0 : 1)],type:'yellow',team:yi===0?'home':'away',icon:'🟨',detail:yTeam + ' — Yellow Card',color:'var(--warning)'});
    }
    timelineEvents.sort(function(a,b){ return a.min - b.min; });

    html += '<div class="card" style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;margin-bottom:10px;">⏱ Match Timeline</div>';
    timelineEvents.forEach(function(ev) {
      var side = ev.team === 'home' ? 'flex-start' : ev.team === 'away' ? 'flex-end' : 'center';
      html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);">';
      html += '<span style="font-size:11px;font-weight:700;color:var(--text-muted);min-width:30px;">' + ev.min + "'</span>";
      html += '<span style="font-size:14px;">' + ev.icon + '</span>';
      html += '<span style="font-size:12px;color:' + ev.color + ';font-weight:500;">' + ev.detail + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  html += '<div class="card" style="margin-bottom:14px;padding:12px 16px;"><div style="font-size:13px;font-weight:600;margin-bottom:10px;">Tournament Info</div><div style="display:flex;gap:16px;flex-wrap:wrap;">';
  html += '<div style="flex:1;min-width:120px;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:2px;">Competition</div><div style="font-size:13px;font-weight:600;">FIFA World Cup 2026</div></div>';
  html += '<div style="flex:1;min-width:120px;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:2px;">Group</div><div style="font-size:13px;font-weight:600;">' + (game.group || 'Knockout') + '</div></div>';
  html += '<div style="flex:1;min-width:120px;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:2px;">Matchday</div><div style="font-size:13px;font-weight:600;">' + (game.matchday || '-') + '</div></div>';
  if (formattedDate) {
    html += '<div style="flex:1;min-width:120px;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:2px;">Date & Time</div><div style="font-size:13px;font-weight:600;">' + formattedDate + '</div></div>';
  }
  html += '</div></div>';

  var preview = generateMatchPreview(game.home, game.away, 'FIFA World Cup 2026');
  html += '<div class="card" style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">Match Preview</div><div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">' + preview + '</div></div>';

  html += '<div style="height:16px;"></div>';
  return html;
}

function renderWCLineups(game) {
  var homeFormation = game.homeFormation || '4-3-3';
  var awayFormation = game.awayFormation || '4-3-3';
  var realPlayers = game._realPlayers || null;
  var realDetail = game._realDetail || null;

  var tc_home = getTeamColor(game.home);
  var tc_away = getTeamColor(game.away);

  var posToXY = {
    'GK':{x:50,y:92},'G':{x:50,y:92},
    'RB':{x:18,y:78},'LB':{x:82,y:78},
    'CB':{x:50,y:80},'RCB':{x:38,y:80},'LCB':{x:62,y:80},'CBR':{x:38,y:80},'CBL':{x:62,y:80},
    'CDM':{x:50,y:65},'DM':{x:50,y:65},
    'CM':{x:35,y:58},'RM':{x:15,y:58},'LM':{x:85,y:58},'RCM':{x:35,y:58},'LCM':{x:65,y:58},
    'AM':{x:50,y:48},'CAM':{x:50,y:48},'RW':{x:15,y:45},'LW':{x:85,y:45},
    'ST':{x:50,y:40},'CF':{x:50,y:40},'SS':{x:50,y:45},
    'RF':{x:30,y:40},'LF':{x:70,y:40}
  };

  var posOrder = ['GK','RB','CB','LB','CDM','CM','RW','ST','LW','G','DF','MF','FW'];

  function buildHomePlayers() {
    if (realPlayers && realPlayers.home && realPlayers.home.length > 0) {
      var gks = realPlayers.home.filter(function(p){ return p.position === 'GK' || p.positionShort === 'GK' || p.position === 'Goalkeeper'; });
      var others = realPlayers.home.filter(function(p){ return p.position !== 'GK' && p.positionShort !== 'GK' && p.position !== 'Goalkeeper'; });
      var sorted = gks.concat(others);
      var formationParts = homeFormation.split('-').map(function(n){ return parseInt(n); });
      var posMap = ['GK'];
      if (formationParts.length >= 3) {
        posMap.push('RB');
        for (var i = 0; i < formationParts[0] - 2; i++) posMap.push('CB');
        posMap.push('LB');
        var midCount = formationParts[1];
        for (var j = 0; j < midCount; j++) posMap.push('CM');
        var fwCount = formationParts[2];
        if (fwCount === 3) { posMap.push('RW'); posMap.push('ST'); posMap.push('LW'); }
        else if (fwCount === 2) { posMap.push('ST'); posMap.push('ST'); }
        else { for (var k = 0; k < fwCount; k++) posMap.push('ST'); }
      }
      return sorted.slice(0, 11).map(function(p, idx) {
        var pos = posMap[idx] || 'CM';
        var xy = posToXY[pos] || {x:50,y:50};
        var offset = (idx > 0 && posMap[idx] === posMap[idx-1]) ? ((idx % 2 === 0 ? 1 : -1) * 12) : 0;
        return {num: String(p.number || (idx+1)), name: p.name || pos, pos: pos, x: Math.max(8, Math.min(92, xy.x + offset)), y: xy.y};
      });
    }
    return [
      {num:'1',name:game.home.substring(0,3).toUpperCase() + ' GK',pos:'GK',x:50,y:92},
      {num:'2',name:'RB',pos:'RB',x:18,y:78},{num:'4',name:'CB',pos:'CB',x:38,y:80},
      {num:'5',name:'CB',pos:'CB',x:62,y:80},{num:'3',name:'LB',pos:'LB',x:82,y:78},
      {num:'6',name:'CDM',pos:'CDM',x:50,y:65},{num:'8',name:'CM',pos:'CM',x:35,y:58},
      {num:'10',name:'CM',pos:'CM',x:65,y:58},{num:'7',name:'RW',pos:'RW',x:15,y:45},
      {num:'9',name:'ST',pos:'ST',x:50,y:40},{num:'11',name:'LW',pos:'LW',x:85,y:45}
    ];
  }

  function buildAwayPlayers() {
    if (realPlayers && realPlayers.away && realPlayers.away.length > 0) {
      var gks = realPlayers.away.filter(function(p){ return p.position === 'GK' || p.positionShort === 'GK' || p.position === 'Goalkeeper'; });
      var others = realPlayers.away.filter(function(p){ return p.position !== 'GK' && p.positionShort !== 'GK' && p.position !== 'Goalkeeper'; });
      var sorted = gks.concat(others);
      var formationParts = awayFormation.split('-').map(function(n){ return parseInt(n); });
      var posMap = ['GK'];
      if (formationParts.length >= 3) {
        posMap.push('RB');
        for (var i = 0; i < formationParts[0] - 2; i++) posMap.push('CB');
        posMap.push('LB');
        var midCount = formationParts[1];
        for (var j = 0; j < midCount; j++) posMap.push('CM');
        var fwCount = formationParts[2];
        if (fwCount === 3) { posMap.push('RW'); posMap.push('ST'); posMap.push('LW'); }
        else if (fwCount === 2) { posMap.push('ST'); posMap.push('ST'); }
        else { for (var k = 0; k < fwCount; k++) posMap.push('ST'); }
      }
      return sorted.slice(0, 11).map(function(p, idx) {
        var pos = posMap[idx] || 'CM';
        var xy = posToXY[pos] || {x:50,y:50};
        var offset = (idx > 0 && posMap[idx] === posMap[idx-1]) ? ((idx % 2 === 0 ? 1 : -1) * 12) : 0;
        return {num: String(p.number || (idx+1)), name: p.name || pos, pos: pos, x: Math.max(8, Math.min(92, xy.x + offset)), y: xy.y};
      });
    }
    return [
      {num:'1',name:game.away.substring(0,3).toUpperCase() + ' GK',pos:'GK',x:50,y:8},
      {num:'2',name:'RB',pos:'RB',x:82,y:22},{num:'4',name:'CB',pos:'CB',x:62,y:20},
      {num:'5',name:'CB',pos:'CB',x:38,y:20},{num:'3',name:'LB',pos:'LB',x:18,y:22},
      {num:'6',name:'CDM',pos:'CDM',x:50,y:35},{num:'8',name:'CM',pos:'CM',x:35,y:42},
      {num:'10',name:'CM',pos:'CM',x:65,y:42},{num:'7',name:'RW',pos:'RW',x:85,y:55},
      {num:'9',name:'ST',pos:'ST',x:50,y:60},{num:'11',name:'LW',pos:'LW',x:15,y:55}
    ];
  }

  var homePlayers = buildHomePlayers();
  var awayPlayers = buildAwayPlayers();

  var html = '<div style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div style="font-size:14px;font-weight:600;cursor:pointer;" onclick="openTeamProfile(\'' + game.home.replace(/'/g, "\\'") + '\')">' + game.home + '</div><span style="font-size:12px;color:var(--text-muted);font-weight:600;">' + homeFormation + '</span></div>';
  html += '<div class="pitch-container">';
  html += '<div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;"><div style="width:2px;height:100%;background:rgba(255,255,255,0.2);position:absolute;"></div></div>';
  html += '<div style="position:absolute;top:50%;left:0;right:0;height:2px;background:rgba(255,255,255,0.2);"></div>';
  html += '<div style="position:absolute;top:50%;left:50%;width:20%;aspect-ratio:1;border:2px solid rgba(255,255,255,0.2);border-radius:50%;transform:translate(-50%,-50%);"></div>';
  homePlayers.forEach(function(p) {
    html += '<div class="pitch-player" style="left:' + p.x + '%;top:' + p.y + '%;"><div class="pitch-player-num" style="background:' + tc_home.bg + ';">' + p.num + '</div><div class="pitch-player-name">' + p.name + '</div></div>';
  });
  html += '</div></div>';

  html += '<div style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div style="font-size:14px;font-weight:600;cursor:pointer;" onclick="openTeamProfile(\'' + game.away.replace(/'/g, "\\'") + '\')">' + game.away + '</div><span style="font-size:12px;color:var(--text-muted);font-weight:600;">' + awayFormation + '</span></div>';
  html += '<div class="pitch-container" style="transform:scaleY(-1);">';
  html += '<div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;"><div style="width:2px;height:100%;background:rgba(255,255,255,0.2);position:absolute;"></div></div>';
  html += '<div style="position:absolute;top:50%;left:0;right:0;height:2px;background:rgba(255,255,255,0.2);"></div>';
  html += '<div style="position:absolute;top:50%;left:50%;width:20%;aspect-ratio:1;border:2px solid rgba(255,255,255,0.2);border-radius:50%;transform:translate(-50%,-50%);"></div>';
  awayPlayers.forEach(function(p) {
    html += '<div class="pitch-player" style="left:' + p.x + '%;top:' + p.y + '%;"><div class="pitch-player-num" style="background:' + tc_away.bg + ';">' + p.num + '</div><div class="pitch-player-name">' + p.name + '</div></div>';
  });
  html += '</div></div>';

  var hasReal = realPlayers && realPlayers.home && realPlayers.home.length > 0;
  html += '<div class="card" style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">Bench</div>';
  html += '<div style="display:flex;gap:12px;">';
  if (hasReal && realPlayers.home.length > 11) {
    var homeSubs = realPlayers.home.slice(11).map(function(p){
      var stats = [];
      if (p.goals > 0) stats.push('<span style="color:var(--success);">⚽' + p.goals + '</span>');
      if (p.assists > 0) stats.push('<span style="color:var(--strong);">🅰' + p.assists + '</span>');
      if (p.yellowCards > 0) stats.push('<span style="color:var(--warning);">🟨' + p.yellowCards + '</span>');
      if (p.redCards > 0) stats.push('<span style="color:var(--danger);">🟥' + p.redCards + '</span>');
      return p.name + (stats.length > 0 ? ' ' + stats.join(' ') : '');
    });
    html += '<div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">' + game.home + '</div><div style="font-size:12px;color:var(--text-secondary);line-height:1.8;">' + homeSubs.join('<br>') + '</div></div>';
  } else {
    html += '<div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">' + game.home + '</div><div style="font-size:12px;color:var(--text-secondary);line-height:1.6;">Lineup pending</div></div>';
  }
  if (hasReal && realPlayers.away && realPlayers.away.length > 11) {
    var awaySubs = realPlayers.away.slice(11).map(function(p){
      var stats = [];
      if (p.goals > 0) stats.push('<span style="color:var(--success);">⚽' + p.goals + '</span>');
      if (p.assists > 0) stats.push('<span style="color:var(--strong);">🅰' + p.assists + '</span>');
      if (p.yellowCards > 0) stats.push('<span style="color:var(--warning);">🟨' + p.yellowCards + '</span>');
      if (p.redCards > 0) stats.push('<span style="color:var(--danger);">🟥' + p.redCards + '</span>');
      return p.name + (stats.length > 0 ? ' ' + stats.join(' ') : '');
    });
    html += '<div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">' + game.away + '</div><div style="font-size:12px;color:var(--text-secondary);line-height:1.8;">' + awaySubs.join('<br>') + '</div></div>';
  } else {
    html += '<div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">' + game.away + '</div><div style="font-size:12px;color:var(--text-secondary);line-height:1.6;">Lineup pending</div></div>';
  }
  html += '</div></div>';

  if (hasReal) {
    html += '<div class="card" style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">Player Stats</div>';
    html += '<div style="display:flex;gap:12px;">';
    var homeKey = realPlayers.home.filter(function(p){ return p.goals > 0 || p.assists > 0 || p.yellowCards > 0 || p.redCards > 0; });
    var awayKey = realPlayers.away.filter(function(p){ return p.goals > 0 || p.assists > 0 || p.yellowCards > 0 || p.redCards > 0; });
    if (homeKey.length > 0) {
      html += '<div style="flex:1;"><div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px;">' + game.home + '</div>';
      homeKey.forEach(function(p) {
        html += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--border);font-size:12px;cursor:pointer;" onclick="openPlayerDetail(\'' + (p.name||'').replace(/'/g,"\\'") + '\')">';
        html += '<span style="font-weight:600;min-width:18px;">#' + (p.number || '-') + '</span>';
        html += '<span style="flex:1;color:var(--text-secondary);">' + p.name + '</span>';
        if (p.goals > 0) html += '<span style="color:var(--success);font-weight:600;">⚽' + p.goals + '</span>';
        if (p.assists > 0) html += '<span style="color:var(--strong);font-weight:600;">🅰' + p.assists + '</span>';
        if (p.yellowCards > 0) html += '<span style="font-size:14px;">🟨</span>';
        if (p.redCards > 0) html += '<span style="font-size:14px;">🟥</span>';
        html += '</div>';
      });
      html += '</div>';
    } else {
      html += '<div style="flex:1;"><div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px;">' + game.home + '</div><div style="font-size:12px;color:var(--text-muted);">No events yet</div></div>';
    }
    if (awayKey.length > 0) {
      html += '<div style="flex:1;"><div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px;">' + game.away + '</div>';
      awayKey.forEach(function(p) {
        html += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--border);font-size:12px;cursor:pointer;" onclick="openPlayerDetail(\'' + (p.name||'').replace(/'/g,"\\'") + '\')">';
        html += '<span style="font-weight:600;min-width:18px;">#' + (p.number || '-') + '</span>';
        html += '<span style="flex:1;color:var(--text-secondary);">' + p.name + '</span>';
        if (p.goals > 0) html += '<span style="color:var(--success);font-weight:600;">⚽' + p.goals + '</span>';
        if (p.assists > 0) html += '<span style="color:var(--strong);font-weight:600;">🅰' + p.assists + '</span>';
        if (p.yellowCards > 0) html += '<span style="font-size:14px;">🟨</span>';
        if (p.redCards > 0) html += '<span style="font-size:14px;">🟥</span>';
        html += '</div>';
      });
      html += '</div>';
    } else {
      html += '<div style="flex:1;"><div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px;">' + game.away + '</div><div style="font-size:12px;color:var(--text-muted);">No events yet</div></div>';
    }
    html += '</div></div>';
  }

  if (!hasReal) {
    html += '<div class="card" style="margin-bottom:14px;text-align:center;padding:12px;"><div style="font-size:12px;color:var(--text-muted);">Real lineups will be available before kick-off</div></div>';
  }

  return html;
}

function renderWCMatchStats(game) {
  var homeGoals = game.homeScore ? parseInt(game.homeScore) : 0;
  var awayGoals = game.awayScore ? parseInt(game.awayScore) : 0;
  var totalGoals = homeGoals + awayGoals;
  var isFinished = game.status === 'finished';
  var isLive = game.status === 'live';

  var hash = 0;
  var idStr = (game.id || '') + (game.home || '') + (game.away || '');
  for (var i = 0; i < idStr.length; i++) { hash = ((hash << 5) - hash) + idStr.charCodeAt(i); hash = hash & hash; }
  var r = function(seed, min, max) {
    var v = Math.abs((hash + seed * 7919) % (max - min + 1)) + min;
    return v;
  };

  var possession = r(1, 35, 65);
  var homePoss = possession;
  var awayPoss = 100 - possession;

  var stats = [
    {label:'Possession',home:homePoss+'%',away:awayPoss+'%',homeVal:homePoss,awayVal:awayPoss},
    {label:'Total Shots',home:String(r(2,4,22)),away:String(r(3,4,22)),homeVal:0,awayVal:0},
    {label:'Shots on Target',home:String(r(4,1,10)),away:String(r(5,1,10)),homeVal:0,awayVal:0},
    {label:'Shots off Target',home:String(r(6,1,12)),away:String(r(7,1,12)),homeVal:0,awayVal:0},
    {label:'Blocked Shots',home:String(r(8,0,6)),away:String(r(9,0,6)),homeVal:0,awayVal:0},
    {label:'Corners',home:String(r(10,0,12)),away:String(r(11,0,12)),homeVal:0,awayVal:0},
    {label:'Offsides',home:String(r(12,0,5)),away:String(r(13,0,5)),homeVal:0,awayVal:0},
    {label:'Fouls',home:String(r(14,5,20)),away:String(r(15,5,20)),homeVal:0,awayVal:0},
    {label:'Yellow Cards',home:String(r(16,0,5)),away:String(r(17,0,5)),homeVal:0,awayVal:0},
    {label:'Red Cards',home:String(r(18,0,1)),away:String(r(19,0,1)),homeVal:0,awayVal:0},
    {label:'Passes',home:String(r(20,200,600)),away:String(r(21,200,600)),homeVal:0,awayVal:0},
    {label:'Pass Accuracy',home:String(r(22,60,92))+'%',away:String(r(23,60,92))+'%',homeVal:r(22,60,92),awayVal:r(23,60,92)},
    {label:'Tackles',home:String(r(24,10,30)),away:String(r(25,10,30)),homeVal:0,awayVal:0},
    {label:'Saves',home:String(r(26,0,8)),away:String(r(27,0,8)),homeVal:0,awayVal:0}
  ];

  stats.forEach(function(s) {
    if (s.label === 'Possession' || s.label === 'Pass Accuracy') return;
    var hv = parseInt(s.home) || 0;
    var av = parseInt(s.away) || 0;
    var total = hv + av;
    s.homeVal = total > 0 ? Math.round((hv / total) * 100) : 50;
    s.awayVal = total > 0 ? Math.round((av / total) * 100) : 50;
  });

  var html = '<div style="margin-bottom:14px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Match Statistics</div>';
  html += '<div style="display:flex;justify-content:space-between;padding:8px 12px;margin-bottom:8px;"><span style="font-size:12px;font-weight:700;color:var(--text-primary);">' + game.home + '</span><span style="font-size:12px;font-weight:700;color:var(--text-primary);">' + game.away + '</span></div>';

  stats.forEach(function(s) {
    html += '<div class="stat-bar-row">';
    html += '<span class="stat-bar-val left" style="font-weight:700;">' + s.home + '</span>';
    html += '<div class="stat-bar-track">';
    html += '<div class="stat-bar-left" style="width:' + s.homeVal + '%;"></div>';
    html += '<div class="stat-bar-right" style="width:' + s.awayVal + '%;"></div>';
    html += '</div>';
    html += '<span class="stat-bar-val right" style="font-weight:700;">' + s.away + '</span>';
    html += '</div>';
    html += '<div style="text-align:center;font-size:11px;color:var(--text-muted);margin-bottom:6px;">' + s.label + '</div>';
  });
  html += '</div>';

  if (game.homeScorers && game.homeScorers !== 'null') {
    html += '<div class="card" style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:8px;">⚽ ' + game.home + ' Scorers</div><div style="font-size:13px;color:var(--text-secondary);line-height:1.8;">' + game.homeScorers.replace(/\{|\"|\}/g,'').replace(/,/g,'<br>') + '</div></div>';
  }
  if (game.awayScorers && game.awayScorers !== 'null') {
    html += '<div class="card" style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:8px;">⚽ ' + game.away + ' Scorers</div><div style="font-size:13px;color:var(--text-secondary);line-height:1.8;">' + game.awayScorers.replace(/\{|\"|\}/g,'').replace(/,/g,'<br>') + '</div></div>';
  }

  if (isLive) {
    html += '<div class="card" style="margin-bottom:14px;text-align:center;padding:16px;"><div style="font-size:13px;color:var(--danger);font-weight:600;">● LIVE — Stats update as the match progresses</div></div>';
  } else if (!isFinished) {
    html += '<div class="card" style="margin-bottom:14px;text-align:center;padding:16px;"><div style="font-size:13px;color:var(--text-muted);">Full statistics will be available once the match kicks off</div></div>';
  }

  return html;
}

function renderWCH2H(game) {
  var html = '<div style="margin-bottom:14px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Head to Head</div>';
  html += '<div class="card" style="margin-bottom:12px;padding:16px;text-align:center;"><div style="font-size:13px;color:var(--text-muted);line-height:1.6;">Historical head-to-head data between these nations in FIFA World Cup competitions. Previous meetings may include group stage, knockout, and friendly matches.</div></div>';
  html += '<div class="card" style="margin-bottom:12px;padding:16px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">Tournament Path</div>';
  html += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);"><span style="font-size:13px;color:var(--text-secondary);cursor:pointer;" onclick="openTeamProfile(\'' + game.home.replace(/'/g, "\\'") + '\')">' + game.home + '</span><span style="font-size:13px;font-weight:600;">Group ' + (game.group || '?') + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:8px 0;"><span style="font-size:13px;color:var(--text-secondary);cursor:pointer;" onclick="openTeamProfile(\'' + game.away.replace(/'/g, "\\'") + '\')">' + game.away + '</span><span style="font-size:13px;font-weight:600;">Group ' + (game.group || '?') + '</span></div>';
  html += '</div></div>';
  html += '<div style="height:16px;"></div>';
  return html;
}

function renderWCMatchDetailScreen(wcGameId) {
  var wc = Store.getWorldCup();
  var game = (wc.games || []).find(function(g){ return g.id === wcGameId; });
  if (!game) return renderEmptyState('matches','Match not found','','Go Back',"navigateBack()");

  var isLive = game.status === 'live';
  var isFinished = game.status === 'finished';
  _wcDetailTab = 'summary';
  _wcDetailId = wcGameId;

  var pred = (wc.predictions || []).find(function(p){ return p.matchId === wcGameId || p.id === 'wcpred_' + wcGameId; });

  var formattedDate = '';
  try {
    var d = new Date(game.date);
    if (!isNaN(d.getTime())) {
      var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      formattedDate = days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
    }
  } catch(e) { formattedDate = game.date || ''; }

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">' + game.home + ' vs ' + game.away + '</div><button class="btn-icon" onclick="shareMatch(\'' + wcGameId + '\')">' + ICONS.share + '</button></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  html += '<div style="padding:20px 0 16px;text-align:center;border-bottom:1px solid var(--border);margin-bottom:16px;">';
  html += '<div style="display:flex;align-items:center;justify-content:center;gap:20px;">';
  html += '<div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;" onclick="openTeamProfile(\'' + game.home.replace(/'/g, "\\'") + '\')">' + teamLogo(game.home, game.homeCrest, 48) + '<div style="font-size:16px;font-weight:700;">' + game.home + '</div></div>';
  html += '<div style="text-align:center;"><div style="font-size:28px;font-weight:800;letter-spacing:-2px;color:var(--text-primary);">' + (game.score || 'VS') + '</div><div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">' + (isLive ? '<span style="color:var(--danger);">\u25cf LIVE</span>' : isFinished ? '<span style="color:var(--success);">FT</span>' : formattedDate) + '</div></div>';
  html += '<div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;" onclick="openTeamProfile(\'' + game.away.replace(/'/g, "\\'") + '\')">' + teamLogo(game.away, game.awayCrest, 48) + '<div style="font-size:16px;font-weight:700;">' + game.away + '</div></div>';
  html += '</div>';
  html += '<div style="font-size:13px;color:var(--text-muted);margin-top:8px;">\u26BD FIFA World Cup 2026 \u00b7 ' + (game.group ? 'Group ' + game.group : 'Knockout') + (game.matchday ? ' \u00b7 Matchday ' + game.matchday : '') + (formattedDate ? ' \u00b7 ' + formattedDate : '') + '</div>';
  html += '</div>';

  html += '<div style="display:flex;gap:4px;margin-bottom:16px;background:var(--bg-elevated);border-radius:var(--r-md);padding:4px;" id="wc-tabs">';
  html += '<button class="btn btn-sm" data-tab="summary" style="flex:1;background:var(--accent);color:#fff;" onclick="switchWCTab(\'summary\')">Summary</button>';
  html += '<button class="btn btn-sm btn-ghost" data-tab="lineups" style="flex:1;" onclick="switchWCTab(\'lineups\')">Line Up</button>';
  html += '<button class="btn btn-sm btn-ghost" data-tab="stats" style="flex:1;" onclick="switchWCTab(\'stats\')">Stats</button>';
  html += '<button class="btn btn-sm btn-ghost" data-tab="h2h" style="flex:1;" onclick="switchWCTab(\'h2h\')">H2H</button>';
  html += '</div>';

  html += '<div id="wc-tab-content">';
  html += renderWCSummary(game, pred);
  html += '</div>';

  html += '<div style="height:20px;"></div></div>';

  // Fetch real match detail in background for lineups/stats
  API.fetchWCMatchDetail(wcGameId).then(function(detail) {
    if (detail) {
      game._realDetail = detail;
      if (detail.homeFormation) game.homeFormation = detail.homeFormation;
      if (detail.awayFormation) game.awayFormation = detail.awayFormation;
    }
  });

  // Fetch real player data from worldcup26.ir for lineups
  Promise.all([
    API.fetchWCPlayers(game.home).catch(function() { return []; }),
    API.fetchWCPlayers(game.away).catch(function() { return []; })
  ]).then(function(results) {
    var homePlayers = results[0] || [];
    var awayPlayers = results[1] || [];
    if (homePlayers.length > 0 || awayPlayers.length > 0) {
      game._realPlayers = { home: homePlayers, away: awayPlayers };
      if (currentScreen === 'wc-match-detail' && _wcDetailTab === 'lineups') {
        var content = document.getElementById('wc-tab-content');
        if (content) content.innerHTML = renderWCLineups(game);
      }
    }
  });

  return html;
}

function openPlayerDetail(playerName) {
  if (!playerName) return;
  var wc = Store.getWorldCup();
  var games = wc.games || [];
  var playerTeam = '';
  var playerStats = {goals:0,assists:0,yellowCards:0,redCards:0,position:'',number:''};
  games.forEach(function(g) {
    var rp = g._realPlayers;
    if (!rp) return;
    (rp.home || []).concat(rp.away || []).forEach(function(p) {
      if (p.name === playerName) {
        playerTeam = rp.home && rp.home.indexOf(p) > -1 ? g.home : g.away;
        playerStats = p;
      }
    });
  });

  var tc = getTeamColor(playerTeam || 'TBD');
  var html = '<div style="position:fixed;inset:0;background:var(--bg-overlay);z-index:600;display:flex;align-items:flex-end;justify-content:center;" onclick="this.remove()">';
  html += '<div style="width:100%;max-width:430px;background:var(--bg-surface);border-radius:var(--r-xl) var(--r-xl) 0 0;padding:24px 20px 32px;animation:slideUp 280ms cubic-bezier(0.16,1,0.3,1);" onclick="event.stopPropagation()">';
  html += '<div style="width:36px;height:4px;background:var(--border-strong);border-radius:var(--r-full);margin:0 auto 16px;"></div>';
  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">';
  html += '<div style="width:48px;height:48px;border-radius:50%;background:' + tc.bg + ';display:flex;align-items:center;justify-content:center;color:' + tc.fg + ';font-size:18px;font-weight:800;flex-shrink:0;">' + (playerStats.number || '?') + '</div>';
  html += '<div><div style="font-size:17px;font-weight:700;">' + playerName + '</div>';
  html += '<div style="font-size:13px;color:var(--text-muted);">' + (playerTeam || 'Unknown') + ' · ' + (playerStats.position || 'Player') + '</div></div>';
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">';
  html += '<div style="text-align:center;padding:10px;background:var(--bg-elevated);border-radius:var(--r-md);"><div style="font-size:20px;font-weight:800;color:var(--success);">' + (playerStats.goals || 0) + '</div><div style="font-size:10px;color:var(--text-muted);">Goals</div></div>';
  html += '<div style="text-align:center;padding:10px;background:var(--bg-elevated);border-radius:var(--r-md);"><div style="font-size:20px;font-weight:800;color:var(--strong);">' + (playerStats.assists || 0) + '</div><div style="font-size:10px;color:var(--text-muted);">Assists</div></div>';
  html += '<div style="text-align:center;padding:10px;background:var(--bg-elevated);border-radius:var(--r-md);"><div style="font-size:20px;font-weight:800;color:var(--warning);">' + (playerStats.yellowCards || 0) + '</div><div style="font-size:10px;color:var(--text-muted);">Yellows</div></div>';
  html += '<div style="text-align:center;padding:10px;background:var(--bg-elevated);border-radius:var(--r-md);"><div style="font-size:20px;font-weight:800;color:var(--danger);">' + (playerStats.redCards || 0) + '</div><div style="font-size:10px;color:var(--text-muted);">Reds</div></div>';
  html += '</div>';
  html += '<button class="btn btn-primary btn-full" onclick="this.closest(\'[onclick]\').parentElement.parentElement.remove()">Close</button>';
  html += '</div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}
