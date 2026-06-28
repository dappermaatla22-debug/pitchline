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
  html += '<div style="overflow-y:auto;flex:1;position:relative;">';

  html += '<div class="chip-row date-selector" id="date-chips">' + dateChips + '</div>';

  // Hero banner
  html += '<div class="hero-banner" onclick="navigate(\'fixtures\')">'
    + '<div class="hero-title">World Cup 2026</div>'
    + '<div class="hero-sub">48 teams. 16 cities. One champion.</div>'
    + '<button class="hero-cta">' + ICONS.trophy + ' Explore Fixtures</button>'
    + '</div>';

  // Quick access — Neon pill panel
  html += '<div class="quick-access-panel">'
    + '<div class="quick-pills-row">'
    + '<button class="quick-pill active" onclick="navigate(\'fixtures\')">'
    + '<span class="quick-pill-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>'
    + '<div class="quick-pill-stack"><span class="quick-pill-title">' + (typeof t === 'function' ? t('fixtures') : 'Fixtures') + '</span><span class="quick-pill-badge">' + matches.length + ' fixtures</span></div>'
    + '</button>'
    + '<button class="quick-pill" onclick="navigate(\'worldcup\')">'
    + '<span class="quick-pill-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20M12 2a14.5 14.5 0 010 20M2 12h20"/></svg></span>'
    + '<div class="quick-pill-stack"><span class="quick-pill-title">World Cup</span><span class="quick-pill-badge">2026</span></div>'
    + '</button>'
    + '<button class="quick-pill" onclick="navigate(\'predictions\')">'
    + '<span class="quick-pill-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>'
    + '<div class="quick-pill-stack"><span class="quick-pill-title">' + (typeof t === 'function' ? t('predict') : 'Predict') + '</span><span class="quick-pill-badge">' + predictions.length + ' predictions</span></div>'
    + '</button>'
    + '<button class="quick-pill" onclick="navigate(\'stats\')">'
    + '<span class="quick-pill-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span>'
    + '<div class="quick-pill-stack"><span class="quick-pill-title">Stats</span><span class="quick-pill-badge">125 total</span></div>'
    + '</button>'
    + '</div>'
    + '</div>';

  if (live.length > 0) {
    html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--danger);animation:pulse 2s infinite;"></div><span class="section-title">' + (typeof t === 'function' ? t('liveNow') : 'Live Now') + '</span><span style="font-size:12px;font-weight:600;color:var(--danger);background:rgba(244,63,94,0.12);padding:2px 8px;border-radius:var(--r-full);">' + live.length + '</span></div><span class="section-link" onclick="navigate(\'fixtures\')">See More</span></div><div style="display:flex;gap:12px;overflow-x:auto;padding:0 var(--sp-4) 4px;scroll-snap-type:x mandatory;scrollbar-width:none;">' + live.map(function(m) { return renderLiveMatchCard(m); }).join('') + '</div></div>';
  }

  if (predictions.length === 0 && matches.length === 0) {
    html += renderLoadingState();
  } else {
    if (elite.length > 0) html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--elite);"></div><span class="section-title">' + (typeof t === 'function' ? t('elitePicks') : 'Elite Picks') + '</span></div><span class="section-link" onclick="navigate(\'predictions\')">View All</span></div><div style="display:flex;flex-direction:column;gap:10px;">' + elite.slice(0,2).map(renderPredCard).join('') + '</div></div>';
    if (strong.length > 0) html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--strong);"></div><span class="section-title">' + (typeof t === 'function' ? t('strongPicks') : 'Strong Picks') + '</span></div><span class="section-link" onclick="navigate(\'predictions\')">View All</span></div><div style="display:flex;flex-direction:column;gap:10px;">' + strong.slice(0,2).map(renderPredCard).join('') + '</div></div>';

    var risky = predictions.filter(function(p){ return p.tier==='moderate'||p.tier==='risky'; });
    if (risky.length > 0) html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--danger);"></div><span class="section-title">' + (typeof t === 'function' ? t('avoidList') : 'Avoid List') + '</span></div></div><div class="card" style="background:var(--risky-dim);border-color:rgba(244,63,94,0.2);">' + risky.slice(0,4).map(function(p){ return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(244,63,94,0.12);cursor:pointer;" onclick="openPredDetail(\'' + p.id + '\')"><span style="font-size:13px;color:var(--text-secondary);">' + p.home + ' vs ' + p.away + '</span><span style="font-size:13px;font-weight:600;color:var(--risky);">' + p.confidence + '%</span></div>'; }).join('') + '</div></div>';
  }

  html += '<div class="section"><div class="section-header"><span class="section-title">' + (typeof t === 'function' ? t('allMatches') : 'All Matches') + '</span><span class="section-link" onclick="navigate(\'fixtures\')">Browse</span></div><div style="display:flex;flex-direction:column;gap:10px;">' + matches.slice(0,6).map(renderMatchCard).join('') + '</div></div>';
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
      }
    }

    if (filter === 'all' || filter === 'upcoming') {
      if (upcomingGames.length > 0) {
        html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin:12px 0 8px;">Upcoming (' + upcomingGames.length + ')</div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">';
        upcomingGames.forEach(function(g) {
          html += renderWCMatchCard(g, false);
        });
        html += '</div>';
      }
    }

    if (filter === 'all' || filter === 'finished') {
      if (finishedGames.length > 0) {
        html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin:12px 0 8px;">Results (' + finishedGames.length + ')</div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">';
        finishedGames.forEach(function(g) {
          html += renderWCMatchCard(g, false);
        });
        html += '</div>';
      }
    }

    if (filter === 'all' && groups.length > 0) {
      html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin:16px 0 8px;">Group Standings</div>';
      groups.slice(0,4).forEach(function(grp) {
        html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin-bottom:12px;">';
        html += '<div style="padding:10px 14px;font-size:13px;font-weight:600;border-bottom:1px solid var(--border);">Group ' + (grp.name || '?') + '</div>';
        if (grp.standings) {
          grp.standings.forEach(function(row) {
            html += '<div style="display:flex;align-items:center;padding:8px 14px;border-bottom:1px solid var(--border);gap:8px;">';
            html += '<span style="font-size:12px;font-weight:600;color:var(--text-muted);width:20px;">' + row.position + '</span>';
            html += '<span style="font-size:13px;font-weight:600;flex:1;">' + row.team + '</span>';
            html += '<span style="font-size:12px;color:var(--text-secondary);">' + (row.played || 0) + '</span>';
            html += '<span style="font-size:12px;color:var(--text-secondary);">' + (row.won || 0) + '</span>';
            html += '<span style="font-size:13px;font-weight:700;">' + (row.points || 0) + '</span>';
            html += '</div>';
          });
        }
        html += '</div>';
      });
    }
  }

  html += '<div style="height:20px;"></div></div>';
  return html;
}

function renderWCMatchCard(game, isLive) {
  var statusColor = isLive ? 'var(--danger)' : game.status === 'finished' ? 'var(--success)' : 'var(--text-muted)';
  var statusText = isLive ? 'LIVE' : game.status === 'finished' ? 'FT' : game.local_date || '';
  return '<div class="match-card" onclick="openWCMatchDetail(\'' + game.id + '\')">'
    + '<div class="match-teams">'
    + '<div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">'
    + teamLogo(game.home_team_name_en, null, 28)
    + '<span class="team-name">' + game.home_team_name_en + '</span>'
    + '</div>'
    + '<div style="text-align:center;">'
    + '<span class="vs-badge" style="font-size:14px;">' + (game.score || 'vs') + '</span>'
    + '<div style="font-size:11px;color:' + statusColor + ';font-weight:600;margin-top:2px;">' + statusText + '</div>'
    + '</div>'
    + '<div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;justify-content:flex-end;">'
    + '<span class="team-name away">' + game.away_team_name_en + '</span>'
    + teamLogo(game.away_team_name_en, null, 28)
    + '</div>'
    + '</div>'
    + '<div class="match-meta"><span class="match-league">Group ' + (game.group || '?') + ' · Matchday ' + (game.matchday || '?') + '</span></div>'
    + '</div>';
}

function renderWCStats(games, groups, teams) {
  var totalGoals = 0;
  var totalFinished = 0;
  var teamGoals = {};
  games.forEach(function(g) {
    if (g.status === 'finished' && g.homeScore && g.awayScore) {
      var h = parseInt(g.homeScore);
      var a = parseInt(g.awayScore);
      totalGoals += h + a;
      totalFinished++;
      if (!teamGoals[g.home_team_name_en]) teamGoals[g.home_team_name_en] = 0;
      if (!teamGoals[g.away_team_name_en]) teamGoals[g.away_team_name_en] = 0;
      teamGoals[g.home_team_name_en] += h;
      teamGoals[g.away_team_name_en] += a;
    }
  });
  var avgGoals = totalFinished > 0 ? (totalGoals / totalFinished).toFixed(1) : '0.0';

  var html = '<div style="font-size:14px;font-weight:600;margin-bottom:12px;">Tournament Statistics</div>';

  html += '<div class="stat-grid" style="margin-bottom:16px;">';
  html += '<div class="stat-card"><div class="stat-label">Total Goals</div><div class="stat-value">' + totalGoals + '</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Matches Played</div><div class="stat-value">' + totalFinished + '</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Goals/Match</div><div class="stat-value" style="color:var(--accent);">' + avgGoals + '</div></div>';
  html += '<div class="stat-card"><div class="stat-label">Total Teams</div><div class="stat-value">' + (teams.length || games.length * 2) + '</div></div>';
  html += '</div>';

  var sorted = Object.keys(teamGoals).sort(function(a,b){ return teamGoals[b] - teamGoals[a]; }).slice(0,8);
  if (sorted.length > 0) {
    html += '<div style="font-size:14px;font-weight:600;margin-bottom:10px;">Top Scoring Teams</div>';
    html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;">';
    sorted.forEach(function(team, i) {
      html += '<div style="display:flex;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border);gap:10px;">';
      html += '<span style="font-size:12px;font-weight:600;color:var(--text-muted);width:20px;">' + (i+1) + '</span>';
      html += teamLogo(team, null, 24);
      html += '<span style="font-size:13px;font-weight:600;flex:1;">' + team + '</span>';
      html += '<span style="font-size:14px;font-weight:700;color:var(--accent);">' + teamGoals[team] + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  html += '<div class="card" style="margin-top:16px;"><div style="font-size:13px;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Tournament Summary</div><div style="font-size:14px;color:var(--text-secondary);line-height:1.6;">The 2026 FIFA World Cup features 48 teams competing across 16 venues in the United States, Canada, and Mexico. Group stage matches are underway with ' + totalGoals + ' goals scored so far in ' + totalFinished + ' completed matches.</div></div>';

  return html;
}

function renderPredictionsScreen() {
  var predictions = Store.getPredictions();
  var elite = predictions.filter(function(p){ return p.tier === 'elite'; });
  var strong = predictions.filter(function(p){ return p.tier === 'strong'; });
  var moderate = predictions.filter(function(p){ return p.tier === 'moderate'; });
  var risky = predictions.filter(function(p){ return p.tier === 'risky'; });

  var html = '<div class="app-header"><div class="header-title">Predictions</div><div class="header-actions"><button class="btn-icon" onclick="showBetSlip()" title="Bet Slip">' + ICONS.download + '</button><button class="btn-icon" onclick="navigate(\'search\')">' + ICONS.search + '</button></div></div>';

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
  var accStats = typeof getAccuracyStats === 'function' ? getAccuracyStats() : {total:0,correct:0};

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
  var html = '<div class="app-header"><div class="header-title">News</div><div class="header-actions"><button class="btn-icon" onclick="navigate(\'search\')">' + ICONS.search + '</button></div></div>';
  html += '<div class="chip-row"><div class="chip active">All</div><div class="chip">Transfers</div><div class="chip">Analysis</div><div class="chip">Injuries</div><div class="chip">Tactics</div></div>';
  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  var NEWS_DATA = [
    { id:'n1', category:'Transfer', catColor:'var(--accent)', title:'Man City eyeing January move for midfield target', summary:'Manchester City are reportedly monitoring a key midfield target ahead of the January transfer window.', time:'15 min ago' },
    { id:'n2', category:'Analysis', catColor:'var(--success)', title:'Champions League predictions updated after draw', summary:'Following the latest Champions League group stage draw, our prediction models have been recalibrated.', time:'1 hr ago' },
    { id:'n3', category:'Injury', catColor:'var(--warning)', title:'Key striker doubts for weekend showdown', summary:'A crucial striker is facing a race to be fit for this weekend\'s important fixture.', time:'3 hrs ago' },
    { id:'n4', category:'Tactics', catColor:'var(--strong)', title:'How Arsenal\'s new formation could change the title race', summary:'Arsenal\'s tactical shift to a 3-4-3 formation has been producing impressive results.', time:'5 hrs ago' },
    { id:'n5', category:'Transfer', catColor:'var(--accent)', title:'Barcelona targeting Premier League defender', summary:'Barcelona have reportedly identified a Premier League defender as their top transfer target.', time:'8 hrs ago' },
    { id:'n6', category:'Analysis', catColor:'var(--success)', title:'xG breakdown: Which teams are overperforming?', summary:'Our latest expected goals analysis reveals some surprising overperformers across Europe.', time:'12 hrs ago' }
  ];

  NEWS_DATA.forEach(function(article) {
    html += '<div class="news-card" style="margin-bottom:12px;" onclick="openNewsDetail(\'' + article.id + '\')">';
    html += '<div class="news-card-img" style="background:linear-gradient(135deg,var(--bg-elevated),var(--bg-card));"><span style="font-size:11px;font-weight:600;color:' + article.catColor + ';text-transform:uppercase;letter-spacing:0.5px;">' + article.category + '</span></div>';
    html += '<div style="padding:12px;">';
    html += '<div style="font-size:15px;font-weight:600;margin-bottom:6px;line-height:1.3;">' + article.title + '</div>';
    html += '<div style="font-size:13px;color:var(--text-secondary);line-height:1.4;margin-bottom:8px;">' + article.summary + '</div>';
    html += '<div style="font-size:12px;color:var(--text-muted);">' + article.time + '</div>';
    html += '</div></div>';
  });

  html += '<div style="height:20px;"></div></div>';
  return html;
}

function renderProfileScreen() {
  var u = Store.getUser();
  var savedCount = Store.getSavedPredictions().length;
  var unreadCount = Store.getUnreadCount();
  var favTeams = Store.getFavTeams();
  var accStats = typeof getAccuracyStats === 'function' ? getAccuracyStats() : {total:0,correct:0};
  var accuracy = accStats.total > 0 ? Math.round((accStats.correct / accStats.total) * 100) : 0;

  var html = '<div class="app-header"><div class="header-title">Profile</div><button class="btn-icon" onclick="navigate(\'settings\')">' + ICONS.settings + '</button></div>';
  html += '<div style="overflow-y:auto;flex:1;">';

  // Compact header
  html += '<div class="profile-header"><div class="profile-avatar">' + (u.initials || u.name.substring(0,2).toUpperCase()) + '</div><div style="flex:1;"><div class="profile-name">' + u.name + '</div><div class="profile-plan">' + u.plan + ' Plan</div></div><button class="btn btn-sm btn-secondary" onclick="openEditProfile()">Edit</button></div>';

  // Stats row - compact 4-column
  html += '<div style="padding:12px 16px 0;"><div class="stat-grid"><div class="stat-card"><div class="stat-label">Tracked</div><div class="stat-value">' + u.stats.tracked + '</div></div><div class="stat-card"><div class="stat-label">Accuracy</div><div class="stat-value" style="color:var(--success);">' + accuracy + '%</div></div><div class="stat-card"><div class="stat-label">Elite</div><div class="stat-value" style="color:var(--elite);">' + u.stats.eliteHitPct + '%</div></div><div class="stat-card"><div class="stat-label">Streak</div><div class="stat-value" style="color:var(--warning);">' + u.stats.streak + '</div></div></div></div>';

  // Menu items with colored icons
  html += '<div class="profile-section">';
  html += '<div class="profile-list-row" onclick="navigate(\'worldcup\')"><div class="profile-list-icon" style="background:rgba(255,77,125,0.12);color:#ff4d7d;">' + ICONS.trophy + '</div><div class="profile-list-text"><div class="profile-list-title">World Cup 2026</div><div class="profile-list-sub">Matches, standings, stats</div></div>' + ICONS.chevronRight + '</div>';
  html += '<div class="profile-list-row" onclick="navigate(\'competitions\')"><div class="profile-list-icon" style="background:rgba(79,142,247,0.12);color:#4f8ef7;">' + ICONS.matches + '</div><div class="profile-list-text"><div class="profile-list-title">Competitions</div><div class="profile-list-sub">All leagues &amp; matches</div></div>' + ICONS.chevronRight + '</div>';
  html += '<div class="profile-list-row" onclick="showBetSlip()"><div class="profile-list-icon" style="background:rgba(251,191,36,0.12);color:#fbbf24;">' + ICONS.download + '</div><div class="profile-list-text"><div class="profile-list-title">Bet Slip</div><div class="profile-list-sub">Generate from saved picks</div></div>' + ICONS.chevronRight + '</div>';
  html += '<div class="profile-list-row" onclick="navigate(\'saved\')"><div class="profile-list-icon" style="background:rgba(52,200,122,0.12);color:#34c87a;">' + ICONS.bookmark + '</div><div class="profile-list-text"><div class="profile-list-title">Saved</div><div class="profile-list-sub">' + savedCount + ' predictions</div></div>' + ICONS.chevronRight + '</div>';
  html += '<div class="profile-list-row" onclick="navigate(\'favorites\')"><div class="profile-list-icon" style="background:rgba(244,63,94,0.12);color:#f43f5e;">' + ICONS.heart + '</div><div class="profile-list-text"><div class="profile-list-title">Favourite Teams</div><div class="profile-list-sub">' + (favTeams.length > 0 ? favTeams.slice(0,3).join(', ') + (favTeams.length > 3 ? '...' : '') : 'None set') + '</div></div>' + ICONS.chevronRight + '</div>';
  html += '<div class="profile-list-row" onclick="navigate(\'notifications-screen\')"><div class="profile-list-icon" style="background:rgba(168,85,247,0.12);color:#a855f7;">' + ICONS.bell + '</div><div class="profile-list-text"><div class="profile-list-title">Notifications</div><div class="profile-list-sub">' + unreadCount + ' unread</div></div>' + ICONS.chevronRight + '</div>';
  html += '<div class="profile-list-row" onclick="navigate(\'settings\')"><div class="profile-list-icon" style="background:rgba(148,163,184,0.12);color:#94a3b8;">' + ICONS.settings + '</div><div class="profile-list-text"><div class="profile-list-title">Settings</div><div class="profile-list-sub">Theme, preferences</div></div>' + ICONS.chevronRight + '</div>';
  html += '</div>';

  html += '<div style="padding:0 16px 20px;"><button class="btn btn-ghost btn-full" onclick="signOut()" style="color:var(--risky);border-color:rgba(244,63,94,0.2);">Sign Out</button></div>';
  html += '</div>';
  return html;
}