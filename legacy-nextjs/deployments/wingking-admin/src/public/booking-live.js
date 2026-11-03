/* Wingking V2.5 — real booking bridge for the V2.4 motion prototype.
   The original DOM, canvas animation, posters, and manual controls remain intact.
   This module intercepts submit in the capture phase before the old local-demo handler.
   Only the server response can confirm a saved reservation. */
(()=>{
  'use strict';
  const $=s=>document.querySelector(s);
  const form=$('#bookingForm'), feedback=$('#feedback'), service=$('#service'), date=$('#date'), time=$('#time'), duration=$('#duration');
  if(!form||!feedback||!service||!date||!time||!duration)return;
  const submit=form.querySelector('button[type="submit"]'), submitLabel=submit?.querySelector('span');
  const notice=document.querySelector('#booking .notice');
  const money=v=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(v);
  const map=new Map();let ready=false, submitting=false, version=0;
  const notify=(message,type='error')=>{feedback.textContent=message;feedback.className='feedback show '+type};
  const setReady=value=>{ready=value;submit.disabled=!value||submitting;if(submitLabel)submitLabel.textContent=value?'AJUKAN BOOKING':'BOOKING BELUM TERSEDIA'};
  function updatePrice(){
    if(!ready)return;
    const item=map.get(service.value);
    if(!item)return;
    $('#total').textContent=money(item.pricePerHour*Number(duration.value||0));
    $('#estimateMeta').textContent=`${duration.value} JAM · ${item.name.toUpperCase()} · TARIF AKTUAL`;
  }
  async function loadServices(){
    setReady(false);
    try{
      const response=await fetch('/api/services',{headers:{Accept:'application/json'},credentials:'same-origin',cache:'no-store'});
      const data=await response.json();if(!response.ok||!data.success||!Array.isArray(data.services)||!data.services.length)throw new Error(data.error||'Layanan belum tersedia');
      map.clear();service.replaceChildren();
      for(const item of data.services){
        if(!Number.isFinite(item.pricePerHour))continue;
        const key=/rehearsal/i.test(item.name)?'rehearsal':/recording/i.test(item.name)?'recording':`service-${item.id}`;
        map.set(key,item);
        const opt=document.createElement('option');opt.value=key;opt.textContent=`${item.name} — ${money(item.pricePerHour)}/jam`;service.appendChild(opt);
      }
      if(!map.size)throw new Error('Tidak ada layanan yang bisa dipesan');
      setReady(true);updatePrice();
      if(notice){notice.innerHTML='<strong>LIVE BOOKING / DATABASE CONNECTED</strong><br>Permintaan akan tercatat sebagai <strong>MENUNGGU KONFIRMASI</strong> setelah berhasil disimpan. Pembayaran belum tersedia di website.'}
      notify('Layanan tersedia. Pilih jadwal, lalu ajukan booking. Permintaan belum dikonfirmasi sampai admin memprosesnya.','success');
      refreshAvailability();
    }catch(err){setReady(false);notify('Reservasi belum tersedia karena server atau database belum siap. Silakan hubungi studio melalui Instagram.');if(notice){notice.innerHTML='<strong>BOOKING TEMPORARILY UNAVAILABLE</strong><br>Database belum aktif atau tidak dapat dijangkau. <strong>Tidak ada pemesanan yang dikirim atau disimpan.</strong>'}}
  }
  function toMinutes(value){const parts=value.split(':').map(Number);return parts.length===2&&parts.every(Number.isFinite)?parts[0]*60+parts[1]:null}
  async function refreshAvailability(){
    if(!ready||!date.value)return;
    const v=++version;
    try{
      const r=await fetch('/api/availability?date='+encodeURIComponent(date.value),{cache:'no-store'});
      const data=await r.json();
      if(v!==version)return;
      if(!r.ok||!Array.isArray(data.occupied))return;
      const n=Number(duration.value)||1,selected=time.value;
      for(const opt of time.options){
        const m=toMinutes(opt.value);
        const booked=m==null||m+n*60>23*60||(date.value===new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())&&m<=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date()).slice(0,2))*60+Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date()).slice(3)))||data.occupied.some(b=>{const start=toMinutes(b.startTime);return start!=null&&m<start+b.durationHours*60&&start<m+n*60});
        opt.disabled=!!booked;
        opt.textContent=opt.value+(booked?' · TERISI':'');
      }
      const choice=[...time.options].find(o=>o.value===selected&&!o.disabled);
      if(!choice){const free=[...time.options].find(o=>!o.disabled);if(free)time.value=free.value;else notify('Jadwal untuk tanggal dan durasi ini sudah habis. Pilih tanggal atau durasi lain.','error')}
    }catch{/* schedule availability is advisory; POST validates conflicts atomically */}
  }
  service.addEventListener('change',()=>setTimeout(updatePrice,0));
  duration.addEventListener('change',()=>{setTimeout(updatePrice,0);refreshAvailability()});
  date.addEventListener('change',refreshAvailability);
  form.addEventListener('input',()=>setTimeout(updatePrice,0));
  form.addEventListener('submit',async e=>{
    // The 2026 V2.4 handler runs in bubble phase; do not let the demo claim success.
    e.preventDefault();e.stopImmediatePropagation();
    if(!ready||submitting)return;
    const item=map.get(service.value);if(!item){notify('Layanan tidak valid, muat ulang halaman.');return}
    const payload={serviceId:item.id,date:date.value,startTime:time.value,durationHours:Number(duration.value),customerName:$('#name').value.trim(),customerPhone:$('#phone').value.trim()};
    if(!payload.date||!payload.startTime||!payload.customerName||!payload.customerPhone){notify('Lengkapi layanan, tanggal, jam, nama, dan nomor WhatsApp.');return}
    submitting=true;submit.disabled=true;if(submitLabel)submitLabel.textContent='MENYIMPAN RESERVASI...';
    try{
      const res=await fetch('/api/booking',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},credentials:'same-origin',body:JSON.stringify(payload)});
      const data=await res.json();
      if(!res.ok||!data.success||!data.reservation?.id)throw new Error(data.error||'Reservasi tidak dapat disimpan.');
      notify(`Booking #${data.reservation.id.slice(-8).toUpperCase()} berhasil tercatat sebagai MENUNGGU KONFIRMASI. Admin studio akan menghubungi WhatsApp kamu. Simpan nomor referensi ini.`,'success');
      $('#name').value='';$('#phone').value='';refreshAvailability();
    }catch(err){notify((err&&err.message)||'Koneksi terputus. Reservasi belum tercatat. Silakan coba lagi.','error')}
    finally{submitting=false;setReady(ready);feedback.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
  },true);
  loadServices();
})();
