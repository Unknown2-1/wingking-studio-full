export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const origin = req.headers.origin;
    const expected = 'https://' + req.headers.host;
    if (origin && origin !== expected) return res.status(403).json({ success: false, error: 'Forbidden origin' });
    const body = JSON.stringify(req.body || {});
    if (body.length > 8000) return res.status(413).json({ error: 'Payload too large' });
    const response = await fetch('https://kiuhzrowbypovoydymam.supabase.co/functions/v1/wingking-core/booking', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body
    });
    return res.status(response.status).setHeader('Content-Type', 'application/json').send(await response.text());
  } catch (error) {
    console.error('Wingking booking proxy failure:', error?.message);
    return res.status(503).json({ success: false, error: 'Layanan sementara tidak tersedia' });
  }
}