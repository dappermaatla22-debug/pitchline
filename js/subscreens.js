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
  var predHtml = pred
    ? '<div class="card card-accent-left" style="margin-bottom:14px;"><div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">AI Prediction</div><div style="display:flex;align-items:center;justify-content:space-between;"><div><div style="font-size:16px;font-weight:700;">' + pred.outcome + '</div>' + renderConfidenceBadge(pred.tier) + '</div>' + renderScoreRing(pred.confidence, 64) + '</div></div>'
    : '<div class="card" style="margin-bottom:14px;text-align:center;padding:20px;"><div style="color:var(--text-muted);font-size:14px;">No prediction available for this match</div></div>';

  var html = predHtml;

  html += '<div style="display:flex;gap:10px;margin-bottom:14px;">';
  html += '<button class="btn btn-primary" style="flex:1;" onclick="openPredDetail(\'' + (pred ? pred.id : '') + '\')">' + ICONS.eye + ' View Analysis</button>';
  html += '<button class="btn btn-secondary" onclick="savePrediction(\'' + (pred ? pred.id : '') + '\')">' + ICONS.bookmark + '</button>';
  html += '<button class="btn btn-secondary" onclick="openComparison(\'' + match.home + '\',\'' + match.away + '\')">' + ICONS.compare + '</button>';
  html += '</div>';

  html += '<div style="margin-bottom:14px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Recent Form</div><div style="display:flex;gap:16px;"><div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">' + match.home + '</div>' + renderFormGuide((pred && pred.homeForm) ? pred.homeForm : ['W','W','D','W','L']) + '</div><div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">' + match.away + '</div>' + renderFormGuide((pred && pred.awayForm) ? pred.awayForm : ['D','W','L','W','W']) + '</div></div></div>';

  var venue = getVenueInfo(match.id);
  var weather = getWeatherInfo();
  html += '<div class="card" style="margin-bottom:14px;padding:12px 16px;"><div style="font-size:13px;font-weight:600;margin-bottom:10px;">Venue & Weather</div><div style="display:flex;gap:16px;flex-wrap:wrap;">';
  html += '<div style="flex:1;min-width:120px;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:2px;">Stadium</div><div style="font-size:13px;font-weight:600;">' + venue.name + '</div><div style="font-size:12px;color:var(--text-secondary);">' + venue.city + ' \u00b7 ' + venue.capacity.toLocaleString() + ' seats</div></div>';
  html += '<div style="flex:1;min-width:120px;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:2px;">Weather</div><div style="font-size:13px;font-weight:600;">' + weather.temp + ' ' + weather.condition + '</div><div style="font-size:12px;color:var(--text-secondary);">Humidity: ' + weather.humidity + '</div></div>';
  html += '</div></div>';

  var preview = generateMatchPreview(match.home, match.away, match.league);
  html += '<div class="card" style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">Match Preview</div><div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">' + preview + '</div></div>';

  html += renderMatchTimeline(match);

  html += renderMatchInjuries(match);

  html += '<div style="height:16px;"></div>';
  return html;
}

function renderMatchTimeline(match) {
  var timelineEvents = [
    {min:'78',type:'goal',team:'home',player:'B. Saka',detail:'Goal \u2014 Assisted by Martin Odegaard'},
    {min:'65',type:'yellow',team:'away',player:'E. Fernandez',detail:'Yellow Card \u2014 Foul on Martin Odegaard'},
    {min:'52',type:'sub',team:'home',player:'J. Havertz',detail:'Subbed on for G. Jesus'},
    {min:'45',type:'halftime',detail:'Half Time'},
    {min:'34',type:'goal',team:'away',player:'C. Palmer',detail:'Goal \u2014 Penalty'},
    {min:'12',type:'goal',team:'home',player:'K. Havertz',detail:'Goal \u2014 Header from corner kick'},
  ];

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
      html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);justify-content:center;"><span style="font-size:12px;color:var(--text-muted);font-weight:500;">Half Time</span></div>';
    } else {
      html += '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);' + (ev.type === 'goal' ? 'background:rgba(52,200,122,0.05);margin:0 -16px;padding:10px 16px;border-radius:var(--r-sm);' : '') + '">';
      html += '<span style="font-size:12px;color:var(--text-muted);width:32px;flex-shrink:0;font-weight:600;">' + ev.min + '\'</span>';
      html += '<div style="color:' + iconColor + ';flex-shrink:0;margin-top:2px;">' + iconHtml + '</div>';
      html += '<div style="flex:1;"><div style="font-size:13px;font-weight:600;color:var(--text-primary);">' + ev.player + '</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px;">' + ev.detail + '</div></div>';
      html += '<div style="font-size:11px;color:var(--text-muted);">' + (ev.team === 'home' ? match.home.substring(0,3) : match.away.substring(0,3)) + '</div>';
      html += '</div>';
    }
  });
  html += '</div></div>';
  return html;
}

function renderMatchInjuries(match) {
  var injuries = [{team:match.home,player:'M. Saliba',pos:'DF',status:'Out'},{team:match.away,player:'R. James',pos:'DF',status:'Doubtful'}];
  var html = '<div style="margin-bottom:14px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Injury Report</div><div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;">';
  injuries.forEach(function(inj) {
    html += '<div class="list-row" style="cursor:default;"><div><div style="font-size:13px;font-weight:600;">' + inj.player + ' <span style="color:var(--text-muted);font-weight:400;">(' + inj.pos + ')</span></div><div style="font-size:12px;color:var(--text-muted);">' + inj.team + '</div></div><span class="confidence-badge ' + (inj.status === 'Out' ? 'badge-risky' : 'badge-moderate') + '">' + inj.status + '</span></div>';
  });
  html += '</div></div>';
  return html;
}

// ─── Lineups Tab ──────────────────────────────────────────────────────────────
function renderMatchLineups(match) {
  var homeFormation = [
    {num:'1',name:'Raya',pos:'GK',x:50,y:92},
    {num:'2',name:'White',pos:'RB',x:18,y:78},
    {num:'6',name:'Gabriel',pos:'CB',x:38,y:80},
    {num:'2',name:'Saliba',pos:'CB',x:62,y:80},
    {num:'35',name:'Zinchenko',pos:'LB',x:82,y:78},
    {num:'5',name:'Partey',pos:'CDM',x:50,y:65},
    {num:'8',name:'Odegaard',pos:'CM',x:35,y:58},
    {num:'29',name:'Havertz',pos:'CM',x:65,y:58},
    {num:'7',name:'Saka',pos:'RW',x:15,y:45},
    {num:'14',name:'Nketiah',pos:'ST',x:50,y:40},
    {num:'11',name:'Martinelli',pos:'LW',x:85,y:45}
  ];
  var awayFormation = [
    {num:'1',name:'Sanchez',pos:'GK',x:50,y:8},
    {num:'24',name:'James',pos:'RB',x:82,y:22},
    {num:'6',name:'Thiago Silva',pos:'CB',x:62,y:20},
    {num:'4',name:'Colwill',pos:'CB',x:38,y:20},
    {num:'21',name:'Cucurella',pos:'LB',x:18,y:22},
    {num:'25',name:'Caicedo',pos:'CDM',x:50,y:35},
    {num:'8',name:'Fernandez',pos:'CM',x:35,y:42},
    {num:'23',name:'Gallagher',pos:'CM',x:65,y:42},
    {num:'11',name:'Madueke',pos:'RW',x:85,y:55},
    {num:'15',name:'Jackson',pos:'ST',x:50,y:60},
    {num:'10',name:'Palmer',pos:'LW',x:15,y:55}
  ];

  var tc_home = getTeamColor(match.home);
  var tc_away = getTeamColor(match.away);

  var html = '<div style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div style="font-size:14px;font-weight:600;">' + match.home + '</div><span style="font-size:12px;color:var(--text-muted);font-weight:600;">4-3-3</span></div>';
  html += '<div class="pitch-container">';

  html += '<div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;"><div style="width:2px;height:100%;background:rgba(255,255,255,0.2);position:absolute;"></div></div>';
  html += '<div style="position:absolute;top:50%;left:0;right:0;height:2px;background:rgba(255,255,255,0.2);"></div>';
  html += '<div style="position:absolute;top:50%;left:50%;width:20%;aspect-ratio:1;border:2px solid rgba(255,255,255,0.2);border-radius:50%;transform:translate(-50%,-50%);"></div>';
  html += '<div style="position:absolute;top:0;left:30%;right:30%;height:18%;border-bottom:2px solid rgba(255,255,255,0.2);"></div>';
  html += '<div style="position:absolute;bottom:0;left:30%;right:30%;height:18%;border-top:2px solid rgba(255,255,255,0.2);"></div>';

  homeFormation.forEach(function(p) {
    html += '<div class="pitch-player" style="left:' + p.x + '%;top:' + p.y + '%;"><div class="pitch-player-num" style="background:' + tc_home.bg + ';">' + p.num + '</div><div class="pitch-player-name">' + p.name + '</div></div>';
  });
  html += '</div></div>';

  html += '<div style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div style="font-size:14px;font-weight:600;">' + match.away + '</div><span style="font-size:12px;color:var(--text-muted);font-weight:600;">4-2-3-1</span></div>';
  html += '<div class="pitch-container" style="transform:scaleY(-1);">';

  html += '<div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;"><div style="width:2px;height:100%;background:rgba(255,255,255,0.2);position:absolute;"></div></div>';
  html += '<div style="position:absolute;top:50%;left:0;right:0;height:2px;background:rgba(255,255,255,0.2);"></div>';
  html += '<div style="position:absolute;top:50%;left:50%;width:20%;aspect-ratio:1;border:2px solid rgba(255,255,255,0.2);border-radius:50%;transform:translate(-50%,-50%);"></div>';
  html += '<div style="position:absolute;top:0;left:30%;right:30%;height:18%;border-bottom:2px solid rgba(255,255,255,0.2);"></div>';
  html += '<div style="position:absolute;bottom:0;left:30%;right:30%;height:18%;border-top:2px solid rgba(255,255,255,0.2);"></div>';

  awayFormation.forEach(function(p) {
    html += '<div class="pitch-player" style="left:' + p.x + '%;top:' + p.y + '%;"><div class="pitch-player-num" style="background:' + tc_away.bg + ';">' + p.num + '</div><div class="pitch-player-name">' + p.name + '</div></div>';
  });
  html += '</div></div>';

  html += '<div class="card" style="margin-bottom:14px;"><div style="font-size:13px;font-weight:600;margin-bottom:8px;">Bench</div>';
  var homeBench = ['Ramsdale','Tierney','Jorginho','Smith Rowe','Trossard','Vieira','Nelson'];
  var awayBench = ['Petrovic','Disasi','Chilwell','Ugochukwu','Casadei','Mudryk','Broja'];
  html += '<div style="display:flex;gap:12px;">';
  html += '<div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">' + match.home + '</div><div style="font-size:12px;color:var(--text-secondary);line-height:1.6;">' + homeBench.join(', ') + '</div></div>';
  html += '<div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">' + match.away + '</div><div style="font-size:12px;color:var(--text-secondary);line-height:1.6;">' + awayBench.join(', ') + '</div></div>';
  html += '</div></div>';

  return html;
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────
function renderMatchStats(match) {
  var stats = [
    {label:'Possession',home:'58%',away:'42%',homeVal:58,awayVal:42},
    {label:'Shots',home:'16',away:'9',homeVal:64,awayVal:36},
    {label:'Shots on Target',home:'7',away:'3',homeVal:70,awayVal:30},
    {label:'Corners',home:'8',away:'4',homeVal:67,awayVal:33},
    {label:'Fouls',home:'11',away:'14',homeVal:44,awayVal:56},
    {label:'xG',home:'2.14',away:'0.87',homeVal:71,awayVal:29}
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
  var h2h = [
    {date:'Mar 2024',result:'1 - 2',out:'A'},
    {date:'Oct 2023',result:'2 - 0',out:'H'},
    {date:'Apr 2023',result:'3 - 3',out:'D'},
    {date:'Nov 2022',result:'1 - 0',out:'H'},
    {date:'Feb 2022',result:'0 - 1',out:'A'}
  ];

  var homeWins = h2h.filter(function(h){ return h.out === 'H'; }).length;
  var draws = h2h.filter(function(h){ return h.out === 'D'; }).length;
  var awayWins = h2h.filter(function(h){ return h.out === 'A'; }).length;

  var html = '<div style="margin-bottom:14px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Head to Head</div>';

  html += '<div class="card" style="margin-bottom:12px;padding:16px;text-align:center;"><div style="display:flex;justify-content:center;gap:24px;margin-bottom:12px;">';
  html += '<div><div style="font-size:24px;font-weight:700;color:var(--success);">' + homeWins + '</div><div style="font-size:11px;color:var(--text-muted);">Home Wins</div></div>';
  html += '<div><div style="font-size:24px;font-weight:700;color:var(--warning);">' + draws + '</div><div style="font-size:11px;color:var(--text-muted);">Draws</div></div>';
  html += '<div><div style="font-size:24px;font-weight:700;color:var(--danger);">' + awayWins + '</div><div style="font-size:11px;color:var(--text-muted);">Away Wins</div></div>';
  html += '</div>';
  html += '<div style="display:flex;height:6px;border-radius:3px;overflow:hidden;">';
  html += '<div style="flex:' + homeWins + ';background:var(--success);"></div>';
  html += '<div style="flex:' + draws + ';background:var(--warning);"></div>';
  html += '<div style="flex:' + awayWins + ';background:var(--danger);"></div>';
  html += '</div></div>';

  html += '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">Last 5 Meetings</div>';
  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;padding:4px 16px;">';
  h2h.forEach(function(h) {
    var label = h.out === 'H' ? match.home.split(' ')[0] : h.out === 'A' ? match.away.split(' ')[0] : 'Draw';
    html += '<div class="h2h-row"><span class="h2h-date">' + h.date + '</span><span class="h2h-result">' + match.home + ' ' + h.result + ' ' + match.away + '</span><span class="h2h-outcome h2h-' + h.out + '">' + label + '</span></div>';
  });
  html += '</div></div>';

  html += '<div style="height:16px;"></div>';
  return html;
}

// ─── Match Detail Screen (Wrapper) ────────────────────────────────────────────
function renderMatchDetailScreen(matchId) {
  var matches = Store.getMatches();
  var match = matches.find(function(m){ return m.id === matchId; });
  if (!match) return renderEmptyState('matches','Match not found','This match could not be loaded.','Go Back',"navigateBack()");
  var isLive = match.status === 'live';
  _matchDetailTab = 'summary';
  _matchDetailId = matchId;

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">' + match.home + ' vs ' + match.away + '</div><button class="btn-icon" onclick="shareMatch(\'' + matchId + '\')">' + ICONS.share + '</button></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  html += '<div style="padding:20px 0 16px;text-align:center;border-bottom:1px solid var(--border);margin-bottom:16px;">';
  html += '<div style="display:flex;align-items:center;justify-content:center;gap:20px;">';
  html += '<div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;">' + teamLogo(match.home, match.homeCrest, 48) + '<div style="font-size:16px;font-weight:700;">' + match.home + '</div></div>';
  html += '<div style="text-align:center;"><div style="font-size:28px;font-weight:800;letter-spacing:-2px;color:var(--text-primary);">' + (isLive ? match.score : 'VS') + '</div><div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">' + (isLive ? '<span style="color:var(--danger);">\u25cf LIVE ' + (match.minute || '') + '</span>' : match.time) + '</div></div>';
  html += '<div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;">' + teamLogo(match.away, match.awayCrest, 48) + '<div style="font-size:16px;font-weight:700;">' + match.away + '</div></div>';
  html += '</div>';
  html += '<div style="font-size:13px;color:var(--text-muted);margin-top:8px;">' + match.league + '</div>';
  html += '</div>';

  var preview = generateMatchPreview(match.home, match.away, match.league);
  html += '<div class="card" style="margin-bottom:14px;padding:12px 16px;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Match Preview</div><div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">' + preview + '</div></div>';

  html += '<div style="display:flex;gap:4px;margin-bottom:16px;background:var(--bg-elevated);border-radius:var(--r-md);padding:4px;" id="match-tabs">';
  html += '<button class="btn btn-sm" data-tab="summary" style="flex:1;background:var(--accent);color:#fff;" onclick="switchMatchTab(\'summary\')">Summary</button>';
  html += '<button class="btn btn-sm btn-ghost" data-tab="lineups" style="flex:1;" onclick="switchMatchTab(\'lineups\')">Line Up</button>';
  html += '<button class="btn btn-sm btn-ghost" data-tab="stats" style="flex:1;" onclick="switchMatchTab(\'stats\')">Stats</button>';
  html += '<button class="btn btn-sm btn-ghost" data-tab="h2h" style="flex:1;" onclick="switchMatchTab(\'h2h\')">H2H</button>';
  html += '</div>';

  html += '<div id="match-tab-content">';
  html += renderMatchSummary(match, match.predId ? Store.getPredictions().find(function(p){ return p.id === match.predId; }) : null);
  html += '</div>';

  html += '<div style="height:20px;"></div></div>';
  return html;
}

// ─── Prediction Detail Screen ─────────────────────────────────────────────────
function renderPredDetailScreen(predId) {
  var predictions = Store.getPredictions();
  var pred = predictions.find(function(p){ return p.id === predId; });
  if (!pred) return renderEmptyState('predictions','Prediction not found','','','');
  var agreeColor = pred.tier === 'elite' ? 'var(--elite)' : pred.tier === 'strong' ? 'var(--strong)' : 'var(--moderate)';
  var confText = pred.confidence >= 80 ? 'Very high model agreement' : pred.confidence >= 65 ? 'Good model agreement' : 'Moderate agreement';

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Match Analysis</div><button class="btn-icon" onclick="sharePred(\'' + predId + '\')">' + ICONS.share + '</button></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  html += '<div style="padding:20px 0 16px;border-bottom:1px solid var(--border);margin-bottom:16px;"><div style="font-size:13px;color:var(--text-muted);margin-bottom:6px;">' + pred.league + ' \u00b7 ' + pred.time + '</div><div style="display:flex;align-items:center;gap:8px;font-size:20px;font-weight:700;letter-spacing:-0.5px;margin-bottom:8px;">' + teamLogo(pred.home, pred.homeCrest, 28) + '<span>' + pred.home + '</span> <span style="color:var(--text-muted);font-weight:400;">vs</span> <span>' + pred.away + '</span>' + teamLogo(pred.away, pred.awayCrest, 28) + '</div>' + renderConfidenceBadge(pred.tier) + '</div>';

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

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">' + teamName + '</div><button class="btn-icon" onclick="followTeam(\'' + teamName + '\')">' + ICONS.heart + '</button></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  html += '<div style="padding:20px 0 16px;border-bottom:1px solid var(--border);margin-bottom:20px;display:flex;align-items:center;gap:16px;">' + teamLogo(teamName, teamLogoUrl, 56) + '<div><div style="font-size:20px;font-weight:700;letter-spacing:-0.5px;">' + teamName + '</div><div style="font-size:13px;color:var(--text-muted);">' + teamMatches.length + ' matches tracked</div></div></div>';

  html += '<div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:16px;">' + renderScoreRing(78, 68, 'var(--accent)') + '<div><div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Predicted Strength</div><div style="font-size:24px;font-weight:700;">78</div><div style="font-size:13px;color:var(--text-secondary);">' + teamPreds.length + ' predictions</div></div></div>';

  html += '<div style="margin-bottom:16px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Recent Form</div>' + renderFormGuide(['W','W','D','W','L']) + '</div>';

  html += '<div style="display:flex;gap:10px;margin-bottom:16px;"><div class="card" style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Home Record</div><div style="display:flex;gap:12px;"><div><div style="font-size:20px;font-weight:700;color:var(--success);">8</div><div style="font-size:11px;color:var(--text-muted);">W</div></div><div><div style="font-size:20px;font-weight:700;color:var(--warning);">3</div><div style="font-size:11px;color:var(--text-muted);">D</div></div><div><div style="font-size:20px;font-weight:700;color:var(--risky);">2</div><div style="font-size:11px;color:var(--text-muted);">L</div></div></div></div><div class="card" style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Away Record</div><div style="display:flex;gap:12px;"><div><div style="font-size:20px;font-weight:700;color:var(--success);">6</div><div style="font-size:11px;color:var(--text-muted);">W</div></div><div><div style="font-size:20px;font-weight:700;color:var(--warning);">4</div><div style="font-size:11px;color:var(--text-muted);">D</div></div><div><div style="font-size:20px;font-weight:700;color:var(--risky);">3</div><div style="font-size:11px;color:var(--text-muted);">L</div></div></div></div></div>';

  html += '<div style="margin-bottom:16px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;">Recent Matches</div><div style="display:flex;flex-direction:column;gap:8px;">';
  teamMatches.slice(0,4).forEach(function(m) {
    var score = m.status === 'live' ? m.score : m.time;
    html += '<div class="card" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;"><div><span style="font-size:13px;font-weight:600;">' + m.home + ' vs ' + m.away + '</span></div><span style="font-size:13px;color:var(--text-secondary);">' + score + '</span></div>';
  });
  html += '</div></div>';

  html += '<div style="display:flex;gap:10px;margin-bottom:20px;"><button class="btn btn-primary" style="flex:1;" onclick="navigate(\'competitions\')">View Predictions</button><button class="btn btn-secondary" onclick="openComparison(\'' + teamName + '\',\'\')">Compare</button></div>';

  html += '<div style="height:20px;"></div></div>';
  return html;
}

// ─── Comparison Screen ────────────────────────────────────────────────────────
function renderComparisonScreen(teamA, teamB) {
  teamA = teamA || 'Arsenal'; teamB = teamB || 'Chelsea';
  var metrics = [
    {label:'Form (last 5)',a:'4W 1D',b:'3W 1D 1L'},
    {label:'Goals Scored',a:'2.4/g',b:'1.9/g'},
    {label:'Goals Conceded',a:'0.8/g',b:'1.1/g'},
    {label:'Home Performance',a:'87%',b:'72%'},
    {label:'Away Performance',a:'64%',b:'58%'},
    {label:'Predicted Strength',a:'84',b:'76'},
    {label:'xG For',a:'2.7',b:'2.1'},
    {label:'xG Against',a:'0.9',b:'1.3'}
  ];

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Team Comparison</div><button class="btn-icon" onclick="swapTeams()">' + ICONS.swap + '</button></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  html += '<div style="display:flex;gap:10px;padding:16px 0;"><div style="flex:1;background:var(--bg-card);border:1px solid var(--accent);border-radius:var(--r-md);padding:12px;text-align:center;"><div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">Team A</div><div style="font-size:16px;font-weight:700;">' + teamA + '</div></div><div style="display:flex;align-items:center;"><button class="btn-icon" onclick="swapTeams()">' + ICONS.swap + '</button></div><div style="flex:1;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:12px;text-align:center;"><div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">Team B</div><div style="font-size:16px;font-weight:700;">' + teamB + '</div></div></div>';

  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;padding:0 16px;">';
  metrics.forEach(function(m) {
    html += '<div class="compare-row"><span class="compare-val-a">' + m.a + '</span><span class="compare-label">' + m.label + '</span><span class="compare-val-b">' + m.b + '</span></div>';
  });
  html += '</div>';

  html += '<div class="card card-accent-left" style="margin-top:16px;"><div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Model Verdict</div><div style="font-size:15px;font-weight:600;margin-bottom:4px;">' + teamA + ' rated higher</div><div style="font-size:13px;color:var(--text-secondary);">Based on current form, xG and home/away records, ' + teamA + ' holds a significant advantage.</div></div>';

  html += '<div style="display:flex;gap:10px;margin-top:16px;margin-bottom:20px;"><button class="btn btn-primary" style="flex:1;" onclick="navigate(\'competitions\')">View Predictions</button><button class="btn btn-secondary" onclick="saveComparison()">Save</button></div>';

  html += '<div style="height:20px;"></div></div>';
  return html;
}

// ─── Search Screen ────────────────────────────────────────────────────────────
function renderSearchScreen() {
  var recent = ['Arsenal','Premier League','Real Madrid'];
  var trending = ['Bayern Munich','Champions League','Erling Haaland'];

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Search</div></div>';

  html += '<div style="overflow-y:auto;flex:1;">';

  html += '<div class="search-input-wrap"><div class="search-icon">' + ICONS.search + '</div><input class="search-input" id="search-field" type="text" placeholder="Teams, leagues, matches\u2026" oninput="handleSearch(this.value)"></div>';

  html += '<div id="search-results"><div style="padding:8px 16px;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Recent Searches</div>';
  recent.forEach(function(s) {
    html += '<div class="list-row" onclick="openSearchResult(\'' + s + '\')"><div style="display:flex;align-items:center;gap:12px;">' + ICONS.search + '<span style="font-size:14px;">' + s + '</span></div>' + ICONS.chevronRight + '</div>';
  });
  html += '</div>';

  html += '<div style="padding:8px 16px;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Trending</div>';
  trending.forEach(function(s) {
    html += '<div class="list-row" onclick="openSearchResult(\'' + s + '\')"><div style="display:flex;align-items:center;gap:12px;">' + ICONS.trendUp + '<span style="font-size:14px;">' + s + '</span></div>' + ICONS.chevronRight + '</div>';
  });
  html += '</div></div></div>';

  return html;
}

// ─── Notifications Screen ─────────────────────────────────────────────────────
function renderNotificationsScreen() {
  var notifs = Store.getNotifications();
  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Notifications</div><button class="btn btn-sm btn-ghost" onclick="clearAllNotifs()">Clear All</button></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;"><div style="margin-top:16px;display:flex;flex-direction:column;gap:8px;">';

  notifs.forEach(function(n) {
    html += '<div class="card ' + (n.read ? '' : 'card-accent-left') + '" style="' + (n.read ? '' : 'border-color:rgba(255,77,125,0.25);') + '" onclick="markRead(\'' + n.id + '\')"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;"><div style="flex:1;"><div style="font-size:14px;font-weight:' + (n.read ? '500' : '600') + ';margin-bottom:3px;">' + n.title + '</div><div style="font-size:13px;color:var(--text-secondary);">' + n.body + '</div><div style="font-size:12px;color:var(--text-muted);margin-top:6px;">' + n.time + '</div></div>' + (!n.read ? '<div style="width:8px;height:8px;background:var(--accent);border-radius:50%;margin-top:4px;flex-shrink:0;"></div>' : '') + '</div></div>';
  });

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
  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Favourite Teams</div><button class="btn-icon" onclick="openAddTeamModal()">' + ICONS.plus + '</button></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;"><div style="margin-top:16px;">';

  if (favs.length === 0) {
    html += renderEmptyState('heart','No favourite teams','Add teams you follow to get personalised predictions and alerts.','Add Team',"openAddTeamModal()");
  } else {
    html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;">';
    favs.forEach(function(t) {
      html += '<div class="list-row"><div style="display:flex;align-items:center;gap:12px;">' + teamLogo(t, null, 36) + '<span style="font-size:14px;font-weight:500;">' + t + '</span></div><button onclick="removeFavTeam(\'' + t + '\')" style="background:none;border:none;color:var(--risky);cursor:pointer;">' + ICONS.close + '</button></div>';
    });
    html += '</div>';
    html += '<button class="btn btn-secondary btn-full" style="margin-top:12px;" onclick="openAddTeamModal()">' + ICONS.plus + ' Add Team</button>';
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
function renderStandingsScreen(leagueCode) {
  var code = leagueCode || 'PL';
  var leagueNames = { 'PL':'Premier League', 'PD':'La Liga', 'BL1':'Bundesliga', 'SA':'Serie A', 'FL1':'Ligue 1', 'CL':'Champions League' };

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">' + (leagueNames[code] || code) + ' Standings</div></div>';

  html += '<div class="chip-row" id="standings-chips"><div class="chip active" onclick="filterStandings(\'overall\',this)">Overall</div><div class="chip" onclick="filterStandings(\'home\',this)">Home</div><div class="chip" onclick="filterStandings(\'away\',this)">Away</div></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin-top:12px;">';

  html += '<div style="display:grid;grid-template-columns:32px 1fr 28px 28px 28px 28px 36px;padding:8px 12px;border-bottom:1px solid var(--border);font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;"><span>#</span><span>Team</span><span style="text-align:center;">W</span><span style="text-align:center;">D</span><span style="text-align:center;">L</span><span style="text-align:center;">GD</span><span style="text-align:center;">Pts</span></div>';

  var standings = [
    { pos:1, team:'Arsenal', w:24, d:5, l:3, gd:'+52', pts:77 },
    { pos:2, team:'Liverpool', w:23, d:6, l:3, gd:'+45', pts:75 },
    { pos:3, team:'Man City', w:22, d:5, l:5, gd:'+40', pts:71 },
    { pos:4, team:'Aston Villa', w:18, d:6, l:8, gd:'+18', pts:60 },
    { pos:5, team:'Tottenham', w:17, d:5, l:10, gd:'+13', pts:56 },
    { pos:6, team:'Newcastle', w:16, d:7, l:9, gd:'+20', pts:55 },
    { pos:7, team:'Chelsea', w:15, d:8, l:9, gd:'+8', pts:53 },
    { pos:8, team:'Man United', w:15, d:5, l:12, gd:'-2', pts:50 },
    { pos:9, team:'West Ham', w:14, d:6, l:12, gd:'-5', pts:48 },
    { pos:10, team:'Brighton', w:13, d:8, l:11, gd:'+4', pts:47 }
  ];

  standings.forEach(function(row) {
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

  html += '<div style="height:20px;"></div></div>';
  return html;
}

// ─── World Cup Match Detail Screen ────────────────────────────────────────────
function renderWCMatchDetailScreen(wcGameId) {
  var wc = Store.getWorldCup();
  var game = (wc.games || []).find(function(g){ return g.id === wcGameId; });
  if (!game) return renderEmptyState('matches','Match not found','','Go Back',"navigateBack()");

  var isLive = game.status === 'live';
  var isFinished = game.status === 'finished';

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">' + game.home + ' vs ' + game.away + '</div><button class="btn-icon" onclick="shareMatch(\'' + wcGameId + '\')">' + ICONS.share + '</button></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  html += '<div style="padding:24px 0 20px;text-align:center;border-bottom:1px solid var(--border);margin-bottom:16px;">';
  html += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Group ' + game.group + ' \u00b7 Matchday ' + game.matchday + '</div>';
  html += '<div style="display:flex;align-items:center;justify-content:center;gap:20px;">';
  html += '<div style="text-align:center;flex:1;"><div style="font-size:16px;font-weight:700;">' + game.home + '</div></div>';
  html += '<div style="text-align:center;"><div style="font-size:32px;font-weight:800;letter-spacing:-2px;">' + (game.score || ' - ') + '</div>';
  if (isLive) {
    html += '<div style="font-size:13px;color:var(--danger);margin-top:4px;font-weight:600;">LIVE</div>';
  } else if (isFinished) {
    html += '<div style="font-size:13px;color:var(--success);margin-top:4px;font-weight:600;">Full Time</div>';
  } else {
    html += '<div style="font-size:13px;color:var(--text-muted);margin-top:4px;">' + (game.local_date || game.date || '') + '</div>';
  }
  html += '</div>';
  html += '<div style="text-align:center;flex:1;"><div style="font-size:16px;font-weight:700;">' + game.away + '</div></div>';
  html += '</div>';

  if (game.homeScorers && game.homeScorers !== 'null') {
    html += '<div style="margin-top:12px;text-align:left;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:4px;">' + game.home + ' Scorers</div><div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">' + game.homeScorers.replace(/\{/g,'').replace(/\}/g,'').replace(/"/g,'') + '</div></div>';
  }
  if (game.awayScorers && game.awayScorers !== 'null') {
    html += '<div style="margin-top:8px;text-align:left;"><div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:4px;">' + game.away + ' Scorers</div><div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">' + game.awayScorers.replace(/\{/g,'').replace(/\}/g,'').replace(/"/g,'') + '</div></div>';
  }
  html += '</div>';

  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin-bottom:16px;">';
  html += '<div style="padding:12px 14px;font-size:13px;font-weight:600;border-bottom:1px solid var(--border);">Match Info</div>';
  html += '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);"><span style="font-size:13px;color:var(--text-secondary);">Competition</span><span style="font-size:13px;font-weight:600;">FIFA World Cup 2026</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);"><span style="font-size:13px;color:var(--text-secondary);">Group</span><span style="font-size:13px;font-weight:600;">' + game.group + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);"><span style="font-size:13px;color:var(--text-secondary);">Matchday</span><span style="font-size:13px;font-weight:600;">' + game.matchday + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:10px 14px;"><span style="font-size:13px;color:var(--text-secondary);">Type</span><span style="font-size:13px;font-weight:600;">' + (game.type || 'Group Stage') + '</span></div>';
  html += '</div>';

  html += '<div style="display:flex;gap:10px;margin-bottom:16px;"><button class="btn btn-primary" style="flex:1;" onclick="navigate(\'worldcup\')">Back to World Cup</button></div>';

  html += '<div style="height:20px;"></div></div>';
  return html;
}
