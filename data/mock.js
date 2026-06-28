var DATA = {
  predictions: [
    { id:'p1', home:'Arsenal', away:'Chelsea', league:'Premier League', leagueFlag:'\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f', time:'15:00', date:'Today', outcome:'Arsenal Win', confidence:91, agreement:88, tier:'elite', factors:['Arsenal 6-match home unbeaten run','Chelsea missing key midfield duo','xG differential +1.4 in Arsenal favour','H2H: Arsenal 4W 1D 0L in last 5 home'], risks:['Chelsea counter-attack threat','Set-piece vulnerability for Arsenal CB'], models:{poisson:'Arsenal Win',elo:'Arsenal Win',xg:'Arsenal Win',ml:'Draw'} },
    { id:'p2', home:'Real Madrid', away:'Atletico Madrid', league:'La Liga', leagueFlag:'\ud83c\uddea\ud83c\uddf8', time:'20:00', date:'Today', outcome:'Over 2.5 Goals', confidence:84, agreement:79, tier:'strong', factors:['Madrid avg 2.9 goals in derbies','Atletico high press creates open play','Both teams scored in last 6 meetings'], risks:['Atletico defense has tightened recently','Madrid may rotate ahead of UCL'], models:{poisson:'Over 2.5',elo:'Real Madrid Win',xg:'Over 2.5',ml:'Over 2.5'} },
    { id:'p3', home:'Bayern Munich', away:'Dortmund', league:'Bundesliga', leagueFlag:'\ud83c\udde9\ud83c\uddea', time:'17:30', date:'Today', outcome:'Bayern Munich Win', confidence:78, agreement:72, tier:'strong', factors:['Bayern home record: 12W 1D 0L this season','Dortmund away form has dropped sharply','Kane avg 0.9 goals per home game'], risks:['Der Klassiker unpredictability','Dortmund have won 3 of last 10 visits'], models:{poisson:'Bayern Win',elo:'Bayern Win',xg:'Draw',ml:'Bayern Win'} },
    { id:'p4', home:'PSG', away:'Lyon', league:'Ligue 1', leagueFlag:'\ud83c\uddeb\ud83c\uddf7', time:'20:45', date:'Today', outcome:'Draw', confidence:61, agreement:55, tier:'moderate', factors:['PSG unconvincing at home recently','Lyon unbeaten in last 4 away games'], risks:['PSG have quality to win at any time','Lyon striker injury doubt'], models:{poisson:'Draw',elo:'PSG Win',xg:'Draw',ml:'PSG Win'} },
    { id:'p5', home:'Napoli', away:'Inter Milan', league:'Serie A', leagueFlag:'\ud83c\uddee\ud83c\uddf9', time:'18:00', date:'Tomorrow', outcome:'Inter Milan Win', confidence:73, agreement:68, tier:'strong', factors:['Inter 7-match unbeaten run','Napoli league position in decline','Inter xG superiority +2.1 vs Napoli'], risks:['Napoli home crowd factor','Inter striker slight knock'], models:{poisson:'Inter Win',elo:'Inter Win',xg:'Inter Win',ml:'Draw'} },
    { id:'p6', home:'Man City', away:'Liverpool', league:'Premier League', leagueFlag:'\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f', time:'16:30', date:'Tomorrow', outcome:'BTTS', confidence:86, agreement:83, tier:'strong', factors:['Both teams avg 2+ goals at Etihad','No clean sheets for either in last 5','Liverpool high defensive line exploitable'], risks:['Tactical nullification possible','City may sit deep after recent results'], models:{poisson:'BTTS',elo:'Man City Win',xg:'BTTS',ml:'BTTS'} },
    { id:'p7', home:'Man City', away:'Liverpool', league:'Premier League', leagueFlag:'\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f', time:'16:30', date:'Tomorrow', outcome:'Over 2.5 Goals', confidence:88, agreement:85, tier:'elite', factors:['9 of last 11 meetings had 3+ goals','Both avg 2.5+ goals per game','Strong attacking options available'], risks:['Tactical cagey opening possible'], models:{poisson:'Over 2.5',elo:'Over 2.5',xg:'Over 2.5',ml:'Over 2.5'} },
    { id:'p8', home:'Barcelona', away:'Sevilla', league:'La Liga', leagueFlag:'\ud83c\uddea\ud83c\uddf8', time:'21:00', date:'Today', outcome:'Barcelona Win', confidence:76, agreement:70, tier:'strong', factors:['Barcelona strong at Camp Nou','Sevilla struggling on the road'], risks:['Sevilla improved under new manager'], models:{poisson:'Barcelona Win',elo:'Barcelona Win',xg:'Draw',ml:'Barcelona Win'} }
  ],
  matches: [
    { id:'m1', home:'Arsenal', away:'Chelsea', league:'Premier League', time:'15:00', status:'upcoming', predId:'p1' },
    { id:'m2', home:'Real Madrid', away:'Atletico Madrid', league:'La Liga', time:'20:00', status:'upcoming', predId:'p2' },
    { id:'m3', home:'Bayern Munich', away:'Dortmund', league:'Bundesliga', time:'17:30', status:'upcoming', predId:'p3' },
    { id:'m4', home:'PSG', away:'Lyon', league:'Ligue 1', time:'20:45', status:'upcoming', predId:'p4' },
    { id:'m5', home:'Napoli', away:'Inter Milan', league:'Serie A', time:'18:00', status:'tomorrow', predId:'p5' },
    { id:'m6', home:'Man City', away:'Liverpool', league:'Premier League', time:'16:30', status:'tomorrow', predId:'p6' },
    { id:'m7', home:'Barcelona', away:'Sevilla', league:'La Liga', time:'21:00', status:'upcoming', predId:'p8' },
    { id:'m8', home:'Juventus', away:'AC Milan', league:'Serie A', time:'20:45', status:'live', score:'1 - 0', minute:'67\'', predId:null },
    { id:'m9', home:'Tottenham', away:'Newcastle', league:'Premier League', time:'15:00', status:'live', score:'2 - 1', minute:'34\'', predId:null },
    { id:'m10', home:'Wolves', away:'Brighton', league:'Premier League', time:'17:30', status:'live', score:'0 - 0', minute:'12\'', predId:null }
  ],
  insights: {
    predictableTeams: [
      {name:'Arsenal',league:'Premier League',accuracy:87},
      {name:'Bayern Munich',league:'Bundesliga',accuracy:85},
      {name:'PSG',league:'Ligue 1',accuracy:82},
      {name:'Man City',league:'Premier League',accuracy:80}
    ],
    unpredictableTeams: [
      {name:'Brentford',league:'Premier League',upsetRate:34},
      {name:'Getafe',league:'La Liga',upsetRate:31},
      {name:'Frosinone',league:'Serie A',upsetRate:29}
    ],
    topLeagues: [
      {name:'Bundesliga',flag:'\ud83c\udde9\ud83c\uddea',accuracy:79},
      {name:'Premier League',flag:'\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f',accuracy:77},
      {name:'Serie A',flag:'\ud83c\uddee\ud83c\uddf9',accuracy:74},
      {name:'La Liga',flag:'\ud83c\uddea\ud83c\uddf8',accuracy:73}
    ],
    formTrends: [
      {team:'Arsenal',trend:'+12.3',dir:'up'},
      {team:'Inter Milan',trend:'+8.7',dir:'up'},
      {team:'Atletico Madrid',trend:'-5.2',dir:'down'},
      {team:'Lyon',trend:'+3.1',dir:'up'}
    ]
  },
  teamDetail: {
    name:'Arsenal', league:'Premier League', manager:'Mikel Arteta',
    homeRecord:{w:12,d:2,l:1}, awayRecord:{w:8,d:3,l:4},
    form:['W','W','D','W','W'], predictedStrength:84,
    upcomingFixtures: [ {opp:'Chelsea',home:true,date:'Today 15:00'}, {opp:'Brentford',home:false,date:'Sat 15:00'}, {opp:'Crystal Palace',home:true,date:'Wed 19:45'} ],
    injuries: [ {player:'T. Partey',position:'MF',status:'Doubtful',return:'~1 week'}, {player:'J. Timber',position:'DF',status:'Out',return:'~3 weeks'} ]
  },
  user: {
    name:'Alex Morgan', initials:'AM', plan:'Free',
    savedCount:7, favTeams:['Arsenal','Liverpool'], joinedDays:14,
    stats:{ tracked:31, correctPct:71, eliteHitPct:88, streak:5 }
  },
  notifications: [
    {id:'n1',type:'elite',title:'Elite Pick found',body:'Arsenal vs Chelsea \u2014 91% confidence',time:'2 min ago',read:false},
    {id:'n2',type:'upset',title:'Upset alert',body:'Brentford vs Man City flagged as upset risk',time:'1 hr ago',read:false},
    {id:'n3',type:'match',title:'Match starting soon',body:'Juventus vs AC Milan kicks off in 30 min',time:'3 hr ago',read:true},
    {id:'n4',type:'elite',title:'New strong pick',body:'Man City vs Liverpool BTTS \u2014 86%',time:'Yesterday',read:true}
  ]
};