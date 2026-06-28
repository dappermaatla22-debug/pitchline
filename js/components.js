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

function teamLogo(name, crest, size) {
  size = size || 32;
  if (crest) {
    return '<img src="' + crest + '" alt="' + name + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:contain;background:var(--bg-elevated);" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">'
      + '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:var(--bg-elevated);display:none;align-items:center;justify-content:center;font-size:' + (size*0.35) + 'px;font-weight:700;color:var(--text-muted);">' + name.charAt(0) + '</div>';
  }
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;font-size:' + (size*0.35) + 'px;font-weight:700;color:var(--text-muted);">' + name.charAt(0) + '</div>';
}

function renderMatchCard(match, showPred) {
  if (showPred === undefined) showPred = true;
  var predictions = Store.getPredictions();
  var pred = match.predId ? predictions.find(function(p){ return p.id === match.predId; }) : null;
  var isLive = match.status === 'live';
  return '<div class="match-card" onclick="openMatchDetail(\'' + match.id + '\')">'
    + '<div class="match-teams">'
    + '<div style="display:flex;align-items:center;gap:8px;">'
    + teamLogo(match.home, match.homeCrest, 28)
    + '<span class="team-name">' + match.home + '</span>'
    + '</div>'
    + '<span class="vs-badge">' + (isLive ? match.score : 'VS') + '</span>'
    + '<div style="display:flex;align-items:center;gap:8px;">'
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
  return '<div class="live-match-card" onclick="openMatchDetail(\'' + match.id + '\')">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;"><span style="font-size:11px;color:var(--text-muted);">' + match.league + '</span>'
    + '<span style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--danger);font-weight:600;"><span style="width:6px;height:6px;border-radius:50%;background:var(--danger);animation:pulse 2s infinite;"></span>' + (match.minute || "45'") + '</span></div>'
    + '<div style="text-align:center;margin:12px 0;"><div style="display:flex;align-items:center;justify-content:center;gap:12px;">'
    + teamLogo(match.home, match.homeCrest, 28)
    + '<span style="font-size:14px;font-weight:600;color:var(--text-primary);">' + match.home + '</span>'
    + '<span style="font-size:22px;font-weight:800;color:var(--text-primary);letter-spacing:-1px;">' + match.score + '</span>'
    + '<span style="font-size:14px;font-weight:600;color:var(--text-primary);">' + match.away + '</span>'
    + teamLogo(match.away, match.awayCrest, 28)
    + '</div></div>'
    + (pred ? '<div style="text-align:center;">' + renderConfidenceBadge(pred.tier) + '</div>' : '')
    + '</div>';
}

function renderPredCard(pred) {
  var agreeColor = pred.tier === 'elite' ? 'var(--elite)' : pred.tier === 'strong' ? 'var(--strong)' : pred.tier === 'moderate' ? 'var(--moderate)' : 'var(--risky)';
  return '<div class="pred-card" onclick="openPredDetail(\'' + pred.id + '\')">'
    + '<div class="pred-card-top">'
    + '<div style="flex:1;margin-right:12px;">'
    + '<div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">' + pred.league + ' \u00b7 ' + pred.time + '</div>'
    + '<div style="display:flex;align-items:center;gap:6px;font-size:15px;font-weight:600;">'
    + teamLogo(pred.home, pred.homeCrest, 20)
    + '<span>' + pred.home + '</span>'
    + '<span style="color:var(--text-muted);font-weight:400;">vs</span>'
    + '<span>' + pred.away + '</span>'
    + teamLogo(pred.away, pred.awayCrest, 20)
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

function renderEmptyState(iconName, title, desc, btnLabel, btnAction) {
  return '<div class="empty-state"><div class="empty-icon">' + (ICONS[iconName] || '') + '</div><div class="empty-title">' + title + '</div><div class="empty-desc">' + desc + '</div>' + (btnLabel ? '<button class="btn btn-primary" onclick="' + btnAction + '">' + btnLabel + '</button>' : '') + '</div>';
}

function renderModelAgreement(models) {
  return Object.entries(models).map(function(e) {
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);"><span style="font-size:13px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.4px;font-weight:500;">' + e[0] + ' Model</span><span style="font-size:13px;font-weight:600;color:var(--text-primary);">' + e[1] + '</span></div>';
  }).join('');
}