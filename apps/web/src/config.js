// Local development uses an isolated demo unless staging Supabase variables are provided.
// Never add service_role / secret keys to client-side Vite environment variables.
export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  contactName: import.meta.env.VITE_CONTACT_NAME || 'Tim Wingking',
  contactUrl: import.meta.env.VITE_CONTACT_URL || 'https://instagram.com/w.hubstudio',
};
