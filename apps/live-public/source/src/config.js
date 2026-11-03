export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "https://kiuhzrowbypovoydymam.supabase.co",
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_USjBvA86ZzhKG9DMLX0SEg_AehbVr5M",
  contactName: import.meta.env.VITE_CONTACT_PERSON_NAME || 'Tim Wingking',
  contactUrl: import.meta.env.VITE_CONTACT_PERSON_URL || 'https://instagram.com/w.hubstudio',
};
export const hasBackend = Boolean(config.supabaseUrl && config.supabaseKey);
export function isSafeUrl(input) {
  try { const url = new URL(input); return ['https:', 'http:'].includes(url.protocol); } catch { return false; }
}
export function handle(url) { return isSafeUrl(url) ? url : null; }
export function money(n) { return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Math.max(0,Number(n)||0)); }
export function parseRates(value) {
  return String(value||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,7).map(s=>{
    const [label,price] = s.split('|').map(x=>x.trim());
    return {label: String(label||'').slice(0,50), price: Number((price||'').replace(/[^0-9]/g,''))};
  }).filter(x=>x.label && Number.isFinite(x.price) && x.price>=0 && x.price<=1000000000);
}
export function rateLines(rates) { return Array.isArray(rates) ? rates.map(x=>`${x.label} | ${x.price}`).join('\n') : ''; }
export function shortText(value,limit=140) { return String(value||'').trim().slice(0,limit); }
