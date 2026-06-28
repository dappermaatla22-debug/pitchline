var Store = (function() {

  var state = {
    matches: [],
    predictions: [],
    liveMatches: [],
    todayMatches: [],
    tomorrowMatches: [],
    weekMatches: [],
    notifications: [],
    worldCup: {
      games: [],
      groups: [],
      teams: [],
      stadiums: [],
      predictions: []
    },
    user: {
      name: 'Alex Morgan',
      initials: 'AM',
      plan: 'Free',
      savedCount: 0,
      savedPredictions: [],
      favTeams: ['Arsenal', 'Liverpool'],
      stats: { tracked: 0, correctPct: 0, eliteHitPct: 0, streak: 0 }
    },
    standings: [],
    loading: false,
    error: null,
    lastFetch: null
  };

  var listeners = [];

  function subscribe(fn) {
    listeners.push(fn);
    return function() {
      listeners = listeners.filter(function(l) { return l !== fn; });
    };
  }

  function notify() {
    listeners.forEach(function(fn) { fn(state); });
  }

  function setLoading(loading) {
    state.loading = loading;
  }

  function setError(error) {
    state.error = error;
  }

  function loadUserData() {
    try {
      var saved = localStorage.getItem('pitchline-user');
      if (saved) {
        var parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(function(k) { state.user[k] = parsed[k]; });
      }
      var savedPredictions = localStorage.getItem('pitchline-saved');
      if (savedPredictions) state.user.savedPredictions = JSON.parse(savedPredictions);
      var favTeams = localStorage.getItem('pitchline-favteams');
      if (favTeams) state.user.favTeams = JSON.parse(favTeams);
    } catch(e) { console.warn('Failed to load user data:', e); }
  }

  function saveUserData() {
    try {
      localStorage.setItem('pitchline-user', JSON.stringify(state.user));
      localStorage.setItem('pitchline-saved', JSON.stringify(state.user.savedPredictions || []));
      localStorage.setItem('pitchline-favteams', JSON.stringify(state.user.favTeams));
    } catch(e) { console.warn('Failed to save user data:', e); }
  }

  function loadDemoData() {
    if (typeof DATA !== 'undefined') {
      state.matches = DATA.matches || [];
      state.predictions = DATA.predictions || [];
    } else {
      state.matches = [];
      state.predictions = [];
    }
    state.liveMatches = state.matches.filter(function(m) { return m.status === 'live'; });
    state.todayMatches = state.matches.filter(function(m) { return m.date === 'Today'; });
    state.tomorrowMatches = state.matches.filter(function(m) { return m.date === 'Tomorrow'; });
    generateNotifications(state.matches);
    state.lastFetch = Date.now();
  }

  function fetchAllData() {
    loadDemoData();
    notify();

    API.fetchAllMatches()
      .then(function(allMatches) {
        if (allMatches && allMatches.length > 0) {
          state.matches = allMatches;
          state.liveMatches = allMatches.filter(function(m) { return m.status === 'live'; });
          state.todayMatches = allMatches.filter(function(m) { return m.date === 'Today'; });
          state.tomorrowMatches = allMatches.filter(function(m) { return m.date === 'Tomorrow'; });
          state.weekMatches = allMatches.filter(function(m) { return m.status === 'upcoming'; });
          state.predictions = API.generatePredictions(allMatches);
          allMatches.forEach(function(m) {
            var pred = state.predictions.find(function(p) { return p.matchId === m.id; });
            if (pred) m.predId = pred.id;
          });

          var teamNames = [];
          allMatches.forEach(function(m) {
            if (teamNames.indexOf(m.home) === -1) teamNames.push(m.home);
            if (teamNames.indexOf(m.away) === -1) teamNames.push(m.away);
          });
          API.batchLoadBadges(teamNames);

          generateNotifications(allMatches);
          state.lastFetch = Date.now();
          notify();
        }
      })
      .catch(function(e) {
        console.warn('API fetch failed, using demo data:', e);
      });
  }

  function refreshMatches() {
    setLoading(true);
    return API.fetchAllMatches()
      .then(function(matches) {
        if (matches && matches.length > 0) {
          state.matches = matches;
          state.liveMatches = matches.filter(function(m) { return m.status === 'live'; });
          state.todayMatches = matches.filter(function(m) { return m.date === 'Today'; });
          state.tomorrowMatches = matches.filter(function(m) { return m.date === 'Tomorrow'; });
          state.weekMatches = matches.filter(function(m) { return m.status === 'upcoming'; });
          state.predictions = API.generatePredictions(matches);
          matches.forEach(function(m) {
            var pred = state.predictions.find(function(p) { return p.matchId === m.id; });
            if (pred) m.predId = pred.id;
          });
          generateNotifications(matches);
        }
        state.lastFetch = Date.now();
        setLoading(false);
        notify();
        return state.matches;
      })
      .catch(function(e) {
        console.warn('Refresh failed:', e);
        setLoading(false);
        notify();
        return state.matches;
      });
  }

  function fetchCompetition(code) {
    return API.fetchCompetitionMatches(code)
      .then(function(matches) { return matches; })
      .catch(function() { return []; });
  }

  function fetchMatchDetail(matchId) {
    var apiId = matchId.replace('fm_', '');
    return API.fetchMatchDetail(apiId)
      .then(function(match) { return match; })
      .catch(function() { return null; });
  }

  function fetchStandings(code) {
    return API.fetchStandings(code)
      .catch(function() { return []; });
  }

  function fetchWorldCupData() {
    return Promise.all([
      API.fetchWorldCupFromFD().catch(function() { return []; }),
      API.fetchWorldCupGames().catch(function() { return []; }),
      API.fetchWorldCupGroups().catch(function() { return []; }),
      API.fetchWorldCupTeams().catch(function() { return []; })
    ]).then(function(results) {
      var fdGames = results[0] || [];
      var wcGames = results[1] || [];
      var groups = results[2] || [];
      var teams = results[3] || [];

      if (fdGames.length > 0) {
        state.worldCup.games = fdGames;
      } else {
        state.worldCup.games = wcGames;
      }
      state.worldCup.groups = groups;
      state.worldCup.teams = teams;
      state.worldCup.predictions = API.generateWCPredictions(state.worldCup.games);
      notify();
      return state.worldCup;
    }).catch(function(e) {
      console.warn('World Cup fetch failed:', e);
      return state.worldCup;
    });
  }

  function generateNotifications(matches) {
    state.notifications = [];
    var live = matches.filter(function(m) { return m.status === 'live'; });
    var elitePreds = state.predictions.filter(function(p) { return p.tier === 'elite'; });

    live.forEach(function(m, i) {
      if (i < 5) {
        state.notifications.push({
          id: 'live_' + m.id,
          type: 'match',
          title: m.home + ' vs ' + m.away + ' is live',
          body: m.score || 'Kick off \u2014 ' + m.time,
          time: 'Now',
          read: false
        });
      }
    });

    elitePreds.forEach(function(p, i) {
      if (i < 3) {
        state.notifications.push({
          id: 'elite_' + p.id,
          type: 'elite',
          title: 'Elite Pick: ' + p.confidence + '% confidence',
          body: p.home + ' vs ' + p.away + ' \u2014 ' + p.outcome,
          time: i === 0 ? '2 min ago' : (i === 1 ? '15 min ago' : '1 hr ago'),
          read: false
        });
      }
    });

    if (state.notifications.length === 0) {
      state.notifications.push({
        id: 'welcome',
        type: 'info',
        title: 'Welcome to Pitchline',
        body: 'Matches and predictions will appear here once the API is connected.',
        time: 'Just now',
        read: false
      });
    }
  }

  function getMatches() { return state.matches; }
  function getLiveMatches() { return state.liveMatches; }
  function getTodayMatches() { return state.todayMatches; }
  function getTomorrowMatches() { return state.tomorrowMatches; }
  function getWeekMatches() { return state.weekMatches; }
  function getPredictions() { return state.predictions; }
  function getNotifications() { return state.notifications; }
  function getUser() { return state.user; }
  function getWorldCup() { return state.worldCup; }
  function getWCPredictions() { return state.worldCup.predictions || []; }
  function isLoading() { return state.loading; }
  function getError() { return state.error; }

  function getSavedPredictions() {
    var savedIds = state.user.savedPredictions || [];
    var regular = state.predictions.filter(function(p) { return savedIds.indexOf(p.id) > -1; });
    var wcPreds = state.worldCup.predictions || [];
    var wc = wcPreds.filter(function(p) { return savedIds.indexOf(p.id) > -1; });
    return regular.concat(wc);
  }

  function getUnreadCount() {
    return state.notifications.filter(function(n) { return !n.read; }).length;
  }

  function getFavTeams() {
    return state.user.favTeams || [];
  }

  function savePrediction(id) {
    if (!state.user.savedPredictions) state.user.savedPredictions = [];
    if (state.user.savedPredictions.indexOf(id) === -1) {
      state.user.savedPredictions.push(id);
      state.user.savedCount = state.user.savedPredictions.length;
      saveUserData();
      notify();
    }
  }

  function removeSavedPrediction(id) {
    if (!state.user.savedPredictions) return;
    state.user.savedPredictions = state.user.savedPredictions.filter(function(s) { return s !== id; });
    state.user.savedCount = state.user.savedPredictions.length;
    saveUserData();
    notify();
  }

  function addFavTeam(name) {
    if (state.user.favTeams.indexOf(name) === -1) {
      state.user.favTeams.push(name);
      saveUserData();
      notify();
    }
  }

  function removeFavTeam(name) {
    state.user.favTeams = state.user.favTeams.filter(function(t) { return t !== name; });
    saveUserData();
    notify();
  }

  function markNotificationRead(id) {
    var n = state.notifications.find(function(n) { return n.id === id; });
    if (n) { n.read = true; notify(); }
  }

  function clearNotifications() {
    state.notifications.forEach(function(n) { n.read = true; });
    notify();
  }

  function deleteNotification(id) {
    state.notifications = state.notifications.filter(function(n) { return n.id !== id; });
    notify();
  }

  loadUserData();

  return {
    subscribe: subscribe,
    notify: notify,
    fetchAllData: fetchAllData,
    refreshMatches: refreshMatches,
    fetchCompetition: fetchCompetition,
    fetchMatchDetail: fetchMatchDetail,
    fetchStandings: fetchStandings,
    fetchWorldCupData: fetchWorldCupData,
    getMatches: getMatches,
    getLiveMatches: getLiveMatches,
    getTodayMatches: getTodayMatches,
    getTomorrowMatches: getTomorrowMatches,
    getWeekMatches: getWeekMatches,
    getPredictions: getPredictions,
    getNotifications: getNotifications,
    getUser: getUser,
    getWorldCup: getWorldCup,
    getWCPredictions: getWCPredictions,
    getSavedPredictions: getSavedPredictions,
    getUnreadCount: getUnreadCount,
    getFavTeams: getFavTeams,
    isLoading: isLoading,
    getError: getError,
    savePrediction: savePrediction,
    removeSavedPrediction: removeSavedPrediction,
    addFavTeam: addFavTeam,
    removeFavTeam: removeFavTeam,
    markNotificationRead: markNotificationRead,
    clearNotifications: clearNotifications,
    deleteNotification: deleteNotification,
    state: state
  };
})();