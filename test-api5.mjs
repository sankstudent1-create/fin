process.env.VITE_VAPID_PUBLIC_KEY = 'BKKLrt1uFoTlefdLIUDvx2TbjnSyreriG8o6S8SSy1im08nbAPWl_co-Pu9nTMifJ5IFp7xh7NiFF-yNAF2fp2A';
process.env.VAPID_PRIVATE_KEY = 'z6FZlmYm1vxluA8ngvhySvX1DDrYNdx9KarGTj3LNM4';
process.env.VAPID_SUBJECT = 'mailto:admin@swinfosystems.online';
process.env.VITE_SUPABASE_URL = 'https://joanfonaixkgbpbyuwch.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvYW5mb25haXhrZ2JwYnl1d2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjk2NjQsImV4cCI6MjA4NzYwNTY2NH0.KpWdsdb5oWStJMZsmE1dJyqRCqDVD4tfN-d3IVn2yec';

import('./api/send-push.js').then(({ default: handler }) => {
    const req = { method: 'POST', body: { title: 'T', body: 'T' }, headers: {} };
    const res = { setHeader:()=>null, status: (c) => ({ json: (d) => console.log(c, d), end: () => {} }) };
    handler(req, res).catch(console.error);
});
