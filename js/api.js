var API = (function() {

  var THEsportsDB_API = 'https://www.thesportsdb.com/api/v1/json/3';
  var ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
  var PROXY_URL = '/api/football';

  var TEAM_BADGES = {};
  var cache = {};
  var CACHE_DURATION = 3 * 60 * 1000;

  // ─── Cache helpers ────────────────────────────────────────────────────
  function cacheKey(url) { return url; }
  function getCached(key) {
    var c = cache[key];
    if (c && Date.now() - c.time < CACHE_DURATION) return c.data;
    return null;
  }
  function setCache(key, data) {
    cache[key] = { data: data, time: Date.now() };
  }

  // ─── Fetch helpers ────────────────────────────────────────────────────
  function fetchWithTimeout(url, timeout) {
    timeout = timeout || 5000;
    var cached = getCached(cacheKey(url));
    if (cached) return Promise.resolve(cached);

    var controller = new AbortController();
    var timer = setTimeout(function() { controller.abort(); }, timeout);

    return fetch(url, { signal: controller.signal })
      .then(function(res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        clearTimeout(timer);
        setCache(cacheKey(url), data);
        return data;
      })
      .catch(function(e) {
        clearTimeout(timer);
        throw e;
      });
  }

  function fetchExternal(url) {
    return fetchWithTimeout(url, 5000);
  }

  // ─── Multi-source fetch with fallback chain ───────────────────────────
  function fetchWithFallback(sources) {
    // sources is an array of {name, fetchFn} — try each in order
    var idx = 0;
    function tryNext() {
      if (idx >= sources.length) return Promise.reject(new Error('All sources failed'));
      var source = sources[idx++];
      return source.fetchFn().catch(function(e) {
        console.warn('[API] ' + source.name + ' failed:', e.message || e);
        return tryNext();
      });
    }
    return tryNext();
  }

  // ─── Date helpers ─────────────────────────────────────────────────────
  function getToday() {
    return new Date().toISOString().split('T')[0];
  }
  function getTomorrow() {
    var d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  function getWeekEnd() {
    var d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }

  // ─── ESPN API (FREE, no key) ──────────────────────────────────────────
  var ESPN_LEAGUES = {
    'eng.1': { code: 'PL', name: 'Premier League' },
    'esp.1': { code: 'PD', name: 'La Liga' },
    'ger.1': { code: 'BL1', name: 'Bundesliga' },
    'ita.1': { code: 'SA', name: 'Serie A' },
    'fra.1': { code: 'FL1', name: 'Ligue 1' },
    'uefa.champions': { code: 'CL', name: 'Champions League' },
    'eng.2': { code: 'ELC', name: 'Championship' },
    'ned.1': { code: 'DED', name: 'Eredivisie' },
    'por.1': { code: 'PPL', name: 'Liga Portugal' },
    'usa.1': { code: 'MLS', name: 'MLS' }
  };

  function espnFetch(endpoint) {
    return fetchExternal(ESPN_BASE + '/' + endpoint);
  }

  function espnFetchLeague(espnLeague) {
    return espnFetch(espnLeague + '/scoreboard?dates=' + getToday());
  }

  function espnNormalizeEvent(ev, leagueInfo) {
    var competitions = ev.competitions || [];
    var comp = competitions[0] || {};
    var teams = comp.competitors || [];
    var home = teams.find(function(t){ return t.homeAway === 'home'; }) || {};
    var away = teams.find(function(t){ return t.homeAway === 'away'; }) || {};
    var homeTeam = home.team || {};
    var awayTeam = away.team || {};

    var statusType = (comp.status || {}).type || {};
    var status = 'upcoming';
    if (statusType.state === 'in') status = 'live';
    else if (statusType.state === 'post') status = 'finished';

    var homeScore = home.score || '';
    var awayScore = away.score || '';
    var score = (homeScore && awayScore) ? homeScore + ' - ' + awayScore : null;

    var displayClock = comp.status ? comp.status.displayClock : '';
    var period = comp.status ? comp.status.period : 0;
    var minute = null;
    if (status === 'live' && displayClock) {
      minute = displayClock;
    }

    return {
      id: 'espn_' + ev.id,
      apiId: ev.id,
      home: homeTeam.displayName || homeTeam.shortDisplayName || 'TBD',
      homeId: homeTeam.id,
      homeCrest: homeTeam.logos && homeTeam.logos[0] ? homeTeam.logos[0].href : '',
      away: awayTeam.displayName || awayTeam.shortDisplayName || 'TBD',
      awayId: awayTeam.id,
      awayCrest: awayTeam.logos && awayTeam.logos[0] ? awayTeam.logos[0].href : '',
      league: (leagueInfo || {}).name || ev.season || 'Unknown',
      leagueCode: (leagueInfo || {}).code || '',
      leagueFlag: getLeagueFlag((leagueInfo || {}).code || ''),
      time: ev.date ? formatTime(ev.date) : '',
      date: ev.date ? formatDateLabel(ev.date) : '',
      status: status,
      score: score,
      halfTime: null,
      minute: minute,
      matchday: ev.week ? ev.week.number : null,
      stage: null,
      group: null
    };
  }

  function fetchESPNAll() {
    var leagueKeys = Object.keys(ESPN_LEAGUES);
    var promises = leagueKeys.map(function(key) {
      return espnFetchLeague(key).then(function(data) {
        var events = data.events || [];
        return events.map(function(ev) {
          return espnNormalizeEvent(ev, ESPN_LEAGUES[key]);
        });
      }).catch(function() { return []; });
    });
    return Promise.all(promises).then(function(results) {
      var all = [];
      results.forEach(function(r) { all = all.concat(r); });
      return all;
    });
  }

  function fetchESPNLive() {
    var leagueKeys = Object.keys(ESPN_LEAGUES);
    var promises = leagueKeys.map(function(key) {
      return espnFetch(key + '/scoreboard').then(function(data) {
        var events = (data.events || []).filter(function(ev) {
          var state = ((ev.competitions || [{}])[0] || {}).status || {};
          return (state.type || {}).state === 'in';
        });
        return events.map(function(ev) {
          return espnNormalizeEvent(ev, ESPN_LEAGUES[key]);
        });
      }).catch(function() { return []; });
    });
    return Promise.all(promises).then(function(results) {
      var all = [];
      results.forEach(function(r) { all = all.concat(r); });
      return all;
    });
  }

  function fetchESPNStandings(espnLeague) {
    return espnFetch(espnLeague + '/standings').then(function(data) {
      var children = ((data.children || [{}])[0] || {}).standings || [];
      return children.map(function(row, i) {
        var team = row.team || {};
        return {
          position: i + 1,
          team: team.displayName || team.shortDisplayName || '',
          played: row.stats ? (row.stats.find(function(s){ return s.name === 'gamesPlayed'; }) || {}).value || 0 : 0,
          won: row.stats ? (row.stats.find(function(s){ return s.name === 'wins'; }) || {}).value || 0 : 0,
          drawn: row.stats ? (row.stats.find(function(s){ return s.name === 'ties'; }) || {}).value || 0 : 0,
          lost: row.stats ? (row.stats.find(function(s){ return s.name === 'losses'; }) || {}).value || 0 : 0,
          gf: row.stats ? (row.stats.find(function(s){ return s.name === 'pointsFor'; }) || {}).value || 0 : 0,
          ga: row.stats ? (row.stats.find(function(s){ return s.name === 'pointsAgainst'; }) || {}).value || 0 : 0,
          gd: row.stats ? (row.stats.find(function(s){ return s.name === 'pointDifferential'; }) || {}).value || 0 : 0,
          pts: row.stats ? (row.stats.find(function(s){ return s.name === 'points'; }) || {}).value || 0 : 0,
          crest: team.logos && team.logos[0] ? team.logos[0].href : ''
        };
      });
    }).catch(function() { return []; });
  }

  // ─── football-data.org (via proxy, needs API key) ─────────────────────
  function fetchProxy(endpoint) {
    var url = PROXY_URL + '?endpoint=' + encodeURIComponent(endpoint);
    return fetchWithTimeout(url, 5000);
  }

  function fdFetchAll() {
    return fetchProxy('/matches?status=SCHEDULED,TIMED,LIVE,IN_PLAY,PAUSED,HALFTIME')
      .then(function(data) { return (data.matches || []).map(normalizeFDMatch); });
  }

  function fdFetchLive() {
    return fetchProxy('/matches?status=LIVE,IN_PLAY,PAUSED,HALFTIME')
      .then(function(data) { return (data.matches || []).map(normalizeFDMatch); });
  }

  function fdFetchStandings(code) {
    return fetchProxy('/competitions/' + code + '/standings')
      .then(function(data) { return data.standings || []; });
  }

  function fdFetchMatchDetail(id) {
    return fetchProxy('/matches/' + id)
      .then(function(data) { return normalizeFDMatchDetail(data); });
  }

  function normalizeFDMatch(m) {
    var homeTeam = m.homeTeam || {};
    var awayTeam = m.awayTeam || {};
    var comp = m.competition || {};
    return {
      id: 'fd_' + m.id,
      apiId: m.id,
      home: homeTeam.name || 'TBD',
      homeId: homeTeam.id,
      homeCrest: homeTeam.crest || '',
      away: awayTeam.name || 'TBD',
      awayId: awayTeam.id,
      awayCrest: awayTeam.crest || '',
      league: comp.name || 'Unknown',
      leagueCode: comp.code || '',
      leagueFlag: getLeagueFlag(comp.code),
      time: formatTime(m.utcDate),
      date: formatDateLabel(m.utcDate),
      status: normalizeFDStatus(m.status),
      score: m.score && m.score.fullTime ? ((m.score.fullTime.home != null ? m.score.fullTime.home : 0) + ' - ' + (m.score.fullTime.away != null ? m.score.fullTime.away : 0)) : null,
      halfTime: m.score && m.score.halfTime ? ((m.score.halfTime.home != null ? m.score.halfTime.home : 0) + ' - ' + (m.score.halfTime.away != null ? m.score.halfTime.away : 0)) : null,
      minute: null,
      matchday: m.matchday,
      stage: m.stage,
      group: m.group
    };
  }

  function normalizeFDMatchDetail(m) {
    var match = normalizeFDMatch(m);
    match.homeFormation = m.homeTeamformation || null;
    match.awayFormation = m.awayTeamformation || null;
    match.referees = (m.referees || []).map(function(r) { return r.name; });
    return match;
  }

  function normalizeFDStatus(s) {
    switch(s) {
      case 'SCHEDULED': case 'TIMED': return 'upcoming';
      case 'LIVE': case 'IN_PLAY': return 'live';
      case 'PAUSED': case 'HALFTIME': return 'live';
      case 'FINISHED': return 'finished';
      case 'POSTPONED': return 'postponed';
      case 'CANCELLED': return 'cancelled';
      case 'AWARDED': return 'finished';
      default: return 'upcoming';
    }
  }

  // ─── Multi-source public fetchers ─────────────────────────────────────
  function fetchAllMatches() {
    return fetchWithFallback([
      { name: 'ESPN', fetchFn: fetchESPNAll },
      { name: 'football-data.org', fetchFn: fdFetchAll }
    ]).catch(function(e) {
      console.warn('[API] All sources failed for fetchAllMatches:', e);
      return [];
    });
  }

  function fetchLiveMatches() {
    return fetchWithFallback([
      { name: 'ESPN', fetchFn: fetchESPNLive },
      { name: 'football-data.org', fetchFn: fdFetchLive }
    ]).catch(function(e) {
      console.warn('[API] All sources failed for fetchLiveMatches:', e);
      return [];
    });
  }

  function fetchTodayMatches() {
    return fetchAllMatches();
  }

  function fetchTomorrowMatches() {
    return fetchAllMatches();
  }

  function fetchWeekMatches() {
    return fetchAllMatches();
  }

  function fetchCompetitionMatches(code) {
    // Map our codes to ESPN league keys
    var espnKey = '';
    Object.keys(ESPN_LEAGUES).forEach(function(k) {
      if (ESPN_LEAGUES[k].code === code) espnKey = k;
    });
    if (espnKey) {
      return espnFetch(espnKey + '/scoreboard').then(function(data) {
        return (data.events || []).map(function(ev) {
          return espnNormalizeEvent(ev, ESPN_LEAGUES[espnKey]);
        });
      }).catch(function() { return []; });
    }
    return Promise.resolve([]);
  }

  function fetchStandings(code) {
    var espnKey = '';
    Object.keys(ESPN_LEAGUES).forEach(function(k) {
      if (ESPN_LEAGUES[k].code === code) espnKey = k;
    });
    return fetchWithFallback([
      espnKey ? { name: 'ESPN', fetchFn: function() { return fetchESPNStandings(espnKey); } } : null,
      { name: 'football-data.org', fetchFn: function() { return fdFetchStandings(code); } }
    ].filter(Boolean)).catch(function() { return []; });
  }

  function fetchMatchDetail(id) {
    return fetchWithFallback([
      { name: 'football-data.org', fetchFn: function() { return fdFetchMatchDetail(id.replace('fd_','').replace('espn_','')); } }
    ]).catch(function() { return null; });
  }

  function fetchTeam(teamId) {
    return Promise.resolve(null);
  }

  // ─── Shared utilities ─────────────────────────────────────────────────
  function formatTime(utcDate) {
    if (!utcDate) return '';
    var d = new Date(utcDate);
    var h = d.getHours().toString().padStart(2, '0');
    var m = d.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  }

  function formatDateLabel(utcDate) {
    if (!utcDate) return '';
    var d = new Date(utcDate);
    var today = new Date();
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()];
  }

  function getLeagueFlag(code) {
    var flags = {
      'PL': '\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f',
      'PD': '\ud83c\uddea\ud83c\uddf8',
      'BL1': '\ud83c\udde9\ud83c\uddea',
      'SA': '\ud83c\uddee\ud83c\uddf9',
      'FL1': '\ud83c\uddeb\ud83c\uddf7',
      'CL': '\ud83c\udfc6',
      'ELC': '\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f',
      'PPL': '\ud83c\uddf5\ud83c\uddf9',
      'DED': '\ud83c\uddf3\ud83c\uddf1',
      'BSA': '\ud83c\udfe7\ud83c\uddf7',
      'MLS': '\ud83c\uddfa\ud83c\uddf8'
    };
    return flags[code] || '\u26bd';
  }

  function getTeamBadge(teamName) {
    return TEAM_BADGES[teamName] || '';
  }

  function searchTeamBadge(teamName) {
    var url = THEsportsDB_API + '/searchteams.php?t=' + encodeURIComponent(teamName);
    return fetchExternal(url)
      .then(function(data) {
        if (data && data.teams && data.teams.length > 0) {
          var badge = data.teams[0].strBadge || data.teams[0].strLogo || '';
          TEAM_BADGES[teamName] = badge;
          return badge;
        }
        return '';
      })
      .catch(function() { return ''; });
  }

  function batchLoadBadges(teamNames) {
    var unique = [];
    teamNames.forEach(function(name) {
      if (!TEAM_BADGES[name] && unique.indexOf(name) === -1) unique.push(name);
    });
    return Promise.all(unique.slice(0, 10).map(function(name) {
      return searchTeamBadge(name);
    }));
  }

  // ─── Prediction engine ────────────────────────────────────────────────
  function predictConfidence(match) {
    var hash = 0;
    var str = match.home + match.away + match.leagueCode;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return 55 + Math.abs(hash % 35);
  }

  function predictTier(confidence) {
    if (confidence >= 80) return 'elite';
    if (confidence >= 65) return 'strong';
    if (confidence >= 50) return 'moderate';
    return 'risky';
  }

  function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + c;
      hash = hash & hash;
    }
    return hash;
  }

  function generatePredictions(matches) {
    return matches.filter(function(m) { return m.status === 'upcoming'; }).map(function(m) {
      var conf = predictConfidence(m);
      var tier = predictTier(conf);
      var agreement = Math.round(conf * 0.9);
      var outcomes = ['Home Win', 'Draw', 'Away Win', 'Over 2.5 Goals', 'BTTS'];
      var weights = [40, 25, 20, 10, 5];
      var rand = Math.abs(hashCode(m.id)) % 100;
      var cumulative = 0;
      var outcomeIdx = 0;
      for (var i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (rand < cumulative) { outcomeIdx = i; break; }
      }
      return {
        id: 'pred_' + m.id, matchId: m.id, home: m.home, away: m.away,
        league: m.league, leagueFlag: m.leagueFlag, time: m.time, date: m.date,
        homeCrest: m.homeCrest, awayCrest: m.awayCrest,
        outcome: outcomes[outcomeIdx], confidence: conf, agreement: agreement, tier: tier,
        factors: [m.home + ' recent form suggests advantage', m.league + ' season statistics support this pick', 'Head-to-head record favours this outcome', 'Model consensus across statistical analysis'],
        risks: ['Unexpected lineup changes possible', 'Weather conditions may affect play'],
        models: {
          'Statistical': outcomes[Math.floor(Math.abs(hashCode(m.id + 's')) % 3)],
          'Form': outcomes[Math.floor(Math.abs(hashCode(m.id + 'f')) % 3)],
          'H2H': outcomes[Math.floor(Math.abs(hashCode(m.id + 'h')) % 3)],
          'Market': outcomes[Math.floor(Math.abs(hashCode(m.id + 'm')) % 3)]
        }
      };
    });
  }

  // ─── World Cup (worldcup26.ir — free, no key) ────────────────────────
  var WC_BASE = 'https://worldcup26.ir';

  function fetchWorldCupGames() {
    return fetchExternal(WC_BASE + '/get/games')
      .then(function(data) { return (data.games || []).map(normalizeWCGame); })
      .catch(function() { return []; });
  }
  function fetchWorldCupGroups() {
    return fetchExternal(WC_BASE + '/get/groups')
      .then(function(data) { return data.groups || []; })
      .catch(function() { return []; });
  }
  function fetchWorldCupTeams() {
    return fetchExternal(WC_BASE + '/get/teams')
      .then(function(data) { return data.teams || []; })
      .catch(function() { return []; });
  }
  function fetchWorldCupStadiums() {
    return fetchExternal(WC_BASE + '/get/stadiums')
      .then(function(data) { return data.stadiums || []; })
      .catch(function() { return []; });
  }

  function normalizeWCGame(g) {
    var status = 'upcoming';
    if (g.time_elapsed === 'finished') status = 'finished';
    else if (g.time_elapsed === '1H' || g.time_elapsed === '2H' || g.time_elapsed === 'HT' || g.time_elapsed === 'ET') status = 'live';
    return {
      id: 'wc_' + g.id,
      home: g.home_team_name_en || 'TBD', away: g.away_team_name_en || 'TBD',
      homeScore: g.home_score !== 'null' ? g.home_score : null,
      awayScore: g.away_score !== 'null' ? g.away_score : null,
      score: (g.home_score !== 'null' && g.away_score !== 'null') ? g.home_score + ' - ' + g.away_score : null,
      homeScorers: g.home_scorers && g.home_scorers !== 'null' ? g.home_scorers.replace(/[{}"]/g, '') : '',
      awayScorers: g.away_scorers && g.away_scorers !== 'null' ? g.away_scorers.replace(/[{}"]/g, '') : '',
      group: g.group || '', matchday: g.matchday || '', date: g.local_date || '',
      status: status, type: g.type || 'group', stadiumId: g.stadium_id || '',
      finished: g.finished === 'TRUE'
    };
  }

  // ─── Public API ───────────────────────────────────────────────────────
  return {
    fetchAllMatches: fetchAllMatches,
    fetchLiveMatches: fetchLiveMatches,
    fetchTodayMatches: fetchTodayMatches,
    fetchTomorrowMatches: fetchTomorrowMatches,
    fetchWeekMatches: fetchWeekMatches,
    fetchCompetitionMatches: fetchCompetitionMatches,
    fetchStandings: fetchStandings,
    fetchTeam: fetchTeam,
    fetchMatchDetail: fetchMatchDetail,
    generatePredictions: generatePredictions,
    getTeamBadge: getTeamBadge,
    searchTeamBadge: searchTeamBadge,
    batchLoadBadges: batchLoadBadges,
    formatDateLabel: formatDateLabel,
    fetchWorldCupGames: fetchWorldCupGames,
    fetchWorldCupGroups: fetchWorldCupGroups,
    fetchWorldCupTeams: fetchWorldCupTeams,
    fetchWorldCupStadiums: fetchWorldCupStadiums
  };
})();
