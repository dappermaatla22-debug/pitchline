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

  if (live.length > 0) {
    html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--danger);animation:pulse 2s infinite;"></div><span class="section-title">Live Now</span></div><span class="section-link" onclick="navigate(\'competitions\')">See More</span></div><div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:4px;">' + live.map(function(m) { return renderLiveMatchCard(m); }).join('') + '</div></div>';
  }

  if (predictions.length === 0 && matches.length === 0) {
    html += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;"><div style="width:40px;height:40px;border:3px solid var(--bg-elevated);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:16px;"></div><div style="font-size:14px;color:var(--text-muted);">Loading matches...</div></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
  } else {
    if (elite.length > 0) {
      html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--elite);"></div><span class="section-title">Elite Picks</span></div><span class="section-link" onclick="navigate(\'competitions\')">View All</span></div><div style="display:flex;flex-direction:column;gap:10px;">' + elite.slice(0,2).map(renderPredCard).join('') + '</div></div>';
    }

    if (strong.length > 0) {
      html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--strong);"></div><span class="section-title">Strong Picks</span></div><span class="section-link" onclick="navigate(\'competitions\')">View All</span></div><div style="display:flex;flex-direction:column;gap:10px;">' + strong.slice(0,2).map(renderPredCard).join('') + '</div></div>';
    }

    var risky = predictions.filter(function(p){ return p.tier==='moderate'||p.tier==='risky'; });
    if (risky.length > 0) {
      html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--danger);"></div><span class="section-title">Avoid List</span></div></div><div class="card" style="background:var(--risky-dim);border-color:rgba(244,63,94,0.2);"><div style="font-size:13px;color:var(--risky);font-weight:600;margin-bottom:8px;">Low confidence matches</div>' + risky.slice(0,4).map(function(p){ return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(244,63,94,0.12);cursor:pointer;" onclick="openPredDetail(\'' + p.id + '\')"><span style="font-size:13px;color:var(--text-secondary);">' + p.home + ' vs ' + p.away + '</span><span style="font-size:13px;font-weight:600;color:var(--risky);">' + p.confidence + '%</span></div>'; }).join('') + '</div></div>';
    }
  }

  html += '<div class="section"><div class="section-header"><span class="section-title">All Matches Today</span><span class="section-link" onclick="navigate(\'competitions\')">Browse</span></div><div style="display:flex;flex-direction:column;gap:10px;">' + matches.slice(0,6).map(renderMatchCard).join('') + '</div></div>';

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

  if (live.length) {
    html += '<div style="font-size:12px;font-weight:600;color:var(--danger);letter-spacing:0.5px;text-transform:uppercase;margin:16px 0 10px;">&#9679; Live Now</div><div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">' + live.map(renderMatchCard).join('') + '</div>';
  }

  html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:10px;">Today</div><div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">' + upcoming.map(renderMatchCard).join('') + '</div>';

  if (tomorrow.length) {
    html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:10px;">Tomorrow</div><div style="display:flex;flex-direction:column;gap:10px;">' + tomorrow.map(renderMatchCard).join('') + '</div>';
  }

  html += '<div style="height:20px;"></div></div>';
  return html;
}

function renderNewsScreen() {
  var html = '<div class="app-header"><div class="header-title">News</div><div class="header-actions"><button class="btn-icon" onclick="navigate(\'search\')">' + ICONS.search + '</button></div></div>';

  html += '<div class="chip-row"><div class="chip active">All</div><div class="chip">Transfers</div><div class="chip">Injuries</div><div class="chip">Analysis</div><div class="chip">Tactics</div></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  html += '<div style="margin-top:16px;"><div class="section-header" style="margin-bottom:12px;"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--accent);"></div><span class="section-title">Latest Updates</span></div></div>';

  html += '<div style="display:flex;flex-direction:column;gap:12px;">';

  NEWS_DATA.forEach(function(article) {
    var iconSvg = '';
    if (article.image === 'transfer') iconSvg = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="' + article.catColor + '" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>';
    else if (article.image === 'analysis') iconSvg = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="' + article.catColor + '" stroke-width="1.5"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/><polyline points="9 12 12 15 15 12"/></svg>';
    else if (article.image === 'injury') iconSvg = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="' + article.catColor + '" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>';
    else iconSvg = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="' + article.catColor + '" stroke-width="1.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>';

    html += '<div class="match-card" style="padding:16px;cursor:pointer;" onclick="openNewsDetail(\'' + article.id + '\')"><div style="display:flex;gap:14px;"><div style="width:64px;height:64px;background:var(--bg-elevated);border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + iconSvg + '</div><div style="flex:1;min-width:0;"><div style="font-size:11px;font-weight:600;color:' + article.catColor + ';text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">' + article.category + '</div><div style="font-size:15px;font-weight:600;margin-bottom:4px;line-height:1.3;">' + article.title + '</div><div style="font-size:13px;color:var(--text-muted);">' + article.time + '</div></div></div></div>';
  });

  html += '</div></div>';
  html += '<div style="height:20px;"></div></div>';
  return html;
}

function renderProfileScreen() {
  var u = Store.getUser();
  var savedCount = Store.getSavedPredictions().length;
  var unreadCount = Store.getUnreadCount();
  var favTeams = Store.getFavTeams();
  var html = '<div class="app-header"><div class="header-title">Profile</div><button class="btn-icon" onclick="navigate(\'settings\')">' + ICONS.settings + '</button></div>';

  html += '<div style="overflow-y:auto;flex:1;">';

  html += '<div style="padding:24px 16px 20px;display:flex;align-items:center;gap:16px;border-bottom:1px solid var(--border);"><div style="width:64px;height:64px;border-radius:50%;background:var(--accent-dim);border:2px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:var(--accent);">' + (u.initials || u.name.substring(0,2).toUpperCase()) + '</div><div style="flex:1;"><div style="font-size:18px;font-weight:700;letter-spacing:-0.3px;">' + u.name + '</div><div style="font-size:13px;color:var(--text-muted);margin-top:2px;">' + u.plan + ' Plan</div></div><button class="btn btn-sm btn-secondary" onclick="openEditProfile()">' + ICONS.edit + ' Edit</button></div>';

  html += '<div style="padding:20px 16px 0;"><div class="stat-grid"><div class="stat-card"><div class="stat-label">Tracked</div><div class="stat-value">' + u.stats.tracked + '</div></div><div class="stat-card"><div class="stat-label">Accuracy</div><div class="stat-value" style="color:var(--success);">' + u.stats.correctPct + '%</div></div><div class="stat-card"><div class="stat-label">Elite Hit</div><div class="stat-value" style="color:var(--elite);">' + u.stats.eliteHitPct + '%</div></div><div class="stat-card"><div class="stat-label">Streak</div><div class="stat-value" style="color:var(--warning);">' + u.stats.streak + '</div><div class="stat-sub">correct</div></div></div></div>';

  html += '<div style="margin:20px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;">';
  html += '<div class="list-row" onclick="navigate(\'saved\')"><div style="display:flex;align-items:center;gap:12px;">' + ICONS.bookmark + '<div><div style="font-size:14px;font-weight:500;">Saved Predictions</div><div style="font-size:12px;color:var(--text-muted);">' + savedCount + ' saved</div></div></div>' + ICONS.chevronRight + '</div>';
  html += '<div class="list-row" onclick="navigate(\'favorites\')"><div style="display:flex;align-items:center;gap:12px;">' + ICONS.heart + '<div><div style="font-size:14px;font-weight:500;">Favourite Teams</div><div style="font-size:12px;color:var(--text-muted);">' + favTeams.join(', ') + '</div></div></div>' + ICONS.chevronRight + '</div>';
  html += '<div class="list-row" onclick="navigate(\'notifications-screen\')"><div style="display:flex;align-items:center;gap:12px;">' + ICONS.bell + '<div><div style="font-size:14px;font-weight:500;">Notifications</div><div style="font-size:12px;color:var(--text-muted);">' + unreadCount + ' unread</div></div></div>' + ICONS.chevronRight + '</div>';
  html += '<div class="list-row" onclick="navigate(\'settings\')"><div style="display:flex;align-items:center;gap:12px;">' + ICONS.settings + '<div><div style="font-size:14px;font-weight:500;">Settings</div><div style="font-size:12px;color:var(--text-muted);">Theme, language, preferences</div></div></div>' + ICONS.chevronRight + '</div>';
  html += '</div>';

  html += '<div style="padding:0 16px;"><button class="btn btn-ghost btn-full" onclick="signOut()" style="color:var(--risky);border-color:rgba(244,63,94,0.2);">' + ICONS.logout + ' Sign Out</button></div>';
  html += '<div style="height:20px;"></div></div>';
  return html;
}

function renderWorldCupScreen() {
  var wc = Store.getWorldCup();
  var games = wc.games || [];
  var groups = wc.groups || [];

  var liveGames = games.filter(function(g){ return g.status === 'live'; });
  var finishedGames = games.filter(function(g){ return g.status === 'finished'; });
  var upcomingGames = games.filter(function(g){ return g.status === 'upcoming'; });

  var html = '<div class="app-header"><div class="header-title" style="display:flex;align-items:center;gap:8px;"><span style="font-size:20px;">&#127942;</span> World Cup 2026</div></div>';

  html += '<div class="chip-row"><div class="chip active">All</div><div class="chip" onclick="filterWCStatus(\'live\',this)"><span style="color:var(--danger);">&#9679;</span> Live (' + liveGames.length + ')</div><div class="chip">Upcoming</div><div class="chip">Finished</div></div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  if (games.length === 0) {
    html += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;"><div style="width:40px;height:40px;border:3px solid var(--bg-elevated);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:16px;"></div><div style="font-size:14px;color:var(--text-muted);">Loading World Cup data...</div></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
    Store.fetchWorldCupData();
  } else {
    if (liveGames.length > 0) {
      html += '<div style="font-size:12px;font-weight:600;color:var(--danger);letter-spacing:0.5px;text-transform:uppercase;margin:16px 0 10px;">&#9679; Live Now</div><div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">';
      liveGames.forEach(function(g) {
        html += '<div class="match-card" style="border-color:rgba(244,63,94,0.3);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:11px;color:var(--text-muted);">Group ' + g.group + ' \u00b7 Matchday ' + g.matchday + '</span><span style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--danger);font-weight:600;"><span style="width:6px;height:6px;border-radius:50%;background:var(--danger);animation:pulse 2s infinite;"></span>LIVE</span></div><div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;"><span style="font-size:14px;font-weight:600;">' + g.home + '</span><span style="font-size:22px;font-weight:800;letter-spacing:-1px;">' + (g.score || '0 - 0') + '</span><span style="font-size:14px;font-weight:600;">' + g.away + '</span></div></div>';
      });
      html += '</div>';
    }

    if (upcomingGames.length > 0) {
      html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:10px;">Upcoming (' + upcomingGames.length + ')</div><div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">';
      upcomingGames.slice(0,6).forEach(function(g) {
        html += '<div class="match-card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:11px;color:var(--text-muted);">Group ' + g.group + ' \u00b7 Matchday ' + g.matchday + '</span><span style="font-size:12px;color:var(--text-muted);">' + g.date + '</span></div><div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;"><span style="font-size:14px;font-weight:600;">' + g.home + '</span><span style="font-size:13px;font-weight:600;color:var(--text-muted);">VS</span><span style="font-size:14px;font-weight:600;">' + g.away + '</span></div></div>';
      });
      html += '</div>';
    }

    if (finishedGames.length > 0) {
      html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:10px;">Results (' + finishedGames.length + ')</div><div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">';
      finishedGames.slice(0,8).forEach(function(g) {
        html += '<div class="match-card" style="opacity:0.8;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:11px;color:var(--text-muted);">Group ' + g.group + ' \u00b7 Matchday ' + g.matchday + '</span><span style="font-size:11px;color:var(--success);font-weight:600;">FT</span></div><div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;"><span style="font-size:14px;font-weight:600;">' + g.home + '</span><span style="font-size:22px;font-weight:800;letter-spacing:-1px;">' + (g.score || '0 - 0') + '</span><span style="font-size:14px;font-weight:600;">' + g.away + '</span></div></div>';
      });
      html += '</div>';
    }

    if (groups.length > 0) {
      html += '<div style="font-size:12px;font-weight:600;color:var(--accent);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:10px;">Group Standings</div>';

      var teamMap = {};
      (wc.teams || []).forEach(function(t) { teamMap[t.id || t._id] = t.name_en || t.name || ''; });

      groups.forEach(function(group) {
        html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin-bottom:12px;">';
        html += '<div style="padding:10px 14px;font-size:13px;font-weight:700;color:var(--accent);border-bottom:1px solid var(--border);">Group ' + group.name + '</div>';
        html += '<div style="display:grid;grid-template-columns:24px 1fr 24px 24px 24px 24px 32px;padding:6px 14px;border-bottom:1px solid var(--border);font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;"><span>#</span><span>Team</span><span style="text-align:center;">P</span><span style="text-align:center;">W</span><span style="text-align:center;">D</span><span style="text-align:center;">L</span><span style="text-align:center;">Pts</span></div>';
        (group.teams || []).forEach(function(t, i) {
          var teamName = teamMap[t.team_id] || ('Team ' + t.team_id);
          var zoneColor = i < 2 ? 'var(--elite)' : 'transparent';
          html += '<div style="display:grid;grid-template-columns:24px 1fr 24px 24px 24px 24px 32px;padding:8px 14px;border-bottom:1px solid var(--border);align-items:center;">';
          html += '<span style="font-size:11px;font-weight:600;color:var(--text-muted);border-left:2px solid ' + zoneColor + ';padding-left:4px;">' + (i+1) + '</span>';
          html += '<span style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + teamName + '</span>';
          html += '<span style="font-size:11px;text-align:center;color:var(--text-secondary);">' + t.mp + '</span>';
          html += '<span style="font-size:11px;text-align:center;color:var(--text-secondary);">' + t.w + '</span>';
          html += '<span style="font-size:11px;text-align:center;color:var(--text-secondary);">' + t.d + '</span>';
          html += '<span style="font-size:11px;text-align:center;color:var(--text-secondary);">' + t.l + '</span>';
          html += '<span style="font-size:11px;font-weight:700;text-align:center;">' + t.pts + '</span>';
          html += '</div>';
        });
        html += '</div>';
      });
    }
  }

  html += '<div style="height:20px;"></div></div>';
  return html;
}