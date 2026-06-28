function renderHomeScreen() {
  var matches = Store.getMatches();
  var predictions = Store.getPredictions();
  var live = matches.filter(function(m){ return m.status === 'live'; });
  var today = predictions.filter(function(p){ return p.date === 'Today'; });
  var elite = today.filter(function(p){ return p.tier === 'elite'; });
  var strong = today.filter(function(p){ return p.tier === 'strong'; });

  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var todayObj = new Date();
  var dateChips = '';
  for (var i = 0; i < 7; i++) {
    var d = new Date(todayObj);
    d.setDate(todayObj.getDate() + i - 3);
    var label = i === 3 ? 'Today' : (i === 4 ? 'Tomorrow' : days[d.getDay()] + ' ' + d.getDate());
    dateChips += '<div class="date-chip' + (i === 3 ? ' active' : '') + '" onclick="filterDate(\'' + label.toLowerCase() + '\',this)"><div class="date-chip-day">' + days[d.getDay()] + '</div><div class="date-chip-num">' + d.getDate() + '</div><div class="date-chip-month">' + months[d.getMonth()] + '</div></div>';
  }

  var html = '<div class="app-header"><div class="header-logo">PITCH<span>LINE</span></div><div class="header-actions"><button class="btn-icon" onclick="navigate(\'search\')">' + ICONS.search + '</button><button class="btn-icon" onclick="navigate(\'notifications-screen\')" style="position:relative;">' + ICONS.bell + (Store.getUnreadCount() > 0 ? '<span class="notif-badge">' + Store.getUnreadCount() + '</span>' : '') + '</button></div></div>';
  html += '<div style="overflow-y:auto;flex:1;">';
  html += '<div class="chip-row date-selector" id="date-chips">' + dateChips + '</div>';

  html += '<div class="quick-access-row">'
    + '<div class="quick-card" onclick="navigate(\'fixtures\')">'
    + '<div class="quick-card-icon" style="background:rgba(79,142,247,0.15);color:var(--strong);">' + ICONS.matches + '</div>'
    + '<div class="quick-card-label">Fixtures</div>'
    + '<div class="quick-card-sub">' + matches.length + ' matches</div>'
    + '</div>'
    + '<div class="quick-card" onclick="navigate(\'worldcup\')">'
    + '<div class="quick-card-icon" style="background:rgba(255,77,125,0.15);color:var(--accent);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20M12 2a14.5 14.5 0 010 20M2 12h20"/></svg></div>'
    + '<div class="quick-card-label">World Cup</div>'
    + '<div class="quick-card-sub">2026</div>'
    + '</div>'
    + '<div class="quick-card" onclick="navigate(\'stats\')">'
    + '<div class="quick-card-icon" style="background:rgba(52,200,122,0.15);color:var(--elite);">' + ICONS.predictions + '</div>'
    + '<div class="quick-card-label">Stats</div>'
    + '<div class="quick-card-sub">' + predictions.length + ' preds</div>'
    + '</div>'
    + '</div>';

  if (live.length > 0) {
    html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--danger);animation:pulse 2s infinite;"></div><span class="section-title">Live Now</span><span style="font-size:12px;font-weight:600;color:var(--danger);background:rgba(244,63,94,0.12);padding:2px 8px;border-radius:var(--r-full);">' + live.length + '</span></div><span class="section-link" onclick="navigate(\'competitions\')">See More</span></div><div style="display:flex;gap:12px;overflow-x:auto;padding:0 var(--sp-4) 4px;scroll-snap-type:x mandatory;scrollbar-width:none;">' + live.map(function(m) { return renderLiveMatchCard(m); }).join('') + '</div></div>';
  }

  if (predictions.length === 0 && matches.length === 0) {
    html += renderLoadingState();
  } else {
    if (elite.length > 0) html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--elite);"></div><span class="section-title">Elite Picks</span></div><span class="section-link" onclick="navigate(\'predictions\')">View All</span></div><div style="display:flex;flex-direction:column;gap:10px;">' + elite.slice(0,2).map(renderPredCard).join('') + '</div></div>';
    if (strong.length > 0) html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--strong);"></div><span class="section-title">Strong Picks</span></div><span class="section-link" onclick="navigate(\'predictions\')">View All</span></div><div style="display:flex;flex-direction:column;gap:10px;">' + strong.slice(0,2).map(renderPredCard).join('') + '</div></div>';

    var risky = predictions.filter(function(p){ return p.tier==='moderate'||p.tier==='risky'; });
    if (risky.length > 0) html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--danger);"></div><span class="section-title">Avoid List</span></div></div><div class="card" style="background:var(--risky-dim);border-color:rgba(244,63,94,0.2);">' + risky.slice(0,4).map(function(p){ return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(244,63,94,0.12);cursor:pointer;" onclick="openPredDetail(\'' + p.id + '\')"><span style="font-size:13px;color:var(--text-secondary);">' + p.home + ' vs ' + p.away + '</span><span style="font-size:13px;font-weight:600;color:var(--risky);">' + p.confidence + '%</span></div>'; }).join('') + '</div></div>';
  }

  html += '<div class="section"><div class="section-header"><span class="section-title">All Matches</span><span class="section-link" onclick="navigate(\'fixtures\')">Browse</span></div><div style="display:flex;flex-direction:column;gap:10px;">' + matches.slice(0,6).map(renderMatchCard).join('') + '</div></div>';
  html += '<div style="height:20px;"></div></div>';
  return html;
}

function renderCompetitionsScreen() {
  var matches = Store.getMatches();
  var live = matches.filter(function(m){ return m.status === 'live'; });
  var upcoming = matches.filter(function(m){ return m.status === 'upcoming'; });
  var tomorrow = matches.filter(function(m){ return m.status === 'tomorrow'; });

  var html = '<div class="app-header"><div class="header-title">Competitions</div><div class="header-actions"><button class="btn-icon" onclick="openFilterDrawer()">' + ICONS.filter + '</button><button class="btn-icon" onclick="navigate(\'search\')">' + ICONS.search + '</button></div></div>';
  html += '<div class="chip-row" id="match-date-chips"><div class="chip active" onclick="filterMatchDate(\'all\',this)">All</div><div class="chip" onclick="filterMatchDate(\'today\',this)">Today</div><div class="chip" onclick="filterMatchDate(\'tomorrow\',this)">Tomorrow</div><div class="chip" onclick="filterMatchDate(\'live\',this)"><span style="color:var(--danger);">&#9679;</span> Live (' + live.length + ')</div></div>';
  html += '<div class="chip-row" style="padding-top:0;"><div class="chip active">All Leagues</div><div class="chip" onclick="openStandings(\'PL\')">&#127467;&#127471; PL</div><div class="chip" onclick="openStandings(\'PD\')">&#127466;&#127480; La Liga</div><div class="chip" onclick="openStandings(\'BL1\')">&#127465;&#127466; Bundesliga</div><div class="chip" onclick="openStandings(\'SA\')">&#127470;&#127481; Serie A</div><div class="chip" onclick="openStandings(\'FL1\')">&#127467;&#127479; Ligue 1</div></div>';
  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';
  if (live.length) html += '<div style="font-size:12px;font-weight:600;color:var(--danger);letter-spacing:0.5px;text-transform:uppercase;margin:16px 0 10px;">&#9679; Live Now</div><div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">' + live.map(renderMatchCard).join('') + '</div>';
  html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:10px;">Today</div><div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">' + upcoming.map(renderMatchCard).join('') + '</div>';
  if (tomorrow.length) html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:10px;">Tomorrow</div><div style="display:flex;flex-direction:column;gap:10px;">' + tomorrow.map(renderMatchCard).join('') + '</div>';
  html += '<div style="height:20px;"></div></div>';
  return html;
}

var WC_FILTER = 'all';

function renderWorldCupScreen() {
  var wc = Store.getWorldCup();
  var games = wc.games || [];
  var groups = wc.groups || [];
  var filter = WC_FILTER;

  var liveGames = games.filter(function(g){ return g.status === 'live'; });
  var finishedGames = games.filter(function(g){ return g.status === 'finished'; });
  var upcomingGames = games.filter(function(g){ return g.status === 'upcoming'; });

  var totalGoals = 0;
  var totalFinished = 0;
  games.forEach(function(g) {
    if (g.status === 'finished' && g.homeScore && g.awayScore) {
      totalGoals += parseInt(g.homeScore) + parseInt(g.awayScore);
      totalFinished++;
    }
  });

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigate(\'home\')">' + ICONS.chevronLeft + '</button><div class="header-title" style="display:flex;align-items:center;gap:8px;"><span style="font-size:20px;">&#127942;</span> World Cup 2026</div></div>';

  html += '<div class="chip-row" id="wc-filter-chips">';
  html += '<div class="chip' + (filter==='all'?' active':'') + '" onclick="setWCFilter(\'all\',this)">All</div>';
  html += '<div class="chip' + (filter==='live'?' active':'') + '" onclick="setWCFilter(\'live\',this)"><span style="color:var(--danger);">&#9679;</span> Live (' + liveGames.length + ')</div>';
  html += '<div class="chip' + (filter==='upcoming'?' active':'') + '" onclick="setWCFilter(\'upcoming\',this)">Upcoming (' + upcomingGames.length + ')</div>';
  html += '<div class="chip' + (filter==='finished'?' active':'') + '" onclick="setWCFilter(\'finished\',this)">Results (' + finishedGames.length + ')</div>';
  html += '<div class="chip' + (filter==='stats'?' active':'') + '" onclick="setWCFilter(\'stats\',this)">Stats</div>';
  html += '</div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  if (games.length === 0) {
    html += renderLoadingState();
    Store.fetchWorldCupData();
  } else if (filter === 'stats') {
    html += renderWCStats(games, groups, wc.teams || []);
  } else {
    if (filter === 'all' || filter === 'live') {
      if (liveGames.length > 0) {
        html += '<div style="font-size:12px;font-weight:600;color:var(--danger);letter-spacing:0.5px;text-transform:uppercase;margin:12px 0 8px;">&#9679; Live Now (' + liveGames.length + ')</div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">';
        liveGames.forEach(function(g) {
          html += renderWCMatchCard(g, true);
        });
        html += '</div>';
      } else if (filter === 'live') {
        html += '<div style="padding:40px 0;text-align:center;color:var(--text-muted);">No live matches right now</div>';
      }
    }

    if (filter === 'all' || filter === 'upcoming') {
      if (upcomingGames.length > 0) {
        html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin:12px 0 8px;">Upcoming (' + upcomingGames.length + ')</div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">';
        upcomingGames.slice(0, filter==='upcoming' ? 999 : 4).forEach(function(g) {
          html += renderWCMatchCard(g, false);
        });
        html += '</div>';
      }
    }

    if (filter === 'all' || filter === 'finished') {
      if (finishedGames.length > 0) {
        html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin:12px 0 8px;">Results (' + finishedGames.length + ')</div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">';
        finishedGames.slice(0, filter==='finished' ? 999 : 4).forEach(function(g) {
          html += renderWCMatchCard(g, false);
        });
        html += '</div>';
      }
    }

    if (filter === 'all' && groups.length > 0) {
      html += renderWCGroups(games, groups, wc.teams || []);
    }
  }

  html += '<div style="height:20px;"></div></div>';
  return html;
}

function renderWCMatchCard(g, isLive) {
  var scorers = '';
  if (g.homeScorers && g.status === 'finished' || isLive) {
    scorers = g.homeScorers || '';
    if (scorers) scorers = scorers.replace(/\{/g,'').replace(/\}/g,'').replace(/"/g,'');
  }
  var html = '<div class="match-card" onclick="openWCMatchDetail(\'' + g.id + '\')" style="' + (isLive ? 'border-color:rgba(244,63,94,0.3);' : '') + '">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="font-size:11px;color:var(--text-muted);">Group ' + g.group + ' \u00b7 Matchday ' + g.matchday + '</span>';
  if (isLive) {
    html += '<span style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--danger);font-weight:600;"><span style="width:6px;height:6px;border-radius:50%;background:var(--danger);animation:pulse 2s infinite;"></span>LIVE</span>';
  } else if (g.status === 'finished') {
    html += '<span style="font-size:11px;color:var(--success);font-weight:600;">FT</span>';
  } else {
    html += '<span style="font-size:11px;color:var(--text-muted);">' + g.date + '</span>';
  }
  html += '</div>';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;">';
  html += '<span style="font-size:14px;font-weight:600;flex:1;text-align:left;">' + g.home + '</span>';
  html += '<span style="font-size:20px;font-weight:800;letter-spacing:-1px;min-width:60px;text-align:center;">' + (g.score || ' - ') + '</span>';
  html += '<span style="font-size:14px;font-weight:600;flex:1;text-align:right;">' + g.away + '</span>';
  html += '</div>';
  if (scorers && (g.status === 'finished' || isLive)) {
    html += '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;line-height:1.4;">' + scorers + '</div>';
  }
  html += '</div>';
  return html;
}

function renderWCGroups(games, groups, teams) {
  var teamMap = {};
  teams.forEach(function(t) { teamMap[t.id || t._id] = t.name_en || t.name || ''; });

  var html = '<div style="font-size:12px;font-weight:600;color:var(--accent);letter-spacing:0.5px;text-transform:uppercase;margin:12px 0 8px;">Group Standings</div>';
  groups.forEach(function(group) {
    html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin-bottom:10px;">';
    html += '<div style="padding:10px 14px;font-size:13px;font-weight:700;color:var(--accent);border-bottom:1px solid var(--border);">Group ' + group.name + '</div>';
    html += '<div style="display:grid;grid-template-columns:20px 1fr repeat(5,28px) 32px;padding:6px 12px;border-bottom:1px solid var(--border);font-size:9px;font-weight:600;color:var(--text-muted);text-transform:uppercase;"><span></span><span></span><span style="text-align:center;">P</span><span style="text-align:center;">W</span><span style="text-align:center;">D</span><span style="text-align:center;">L</span><span style="text-align:center;">GF</span><span style="text-align:center;">Pts</span></div>';
    (group.teams || []).forEach(function(t, i) {
      var teamName = teamMap[t.team_id] || 'Team ' + t.team_id;
      var zoneColor = i < 2 ? 'var(--elite)' : 'transparent';
      html += '<div style="display:grid;grid-template-columns:20px 1fr repeat(5,28px) 32px;padding:7px 12px;border-bottom:1px solid var(--border);align-items:center;">';
      html += '<span style="font-size:10px;font-weight:600;color:var(--text-muted);border-left:2px solid ' + zoneColor + ';padding-left:4px;">' + (i+1) + '</span>';
      html += '<span style="font-size:11px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + teamName + '</span>';
      html += '<span style="font-size:10px;text-align:center;color:var(--text-secondary);">' + t.mp + '</span>';
      html += '<span style="font-size:10px;text-align:center;color:var(--text-secondary);">' + t.w + '</span>';
      html += '<span style="font-size:10px;text-align:center;color:var(--text-secondary);">' + t.d + '</span>';
      html += '<span style="font-size:10px;text-align:center;color:var(--text-secondary);">' + t.l + '</span>';
      html += '<span style="font-size:10px;text-align:center;color:var(--text-secondary);">' + t.gf + '</span>';
      html += '<span style="font-size:10px;font-weight:700;text-align:center;">' + t.pts + '</span>';
      html += '</div>';
    });
    html += '</div>';
  });
  return html;
}

function renderWCStats(games, groups, teams) {
  var teamMap = {};
  teams.forEach(function(t) { teamMap[t.id || t._id] = t.name_en || t.name || ''; });

  var totalGoals = 0, totalMatches = 0, totalFinished = 0;
  var teamGoals = {};
  games.forEach(function(g) {
    if (g.status === 'finished' && g.homeScore && g.awayScore) {
      var hg = parseInt(g.homeScore) || 0;
      var ag = parseInt(g.awayScore) || 0;
      totalGoals += hg + ag;
      totalMatches++;
      teamGoals[g.home] = (teamGoals[g.home] || 0) + hg;
      teamGoals[g.away] = (teamGoals[g.away] || 0) + ag;
    }
    totalFinished++;
  });

  var sorted = Object.keys(teamGoals).sort(function(a,b){ return teamGoals[b] - teamGoals[a]; });

  var html = '<div style="margin-top:12px;">';

  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px;">';
  html += '<div class="card" style="text-align:center;padding:16px 8px;"><div style="font-size:28px;font-weight:800;color:var(--accent);">' + totalGoals + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Total Goals</div></div>';
  html += '<div class="card" style="text-align:center;padding:16px 8px;"><div style="font-size:28px;font-weight:800;color:var(--success);">' + totalMatches + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Matches Played</div></div>';
  html += '<div class="card" style="text-align:center;padding:16px 8px;"><div style="font-size:28px;font-weight:800;color:var(--warning);">' + (totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '0') + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Goals / Match</div></div>';
  html += '</div>';

  if (sorted.length > 0) {
    html += '<div style="font-size:12px;font-weight:600;color:var(--accent);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:8px;">Top Scoring Teams</div>';
    html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin-bottom:16px;">';
    sorted.slice(0,8).forEach(function(name, i) {
      var pct = teamGoals[name] / (teamGoals[sorted[0]] || 1) * 100;
      html += '<div style="padding:10px 14px;border-bottom:1px solid var(--border);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:12px;font-weight:600;">' + name + '</span><span style="font-size:13px;font-weight:700;color:var(--accent);">' + teamGoals[name] + ' goals</span></div><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%;background:var(--accent);"></div></div></div>';
    });
    html += '</div>';
  }

  var liveGames = games.filter(function(g){ return g.status === 'live'; });
  var finishedGames = games.filter(function(g){ return g.status === 'finished'; });
  var upcomingGames = games.filter(function(g){ return g.status === 'upcoming'; });
  html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:8px;">Tournament Summary</div>';
  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;">';
  html += '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);"><span style="font-size:13px;color:var(--text-secondary);">Total Matches</span><span style="font-size:13px;font-weight:700;">' + games.length + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);"><span style="font-size:13px;color:var(--text-secondary);">Finished</span><span style="font-size:13px;font-weight:700;color:var(--success);">' + finishedGames.length + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);"><span style="font-size:13px;color:var(--text-secondary);">Live</span><span style="font-size:13px;font-weight:700;color:var(--danger);">' + liveGames.length + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);"><span style="font-size:13px;color:var(--text-secondary);">Upcoming</span><span style="font-size:13px;font-weight:700;">' + upcomingGames.length + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:10px 14px;"><span style="font-size:13px;color:var(--text-secondary);">Groups</span><span style="font-size:13px;font-weight:700;">A \u2013 L</span></div>';
  html += '</div>';

  html += '</div>';
  return html;
}

function renderPredictionsScreen() {
  var predictions = Store.getPredictions();
  var elite = predictions.filter(function(p){ return p.tier === 'elite'; });
  var strong = predictions.filter(function(p){ return p.tier === 'strong'; });
  var moderate = predictions.filter(function(p){ return p.tier === 'moderate'; });
  var risky = predictions.filter(function(p){ return p.tier === 'risky'; });

  var activeFilter = 'all';

  var html = '<div class="app-header"><div class="header-title">Predictions</div><div class="header-actions"><button class="btn-icon" onclick="navigate(\'search\')">' + ICONS.search + '</button></div></div>';

  html += '<div class="chip-row" id="pred-filter-chips">';
  html += '<div class="chip active" onclick="filterPreds(\'all\',this)">All <span style="opacity:0.6;">(' + predictions.length + ')</span></div>';
  html += '<div class="chip" onclick="filterPreds(\'elite\',this)"><span style="color:var(--elite);">&#9679;</span> Elite <span style="opacity:0.6;">(' + elite.length + ')</span></div>';
  html += '<div class="chip" onclick="filterPreds(\'strong\',this)"><span style="color:var(--strong);">&#9679;</span> Strong <span style="opacity:0.6;">(' + strong.length + ')</span></div>';
  html += '<div class="chip" onclick="filterPreds(\'moderate\',this)"><span style="color:var(--moderate);">&#9679;</span> Moderate <span style="opacity:0.6;">(' + moderate.length + ')</span></div>';
  html += '<div class="chip" onclick="filterPreds(\'risky\',this)"><span style="color:var(--risky);">&#9679;</span> Risky <span style="opacity:0.6;">(' + risky.length + ')</span></div>';
  html += '</div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;" id="pred-list">';

  if (predictions.length === 0) {
    html += renderEmptyState('predictions','No predictions yet','Check back closer to match time for AI-powered predictions.','Go Home',"navigate('home')");
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:10px;">' + predictions.map(renderPredCard).join('') + '</div>';
  }

  html += '<div style="height:20px;"></div></div>';
  return html;
}

function filterPreds(tier, el) {
  document.querySelectorAll('#pred-filter-chips .chip').forEach(function(c){ c.classList.remove('active'); });
  el.classList.add('active');
  var predictions = Store.getPredictions();
  var filtered = tier === 'all' ? predictions : predictions.filter(function(p){ return p.tier === tier; });
  var list = document.getElementById('pred-list');
  if (list) {
    list.innerHTML = filtered.length === 0
      ? renderEmptyState('predictions','No ' + tier + ' predictions','Check back later for more predictions.','','')
      : '<div style="display:flex;flex-direction:column;gap:10px;">' + filtered.map(renderPredCard).join('') + '</div><div style="height:20px;"></div>';
  }
}

function renderFixturesScreen() {
  var matches = Store.getMatches();
  var html = '<div class="app-header"><div class="header-title">Fixtures</div><div class="header-actions"><button class="btn-icon" onclick="navigate(\'search\')">' + ICONS.search + '</button></div></div>';
  html += '<div class="chip-row" id="fixture-filter-chips"><div class="chip active" onclick="filterFixtures(\'all\',this)">All</div><div class="chip" onclick="filterFixtures(\'live\',this)"><span style="color:var(--danger);">&#9679;</span> Live</div><div class="chip" onclick="filterFixtures(\'upcoming\',this)">Upcoming</div><div class="chip" onclick="filterFixtures(\'finished\',this)">Results</div></div>';
  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;" id="fixture-list">';
  if (matches.length === 0) {
    html += renderEmptyState('matches','No fixtures','No upcoming matches found.','Go Home',"navigate('home')");
  } else {
    var grouped = {};
    matches.forEach(function(m) {
      var key = m.date || 'Other';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });
    Object.keys(grouped).forEach(function(date) {
      html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin:16px 0 8px;">' + date + '</div>';
      html += '<div style="display:flex;flex-direction:column;gap:8px;">';
      grouped[date].forEach(function(m) { html += renderMatchCard(m); });
      html += '</div>';
    });
  }
  html += '<div style="height:20px;"></div></div>';
  return html;
}

function filterFixtures(status, el) {
  document.querySelectorAll('#fixture-filter-chips .chip').forEach(function(c){ c.classList.remove('active'); });
  el.classList.add('active');
  var matches = Store.getMatches();
  var filtered = status === 'all' ? matches : matches.filter(function(m){ return m.status === status; });
  var list = document.getElementById('fixture-list');
  if (list) {
    if (filtered.length === 0) {
      list.innerHTML = renderEmptyState('matches','No matches','No ' + status + ' matches found.','','');
    } else {
      var grouped = {};
      filtered.forEach(function(m) {
        var key = m.date || 'Other';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(m);
      });
      var h = '';
      Object.keys(grouped).forEach(function(date) {
        h += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin:16px 0 8px;">' + date + '</div>';
        h += '<div style="display:flex;flex-direction:column;gap:8px;">';
        grouped[date].forEach(function(m) { h += renderMatchCard(m); });
        h += '</div>';
      });
      list.innerHTML = h + '<div style="height:20px;"></div>';
    }
  }
}

function renderStatsScreen() {
  var matches = Store.getMatches();
  var predictions = Store.getPredictions();
  var totalMatches = matches.length;
  var liveCount = matches.filter(function(m){ return m.status === 'live'; }).length;
  var predCount = predictions.length;
  var eliteCount = predictions.filter(function(p){ return p.tier === 'elite'; }).length;
  var avgConf = predCount > 0 ? Math.round(predictions.reduce(function(a,p){ return a+p.confidence; },0)/predCount) : 0;

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Statistics</div></div>';
  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;margin-bottom:16px;">';
  html += '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:24px;font-weight:800;color:var(--accent);">' + totalMatches + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Total Matches</div></div>';
  html += '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:24px;font-weight:800;color:var(--danger);">' + liveCount + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Live Now</div></div>';
  html += '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:24px;font-weight:800;color:var(--success);">' + predCount + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Predictions</div></div>';
  html += '<div class="card" style="text-align:center;padding:16px;"><div style="font-size:24px;font-weight:800;color:var(--elite);">' + avgConf + '%</div><div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Avg Confidence</div></div>';
  html += '</div>';

  var leagueStats = {};
  predictions.forEach(function(p) {
    if (!leagueStats[p.league]) leagueStats[p.league] = { count: 0, totalConf: 0, elite: 0 };
    leagueStats[p.league].count++;
    leagueStats[p.league].totalConf += p.confidence;
    if (p.tier === 'elite') leagueStats[p.league].elite++;
  });

  html += '<div style="font-size:12px;font-weight:600;color:var(--accent);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:8px;">Predictions by League</div>';
  html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin-bottom:16px;">';
  Object.keys(leagueStats).forEach(function(league) {
    var s = leagueStats[league];
    var avg = Math.round(s.totalConf / s.count);
    html += '<div style="padding:12px 14px;border-bottom:1px solid var(--border);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="font-size:13px;font-weight:600;">' + league + '</span><span style="font-size:12px;color:var(--text-muted);">' + s.count + ' predictions</span></div><div style="display:flex;gap:12px;"><div style="font-size:11px;color:var(--text-muted);">Avg: ' + avg + '%</div><div style="font-size:11px;color:var(--elite);">' + s.elite + ' elite</div></div></div>';
  });
  html += '</div>';

  if (eliteCount > 0) {
    html += '<div style="font-size:12px;font-weight:600;color:var(--elite);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:8px;">Elite Picks (' + eliteCount + ')</div>';
    html += '<div style="display:flex;flex-direction:column;gap:8px;">';
    predictions.filter(function(p){ return p.tier === 'elite'; }).forEach(function(p) {
      html += '<div class="card" style="cursor:pointer;" onclick="openPredDetail(\'' + p.id + '\')"><div style="display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:13px;font-weight:600;">' + p.home + ' vs ' + p.away + '</div><div style="font-size:12px;color:var(--text-muted);">' + p.league + '</div></div><div style="text-align:right;"><div style="font-size:18px;font-weight:800;color:var(--elite);">' + p.confidence + '%</div>' + renderConfidenceBadge(p.tier) + '</div></div></div>';
    });
    html += '</div>';
  }

  html += '<div style="height:20px;"></div></div>';
  return html;
}

function renderNewsScreen() {
  var html = '<div class="app-header"><div class="header-title">News</div></div>';
  html += '<div class="chip-row"><div class="chip active">All</div><div class="chip">Transfers</div><div class="chip">Injuries</div><div class="chip">Analysis</div></div>';
  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;margin-top:12px;">';
  html += '<div style="display:flex;flex-direction:column;gap:12px;">';
  NEWS_DATA.forEach(function(article) {
    var iconSvg = '';
    if (article.image === 'transfer') iconSvg = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="' + article.catColor + '" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg>';
    else if (article.image === 'analysis') iconSvg = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="' + article.catColor + '" stroke-width="1.5"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>';
    else iconSvg = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="' + article.catColor + '" stroke-width="1.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>';
    html += '<div class="match-card" style="padding:14px;cursor:pointer;" onclick="openNewsDetail(\'' + article.id + '\')"><div style="display:flex;gap:12px;"><div style="width:56px;height:56px;background:var(--bg-elevated);border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + iconSvg + '</div><div style="flex:1;min-width:0;"><div style="font-size:11px;font-weight:600;color:' + article.catColor + ';text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">' + article.category + '</div><div style="font-size:14px;font-weight:600;margin-bottom:3px;line-height:1.3;">' + article.title + '</div><div style="font-size:12px;color:var(--text-muted);">' + article.time + '</div></div></div></div>';
  });
  html += '</div></div><div style="height:20px;"></div></div>';
  return html;
}

function renderProfileScreen() {
  var u = Store.getUser();
  var savedCount = Store.getSavedPredictions().length;
  var unreadCount = Store.getUnreadCount();
  var favTeams = Store.getFavTeams();
  var html = '<div class="app-header"><div class="header-title">Profile</div><button class="btn-icon" onclick="navigate(\'settings\')">' + ICONS.settings + '</button></div>';
  html += '<div style="overflow-y:auto;flex:1;">';
  html += '<div style="padding:24px 16px 20px;display:flex;align-items:center;gap:16px;border-bottom:1px solid var(--border);"><div style="width:64px;height:64px;border-radius:50%;background:var(--accent-dim);border:2px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:var(--accent);">' + (u.initials || u.name.substring(0,2).toUpperCase()) + '</div><div style="flex:1;"><div style="font-size:18px;font-weight:700;">' + u.name + '</div><div style="font-size:13px;color:var(--text-muted);margin-top:2px;">' + u.plan + ' Plan</div></div><button class="btn btn-sm btn-secondary" onclick="openEditProfile()">Edit</button></div>';
  html += '<div style="padding:20px 16px 0;"><div class="stat-grid"><div class="stat-card"><div class="stat-label">Tracked</div><div class="stat-value">' + u.stats.tracked + '</div></div><div class="stat-card"><div class="stat-label">Accuracy</div><div class="stat-value" style="color:var(--success);">' + u.stats.correctPct + '%</div></div><div class="stat-card"><div class="stat-label">Elite Hit</div><div class="stat-value" style="color:var(--elite);">' + u.stats.eliteHitPct + '%</div></div><div class="stat-card"><div class="stat-label">Streak</div><div class="stat-value" style="color:var(--warning);">' + u.stats.streak + '</div><div class="stat-sub">correct</div></div></div></div>';
  html += '<div style="margin:20px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;">';
  html += '<div class="list-row" onclick="navigate(\'worldcup\')"><div style="display:flex;align-items:center;gap:12px;"><span style="font-size:18px;">&#127775;</span><div><div style="font-size:14px;font-weight:500;">World Cup 2026</div><div style="font-size:12px;color:var(--text-muted);">Matches, standings, stats</div></div></div>' + ICONS.chevronRight + '</div>';
  html += '<div class="list-row" onclick="navigate(\'competitions\')"><div style="display:flex;align-items:center;gap:12px;">' + ICONS.trophy + '<div><div style="font-size:14px;font-weight:500;">Competitions</div><div style="font-size:12px;color:var(--text-muted);">All leagues &amp; matches</div></div></div>' + ICONS.chevronRight + '</div>';
  html += '<div class="list-row" onclick="navigate(\'saved\')"><div style="display:flex;align-items:center;gap:12px;">' + ICONS.bookmark + '<div><div style="font-size:14px;font-weight:500;">Saved Predictions</div><div style="font-size:12px;color:var(--text-muted);">' + savedCount + ' saved</div></div></div>' + ICONS.chevronRight + '</div>';
  html += '<div class="list-row" onclick="navigate(\'favorites\')"><div style="display:flex;align-items:center;gap:12px;">' + ICONS.heart + '<div><div style="font-size:14px;font-weight:500;">Favourite Teams</div><div style="font-size:12px;color:var(--text-muted);">' + favTeams.join(', ') + '</div></div></div>' + ICONS.chevronRight + '</div>';
  html += '<div class="list-row" onclick="navigate(\'notifications-screen\')"><div style="display:flex;align-items:center;gap:12px;">' + ICONS.bell + '<div><div style="font-size:14px;font-weight:500;">Notifications</div><div style="font-size:12px;color:var(--text-muted);">' + unreadCount + ' unread</div></div></div>' + ICONS.chevronRight + '</div>';
  html += '<div class="list-row" onclick="navigate(\'settings\')"><div style="display:flex;align-items:center;gap:12px;">' + ICONS.settings + '<div><div style="font-size:14px;font-weight:500;">Settings</div><div style="font-size:12px;color:var(--text-muted);">Theme, preferences</div></div></div>' + ICONS.chevronRight + '</div>';
  html += '</div>';
  html += '<div style="padding:0 16px;"><button class="btn btn-ghost btn-full" onclick="signOut()" style="color:var(--risky);border-color:rgba(244,63,94,0.2);">Sign Out</button></div>';
  html += '<div style="height:20px;"></div></div>';
  return html;
}