module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint parameter' });
  }

  const API_KEY = process.env.FOOTBALL_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured. Add FOOTBALL_API_KEY to Vercel environment variables.' });
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const url = 'https://api.football-data.org/v4' + cleanEndpoint;

  try {
    const response = await fetch(url, {
      headers: { 'X-Auth-Token': API_KEY }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'Football API error', status: response.status, detail: text });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch from football API', detail: err.message });
  }
};