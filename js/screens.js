function renderHomeScreen() {
  var allMatches = Store.getMatches();
  var allPredictions = Store.getPredictions();
  var filtered = getFilteredHomeMatches(allMatches, allPredictions);
  var matches = filtered.matches;
  var predictions = filtered.predictions;
  var live = allMatches.filter(function(m){ return m.status === 'live'; });
  var today = allPredictions.filter(function(p){ return p.date === 'Today'; });
  var upcoming = allPredictions.filter(function(p){ return p.date !== 'Today'; });
  var elitePreds = allPredictions.filter(function(p){ return p.tier === 'elite'; });
  var strongPreds = allPredictions.filter(function(p){ return p.tier === 'strong'; });
  var elite = elitePreds.length > 0 ? elitePreds : today.filter(function(p){ return p.tier === 'elite'; });
  var strong = strongPreds.length > 0 ? strongPreds : today.filter(function(p){ return p.tier === 'strong'; });

  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var todayObj = new Date();
  var dateChips = '';
  for (var i = 0; i < 7; i++) {
    var d = new Date(todayObj);
    d.setDate(todayObj.getDate() + i - 3);
    var chipLabel = i === 3 ? 'Today' : (i === 4 ? 'Tomorrow' : days[d.getDay()] + ' ' + d.getDate());
    var filterVal = i === 3 ? 'today' : (i === 4 ? 'tomorrow' : days[d.getDay()].toLowerCase());
    dateChips += '<div class="date-chip' + (i === 3 ? ' active' : '') + '" onclick="filterDate(\'' + filterVal + '\',this)"><div class="date-chip-day">' + days[d.getDay()] + '</div><div class="date-chip-num">' + d.getDate() + '</div><div class="date-chip-month">' + months[d.getMonth()] + '</div></div>';
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
    + '<div class="quick-pill-stack"><span class="quick-pill-title">Stats</span><span class="quick-pill-badge">' + (allMatches.length + allPredictions.length) + ' total</span></div>'
    + '</button>'
    + '</div>'
    + '</div>';

  if (live.length > 0) {
    html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--danger);animation:pulse 2s infinite;"></div><span class="section-title">' + (typeof t === 'function' ? t('liveNow') : 'Live Now') + '</span><span style="font-size:12px;font-weight:600;color:var(--danger);background:rgba(244,63,94,0.12);padding:2px 8px;border-radius:var(--r-full);">' + live.length + '</span></div><span class="section-link" onclick="navigate(\'fixtures\')">See More</span></div><div style="display:flex;gap:12px;overflow-x:auto;padding:0 var(--sp-4) 4px;scroll-snap-type:x mandatory;scrollbar-width:none;">' + live.map(function(m) { return renderLiveMatchCardWithAnimations(m); }).join('') + '</div></div>';
  }

  if (predictions.length === 0 && matches.length === 0) {
    html += renderLoadingState();
  } else {
    if (elite.length > 0) html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--elite);"></div><span class="section-title">' + (typeof t === 'function' ? t('elitePicks') : 'Elite Picks') + '</span></div><span class="section-link" onclick="navigate(\'predictions\')">View All</span></div><div style="display:flex;flex-direction:column;gap:10px;">' + elite.slice(0,2).map(renderPredCard).join('') + '</div></div>';
    if (strong.length > 0) html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--strong);"></div><span class="section-title">' + (typeof t === 'function' ? t('strongPicks') : 'Strong Picks') + '</span></div><span class="section-link" onclick="navigate(\'predictions\')">View All</span></div><div style="display:flex;flex-direction:column;gap:10px;">' + strong.slice(0,2).map(renderPredCard).join('') + '</div></div>';

    var risky = predictions.filter(function(p){ return p.tier==='moderate'||p.tier==='risky'; });
    if (risky.length > 0) html += '<div class="section"><div class="section-header"><div style="display:flex;align-items:center;gap:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--danger);"></div><span class="section-title">' + (typeof t === 'function' ? t('avoidList') : 'Avoid List') + '</span></div></div><div class="card" style="background:var(--risky-dim);border-color:rgba(244,63,94,0.2);">' + risky.slice(0,4).map(function(p){ return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(244,63,94,0.12);cursor:pointer;" onclick="openPredDetail(\'' + p.id + '\')"><span style="font-size:13px;color:var(--text-secondary);">' + p.home + ' vs ' + p.away + '</span><span style="font-size:13px;font-weight:600;color:var(--risky);">' + p.confidence + '%</span></div>'; }).join('') + '</div></div>';
  }

  html += '<div class="section"><div class="section-header"><span class="section-title">' + (typeof t === 'function' ? t('allMatches') : 'All Matches') + '</span><span class="section-link" onclick="navigate(\'fixtures\')">Browse</span></div><div style="display:flex;flex-direction:column;gap:10px;">' + matches.slice(0,6).map(function(m){ return renderMatchCard(m); }).join('') + '</div></div>';
  html += '<div style="height:20px;"></div></div>';
  return html;
}

function renderCompetitionsScreen() {
  var matches = Store.getMatches();
  if (typeof COMP_FILTER !== 'undefined' && COMP_FILTER !== 'all') {
    var leagueMap = { 'PL':'Premier League', 'PD':'La Liga', 'BL1':'Bundesliga', 'SA':'Serie A', 'FL1':'Ligue 1' };
    var leagueName = leagueMap[COMP_FILTER];
    if (leagueName) matches = matches.filter(function(m){ return m.league === leagueName || m.league === COMP_FILTER; });
  }

  var df = typeof COMP_DATE_FILTER !== 'undefined' ? COMP_DATE_FILTER : 'all';
  if (df === 'today') {
    matches = matches.filter(function(m){ return m.date === 'Today' || m.status === 'live'; });
  } else if (df === 'tomorrow') {
    matches = matches.filter(function(m){ return m.date === 'Tomorrow'; });
  } else if (df === 'live') {
    matches = matches.filter(function(m){ return m.status === 'live'; });
  }

  var live = matches.filter(function(m){ return m.status === 'live'; });
  var upcoming = matches.filter(function(m){ return m.status === 'upcoming'; });

  var html = '<div class="app-header"><div class="header-title">Competitions</div><div class="header-actions"><button class="btn-icon" onclick="openFilterDrawer()">' + ICONS.filter + '</button><button class="btn-icon" onclick="navigate(\'search\')">' + ICONS.search + '</button></div></div>';
  html += '<div class="chip-row" id="match-date-chips"><div class="chip' + (df==='all'?' active':'') + '" onclick="filterMatchDate(\'all\',this)">All</div><div class="chip' + (df==='today'?' active':'') + '" onclick="filterMatchDate(\'today\',this)">Today</div><div class="chip' + (df==='tomorrow'?' active':'') + '" onclick="filterMatchDate(\'tomorrow\',this)">Tomorrow</div><div class="chip' + (df==='live'?' active':'') + '" onclick="filterMatchDate(\'live\',this)"><span style="color:var(--danger);">&#9679;</span> Live (' + live.length + ')</div></div>';
  html += '<div class="chip-row" style="padding-top:0;"><div class="chip' + (typeof COMP_FILTER === 'undefined' || COMP_FILTER === 'all' ? ' active' : '') + '" onclick="filterCompetition(\'all\',this)">All Leagues</div><div class="chip' + (COMP_FILTER==='PL'?' active':'') + '" onclick="filterCompetition(\'PL\',this)">&#127467;&#127471; PL</div><div class="chip' + (COMP_FILTER==='PD'?' active':'') + '" onclick="filterCompetition(\'PD\',this)">&#127466;&#127480; La Liga</div><div class="chip' + (COMP_FILTER==='BL1'?' active':'') + '" onclick="filterCompetition(\'BL1\',this)">&#127465;&#127466; Bundesliga</div><div class="chip' + (COMP_FILTER==='SA'?' active':'') + '" onclick="filterCompetition(\'SA\',this)">&#127470;&#127481; Serie A</div><div class="chip' + (COMP_FILTER==='FL1'?' active':'') + '" onclick="filterCompetition(\'FL1\',this)">&#127467;&#127479; Ligue 1</div></div>';
  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  if (matches.length === 0) {
    html += renderEmptyState('matches','No matches','No matches found for this filter.','Go Home',"navigate('home')");
  } else {
    if (live.length) html += '<div style="font-size:12px;font-weight:600;color:var(--danger);letter-spacing:0.5px;text-transform:uppercase;margin:16px 0 10px;">&#9679; Live Now</div><div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">' + live.map(function(m){ return renderMatchCard(m); }).join('') + '</div>';

    var grouped = {};
    upcoming.forEach(function(m) {
      var key = m.date || 'Other';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });
    Object.keys(grouped).forEach(function(date) {
      html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin:16px 0 10px;">' + date + '</div>';
      html += '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">';
      grouped[date].forEach(function(m) { html += renderMatchCard(m); });
      html += '</div>';
    });
  }

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

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigate(\'home\')">' + ICONS.chevronLeft + '</button><div class="header-title" style="display:flex;align-items:center;gap:8px;justify-content:center;"><span style="font-size:20px;flex-shrink:0;">&#127942;</span> <span>World Cup 2026</span></div><div style="width:40px;flex-shrink:0;"></div></div>';

  var todayGames = games.filter(function(g) {
    try {
      var gd = new Date(g.date || g.rawDate || '');
      var now = new Date();
      return gd.toDateString() === now.toDateString();
    } catch(e) { return false; }
  });
  if (todayGames.length === 0) {
    todayGames = games.filter(function(g) {
      return (g.status === 'live') || (g.status === 'finished');
    }).slice(0, 6);
  }

  html += '<div class="chip-row" id="wc-filter-chips">';
  html += '<div class="chip' + (filter==='all'?' active':'') + '" onclick="setWCFilter(\'all\',this)">All</div>';
  html += '<div class="chip' + (filter==='today'?' active':'') + '" onclick="setWCFilter(\'today\',this)">&#128197; Today (' + todayGames.length + ')</div>';
  html += '<div class="chip' + (filter==='live'?' active':'') + '" onclick="setWCFilter(\'live\',this)"><span style="color:var(--danger);">&#9679;</span> Live (' + liveGames.length + ')</div>';
  html += '<div class="chip' + (filter==='upcoming'?' active':'') + '" onclick="setWCFilter(\'upcoming\',this)">Upcoming (' + upcomingGames.length + ')</div>';
  html += '<div class="chip' + (filter==='finished'?' active':'') + '" onclick="setWCFilter(\'finished\',this)">Results (' + finishedGames.length + ')</div>';
  html += '<div class="chip' + (filter==='stats'?' active':'') + '" onclick="setWCFilter(\'stats\',this)">Stats</div>';
  html += '<div class="chip' + (filter==='bracket'?' active':'') + '" onclick="setWCFilter(\'bracket\',this)">Bracket</div>';
  html += '</div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  if (games.length === 0) {
    html += renderLoadingState();
    Store.fetchWorldCupData();
  } else if (filter === 'bracket') {
    html += renderWCBracket(games);
  } else if (filter === 'stats') {
    html += renderWCStats(games, groups, wc.teams || []);
  } else {
    if (filter === 'today') {
      if (todayGames.length > 0) {
        var todayFinished = todayGames.filter(function(g){ return g.status === 'finished'; });
        var todayLive = todayGames.filter(function(g){ return g.status === 'live'; });
        var todayUpcoming = todayGames.filter(function(g){ return g.status !== 'finished' && g.status !== 'live'; });
        if (todayLive.length > 0) {
          html += '<div style="font-size:12px;font-weight:600;color:var(--danger);letter-spacing:0.5px;text-transform:uppercase;margin:12px 0 8px;">&#9679; Live Now (' + todayLive.length + ')</div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">';
          todayLive.forEach(function(g) { html += renderWCMatchCard(g, true); });
          html += '</div>';
        }
        if (todayFinished.length > 0) {
          html += '<div style="font-size:12px;font-weight:600;color:var(--success);letter-spacing:0.5px;text-transform:uppercase;margin:12px 0 8px;">&#10003; Results (' + todayFinished.length + ')</div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">';
          todayFinished.forEach(function(g) { html += renderWCMatchCard(g, false); });
          html += '</div>';
        }
        if (todayUpcoming.length > 0) {
          html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin:12px 0 8px;">Upcoming (' + todayUpcoming.length + ')</div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">';
          todayUpcoming.forEach(function(g) { html += renderWCMatchCard(g, false); });
          html += '</div>';
        }
      } else {
        html += '<div style="text-align:center;padding:40px 20px;"><div style="font-size:14px;color:var(--text-muted);">No World Cup matches today</div></div>';
      }
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

      var sortedGroups = groups.slice().sort(function(a,b) {
        var nameA = (a.name || '').replace('Group ','');
        var nameB = (b.name || '').replace('Group ','');
        return nameA.localeCompare(nameB);
      });

      var groupLetters = 'ABCDEFGHIJKL';
      sortedGroups.forEach(function(grp, gIdx) {
        var groupLetter = (grp.name || '').replace('Group ','') || groupLetters[gIdx] || '?';
        html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin-bottom:12px;">';
        html += '<div style="padding:10px 14px;font-size:13px;font-weight:600;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;"><span style="width:24px;height:24px;border-radius:50%;background:var(--accent-dim);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">' + groupLetter + '</span>Group ' + groupLetter + '</div>';
        if (grp.standings && grp.standings.length > 0) {
          grp.standings.forEach(function(row) {
            var posColor = row.position <= 2 ? 'var(--success)' : 'var(--text-muted)';
            html += '<div style="display:flex;align-items:center;padding:8px 14px;border-bottom:1px solid var(--border);gap:8px;cursor:pointer;" onclick="openTeamProfile(\'' + (row.team || '').replace(/'/g, "\\'") + '\')">';
            html += '<span style="font-size:11px;font-weight:600;color:' + posColor + ';width:16px;">' + row.position + '</span>';
            html += '<span style="font-size:13px;font-weight:600;flex:1;">' + row.team + '</span>';
            html += '<span style="font-size:12px;color:var(--text-secondary);width:20px;text-align:center;">' + (row.played || 0) + '</span>';
            html += '<span style="font-size:12px;color:var(--text-secondary);width:20px;text-align:center;">' + (row.won || 0) + '</span>';
            html += '<span style="font-size:13px;font-weight:700;width:20px;text-align:center;">' + (row.points || 0) + '</span>';
            html += '</div>';
          });
        }
        html += '</div>';
      });
    }
    } // end today/other filter
  } // end bracket/stats/other else

  html += '<div style="height:20px;"></div></div>';
  return html;
}

function renderWCMatchCard(game, isLive) {
  var home = game.home || 'TBD';
  var away = game.away || 'TBD';
  var statusColor = isLive ? 'var(--danger)' : game.status === 'finished' ? 'var(--success)' : 'var(--text-muted)';
  var statusText = isLive ? 'LIVE' : game.status === 'finished' ? 'FT' : '';
  var homeCrest = game.homeCrest || null;
  var awayCrest = game.awayCrest || null;
  var formattedDate = '';
  if (game.date && game.status !== 'finished' && !isLive) {
    try {
      var d = new Date(game.date);
      if (!isNaN(d.getTime())) {
        var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        formattedDate = days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
      }
    } catch(e) { formattedDate = game.date; }
  }
  var stage = game.group ? 'Group ' + game.group : (game.type === 'knockout' || (!game.group && game.matchday)) ? 'Knockout' : '';
  var matchday = game.matchday ? ' \u00b7 MD ' + game.matchday : '';
  return '<div class="match-card" onclick="openWCMatchDetail(\'' + game.id + '\')">'
    + '<div class="match-teams">'
    + '<div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">'
    + teamLogo(home, homeCrest, 28)
    + '<span class="team-name" onclick="event.stopPropagation();openTeamProfile(\'' + home.replace(/'/g, "\\'") + '\')" style="cursor:pointer;">' + home + '</span>'
    + '</div>'
    + '<div style="display:flex;flex-direction:column;align-items:center;min-width:60px;flex-shrink:0;">'
    + '<span class="vs-badge" style="font-size:14px;">' + (game.score || 'vs') + '</span>'
    + '<div style="font-size:11px;color:' + statusColor + ';font-weight:600;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;">' + (statusText || formattedDate) + '</div>'
    + '</div>'
    + '<div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;justify-content:flex-end;">'
    + '<span class="team-name away" onclick="event.stopPropagation();openTeamProfile(\'' + away.replace(/'/g, "\\'") + '\')" style="cursor:pointer;">' + away + '</span>'
    + teamLogo(away, awayCrest, 28)
    + '</div>'
    + '</div>'
    + '<div class="match-meta"><span class="match-league">\u26BD World Cup 2026' + (stage ? ' \u00b7 ' + stage : '') + matchday + '</span></div>'
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
      if (!teamGoals[g.home || g.home_team_name_en]) teamGoals[g.home || g.home_team_name_en] = 0;
      if (!teamGoals[g.away || g.away_team_name_en]) teamGoals[g.away || g.away_team_name_en] = 0;
      teamGoals[g.home || g.home_team_name_en] += h;
      teamGoals[g.away || g.away_team_name_en] += a;
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
      html += '<div style="display:flex;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border);gap:10px;cursor:pointer;" onclick="openTeamProfile(\'' + team.replace(/'/g, "\\'") + '\')">';
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

function renderWCBracket(games) {
  var r16 = games.filter(function(g){ return g.matchday === 'Round of 16' || (g.stage === 'LAST_16') || (g.stage === 'ROUND_OF_16'); });
  var qf = games.filter(function(g){ return g.matchday === 'Quarter-finals' || (g.stage === 'QUARTER_FINALS') || (g.stage === 'QUARTER'); });
  var sf = games.filter(function(g){ return g.matchday === 'Semi-finals' || (g.stage === 'SEMI_FINALS') || (g.stage === 'SEMI'); });
  var third = games.filter(function(g){ return g.matchday === 'Third place match' || (g.stage === 'THIRD_PLACE') || (g.stage === 'THIRD'); });
  var final_ = games.filter(function(g){ return g.matchday === 'Final' || (g.stage === 'FINAL'); });

  if (r16.length === 0 && qf.length === 0 && sf.length === 0 && final_.length === 0) {
    r16 = games.filter(function(g){ return !g.group && (g.type === 'knockout' || g.stage); }).slice(0, 8);
    if (r16.length >= 8) {
      qf = [{home:'TBD',away:'TBD',id:'qf1'},{home:'TBD',away:'TBD',id:'qf2'},{home:'TBD',away:'TBD',id:'qf3'},{home:'TBD',away:'TBD',id:'qf4'}];
      sf = [{home:'TBD',away:'TBD',id:'sf1'},{home:'TBD',away:'TBD',id:'sf2'}];
      third = [{home:'TBD',away:'TBD',id:'third'}];
      final_ = [{home:'TBD',away:'TBD',id:'final'}];
    }
  }

  function formatBracketDate(utcStr) {
    if (!utcStr) return '';
    try {
      var d = new Date(utcStr);
      if (isNaN(d.getTime())) return '';
      var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
    } catch(e) { return ''; }
  }

  function bracketTeam(game, side) {
    if (!game) return '<div class="bracket-team"><span class="bracket-team-name" style="color:var(--text-muted);">TBD</span><span class="bracket-team-score"></span></div>';
    var name = side === 'home' ? (game.home || 'TBD') : (game.away || 'TBD');
    var score = null;
    if (game.homeScore != null && game.awayScore != null) {
      score = side === 'home' ? parseInt(game.homeScore) : parseInt(game.awayScore);
    }
    var opponentScore = side === 'home' ? (game.awayScore != null ? parseInt(game.awayScore) : null) : (game.homeScore != null ? parseInt(game.homeScore) : null);
    var isWinner = game.status === 'finished' && score != null && opponentScore != null && score > opponentScore;
    var isLoser = game.status === 'finished' && score != null && opponentScore != null && score < opponentScore;
    var cls = isWinner ? 'winner' : isLoser ? 'loser' : '';
    return '<div class="bracket-team ' + cls + '">' +
      teamLogo(name, side === 'home' ? game.homeCrest : game.awayCrest, 18) +
      '<span class="bracket-team-name" onclick="event.stopPropagation();openTeamProfile(\'' + name.replace(/'/g, "\\'") + '\')">' + name + '</span>' +
      '<span class="bracket-team-score">' + (score != null ? score : '') + '</span></div>';
  }

  function bracketMatch(game) {
    var id = game ? game.id : '';
    var onclick = id && id.indexOf('TBD') === -1 ? 'onclick="openWCMatchDetail(\'' + id + '\')"' : '';
    var dateStr = game ? formatBracketDate(game.date) : '';
    var statusBadge = '';
    if (game && game.status === 'live') statusBadge = '<div style="font-size:9px;font-weight:700;color:var(--danger);text-transform:uppercase;letter-spacing:0.5px;">LIVE</div>';
    else if (game && game.status === 'finished') statusBadge = '<div style="font-size:9px;font-weight:700;color:var(--success);">FT</div>';
    else if (dateStr) statusBadge = '<div style="font-size:9px;color:var(--text-muted);">' + dateStr + '</div>';
    var html = '<div class="bracket-match" ' + onclick + '>';
    html += bracketTeam(game, 'home');
    html += bracketTeam(game, 'away');
    if (statusBadge) html += '<div style="padding:2px 10px;text-align:center;border-top:1px solid var(--border);">' + statusBadge + '</div>';
    html += '</div>';
    return html;
  }

  var html = '<div style="margin-bottom:12px;"><div style="font-size:14px;font-weight:600;margin-bottom:4px;">Knockout Bracket</div><div style="font-size:12px;color:var(--text-muted);">Swipe horizontally to see full bracket</div></div>';

  html += '<div class="bracket-container">';

  html += '<div class="bracket-round">';
  html += '<div class="bracket-round-title">Round of 16</div>';
  r16.slice(0,8).forEach(function(g) { html += bracketMatch(g); });
  if (r16.length === 0) for (var i=0;i<8;i++) html += bracketMatch(null);
  html += '</div>';

  html += '<div class="bracket-round">';
  html += '<div class="bracket-round-title">Quarter-finals</div>';
  qf.slice(0,4).forEach(function(g) { html += bracketMatch(g); });
  if (qf.length === 0) for (var j=0;j<4;j++) html += bracketMatch(null);
  html += '</div>';

  html += '<div class="bracket-round">';
  html += '<div class="bracket-round-title">Semi-finals</div>';
  sf.slice(0,2).forEach(function(g) { html += bracketMatch(g); });
  if (sf.length === 0) for (var k=0;k<2;k++) html += bracketMatch(null);
  html += '</div>';

  html += '<div class="bracket-round">';
  html += '<div class="bracket-round-title">3rd Place</div>';
  if (third.length > 0) {
    html += bracketMatch(third[0]);
  } else {
    html += bracketMatch(null);
  }
  html += '</div>';

  html += '<div class="bracket-round">';
  html += '<div class="bracket-round-title">Final</div>';
  if (final_.length > 0) {
    html += bracketMatch(final_[0]);
  } else {
    html += bracketMatch(null);
  }
  html += '</div>';

  html += '</div>';

  var finished = games.filter(function(g){ return g.status === 'finished'; });
  html += '<div class="card" style="margin-top:16px;"><div style="font-size:13px;font-weight:600;margin-bottom:6px;">Tournament Progress</div>';
  html += '<div style="display:flex;gap:8px;margin-bottom:8px;">';
  html += '<div style="flex:1;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--accent);">' + r16.length + '</div><div style="font-size:10px;color:var(--text-muted);">R16</div></div>';
  html += '<div style="flex:1;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--strong);">' + qf.length + '</div><div style="font-size:10px;color:var(--text-muted);">QF</div></div>';
  html += '<div style="flex:1;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--elite);">' + sf.length + '</div><div style="font-size:10px;color:var(--text-muted);">SF</div></div>';
  html += '<div style="flex:1;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--warning);">' + final_.length + '</div><div style="font-size:10px;color:var(--text-muted);">Final</div></div>';
  html += '</div>';
  html += '<div style="font-size:12px;color:var(--text-secondary);line-height:1.5;">48 teams in 12 groups. Top 2 per group + 4 best 3rd-placed teams advance to Round of 16. Knockouts decided by extra time and penalties if needed.</div>';
  html += '</div>';

  return html;
}

function renderPredictionsScreen() {
  var predictions = Store.getPredictions();
  var wcPreds = Store.getWCPredictions();
  var allPreds = predictions.concat(wcPreds);
  allPreds.sort(function(a, b) {
    var da = a.rawDate || a.date || '';
    var db = b.rawDate || b.date || '';
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    try { return new Date(da) - new Date(db); } catch(e) { return 0; }
  });
  var elite = allPreds.filter(function(p){ return p.tier === 'elite'; });
  var strong = allPreds.filter(function(p){ return p.tier === 'strong'; });
  var moderate = allPreds.filter(function(p){ return p.tier === 'moderate'; });
  var risky = allPreds.filter(function(p){ return p.tier === 'risky'; });

  var html = '<div class="app-header"><div class="header-title">Predictions</div><div class="header-actions"><button class="btn-icon" onclick="showBetSlip()" title="Bet Slip">' + ICONS.download + '</button><button class="btn-icon" onclick="navigate(\'search\')">' + ICONS.search + '</button></div></div>';

  html += '<div class="chip-row" id="pred-filter-chips">';
  html += '<div class="chip active" onclick="filterPreds(\'all\',this)">All <span style="opacity:0.6;">(' + allPreds.length + ')</span></div>';
  html += '<div class="chip" onclick="filterPreds(\'elite\',this)"><span style="color:var(--elite);">&#9679;</span> Elite <span style="opacity:0.6;">(' + elite.length + ')</span></div>';
  html += '<div class="chip" onclick="filterPreds(\'strong\',this)"><span style="color:var(--strong);">&#9679;</span> Strong <span style="opacity:0.6;">(' + strong.length + ')</span></div>';
  html += '<div class="chip" onclick="filterPreds(\'moderate\',this)"><span style="color:var(--moderate);">&#9679;</span> Moderate <span style="opacity:0.6;">(' + moderate.length + ')</span></div>';
  html += '<div class="chip" onclick="filterPreds(\'risky\',this)"><span style="color:var(--risky);">&#9679;</span> Risky <span style="opacity:0.6;">(' + risky.length + ')</span></div>';
  html += '</div>';

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;" id="pred-list">';

  if (allPreds.length === 0) {
    html += renderEmptyState('predictions','No predictions yet','Check back closer to match time for AI-powered predictions.','Go Home',"navigate('home')");
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:10px;">' + allPreds.map(renderPredCard).join('') + '</div>';
  }

  html += '<div style="height:20px;"></div></div>';
  return html;
}

function filterPreds(tier, el) {
  document.querySelectorAll('#pred-filter-chips .chip').forEach(function(c){ c.classList.remove('active'); });
  el.classList.add('active');
  var predictions = Store.getPredictions().concat(Store.getWCPredictions());
  var filtered = tier === 'all' ? predictions : predictions.filter(function(p){ return p.tier === tier; });
  filtered.sort(function(a, b) {
    var da = a.rawDate || a.date || '';
    var db = b.rawDate || b.date || '';
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    try { return new Date(da) - new Date(db); } catch(e) { return 0; }
  });
  var list = document.getElementById('pred-list');
  if (list) {
    list.innerHTML = filtered.length === 0
      ? renderEmptyState('predictions','No ' + tier + ' predictions','Check back later for more predictions.','','')
      : '<div style="display:flex;flex-direction:column;gap:10px;">' + filtered.map(renderPredCard).join('') + '</div><div style="height:20px;"></div>';
  }
}

var FIXTURE_DATE_FILTER = 'all';
var FIXTURE_LEAGUE_FILTER = 'all';
var FIXTURE_SELECTED_DATE = null;

function filterFixturesDate(val, el) {
  FIXTURE_DATE_FILTER = val;
  if (val === 'date-pick') {
    showFixturesDatePicker();
    return;
  }
  FIXTURE_SELECTED_DATE = null;
  document.querySelectorAll('#fixture-filter-chips .chip').forEach(function(c){ c.classList.remove('active'); });
  if (el) el.classList.add('active');
  renderFixturesScreen();
}

function filterFixturesLeague(val, el) {
  FIXTURE_LEAGUE_FILTER = val;
  document.querySelectorAll('#fixture-league-chips .chip').forEach(function(c){ c.classList.remove('active'); });
  if (el) el.classList.add('active');
  renderFixturesScreen();
}

function showFixturesDatePicker() {
  var overlay = document.getElementById('fixtures-date-picker');
  if (overlay) overlay.remove();
  var today = new Date();
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var html = '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:600;display:flex;align-items:flex-end;justify-content:center;" id="fixtures-date-picker" onclick="this.remove()">';
  html += '<div style="width:100%;max-width:430px;background:var(--bg-surface);border-radius:var(--r-xl) var(--r-xl) 0 0;padding:20px 16px 32px;transform:translateY(0);animation:slideUp 280ms cubic-bezier(0.16,1,0.3,1);" onclick="event.stopPropagation()">';
  html += '<div style="width:36px;height:4px;background:var(--border-strong);border-radius:var(--r-full);margin:0 auto 16px;"></div>';
  html += '<div style="font-size:16px;font-weight:600;margin-bottom:14px;">Select Date</div>';
  html += '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none;">';

  for (var i = 0; i < 30; i++) {
    var d = new Date(today);
    d.setDate(today.getDate() + i);
    var dateStr = d.toISOString().split('T')[0];
    var dayName = days[d.getDay()];
    var dayNum = d.getDate();
    var monthName = months[d.getMonth()];
    var isWeekend = d.getDay() === 0 || d.getDay() === 6;
    var isSelected = FIXTURE_SELECTED_DATE === dateStr;
    var label = i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : dayName);
    html += '<div class="fixture-cal-day' + (isSelected ? ' selected' : '') + '" onclick="selectFixturesDate(\'' + dateStr + '\')" style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 12px;border-radius:var(--r-md);border:1px solid ' + (isSelected ? 'var(--accent)' : 'var(--border)') + ';background:' + (isSelected ? 'var(--accent-dim)' : 'var(--bg-elevated)') + ';cursor:pointer;min-width:52px;flex-shrink:0;">';
    html += '<div style="font-size:10px;font-weight:500;color:' + (isSelected ? 'var(--accent)' : 'var(--text-muted)') + ';">' + label + '</div>';
    html += '<div style="font-size:17px;font-weight:700;color:' + (isSelected ? 'var(--accent)' : 'var(--text-primary)') + ';">' + dayNum + '</div>';
    html += '<div style="font-size:10px;color:' + (isSelected ? 'var(--accent)' : 'var(--text-muted)') + ';">' + monthName + '</div>';
    if (isWeekend && !isSelected) html += '<div style="width:4px;height:4px;border-radius:50%;background:var(--accent);opacity:0.5;"></div>';
    html += '</div>';
  }
  html += '</div>';
  html += '<div style="display:flex;gap:8px;margin-top:14px;"><button class="btn btn-ghost" style="flex:1;" onclick="clearFixturesDate()">Clear</button><button class="btn btn-primary" style="flex:1;" onclick="document.getElementById(\'fixtures-date-picker\').remove();renderFixturesScreen()">Apply</button></div>';
  html += '</div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function selectFixturesDate(dateStr) {
  FIXTURE_SELECTED_DATE = dateStr;
  FIXTURE_DATE_FILTER = 'date-pick';
  document.querySelectorAll('#fixture-filter-chips .chip').forEach(function(c){ c.classList.remove('active'); });
  var dateChip = document.querySelector('#fixture-filter-chips .chip[data-filter="date-pick"]');
  if (dateChip) dateChip.classList.add('active');
  document.querySelectorAll('.fixture-cal-day').forEach(function(el){ el.classList.remove('selected'); });
}

function clearFixturesDate() {
  FIXTURE_SELECTED_DATE = null;
  FIXTURE_DATE_FILTER = 'all';
  var picker = document.getElementById('fixtures-date-picker');
  if (picker) picker.remove();
  renderFixturesScreen();
}

function renderFixturesScreen() {
  var matches = Store.getMatches();

  var df = FIXTURE_DATE_FILTER;
  if (df === 'live') {
    matches = matches.filter(function(m){ return m.status === 'live'; });
  } else if (df === 'upcoming') {
    matches = matches.filter(function(m){ return m.status === 'upcoming'; });
  } else if (df === 'finished') {
    matches = matches.filter(function(m){ return m.status === 'finished'; });
  } else if (df === 'date-pick' && FIXTURE_SELECTED_DATE) {
    matches = matches.filter(function(m){
      if (!m.rawDate && !m.date) return false;
      try {
        var matchDate = m.rawDate ? new Date(m.rawDate) : null;
        if (!matchDate && m.date) {
          if (m.date === 'Today') matchDate = new Date();
          else if (m.date === 'Tomorrow') { matchDate = new Date(); matchDate.setDate(matchDate.getDate() + 1); }
        }
        if (matchDate) {
          return matchDate.toISOString().split('T')[0] === FIXTURE_SELECTED_DATE;
        }
        return false;
      } catch(e) { return false; }
    });
  }

  var lf = FIXTURE_LEAGUE_FILTER;
  if (lf !== 'all') {
    matches = matches.filter(function(m){ return m.leagueCode === lf || m.league === lf; });
  }

  var live = matches.filter(function(m){ return m.status === 'live'; });
  var upcoming = matches.filter(function(m){ return m.status === 'upcoming'; });
  var finished = matches.filter(function(m){ return m.status === 'finished'; });

  var dateLabel = '';
  if (FIXTURE_SELECTED_DATE && df === 'date-pick') {
    try {
      var d = new Date(FIXTURE_SELECTED_DATE + 'T12:00:00');
      var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      dateLabel = days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()];
    } catch(e) { dateLabel = FIXTURE_SELECTED_DATE; }
  }

  var html = '<div class="app-header"><div class="header-title">Fixtures</div><div class="header-actions"><button class="btn-icon" onclick="navigate(\'search\')">' + ICONS.search + '</button></div></div>';

  html += '<div class="chip-row" id="fixture-filter-chips">';
  html += '<div class="chip' + (df==='all'?' active':'') + '" onclick="filterFixturesDate(\'all\',this)">All</div>';
  html += '<div class="chip' + (df==='live'?' active':'') + '" onclick="filterFixturesDate(\'live\',this)"><span style="color:var(--danger);">&#9679;</span> Live (' + live.length + ')</div>';
  html += '<div class="chip' + (df==='upcoming'?' active':'') + '" onclick="filterFixturesDate(\'upcoming\',this)">Upcoming (' + upcoming.length + ')</div>';
  html += '<div class="chip' + (df==='finished'?' active':'') + '" onclick="filterFixturesDate(\'finished\',this)">Results (' + finished.length + ')</div>';
  html += '<div class="chip' + (df==='date-pick'?' active':'') + '" data-filter="date-pick" onclick="filterFixturesDate(\'date-pick\',this)">' + (df === 'date-pick' ? '&#128197; ' + (dateLabel || 'Pick Date') : '&#128197; Pick Date') + '</div>';
  html += '</div>';

  html += '<div class="chip-row" id="fixture-league-chips">';
  html += '<div class="chip' + (lf==='all'?' active':'') + '" onclick="filterFixturesLeague(\'all\',this)">All Leagues</div>';
  html += '<div class="chip' + (lf==='PL'?' active':'') + '" onclick="filterFixturesLeague(\'PL\',this)">&#127467;&#127471; PL</div>';
  html += '<div class="chip' + (lf==='PD'?' active':'') + '" onclick="filterFixturesLeague(\'PD\',this)">&#127466;&#127480; La Liga</div>';
  html += '<div class="chip' + (lf==='BL1'?' active':'') + '" onclick="filterFixturesLeague(\'BL1\',this)">&#127465;&#127466; Bundesliga</div>';
  html += '<div class="chip' + (lf==='SA'?' active':'') + '" onclick="filterFixturesLeague(\'SA\',this)">&#127470;&#127481; Serie A</div>';
  html += '<div class="chip' + (lf==='FL1'?' active':'') + '" onclick="filterFixturesLeague(\'FL1\',this)">&#127467;&#127479; Ligue 1</div>';
  html += '</div>';

  if (dateLabel && df === 'date-pick') {
    html += '<div style="padding:0 16px;margin-bottom:8px;"><div style="font-size:13px;font-weight:600;color:var(--accent);">' + dateLabel + ' \u00b7 ' + matches.length + ' matches</div></div>';
  }

  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;" id="fixture-list">';
  if (matches.length === 0) {
    html += renderEmptyState('matches','No fixtures','No matches found for this filter.','Go Home',"navigate('home')");
  } else {
    if (live.length > 0) {
      html += '<div style="font-size:12px;font-weight:600;color:var(--danger);letter-spacing:0.5px;text-transform:uppercase;margin:16px 0 8px;">&#9679; Live Now (' + live.length + ')</div>';
      html += '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">';
      live.forEach(function(m) { html += renderMatchCard(m); });
      html += '</div>';
    }

    var grouped = {};
    upcoming.forEach(function(m) {
      var key = m.date || 'Upcoming';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });
    Object.keys(grouped).forEach(function(date) {
      html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin:16px 0 8px;">' + date + ' (' + grouped[date].length + ')</div>';
      html += '<div style="display:flex;flex-direction:column;gap:8px;">';
      grouped[date].forEach(function(m) { html += renderMatchCard(m); });
      html += '</div>';
    });

    if (finished.length > 0) {
      html += '<div style="font-size:12px;font-weight:600;color:var(--text-muted);letter-spacing:0.5px;text-transform:uppercase;margin:16px 0 8px;">Results (' + finished.length + ')</div>';
      html += '<div style="display:flex;flex-direction:column;gap:8px;">';
      finished.forEach(function(m) { html += renderMatchCard(m); });
      html += '</div>';
    }
  }
  html += '<div style="height:20px;"></div></div>';
  return html;
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

  var html = '<div class="app-header"><button class="btn-icon" onclick="navigateBack()">' + ICONS.chevronLeft + '</button><div class="header-title">Statistics</div><div style="width:40px;flex-shrink:0;"></div></div>';
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
  html += '<div class="chip-row" id="news-chips"><div class="chip active" onclick="filterNews(\'all\',this)">All</div><div class="chip" onclick="filterNews(\'Transfer\',this)">Transfers</div><div class="chip" onclick="filterNews(\'Analysis\',this)">Analysis</div><div class="chip" onclick="filterNews(\'Injury\',this)">Injuries</div><div class="chip" onclick="filterNews(\'Tactics\',this)">Tactics</div></div>';
  html += '<div style="overflow-y:auto;flex:1;padding:0 16px;">';

  var newsData = typeof NEWS_DATA !== 'undefined' ? NEWS_DATA : [];

  var filteredNews = NEWS_FILTER === 'all' ? newsData : newsData.filter(function(a){ return a.category === NEWS_FILTER; });

  filteredNews.forEach(function(article) {
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

  var html = '<div class="app-header"><div class="header-title">Profile</div><div class="header-actions"><button class="btn-icon" onclick="navigate(\'settings\')">' + ICONS.settings + '</button></div></div>';
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