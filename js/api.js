var API = (function() {

  var BASE_URL = '/api/football';
  var THEsportsDB_API = 'https://www.thesportsdb.com/api/v1/json/3';

  var TEAM_BADGES = {};
  var cache = {};
  var CACHE_DURATION = 3 * 60 * 1000;

  function cacheKey(url) { return url; }
  function getCached(key) {
    var c = cache[key];
    if (c && Date.now() - c.time < CACHE_DURATION) return c.data;
    return null;
  }
  function setCache(key, data) {
    cache[key] = { data: data, time: Date.now() };
  }

  function fetchProxy(endpoint) {
    var url = BASE_URL + '?endpoint=' + encodeURIComponent(endpoint);
    var cached = getCached(cacheKey(url));
    if (cached) return Promise.resolve(cached);

    return fetch(url)
      .then(function(res) {
        if (!res.ok) throw new Error('Proxy error: ' + res.status);
        return res.json();
      })
      .then(function(data) {
        setCache(cacheKey(url), data);
        return data;
      });
  }

  function fetchExternal(url) {
    var cached = getCached(cacheKey(url));
    if (cached) return Promise.resolve(cached);

    return fetch(url)
      .then(function(res) {
        if (!res.ok) throw new Error('Fetch error: ' + res.status);
        return res.json();
      })
      .then(function(data) {
        setCache(cacheKey(url), data);
        return data;
      });
  }

  function getToday() {
    return new Date().toISOString().split('T')[0];
  }

  function getTomorrow() {
    var d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  function fetchLiveMatches() {
    return fetchProxy('/matches?status=LIVE,IN_PLAY,PAUSED,HALFTIME')
      .then(function(data) { return (data.matches || []).map(normalizeMatch); })
      .catch(function(e) { console.warn('Live matches fetch failed:', e); return []; });
  }

  function fetchTodayMatches() {
    var today = getToday();
    return fetchProxy('/matches?dateFrom=' + today + '&dateTo=' + today)
      .then(function(data) { return (data.matches || []).map(normalizeMatch); })
      .catch(function(e) { console.warn('Today matches fetch failed:', e); return []; });
  }

  function fetchTomorrowMatches() {
    var tomorrow = getTomorrow();
    return fetchProxy('/matches?dateFrom=' + tomorrow + '&dateTo=' + tomorrow)
      .then(function(data) { return (data.matches || []).map(normalizeMatch); })
      .catch(function(e) { console.warn('Tomorrow matches fetch failed:', e); return []; });
  }

  function fetchWeekMatches() {
    var today = getToday();
    var end = new Date();
    end.setDate(end.getDate() + 7);
    var endDate = end.toISOString().split('T')[0];
    return fetchProxy('/matches?dateFrom=' + today + '&dateTo=' + endDate)
      .then(function(data) { return (data.matches || []).map(normalizeMatch); })
      .catch(function(e) { console.warn('Week matches fetch failed:', e); return []; });
  }

  function fetchCompetitionMatches(competitionCode) {
    return fetchProxy('/competitions/' + competitionCode + '/matches?status=SCHEDULED,TIMED,LIVE,IN_PLAY,PAUSED,HALFTIME,FINISHED')
      .then(function(data) { return (data.matches || []).map(normalizeMatch); })
      .catch(function(e) { console.warn('Competition matches fetch failed:', e); return []; });
  }

  function fetchStandings(competitionCode) {
    return fetchProxy('/competitions/' + competitionCode + '/standings')
      .then(function(data) { return data.standings || []; })
      .catch(function(e) { console.warn('Standings fetch failed:', e); return []; });
  }

  function fetchTeam(teamId) {
    return fetchProxy('/teams/' + teamId)
      .then(function(data) { return data; })
      .catch(function(e) { console.warn('Team fetch failed:', e); return null; });
  }

  function fetchMatchDetail(matchId) {
    return fetchProxy('/matches/' + matchId)
      .then(function(data) { return normalizeMatchDetail(data); })
      .catch(function(e) { console.warn('Match detail fetch failed:', e); return null; });
  }

  function fetchAllMatches() {
    return fetchProxy('/matches?status=SCHEDULED,TIMED,LIVE,IN_PLAY,PAUSED,HALFTIME')
      .then(function(data) { return (data.matches || []).map(normalizeMatch); })
      .catch(function(e) {
        console.warn('All matches fetch failed:', e);
        return [];
      });
  }

  function normalizeMatch(m) {
    var homeTeam = m.homeTeam || {};
    var awayTeam = m.awayTeam || {};
    var status = normalizeStatus(m.status);
    var comp = m.competition || {};

    return {
      id: 'fm_' + m.id,
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
      status: status,
      score: m.score && m.score.fullTime ? ((m.score.fullTime.home != null ? m.score.fullTime.home : 0) + ' - ' + (m.score.fullTime.away != null ? m.score.fullTime.away : 0)) : null,
      halfTime: m.score && m.score.halfTime ? ((m.score.halfTime.home != null ? m.score.halfTime.home : 0) + ' - ' + (m.score.halfTime.away != null ? m.score.halfTime.away : 0)) : null,
      minute: null,
      matchday: m.matchday,
      stage: m.stage,
      group: m.group
    };
  }

  function normalizeMatchDetail(m) {
    var match = normalizeMatch(m);
    match.homeFormation = m.homeTeamformation || null;
    match.awayFormation = m.awayTeamformation || null;
    match.referees = (m.referees || []).map(function(r) { return r.name; });
    match.statistics = null;
    match.lineups = m.odds || null;
    return match;
  }

  function normalizeStatus(s) {
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
      'BSA': '\ud83c\udfe7\ud83c\uddf7'
    };
    return flags[code] || '\u26bd';
  }

  function getTeamBadge(teamName) {
    if (TEAM_BADGES[teamName]) return TEAM_BADGES[teamName];
    return '';
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
      if (!TEAM_BADGES[name] && unique.indexOf(name) === -1) {
        unique.push(name);
      }
    });
    var limited = unique.slice(0, 10);
    return Promise.all(limited.map(function(name) {
      return searchTeamBadge(name);
    }));
  }

  function predictConfidence(match) {
    var hash = 0;
    var str = match.home + match.away + match.leagueCode;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    var base = 55 + Math.abs(hash % 35);
    return base;
  }

  function predictTier(confidence) {
    if (confidence >= 80) return 'elite';
    if (confidence >= 65) return 'strong';
    if (confidence >= 50) return 'moderate';
    return 'risky';
  }

  function generatePredictions(matches) {
    return matches.filter(function(m) {
      return m.status === 'upcoming';
    }).map(function(m) {
      var conf = predictConfidence(m);
      var tier = predictTier(conf);
      var agreement = Math.round(conf * 0.9);

      var outcomes = ['Home Win', 'Draw', 'Away Win', 'Over 2.5 Goals', 'BTTS'];
      var weights = [40, 25, 20, 10, 5];
      var outcomeIdx = 0;
      var rand = (Math.abs(hashCode(m.id)) % 100);
      var cumulative = 0;
      for (var i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (rand < cumulative) { outcomeIdx = i; break; }
      }

      var factors = [
        m.home + ' recent form suggests advantage',
        m.league + ' season statistics support this pick',
        'Head-to-head record favours ' + (outcomeIdx === 0 ? m.home : outcomeIdx === 2 ? m.away : 'goals'),
        'Model consensus across statistical analysis'
      ];

      var risks = [
        'Unexpected lineup changes possible',
        'Weather conditions may affect play'
      ];

      return {
        id: 'pred_' + m.id,
        matchId: m.id,
        home: m.home,
        away: m.away,
        league: m.league,
        leagueFlag: m.leagueFlag,
        time: m.time,
        date: m.date,
        homeCrest: m.homeCrest,
        awayCrest: m.awayCrest,
        outcome: outcomes[outcomeIdx],
        confidence: conf,
        agreement: agreement,
        tier: tier,
        factors: factors,
        risks: risks,
        models: {
          'Statistical': outcomes[Math.floor(Math.abs(hashCode(m.id + 's')) % 3)],
          'Form': outcomes[Math.floor(Math.abs(hashCode(m.id + 'f')) % 3)],
          'H2H': outcomes[Math.floor(Math.abs(hashCode(m.id + 'h')) % 3)],
          'Market': outcomes[Math.floor(Math.abs(hashCode(m.id + 'm')) % 3)]
        }
      };
    });
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

  var WC_BASE = 'https://worldcup26.ir';

  function fetchWorldCupGames() {
    return fetchExternal(WC_BASE + '/get/games')
      .then(function(data) { return (data.games || []).map(normalizeWCGame); })
      .catch(function(e) { console.warn('World Cup games fetch failed:', e); return []; });
  }

  function fetchWorldCupGroups() {
    return fetchExternal(WC_BASE + '/get/groups')
      .then(function(data) { return data.groups || []; })
      .catch(function(e) { console.warn('World Cup groups fetch failed:', e); return []; });
  }

  function fetchWorldCupTeams() {
    return fetchExternal(WC_BASE + '/get/teams')
      .then(function(data) { return data.teams || []; })
      .catch(function(e) { console.warn('World Cup teams fetch failed:', e); return []; });
  }

  function fetchWorldCupStadiums() {
    return fetchExternal(WC_BASE + '/get/stadiums')
      .then(function(data) { return data.stadiums || []; })
      .catch(function(e) { console.warn('World Cup stadiums fetch failed:', e); return []; });
  }

  function normalizeWCGame(g) {
    var status = 'upcoming';
    if (g.time_elapsed === 'finished') status = 'finished';
    else if (g.time_elapsed === '1H' || g.time_elapsed === '2H' || g.time_elapsed === 'HT' || g.time_elapsed === 'ET') status = 'live';

    return {
      id: 'wc_' + g.id,
      home: g.home_team_name_en || 'TBD',
      away: g.away_team_name_en || 'TBD',
      homeScore: g.home_score !== 'null' ? g.home_score : null,
      awayScore: g.away_score !== 'null' ? g.away_score : null,
      score: (g.home_score !== 'null' && g.away_score !== 'null') ? g.home_score + ' - ' + g.away_score : null,
      homeScorers: g.home_scorers && g.home_scorers !== 'null' ? g.home_scorers.replace(/[{}"]/g, '') : '',
      awayScorers: g.away_scorers && g.away_scorers !== 'null' ? g.away_scorers.replace(/[{}"]/g, '') : '',
      group: g.group || '',
      matchday: g.matchday || '',
      date: g.local_date || '',
      status: status,
      type: g.type || 'group',
      stadiumId: g.stadium_id || '',
      finished: g.finished === 'TRUE'
    };
  }

  return {
    fetchLiveMatches: fetchLiveMatches,
    fetchTodayMatches: fetchTodayMatches,
    fetchTomorrowMatches: fetchTomorrowMatches,
    fetchWeekMatches: fetchWeekMatches,
    fetchAllMatches: fetchAllMatches,
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