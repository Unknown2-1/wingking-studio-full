export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const endpoint = 'https://kiuhzrowbypovoydymam.supabase.co/functions/v1/wingking-core/health';
    const url = 'health' === 'availability'
      ? endpoint + '?date=' + encodeURIComponent(String(req.query.date || ''))
      : endpoint;
    const response = await fetch(url);
    return res.status(response.status).setHeader('Content-Type', 'application/json').send(await response.text());
  } catch (error) {
    console.error('Wingking health proxy failure:', error?.message);
    return res.status(503).json({ success: false, error: 'Layanan sementara tidak tersedia' });
  }
}