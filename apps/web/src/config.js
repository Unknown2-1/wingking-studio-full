// Local development uses an isolated demo unless staging Supabase variables are provided.
// Never add service_role / secret keys to client-side Vite environment variables.
export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
  contactName: import.meta.env.VITE_CONTACT_NAME || "Tim Wingking",
  whatsappUrl:
    import.meta.env.VITE_WHATSAPP_URL || "https://wa.me/6281215600081",
  locationUrl:
    import.meta.env.VITE_LOCATION_URL ||
    "https://www.google.com/maps?q=Wingking+Hub+Studio,+Jl.+Mangunjaya,+RT.6/RW3/RW.Gg+9,+Mangunjaya,+Purwokerto+Lor,+Kec.+Purwokerto+Tim.,+Kabupaten+Banyumas,+Jawa+Tengah+53114&ftid=0x2e655f49edc96611:0xe4e5a800c0cf0ccf&entry=gps&lucs=,94203325,47075489,94216425,94216401,94249918,94244543,94242556,94224825,94227247,94227248,94247554,47071704,47069508,94218641,94233079,94203019,47084304,94208458,94208447&g_ep=CAISEjI0LjQ3LjMuNjk4NTMxOTU1MBgAIJ6dCiqrASw5NDIwMzMyNSw0NzA3NTQ4OSw5NDIxNjQyNSw5NDIxNjQwMSw5NDI0OTkxOCw5NDI0NDU0Myw5NDI0MjU1Niw5NDIyNDgyNSw5NDIyNzI0Nyw5NDIyNzI0OCw5NDI0NzU1NCw0NzA3MTcwNCw5NDIxODY0MSw5NDIzMzA3OSw5NDIwMzAxOSw0NzA4NDMwNCw5NDIwODQ1OCw5NDIwODQ0N0ICSUQ%3D&g_st=ic",
};
