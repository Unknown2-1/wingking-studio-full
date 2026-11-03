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
  const map=new Map();let ready=false, submitting=false, version=0, hasSlot=false, checking=false, scheduleError=false, availabilityController=null;
  const notify=(message,type='error')=>{feedback.textContent=message;feedback.className='feedback show '+type};
  const setReady=value=>{ready=value;submit.disabled=!value||submitting||checking||scheduleError||!hasSlot||Boolean(time.selectedOptions[0]?.disabled);if(submitLabel)submitLabel.textContent=submitting?'MENYIMPAN RESERVASI...':!value?'BOOKING BELUM TERSEDIA':checking?'MEMERIKSA JADWAL...':scheduleError?'GAGAL CEK JADWAL':!hasSlot?'PILIH TANGGAL / DURASI LAIN':'AJUKAN BOOKING'};
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
  const retry=document.createElement('button');retry.type='button';retry.hidden=true;
  retry.textContent='COBA CEK JADWAL LAGI';retry.setAttribute('aria-label','Muat ulang ketersediaan jam booking');
  retry.style.cssText='border:1px solid currentColor;background:transparent;padding:10px 14px;letter-spacing:.08em;font:700 11px Courier New,monospace;cursor:pointer;margin-top:12px';
  feedback.insertAdjacentElement('afterend',retry);
  function toMinutes(value){const m=/^([01]\d|2[0-3]):([0-5]\d)(?::\d{2})?$/.exec(String(value||''));return m?Number(m[1])*60+Number(m[2]):null}
  function nowWIB(){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());return Number(parts.find(x=>x.type==='hour')?.value||0)*60+Number(parts.find(x=>x.type==='minute')?.value||0)}
  function todayWIB(){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const get=k=>parts.find(x=>x.type===k)?.value||'';return get('year')+'-'+get('month')+'-'+get('day')}
  async function refreshAvailability(){
    if(!ready||!date.value)return;
    const v=++version;if(availabilityController)availabilityController.abort();
    const controller=new AbortController();availabilityController=controller;
    checking=true;scheduleError=false;hasSlot=false;retry.hidden=true;setReady(ready);
    try{
      const timeout=setTimeout(()=>controller.abort(),10000);
      let r;try{r=await fetch('/api/availability?date='+encodeURIComponent(date.value),{headers:{Accept:'application/json'},cache:'no-store',signal:controller.signal})}finally{clearTimeout(timeout)}
      const data=await r.json();if(v!==version)return;
      if(!r.ok||!Array.isArray(data.occupied))throw new Error(data.error||'Gagal memuat jadwal');
      const n=Number(duration.value)||1,selected=time.value,isToday=date.value===todayWIB(),now=nowWIB();
      const occupied=data.occupied.filter(b=>toMinutes(b.startTime)!==null&&Number.isFinite(Number(b.durationHours))&&Number(b.durationHours)>0);
      let free=0,reserved=0,past=0,closing=0;
      for(const opt of time.options){
        const start=toMinutes(opt.value),afterClose=start===null||start+n*60>23*60,alreadyPast=isToday&&start!==null&&start<=now;
        const conflict=occupied.some(b=>{const bStart=toMinutes(b.startTime);return start!==null&&start<bStart+Number(b.durationHours)*60&&bStart<start+n*60});
        const reason=afterClose?'LEWAT JAM TUTUP':alreadyPast?'JAM SUDAH LEWAT':conflict?'SUDAH DIBOOKING':'';
        opt.disabled=Boolean(reason);opt.textContent=opt.value+(reason?' · '+reason:'');
        opt.dataset.reason=reason;
        if(reason==='LEWAT JAM TUTUP')closing++;else if(reason==='JAM SUDAH LEWAT')past++;else if(reason==='SUDAH DIBOOKING')reserved++;else free++;
      }
      let choice=[...time.options].find(o=>o.value===selected&&!o.disabled);
      if(!choice)choice=[...time.options].find(o=>!o.disabled);
      if(choice)time.value=choice.value;
      hasSlot=!!choice;
      if(!free)notify('Tidak ada jam tersedia untuk tanggal dan durasi ini. Pilih tanggal lain atau durasi lebih singkat.','error');
      else if(!feedback.textContent.startsWith('Booking #'))notify(free+' jam tersedia · '+reserved+' dibooking · '+past+' sudah lewat · '+closing+' melewati jam tutup.','success');
    }catch(err){
      if(v!==version)return;
      scheduleError=true;hasSlot=false;retry.hidden=false;
      for(const opt of time.options){opt.disabled=false;opt.textContent=opt.value;delete opt.dataset.reason;}
      notify('Jadwal gagal dimuat—BUKAN berarti semua jam sudah dibooking. Periksa koneksi, lalu coba cek jadwal lagi.','error');
    }finally{if(v===version){checking=false;setReady(ready)}}
  }
  retry.addEventListener('click',()=>{if(ready)refreshAvailability();else loadServices()});
  window.addEventListener('online',()=>{if(ready)refreshAvailability();else loadServices()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ready&&!submitting)refreshAvailability()});
  time.addEventListener('change',()=>setReady(ready));
  service.addEventListener('change',()=>setTimeout(updatePrice,0));
  duration.addEventListener('change',()=>{setTimeout(updatePrice,0);refreshAvailability()});
  date.addEventListener('change',refreshAvailability);
  form.addEventListener('input',()=>setTimeout(updatePrice,0));
  form.addEventListener('submit',async e=>{
    // The 2026 V2.4 handler runs in bubble phase; do not let the demo claim success.
    e.preventDefault();e.stopImmediatePropagation();
    if(!ready||!hasSlot||submitting)return;
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
    }catch(err){notify((err&&err.message)||'Respons jaringan terputus. Periksa ke admin sebelum mencoba ulang agar tidak tercatat dua kali.','error')}
    finally{submitting=false;setReady(ready);feedback.scrollIntoView({block:'nearest',behavior:'auto'})}
  },true);
  loadServices();
})();
