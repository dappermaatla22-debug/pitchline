var TEAM_COLORS = {
  'Arsenal': {bg:'#EF0107',fg:'#fff',id:57}, 'Chelsea': {bg:'#034694',fg:'#fff',id:61}, 'Liverpool': {bg:'#C8102E',fg:'#fff',id:64},
  'Man City': {bg:'#6CABDD',fg:'#fff',id:65}, 'Manchester City': {bg:'#6CABDD',fg:'#fff',id:65}, 'Tottenham': {bg:'#132257',fg:'#fff',id:73},
  'Tottenham Hotspur': {bg:'#132257',fg:'#fff',id:73}, 'Newcastle': {bg:'#241F20',fg:'#fff',id:66}, 'Newcastle United': {bg:'#241F20',fg:'#fff',id:66},
  'Aston Villa': {bg:'#670E36',fg:'#fff',id:58}, 'Brighton': {bg:'#0057B8',fg:'#fff',id:397}, 'Brighton & Hove Albion': {bg:'#0057B8',fg:'#fff',id:397},
  'West Ham': {bg:'#7A263A',fg:'#fff',id:563}, 'West Ham United': {bg:'#7A263A',fg:'#fff',id:563}, 'Wolves': {bg:'#FDB913',fg:'#000',id:76},
  'Wolverhampton': {bg:'#FDB913',fg:'#000',id:76}, 'Crystal Palace': {bg:'#1B458F',fg:'#fff',id:354}, 'Brentford': {bg:'#E30613',fg:'#fff',id:402},
  'Fulham': {bg:'#000000',fg:'#fff',id:63}, 'Bournemouth': {bg:'#DA291C',fg:'#fff',id:1044}, 'Nottingham Forest': {bg:'#DD0000',fg:'#fff',id:351},
  'Everton': {bg:'#003399',fg:'#fff',id:62}, 'Ipswich': {bg:'#0044AA',fg:'#fff',id:349}, 'Leicester': {bg:'#003090',fg:'#fff',id:338},
  'Southampton': {bg:'#D71920',fg:'#fff',id:340}, 'Man United': {bg:'#DA291C',fg:'#fff',id:66}, 'Manchester United': {bg:'#DA291C',fg:'#fff',id:66},
  'Real Madrid': {bg:'#FEBE10',fg:'#000',id:86}, 'Atletico Madrid': {bg:'#CB3524',fg:'#fff',id:78},
  'Barcelona': {bg:'#A50044',fg:'#fff',id:81}, 'FC Barcelona': {bg:'#A50044',fg:'#fff',id:81}, 'Sevilla': {bg:'#D4001E',fg:'#fff',id:559},
  'Valencia': {bg:'#EE3524',fg:'#fff',id:95}, 'Bayern Munich': {bg:'#DC052D',fg:'#fff',id:5}, 'Dortmund': {bg:'#FDE100',fg:'#000',id:4},
  'Borussia Dortmund': {bg:'#FDE100',fg:'#000',id:4}, 'Bayer Leverkusen': {bg:'#E32221',fg:'#fff',id:3}, 'RB Leipzig': {bg:'#DD0741',fg:'#fff',id:721},
  'PSG': {bg:'#004170',fg:'#fff',id:524}, 'Paris Saint-Germain': {bg:'#004170',fg:'#fff',id:524}, 'Lyon': {bg:'#241948',fg:'#fff',id:523},
  'Olympique Lyon': {bg:'#241948',fg:'#fff',id:523}, 'Inter Milan': {bg:'#0068A8',fg:'#fff',id:108}, 'Inter': {bg:'#0068A8',fg:'#fff',id:108},
  'AC Milan': {bg:'#FB090B',fg:'#fff',id:98}, 'Milan': {bg:'#FB090B',fg:'#fff',id:98}, 'Juventus': {bg:'#000000',fg:'#fff',id:109},
  'Napoli': {bg:'#12A0D7',fg:'#fff',id:113}, 'AS Roma': {bg:'#8E1F2F',fg:'#fff',id:100}, 'Roma': {bg:'#8E1F2F',fg:'#fff',id:100},
  'Lazio': {bg:'#87D8F7',fg:'#000',id:110},
  'Australia': {bg:'#FFCD00',fg:'#000',flag:'au'}, 'Turkey': {bg:'#E30A17',fg:'#fff',flag:'tr'}, 'Qatar': {bg:'#8D1B3D',fg:'#fff',flag:'qa'},
  'Switzerland': {bg:'#D52B1E',fg:'#fff',flag:'ch'}, 'United States': {bg:'#002868',fg:'#fff',flag:'us'}, 'Germany': {bg:'#000000',fg:'#fff',flag:'de'},
  'Ivory Coast': {bg:'#F77F00',fg:'#000',flag:'ci'}, 'Japan': {bg:'#003087',fg:'#fff',flag:'jp'}, 'Brazil': {bg:'#009739',fg:'#fff',flag:'br'},
  'Argentina': {bg:'#74ACDF',fg:'#fff',flag:'ar'}, 'France': {bg:'#002395',fg:'#fff',flag:'fr'}, 'England': {bg:'#CF081F',fg:'#fff',flag:'gb-eng'},
  'Spain': {bg:'#AA151B',fg:'#fff',flag:'es'}, 'Portugal': {bg:'#006600',fg:'#fff',flag:'pt'}, 'Italy': {bg:'#004B87',fg:'#fff',flag:'it'},
  'Netherlands': {bg:'#FF6600',fg:'#fff',flag:'nl'}, 'Belgium': {bg:'#ED2939',fg:'#fff',flag:'be'}, 'Mexico': {bg:'#006847',fg:'#fff',flag:'mx'},
  'Canada': {bg:'#FF0000',fg:'#fff',flag:'ca'}, 'South Africa': {bg:'#007749',fg:'#FFB81C',flag:'za'}, 'Morocco': {bg:'#C1272D',fg:'#fff',flag:'ma'}, 'Uruguay': {bg:'#5FC2DA',fg:'#000',flag:'uy'},
  'Croatia': {bg:'#171796',fg:'#fff',flag:'hr'}, 'Senegal': {bg:'#00853E',fg:'#fff',flag:'sn'}, 'Ecuador': {bg:'#FFD100',fg:'#000',flag:'ec'},
  'Serbia': {bg:'#C6363C',fg:'#fff',flag:'rs'}, 'Ghana': {bg:'#CE1126',fg:'#fff',flag:'gh'}, 'Cameroon': {bg:'#007A5E',fg:'#fff',flag:'cm'},
  'Tunisia': {bg:'#E70013',fg:'#fff',flag:'tn'}, 'Iran': {bg:'#239F40',fg:'#fff',flag:'ir'}, 'Saudi Arabia': {bg:'#006C35',fg:'#fff',flag:'sa'},
  'South Korea': {bg:'#003478',fg:'#fff',flag:'kr'}, 'Wales': {bg:'#00AB39',fg:'#fff',flag:'gb-wls'}, 'Poland': {bg:'#DC143C',fg:'#fff',flag:'pl'},
  'Peru': {bg:'#D91023',fg:'#fff',flag:'pe'}, 'Greece': {bg:'#0D5EAF',fg:'#fff',flag:'gr'},
  'Scotland': {bg:'#003078',fg:'#fff',flag:'gb-sct'}, 'Norway': {bg:'#BA0C2F',fg:'#fff',flag:'no'}, 'Sweden': {bg:'#006AA7',fg:'#fff',flag:'se'},
  'Denmark': {bg:'#C8102E',fg:'#fff',flag:'dk'}, 'Austria': {bg:'#ED2939',fg:'#fff',flag:'at'}, 'Czech Republic': {bg:'#11457E',fg:'#fff',flag:'cz'},
  'Hungary': {bg:'#477050',fg:'#fff',flag:'hu'}, 'Romania': {bg:'#002B7F',fg:'#fff',flag:'ro'}, 'Ukraine': {bg:'#FFD500',fg:'#000',flag:'ua'},
  'Colombia': {bg:'#FCD116',fg:'#000',flag:'co'}, 'Chile': {bg:'#D52B1E',fg:'#fff',flag:'cl'}, 'Paraguay': {bg:'#D52B1E',fg:'#fff',flag:'py'},
  'Bolivia': {bg:'#007934',fg:'#fff',flag:'bo'}, 'Venezuela': {bg:'#CF142B',fg:'#fff',flag:'ve'}, 'Indonesia': {bg:'#FF0000',fg:'#fff',flag:'id'},
  'Algeria': {bg:'#006233',fg:'#fff',flag:'dz'}, 'Nigeria': {bg:'#008751',fg:'#fff',flag:'ng'}, 'Mali': {bg:'#14B53A',fg:'#fff',flag:'ml'},
  'Burkina Faso': {bg:'#009E49',fg:'#fff',flag:'bf'}, 'DR Congo': {bg:'#007FFF',fg:'#fff',flag:'cd'}, 'Guinea': {bg:'#CE1126',fg:'#fff',flag:'gn'},
  'Zambia': {bg:'#198A38',fg:'#fff',flag:'zm'}, 'Cape Verde': {bg:'#003893',fg:'#fff',flag:'cv'}, 'Gabon': {bg:'#009E60',fg:'#fff',flag:'ga'},
  'Uganda': {bg:'#FCDC04',fg:'#000',flag:'ug'}, 'Iceland': {bg:'#003897',fg:'#fff',flag:'is'},   'Albania': {bg:'#E41E20',fg:'#fff',flag:'al'},
  'Ireland': {bg:'#169B62',fg:'#fff',flag:'ie'}, 'Republic of Ireland': {bg:'#169B62',fg:'#fff',flag:'ie'}, 'Bulgaria': {bg:'#00966E',fg:'#fff',flag:'bg'},
  'New Zealand': {bg:'#000000',fg:'#fff',flag:'nz'}, 'Costa Rica': {bg:'#002B7F',fg:'#fff',flag:'cr'},
  'Panama': {bg:'#D2161B',fg:'#fff',flag:'pa'}, 'Jamaica': {bg:'#009B3A',fg:'#000',flag:'jm'},
  'Trinidad and Tobago': {bg:'#CE1126',fg:'#fff',flag:'tt'}, 'Honduras': {bg:'#0073CF',fg:'#fff',flag:'hn'},
  'El Salvador': {bg:'#0047AB',fg:'#fff',flag:'sv'}, 'Guatemala': {bg:'#4997D0',fg:'#fff',flag:'gt'},
  'Canada Women': {bg:'#FF0000',fg:'#fff',flag:'ca'}, 'Haiti': {bg:'#00209F',fg:'#fff',flag:'ht'},
  'Curaçao': {bg:'#00A551',fg:'#fff',flag:'cw'}, 'Suriname': {bg:'#377E3F',fg:'#fff',flag:'sr'},
  'Nicaragua': {bg:'#0067C6',fg:'#fff',flag:'ni'}, 'Bermuda': {bg:'#CF0A2C',fg:'#fff',flag:'bm'},
  'Guadeloupe': {bg:'#02411C',fg:'#fff',flag:'gp'}, 'Martinique': {bg:'#00653E',fg:'#fff',flag:'mq'},
  'Canada': {bg:'#FF0000',fg:'#fff',flag:'ca'}, 'USA': {bg:'#002868',fg:'#fff',flag:'us'}, 'USMNT': {bg:'#002868',fg:'#fff',flag:'us'},
  'Saudi Arabia': {bg:'#006C35',fg:'#fff',flag:'sa'}, 'Iran': {bg:'#239F40',fg:'#fff',flag:'ir'},
  'Japan': {bg:'#003087',fg:'#fff',flag:'jp'}, 'South Korea': {bg:'#003478',fg:'#fff',flag:'kr'},
  'Australia': {bg:'#FFCD00',fg:'#000',flag:'au'}, 'Qatar': {bg:'#8D1B3D',fg:'#fff',flag:'qa'},
  'Ghana': {bg:'#CE1126',fg:'#fff',flag:'gh'}, 'Cameroon': {bg:'#007A5E',fg:'#fff',flag:'cm'},
  'Senegal': {bg:'#00853E',fg:'#fff',flag:'sn'}, 'Tunisia': {bg:'#E70013',fg:'#fff',flag:'tn'},
  'Morocco': {bg:'#C1272D',fg:'#fff',flag:'ma'}, 'Ecuador': {bg:'#FFD100',fg:'#000',flag:'ec'},
  'Uruguay': {bg:'#5FC2DA',fg:'#000',flag:'uy'}, 'Serbia': {bg:'#C6363C',fg:'#fff',flag:'rs'},
  'Croatia': {bg:'#171796',fg:'#fff',flag:'hr'}, 'Poland': {bg:'#DC143C',fg:'#fff',flag:'pl'},
  'Denmark': {bg:'#C8102E',fg:'#fff',flag:'dk'}, 'Switzerland': {bg:'#D52B1E',fg:'#fff',flag:'ch'},
  'Netherlands': {bg:'#FF6600',fg:'#fff',flag:'nl'}, 'Belgium': {bg:'#ED2939',fg:'#fff',flag:'be'},
  'Mexico': {bg:'#006847',fg:'#fff',flag:'mx'}, 'Colombia': {bg:'#FCD116',fg:'#000',flag:'co'},
  'Peru': {bg:'#D91023',fg:'#fff',flag:'pe'}, 'Chile': {bg:'#D52B1E',fg:'#fff',flag:'cl'}
};

function getTeamColor(name) {
  if (TEAM_COLORS[name]) return TEAM_COLORS[name];
  var keys = Object.keys(TEAM_COLORS);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].toLowerCase().indexOf(name.toLowerCase()) > -1 || name.toLowerCase().indexOf(keys[i].toLowerCase()) > -1) {
      return TEAM_COLORS[keys[i]];
    }
  }
  var hash = 0;
  for (var j = 0; j < name.length; j++) { hash = ((hash << 5) - hash) + name.charCodeAt(j); hash = hash & hash; }
  var hue = Math.abs(hash % 360);
  return {bg:'hsl(' + hue + ',65%,45%)', fg:'#fff'};
}

function getTeamCrestUrl(name) {
  var tc = getTeamColor(name);
  if (tc.id) return 'https://crests.football-data.org/' + tc.id + '.png';
  if (tc.flag) return 'https://flagcdn.com/w80/' + tc.flag + '.png';
  return '';
}

function teamLogo(name, crest, size) {
  size = size || 32;
  var tc = getTeamColor(name);
  var initials = name.split(' ').map(function(w){ return w.charAt(0); }).join('').substring(0,2).toUpperCase();
  var fontSize = Math.round(size * 0.38);
  var url = crest || getTeamCrestUrl(name);

  if (url) {
    var badgeId = 'tb_' + name.replace(/\W/g,'') + '_' + size;
    return '<div id="' + badgeId + '" class="team-badge" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;overflow:hidden;flex-shrink:0;background:' + tc.bg + ';display:flex;align-items:center;justify-content:center;">'
      + '<img src="' + url + '" alt="' + name + '" style="width:100%;height:100%;object-fit:contain;" loading="lazy" onerror="this.style.display=\'none\';var s=this.nextElementSibling;if(s)s.style.display=\'flex\';">'
      + '<span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:' + fontSize + 'px;font-weight:700;color:' + tc.fg + ';background:' + tc.bg + ';">' + initials + '</span>'
      + '</div>';
  }
  return '<div class="team-badge" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:' + fontSize + 'px;font-weight:700;color:' + tc.fg + ';background:' + tc.bg + ';flex-shrink:0;">' + initials + '</div>';
}

function renderConfidenceBadge(tier) {
  var map = {elite:'Elite',strong:'Strong',moderate:'Moderate',risky:'Risky'};
  return '<span class="confidence-badge badge-' + tier + '">' + (map[tier]||tier) + '</span>';
}

function renderFormGuide(form) {
  return '<div class="form-guide">' + form.map(function(r){ return '<div class="form-dot form-' + r + '">' + r + '</div>'; }).join('') + '</div>';
}

function renderScoreRing(score, size, color) {
  size = size || 72;
  var r = (size/2) - 7;
  var circ = 2 * Math.PI * r;
  var dashOffset = circ - (score/100) * circ;
  var c = color || (score >= 80 ? 'var(--elite)' : score >= 65 ? 'var(--strong)' : score >= 50 ? 'var(--moderate)' : 'var(--risky)');
  return '<div class="score-ring" style="width:' + size + 'px;height:' + size + 'px;"><svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '"><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '" fill="none" stroke="var(--bg-elevated)" stroke-width="5"/><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '" fill="none" stroke="' + c + '" stroke-width="5" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + dashOffset.toFixed(1) + '" stroke-linecap="round"/></svg><div class="score-ring-label"><span class="score-ring-num" style="color:' + c + ';font-size:' + (size<60?'14px':'22px') + '">' + score + '</span><span class="score-ring-unit">%</span></div></div>';
}

function renderProgressBar(pct, color) {
  color = color || 'var(--accent)';
  return '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%;background:' + color + ';"></div></div>';
}

function renderMatchCard(match, showPred) {
  if (showPred === undefined) showPred = true;
  var predictions = Store.getPredictions();
  var pred = match.predId ? predictions.find(function(p){ return p.id === match.predId; }) : null;
  var isLive = match.status === 'live';
  var dateLabel = match.date && match.date !== 'Today' && match.date !== 'Tomorrow' ? match.date : '';
  return '<div class="match-card" onclick="openMatchDetail(\'' + match.id + '\')">'
    + '<div class="match-teams">'
    + '<div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">'
    + teamLogo(match.home, match.homeCrest, 28)
    + '<span class="team-name" onclick="event.stopPropagation();openTeamProfile(\'' + match.home.replace(/'/g, "\\'") + '\')" style="cursor:pointer;">' + match.home + '</span>'
    + '</div>'
    + '<span class="vs-badge">' + (isLive ? match.score : (match.status === 'finished' && match.score ? match.score : 'VS')) + '</span>'
    + '<div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;justify-content:flex-end;">'
    + '<span class="team-name away" onclick="event.stopPropagation();openTeamProfile(\'' + match.away.replace(/'/g, "\\'") + '\')" style="cursor:pointer;">' + match.away + '</span>'
    + teamLogo(match.away, match.awayCrest, 28)
    + '</div>'
    + '</div>'
    + '<div class="match-meta">'
    + '<span class="match-league" style="cursor:pointer;">' + (match.leagueFlag || '') + ' ' + match.league + '</span>'
    + '<div style="display:flex;align-items:center;gap:8px;">'
    + (dateLabel ? '<span class="match-time" style="color:var(--text-muted);font-size:11px;">' + dateLabel + '</span>' : '')
    + (isLive ? '<span style="color:var(--danger);font-size:12px;font-weight:600;">\u25cf LIVE ' + (match.minute || '') + '</span>' : '<span class="match-time">' + match.time + '</span>')
    + (pred && showPred ? renderConfidenceBadge(pred.tier) : '')
    + '</div></div></div>';
}

function renderLiveMatchCard(match) {
  var predictions = Store.getPredictions();
  var pred = match.predId ? predictions.find(function(p){ return p.id === match.predId; }) : null;
  return '<div class="live-score-card" onclick="openMatchDetail(\'' + match.id + '\')">'
    + '<div class="live-card-header">'
    + '<span class="live-card-league">' + (match.leagueFlag || '') + ' ' + match.league + '</span>'
    + '<span class="live-card-time"><span class="live-dot"></span>' + (match.minute || "0'") + '</span>'
    + '</div>'
    + '<div class="live-card-teams">'
    + '<div class="live-card-team">'
    + teamLogo(match.home, match.homeCrest, 36)
    + '<span class="live-card-name" onclick="event.stopPropagation();openTeamProfile(\'' + match.home.replace(/'/g, "\\'") + '\')">' + match.home + '</span>'
    + '</div>'
    + '<div class="live-card-score">' + (match.score || '0 - 0') + '</div>'
    + '<div class="live-card-team live-card-team-right">'
    + '<span class="live-card-name" onclick="event.stopPropagation();openTeamProfile(\'' + match.away.replace(/'/g, "\\'") + '\')">' + match.away + '</span>'
    + teamLogo(match.away, match.awayCrest, 36)
    + '</div>'
    + '</div>'
    + (pred ? '<div class="live-card-pred">' + renderConfidenceBadge(pred.tier) + ' ' + pred.outcome + '</div>' : '<div class="live-card-pred" style="color:rgba(255,255,255,0.4);font-size:11px;">In progress</div>')
    + '</div>';
}

function renderPredCard(pred) {
  var agreeColor = pred.tier === 'elite' ? 'var(--elite)' : pred.tier === 'strong' ? 'var(--strong)' : pred.tier === 'moderate' ? 'var(--moderate)' : 'var(--risky)';
  var dateLabel = pred.date && pred.date !== 'Today' && pred.date !== 'Tomorrow' ? ' \u00b7 ' + pred.date : '';
  return '<div class="pred-card tier-' + pred.tier + '" onclick="openPredDetail(\'' + pred.id + '\')">'
    + '<div class="pred-card-top">'
    + '<div style="flex:1;margin-right:12px;min-width:0;">'
    + '<div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">' + pred.league + ' \u00b7 ' + pred.time + dateLabel + '</div>'
    + '<div style="display:flex;align-items:center;gap:6px;font-size:15px;font-weight:600;">'
    + teamLogo(pred.home, pred.homeCrest, 22)
    + '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;" onclick="event.stopPropagation();openTeamProfile(\'' + pred.home.replace(/'/g, "\\'") + '\')">' + pred.home + '</span>'
    + '<span style="color:var(--text-muted);font-weight:400;flex-shrink:0;">vs</span>'
    + '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;" onclick="event.stopPropagation();openTeamProfile(\'' + pred.away.replace(/'/g, "\\'") + '\')">' + pred.away + '</span>'
    + teamLogo(pred.away, pred.awayCrest, 22)
    + '</div>'
    + '<div style="display:flex;align-items:center;gap:8px;margin-top:6px;">'
    + '<div class="pred-outcome">\u2192 ' + pred.outcome + '</div>'
    + (pred.verdict === 'correct' ? '<span style="background:var(--success);color:#fff;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;">✅ CORRECT</span>' : pred.verdict === 'wrong' ? '<span style="background:var(--danger);color:#fff;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;">❌ WRONG</span>' : '')
    + '</div>'
    + '</div>'
    + '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;">' + renderScoreRing(pred.confidence, 60) + renderConfidenceBadge(pred.tier) + '</div>'
    + '</div>'
    + '<div class="pred-card-bottom">'
    + '<div style="flex:1;margin-right:16px;"><div class="agreement-label"><span>Model Agreement</span><span style="color:var(--text-primary);font-weight:600;">' + pred.agreement + '%</span></div>' + renderProgressBar(pred.agreement, agreeColor) + '</div>'
    + (pred.verdict ? '<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();shareResult(\'' + pred.id + '\')">' + ICONS.share + '</button>' : '<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();savePrediction(\'' + pred.id + '\')">Save</button>')
    + '</div></div>';
}

function renderEmptyState(icon, title, desc, btnLabel, btnAction) {
  return '<div class="empty-state"><div class="empty-icon">' + (ICONS[icon] || '') + '</div><div class="empty-title">' + title + '</div><div class="empty-desc">' + desc + '</div>' + (btnLabel ? '<button class="btn btn-primary" onclick="' + btnAction + '">' + btnLabel + '</button>' : '') + '</div>';
}

function renderModelAgreement(models) {
  return Object.entries(models).map(function(e) {
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);"><span style="font-size:13px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.4px;font-weight:500;">' + e[0] + ' Model</span><span style="font-size:13px;font-weight:600;color:var(--text-primary);">' + e[1] + '</span></div>';
  }).join('');
}