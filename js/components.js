var TEAM_COLORS = {
  'Arsenal': {bg:'#EF0107',fg:'#fff'}, 'Chelsea': {bg:'#034694',fg:'#fff'}, 'Liverpool': {bg:'#C8102E',fg:'#fff'},
  'Man City': {bg:'#6CABDD',fg:'#fff'}, 'Manchester City': {bg:'#6CABDD',fg:'#fff'}, 'Tottenham': {bg:'#132257',fg:'#fff'},
  'Tottenham Hotspur': {bg:'#132257',fg:'#fff'}, 'Newcastle': {bg:'#241F20',fg:'#fff'}, 'Newcastle United': {bg:'#241F20',fg:'#fff'},
  'Aston Villa': {bg:'#670E36',fg:'#fff'}, 'Brighton': {bg:'#0057B8',fg:'#fff'}, 'Brighton & Hove Albion': {bg:'#0057B8',fg:'#fff'},
  'West Ham': {bg:'#7A263A',fg:'#fff'}, 'West Ham United': {bg:'#7A263A',fg:'#fff'}, 'Wolves': {bg:'#FDB913',fg:'#000'},
  'Wolverhampton': {bg:'#FDB913',fg:'#000'}, 'Crystal Palace': {bg:'#1B458F',fg:'#fff'}, 'Brentford': {bg:'#E30613',fg:'#fff'},
  'Fulham': {bg:'#000000',fg:'#fff'}, 'Bournemouth': {bg:'#DA291C',fg:'#fff'}, 'Nottingham Forest': {bg:'#DD0000',fg:'#fff'},
  'Everton': {bg:'#003399',fg:'#fff'}, 'Ipswich': {bg:'#0044AA',fg:'#fff'}, 'Leicester': {bg:'#003090',fg:'#fff'},
  'Southampton': {bg:'#D71920',fg:'#fff'}, 'Real Madrid': {bg:'#FEBE10',fg:'#000'}, 'Atletico Madrid': {bg:'#CB3524',fg:'#fff'},
  'Barcelona': {bg:'#A50044',fg:'#fff'}, 'FC Barcelona': {bg:'#A50044',fg:'#fff'}, 'Sevilla': {bg:'#D4001E',fg:'#fff'},
  'Valencia': {bg:'#EE3524',fg:'#fff'}, 'Bayern Munich': {bg:'#DC052D',fg:'#fff'}, 'Dortmund': {bg:'#FDE100',fg:'#000'},
  'Borussia Dortmund': {bg:'#FDE100',fg:'#000'}, 'Bayer Leverkusen': {bg:'#E32221',fg:'#fff'}, 'RB Leipzig': {bg:'#DD0741',fg:'#fff'},
  'PSG': {bg:'#004170',fg:'#fff'}, 'Paris Saint-Germain': {bg:'#004170',fg:'#fff'}, 'Lyon': {bg:'#241948',fg:'#fff'},
  'Olympique Lyon': {bg:'#241948',fg:'#fff'}, 'Inter Milan': {bg:'#0068A8',fg:'#fff'}, 'Inter': {bg:'#0068A8',fg:'#fff'},
  'AC Milan': {bg:'#FB090B',fg:'#fff'}, 'Milan': {bg:'#FB090B',fg:'#fff'}, 'Juventus': {bg:'#000000',fg:'#fff'},
  'Napoli': {bg:'#12A0D7',fg:'#fff'}, 'AS Roma': {bg:'#8E1F2F',fg:'#fff'}, 'Roma': {bg:'#8E1F2F',fg:'#fff'},
  'Lazio': {bg:'#87D8F7',fg:'#000'}, 'Man United': {bg:'#DA291C',fg:'#fff'}, 'Manchester United': {bg:'#DA291C',fg:'#fff'},
  'Australia': {bg:'#FFCD00',fg:'#000'}, 'Turkey': {bg:'#E30A17',fg:'#fff'}, 'Qatar': {bg:'#8D1B3D',fg:'#fff'},
  'Switzerland': {bg:'#D52B1E',fg:'#fff'}, 'United States': {bg:'#002868',fg:'#fff'}, 'Germany': {bg:'#000000',fg:'#fff'},
  'Ivory Coast': {bg:'#F77F00',fg:'#000'}, 'Japan': {bg:'#003087',fg:'#fff'}, 'Brazil': {bg:'#009739',fg:'#fff'},
  'Argentina': {bg:'#74ACDF',fg:'#fff'}, 'France': {bg:'#002395',fg:'#fff'}, 'England': {bg:'#CF081F',fg:'#fff'},
  'Spain': {bg:'#AA151B',fg:'#fff'}, 'Portugal': {bg:'#006600',fg:'#fff'}, 'Italy': {bg:'#004B87',fg:'#fff'},
  'Netherlands': {bg:'#FF6600',fg:'#fff'}, 'Belgium': {bg:'#ED2939',fg:'#fff'}, 'Mexico': {bg:'#006847',fg:'#fff'},
  'Canada': {bg:'#FF0000',fg:'#fff'}, 'Morocco': {bg:'#C1272D',fg:'#fff'}, 'Uruguay': {bg:'#5FC2DA',fg:'#000'},
  'Croatia': {bg:'#171796',fg:'#fff'}, 'Senegal': {bg:'#00853E',fg:'#fff'}, 'Ecuador': {bg:'#FFD100',fg:'#000'},
  'Serbia': {bg:'#C6363C',fg:'#fff'}, 'Ghana': {bg:'#CE1126',fg:'#fff'}, 'Cameroon': {bg:'#007A5E',fg:'#fff'},
  'Tunisia': {bg:'#E70013',fg:'#fff'}, 'Iran': {bg:'#239F40',fg:'#fff'}, 'Saudi Arabia': {bg:'#006C35',fg:'#fff'},
  'South Korea': {bg:'#003478',fg:'#fff'}, 'Wales': {bg:'#00AB39',fg:'#fff'}, 'Poland': {bg:'#DC143C',fg:'#fff'},
  'Senegal': {bg:'#00853E',fg:'#fff'}, 'Peru': {bg:'#D91023',fg:'#fff'}, 'Greece': {bg:'#0D5EAF',fg:'#fff'},
  'Scotland': {bg:'#003078',fg:'#fff'}, 'Norway': {bg:'#BA0C2F',fg:'#fff'}, 'Sweden': {bg:'#006AA7',fg:'#fff'},
  'Denmark': {bg:'#C8102E',fg:'#fff'}, 'Austria': {bg:'#ED2939',fg:'#fff'}, 'Czech Republic': {bg:'#11457E',fg:'#fff'},
  'Hungary': {bg:'#477050',fg:'#fff'}, 'Romania': {bg:'#002B7F',fg:'#fff'}, 'Ukraine': {bg:'#FFD500',fg:'#000'},
  'Colombia': {bg:'#FCD116',fg:'#000'}, 'Chile': {bg:'#D52B1E',fg:'#fff'}, 'Paraguay': {bg:'#D52B1E',fg:'#fff'},
  'Bolivia': {bg:'#007934',fg:'#fff'}, 'Venezuela': {bg:'#CF142B',fg:'#fff'}, 'Indonesia': {bg:'#FF0000',fg:'#fff'},
  'Algeria': {bg:'#006233',fg:'#fff'}, 'Nigeria': {bg:'#008751',fg:'#fff'}, 'Mali': {bg:'#14B53A',fg:'#fff'},
  'Burkina Faso': {bg:'#009E49',fg:'#fff'}, 'DR Congo': {bg:'#007FFF',fg:'#fff'}, 'Guinea': {bg:'#CE1126',fg:'#fff'},
  'Zambia': {bg:'#198A38',fg:'#fff'}, 'Cape Verde': {bg:'#003893',fg:'#fff'}, 'Gabon': {bg:'#009E60',fg:'#fff'},
  'Uganda': {bg:'#FCDC04',fg:'#000'}, 'Iceland': {bg:'#003897',fg:'#fff'}, 'Albania': {bg:'#E41E20',fg:'#fff'},
  'Ireland': {bg:'#169B62',fg:'#fff'}, 'Republic of Ireland': {bg:'#169B62',fg:'#fff'}, 'Bulgaria': {bg:'#00966E',fg:'#fff'}
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

function teamLogo(name, crest, size) {
  size = size || 32;
  var tc = getTeamColor(name);
  var initials = name.split(' ').map(function(w){ return w.charAt(0); }).join('').substring(0,2).toUpperCase();
  var fontSize = Math.round(size * 0.38);

  if (crest) {
    return '<div class="team-badge" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;overflow:hidden;flex-shrink:0;background:' + tc.bg + ';">'
      + '<img src="' + crest + '" alt="' + name + '" style="width:100%;height:100%;object-fit:contain;background:var(--bg-elevated);" onerror="this.parentElement.innerHTML=\'<span style=\\'display:flex;width:100%;height:100%;align-items:center;justify-content:center;font-size:' + fontSize + 'px;font-weight:700;color:' + tc.fg + ';background:' + tc.bg + '\\'>\\' + \'' + initials + '\' + \'</span>\'">'
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
  return '<div class="match-card" onclick="openMatchDetail(\'' + match.id + '\')">'
    + '<div class="match-teams">'
    + '<div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">'
    + teamLogo(match.home, match.homeCrest, 28)
    + '<span class="team-name">' + match.home + '</span>'
    + '</div>'
    + '<span class="vs-badge">' + (isLive ? match.score : 'VS') + '</span>'
    + '<div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;justify-content:flex-end;">'
    + '<span class="team-name away">' + match.away + '</span>'
    + teamLogo(match.away, match.awayCrest, 28)
    + '</div>'
    + '</div>'
    + '<div class="match-meta">'
    + '<span class="match-league">' + match.league + '</span>'
    + '<div style="display:flex;align-items:center;gap:8px;">'
    + (isLive ? '<span style="color:var(--danger);font-size:12px;font-weight:600;">\u25cf LIVE ' + (match.minute || '') + '</span>' : '<span class="match-time">' + match.time + '</span>')
    + (pred && showPred ? renderConfidenceBadge(pred.tier) : '')
    + '</div></div></div>';
}

function renderLiveMatchCard(match) {
  var predictions = Store.getPredictions();
  var pred = match.predId ? predictions.find(function(p){ return p.id === match.predId; }) : null;
  var tc1 = getTeamColor(match.home);
  var tc2 = getTeamColor(match.away);
  return '<div class="live-score-card" onclick="openMatchDetail(\'' + match.id + '\')">'
    + '<div class="live-card-header">'
    + '<span class="live-card-league">' + match.league + '</span>'
    + '<span class="live-card-time"><span class="live-dot"></span>' + (match.minute || "0'") + '</span>'
    + '</div>'
    + '<div class="live-card-teams">'
    + '<div class="live-card-team">'
    + teamLogo(match.home, match.homeCrest, 36)
    + '<span class="live-card-name">' + match.home + '</span>'
    + '</div>'
    + '<div class="live-card-score">' + (match.score || '0 - 0') + '</div>'
    + '<div class="live-card-team live-card-team-right">'
    + '<span class="live-card-name">' + match.away + '</span>'
    + teamLogo(match.away, match.awayCrest, 36)
    + '</div>'
    + '</div>'
    + (pred ? '<div class="live-card-pred">' + renderConfidenceBadge(pred.tier) + ' ' + pred.outcome + '</div>' : '<div class="live-card-pred" style="color:var(--text-muted);font-size:11px;">In progress</div>')
    + '</div>';
}

function renderPredCard(pred) {
  var agreeColor = pred.tier === 'elite' ? 'var(--elite)' : pred.tier === 'strong' ? 'var(--strong)' : pred.tier === 'moderate' ? 'var(--moderate)' : 'var(--risky)';
  return '<div class="pred-card" onclick="openPredDetail(\'' + pred.id + '\')">'
    + '<div class="pred-card-top">'
    + '<div style="flex:1;margin-right:12px;min-width:0;">'
    + '<div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">' + pred.league + ' \u00b7 ' + pred.time + '</div>'
    + '<div style="display:flex;align-items:center;gap:6px;font-size:15px;font-weight:600;">'
    + teamLogo(pred.home, pred.homeCrest, 22)
    + '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + pred.home + '</span>'
    + '<span style="color:var(--text-muted);font-weight:400;flex-shrink:0;">vs</span>'
    + '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + pred.away + '</span>'
    + teamLogo(pred.away, pred.awayCrest, 22)
    + '</div>'
    + '<div class="pred-outcome" style="margin-top:6px;">\u2192 ' + pred.outcome + '</div>'
    + '</div>'
    + '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;">' + renderScoreRing(pred.confidence, 60) + renderConfidenceBadge(pred.tier) + '</div>'
    + '</div>'
    + '<div class="pred-card-bottom">'
    + '<div style="flex:1;margin-right:16px;"><div class="agreement-label"><span>Model Agreement</span><span style="color:var(--text-primary);font-weight:600;">' + pred.agreement + '%</span></div>' + renderProgressBar(pred.agreement, agreeColor) + '</div>'
    + '<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();savePrediction(\'' + pred.id + '\')">Save</button>'
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