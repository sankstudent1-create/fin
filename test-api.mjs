import handler from './api/send-push.js';
process.env.VITE_VAPID_PUBLIC_KEY = 'BKKLrt1uFoTlefdLIUDvx2TbjnSyreriG8o6S8SSy1im08nbAPWl_co-Pu9nTMifJ5IFp7xh7NiFF-yNAF2fp2A';
process.env.VAPID_PRIVATE_KEY = 'z6FZlmYm1vxluA8ngvhySvX1DDrYNdx9KarGTj3LNM4';
process.env.VAPID_SUBJECT = 'mailto:admin@swinfosystems.online';
process.env.VITE_SUPABASE_URL = 'https://joanfonaixkgbpbyuwch.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'DUMMY_KEY';

const req = { method: 'POST', body: { title: 'T', body: 'T' } };
const res = { setHeader:()=>null, status: (c) => ({ json: (d) => console.log(c, d), end: () => {} }) };
handler(req, res).catch(console.error);
