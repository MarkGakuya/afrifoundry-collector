import React, { useState, useEffect, useRef } from 'react';
import { Download, Settings, LogOut, User, RefreshCw, Send, Camera, BarChart2, List, Zap } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE   = 'https://afrifoundry-api.onrender.com';
const APP_VERSION = '3.0.0';
const GOAL_DAY   = 15;
const GOAL_TOTAL = 10000;

// ─────────────────────────────────────────────────────────────────────────────
// KENYA REGIONS — grid positions, geofence radius (km), priority, color
// ─────────────────────────────────────────────────────────────────────────────
const REGIONS = [
  { id:'eldoret',     name:'Eldoret',     row:0, col:0, lat:0.52,  lng:35.27, r:25,  priority:'HIGH',     color:'#f97316', markets:['CBD','Langas','Pioneer','Huruma','Kapseret'] },
  { id:'rift_valley', name:'Rift Valley', row:0, col:1, lat:-0.30, lng:35.87, r:120, priority:'HIGH',     color:'#f97316', markets:['Nakuru','Naivasha','Narok','Kericho'] },
  { id:'central',     name:'Central',     row:0, col:2, lat:-0.42, lng:36.95, r:60,  priority:'MEDIUM',   color:'#eab308', markets:["Nyeri","Murang'a",'Kiambu','Karatina'] },
  { id:'north_east',  name:'North East',  row:0, col:3, lat:1.50,  lng:40.00, r:150, priority:'LOW',      color:'#475569', markets:['Garissa','Isiolo','Wajir'] },
  { id:'western',     name:'Western',     row:1, col:0, lat:-0.28, lng:34.75, r:80,  priority:'HIGH',     color:'#f97316', markets:['Kakamega','Bungoma','Mumias','Webuye'] },
  { id:'nakuru',      name:'Nakuru',      row:1, col:1, lat:-0.30, lng:36.07, r:25,  priority:'CRITICAL', color:'#ef4444', markets:['CBD','Maili Nne','Lanet','Section 58'] },
  { id:'nairobi',     name:'Nairobi',     row:1, col:2, lat:-1.29, lng:36.82, r:30,  priority:'ACTIVE',   color:'#10b981', markets:['Gikomba','Eastleigh','CBD','Westlands','Kibera','Ngong Road'] },
  { id:'eastern',     name:'Eastern',     row:1, col:3, lat:0.05,  lng:37.65, r:120, priority:'MEDIUM',   color:'#eab308', markets:['Meru','Embu','Machakos','Kitui'] },
  { id:'kisumu',      name:'Kisumu',      row:2, col:0, lat:-0.09, lng:34.76, r:25,  priority:'CRITICAL', color:'#ef4444', markets:['CBD','Kondele','Kibuye','Migosi','Mamboleo'] },
  { id:'coast',       name:'Coast',       row:2, col:3, lat:-3.20, lng:40.12, r:100, priority:'MEDIUM',   color:'#eab308', markets:['Kilifi','Malindi','Diani','Lamu','Kwale'] },
  { id:'mombasa',     name:'Mombasa',     row:3, col:3, lat:-4.05, lng:39.67, r:25,  priority:'ACTIVE',   color:'#10b981', markets:['Kongowea','Likoni','Old Town','Bamburi','Nyali','Mtwapa'] },
];

// Priority data gaps per region
const GAPS = {
  kisumu:      ['Fish prices (tilapia, omena)','Maize flour 2kg','Bodaboda fares','Market vendor daily revenue','Water per jerry can'],
  nakuru:      ['Grain prices maize/wheat','Fertilizer DAP 50kg','Land rent per acre','Matatu fares','Hotel room rates'],
  eldoret:     ['Milk per litre (raw)','Transport costs','Tea farm wages','Jua kali daily wages','Flour wholesale prices'],
  western:     ['Sugar cane farm gate price','Chicken live per kg','School fees primary','SACCO loan rates','Mobile money agent float'],
  mombasa:     ['Fresh tilapia per kg','Hotel budget per night','Dhow transport fare','Spices wholesale','Beach vendor daily income'],
  nairobi:     ['Mitumba clothing prices','Tech phone repair costs','Bolt/Uber base fare','Street food prices','Coworking rent per desk'],
  rift_valley: ['Wheat per 90kg bag','Safari day trip cost','Sheep/goat per head','Water trucking 10000L','Flower farm wages per day'],
  central:     ['Coffee farm gate price','Tea picking wages per kg','Dairy milk per litre','Horticultural export prices','School fees secondary'],
  eastern:     ['Mango farm gate price','Livestock transport costs','Borehole drilling per metre','Solar panel 250W price','Drought relief water cost'],
  coast:       ['Tourism budget accommodation','Coconut per piece','Fishing equipment costs','Seaweed per kg','Mangrove charcoal per bag'],
  north_east:  ['Livestock prices per head','Water trucking per litre','Mobile money send fee','Drought aid distribution cost','Camel milk per litre'],
};

const SECTORS = [
  {id:'food',name:'Food',icon:'🍽️'},{id:'agriculture',name:'Agri',icon:'🌾'},
  {id:'transport',name:'Transport',icon:'🚗'},{id:'health',name:'Health',icon:'🏥'},
  {id:'retail',name:'Retail',icon:'🛍️'},{id:'fintech',name:'Fintech',icon:'💰'},
  {id:'energy',name:'Energy',icon:'⚡'},{id:'housing',name:'Housing',icon:'🏠'},
  {id:'water',name:'Water',icon:'💧'},{id:'telecom',name:'Telecom',icon:'📡'},
  {id:'education',name:'Education',icon:'📚'},{id:'technology',name:'Tech',icon:'💻'},
  {id:'manufacturing',name:'Manuf.',icon:'🏭'},{id:'tourism',name:'Tourism',icon:'🏖️'},
  {id:'infrastructure',name:'Infra',icon:'🏗️'},
];

// Map grid — null = empty cell
const MAP_GRID = [
  ['eldoret',  'rift_valley', 'central',  'north_east'],
  ['western',  'nakuru',      'nairobi',  'eastern'],
  ['kisumu',   null,          null,       'coast'],
  [null,       null,          null,       'mombasa'],
];

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  orange: '#F97316', green: '#10B981', red: '#ef4444',
  yellow: '#eab308', blue: '#38bdf8', purple: '#a78bfa',
  bg: '#060610', card: 'rgba(12,12,24,0.96)',
};

const S = {
  page:  { minHeight:'100vh', background:C.bg, color:'#e2e8f0', fontFamily:"'DM Sans',system-ui,sans-serif", paddingBottom:60 },
  card:  { background:C.card, border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'14px 16px', marginBottom:12 },
  input: { width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, color:'#e2e8f0', padding:'12px 14px', fontSize:15, outline:'none', boxSizing:'border-box', fontFamily:'inherit' },
  label: { display:'block', fontSize:10, fontWeight:700, color:'#475569', marginBottom:5, letterSpacing:'0.8px', textTransform:'uppercase' },
  btnP:  { width:'100%', background:'linear-gradient(135deg,#F97316,#ea6c10)', border:'none', color:'#fff', borderRadius:14, padding:14, fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit', boxShadow:'0 4px 20px rgba(249,115,22,0.25)' },
  btnS:  { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', borderRadius:12, padding:'10px 14px', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit' },
  btnG:  { background:'transparent', border:'none', color:'#475569', cursor:'pointer', padding:6, display:'flex', alignItems:'center', gap:4, fontSize:12, fontFamily:'inherit' },
  pill:  (c) => ({ display:'inline-flex', alignItems:'center', gap:3, background:c+'22', color:c, border:`1px solid ${c}35`, borderRadius:20, padding:'3px 9px', fontSize:10, fontWeight:700 }),
  mono:  { fontFamily:'Space Mono,monospace' },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function nearestRegion(lat, lng) {
  let best = null, min = Infinity;
  REGIONS.forEach(r => { const d = distKm(lat, lng, r.lat, r.lng); if (d < min) { min = d; best = r; } });
  return { region: best, dist: min };
}

function weekDates() {
  const out = [];
  for (let i=6; i>=0; i--) { const d=new Date(); d.setDate(d.getDate()-i); out.push(d.toISOString().split('T')[0]); }
  return out;
}

function timeAgo(ts) {
  const m = Math.floor((Date.now()-new Date(ts))/60000);
  if (m<1) return 'now'; if (m<60) return m+'m'; if (m<1440) return Math.floor(m/60)+'h'; return Math.floor(m/1440)+'d';
}

function qScore(e) {
  let s=60;
  if (e.gps) s+=10; if (e.gps_accuracy!=null&&e.gps_accuracy<10) s+=10; else if (e.gps_accuracy!=null&&e.gps_accuracy<50) s+=5;
  if (e.photo) s+=10; if (e.source) s+=5; if (e.vendor_type) s+=5; if (e.notes) s+=5;
  return Math.min(s,100);
}

// AI Chat — calls Claude via Anthropic API directly
async function askAI(systemPrompt, messages) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: systemPrompt,
        messages,
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AfriScout() {
  // Auth
  const [collector, setCollector] = useState(null);
  const [loginForm, setLoginForm] = useState({ email:'', password:'' });
  const [loginErr,  setLoginErr]  = useState('');
  const [loginBusy, setLoginBusy] = useState(false);

  // Nav — map | chat | dashboard | entries | settings
  const [view, setView] = useState('map');

  // GPS
  const [gps, setGps]           = useState(null);
  const [nearbyAlert, setNearbyAlert] = useState(null);
  const watchId = useRef(null);

  // Chat
  const [chatRegion,  setChatRegion]  = useState(null);
  const [messages,    setMessages]    = useState([]);
  const [chatInput,   setChatInput]   = useState('');
  const [chatBusy,    setChatBusy]    = useState(false);
  const [pendingEntry,setPendingEntry]= useState(null);
  const [photo,       setPhoto]       = useState(null);
  const [photoLabel,  setPhotoLabel]  = useState('');
  const chatEnd = useRef(null);

  // Data
  const [entries,  setEntries]  = useState([]);
  const [offline,  setOffline]  = useState([]);
  const [todayCnt, setTodayCnt] = useState(0);
  const [online,   setOnline]   = useState(navigator.onLine);
  const [syncSt,   setSyncSt]   = useState('idle');

  // ── BOOT ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const c = localStorage.getItem('afriscout_v3_col'); if (c) setCollector(JSON.parse(c));
    const e = localStorage.getItem('afriscout_v3_ent'); if (e) { const p=JSON.parse(e); setEntries(p); calcToday(p); }
    const o = localStorage.getItem('afriscout_v3_off'); if (o) setOffline(JSON.parse(o));
  }, []);

  useEffect(() => { localStorage.setItem('afriscout_v3_ent', JSON.stringify(entries)); calcToday(entries); }, [entries]);
  useEffect(() => { localStorage.setItem('afriscout_v3_off', JSON.stringify(offline)); }, [offline]);

  useEffect(() => {
    const goOn  = () => { setOnline(true);  doAutoSync(); };
    const goOff = () => setOnline(false);
    window.addEventListener('online', goOn); window.addEventListener('offline', goOff);
    return () => { window.removeEventListener('online', goOn); window.removeEventListener('offline', goOff); };
  }, [offline, collector]);

  function calcToday(list) {
    const t = new Date().toISOString().split('T')[0];
    setTodayCnt(list.filter(e=>e.date===t).length);
  }

  // ── GPS WATCH ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!collector || !navigator.geolocation) return;
    watchId.current = navigator.geolocation.watchPosition(pos => {
      const c = { lat:pos.coords.latitude, lng:pos.coords.longitude, accuracy:pos.coords.accuracy };
      setGps(c);
      // Geofence check — alert if entering CRITICAL zone with low data
      const { region, dist } = nearestRegion(c.lat, c.lng);
      if (region && dist < region.r && region.priority === 'CRITICAL') {
        const cnt = entries.filter(e=>e.region_id===region.id).length;
        if (cnt < 5) {
          setNearbyAlert({ region, dist: Math.round(dist) });
          setTimeout(() => setNearbyAlert(null), 10000);
        }
      }
    }, () => {}, { enableHighAccuracy:true, timeout:15000, maximumAge:30000 });
    return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); };
  }, [collector, entries]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const doLogin = async () => {
    if (!loginForm.email) { setLoginErr('Email required'); return; }
    setLoginBusy(true); setLoginErr('');
    try {
      const r = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(loginForm),
      });
      const d = await r.json();
      if (!r.ok) { setLoginErr(d.detail||'Login failed'); setLoginBusy(false); return; }
      const c = { name:d.user.name, email:d.user.email, token:d.token };
      setCollector(c); localStorage.setItem('afriscout_v3_col', JSON.stringify(c));
    } catch {
      const c = { name:loginForm.email.split('@')[0], email:loginForm.email, token:null, offline:true };
      setCollector(c); localStorage.setItem('afriscout_v3_col', JSON.stringify(c));
    }
    setLoginBusy(false);
  };

  const doLogout = () => {
    if (!window.confirm('Log out? Unsynced data stays on device.')) return;
    localStorage.removeItem('afriscout_v3_col'); setCollector(null);
  };

  // ── START CHAT ─────────────────────────────────────────────────────────────
  const startChat = async (region) => {
    setChatRegion(region); setMessages([]); setPendingEntry(null); setPhoto(null); setPhotoLabel('');
    setView('chat');
    const gaps = GAPS[region.id] || ['Market prices','Vendor costs','Transport fares'];
    const scoutName = collector?.name?.split(' ')[0] || 'Scout';
    const todayStr  = new Date().toDateString();
    const gpsNote   = gps ? `Scout GPS: ${gps.lat.toFixed(4)},${gps.lng.toFixed(4)}` : 'GPS: not confirmed';

    const system = `You are AfriScout AI — a sharp field data collection assistant for AfriFoundry Kenya.
You help scouts collect structured market intelligence through fast, natural conversation.

MISSION:
- Scout: ${scoutName}
- Region: ${region.name}
- Markets: ${region.markets.join(', ')}
- ${gpsNote}
- Priority data gaps: ${gaps.join(' · ')}
- Date: ${todayStr}

YOUR JOB:
1. Greet briefly — mention 1 priority gap for this region
2. Ask which specific market they're at (one question)
3. Guide them to collect ONE item at a time: item → price → unit → vendor name → vendor type
4. Keep it fast — scout is standing in a market
5. When you have enough data (item + price + unit + vendor), confirm and output this EXACT line:
SAVE:{"item":"snake_case_name","item_display":"Human Name","value":0,"unit":"KES","category":"sector_id","vendor":"Vendor Name","vendor_type":"Vendor Type","notes":""}

SECTOR IDs: food agriculture transport health retail fintech energy housing water telecom education technology manufacturing tourism infrastructure

RULES:
- One question at a time. Always.
- Be warm, brief, Kenyan context.
- Use market names they give you.
- Suggest items from the priority gaps.
- After saving, ask if they want to collect another item.
- Never output SAVE unless you have item + value + vendor.`;

    setChatBusy(true);
    const reply = await askAI(system, [{ role:'user', content:`I'm at ${region.name}. Let's collect.` }]);
    const greeting = reply || `Hey ${scoutName}! You're at ${region.name}. Top priority: ${gaps[0]}. Which market are you at right now?`;
    setMessages([{ role:'ai', text:greeting, ts:Date.now(), system }]);
    setChatBusy(false);
  };

  // ── SEND CHAT ──────────────────────────────────────────────────────────────
  const sendChat = async (text) => {
    if (!text.trim() || chatBusy) return;
    const userMsg = { role:'user', text:text.trim(), ts:Date.now() };
    const next = [...messages, userMsg];
    setMessages(next); setChatInput(''); setChatBusy(true);

    const system = messages[0]?.system || '';
    const apiMsgs = next.map(m => ({ role:m.role==='ai'?'assistant':'user', content:m.text }));
    const reply   = await askAI(system, apiMsgs);
    const aiText  = reply || "Got it! What else are you seeing?";

    // Check for SAVE instruction
    if (aiText.includes('SAVE:')) {
      const match = aiText.match(/SAVE:(\{.*?\})/s);
      if (match) {
        try {
          const data = JSON.parse(match[1]);
          const display = aiText.replace(/SAVE:\{.*?\}/s, '').trim();
          setMessages(prev => [...prev, { role:'ai', text: display || '✅ Entry ready to save!', ts:Date.now() }]);
          setPendingEntry(data);
          setChatBusy(false);
          return;
        } catch {}
      }
    }
    setMessages(prev => [...prev, { role:'ai', text:aiText, ts:Date.now() }]);
    setChatBusy(false);
  };

  // ── SAVE ENTRY ─────────────────────────────────────────────────────────────
  const saveEntry = () => {
    if (!pendingEntry || !chatRegion) return;
    const today = new Date().toISOString().split('T')[0];
    const entry = {
      id:            `${pendingEntry.category}_${Date.now()}`,
      date:          today,
      timestamp:     new Date().toISOString(),
      mode:          'field',
      category:      pendingEntry.category || 'food',
      item:          pendingEntry.item,
      item_display:  pendingEntry.item_display || pendingEntry.item,
      value:         parseFloat(pendingEntry.value) || 0,
      unit:          pendingEntry.unit || 'KES',
      currency:      'KES',
      region:        chatRegion.name,
      region_id:     chatRegion.id,
      market:        pendingEntry.market || '',
      gps:           gps ? `${gps.lat.toFixed(6)},${gps.lng.toFixed(6)}` : null,
      gps_accuracy:  gps?.accuracy || null,
      source:        pendingEntry.vendor || '',
      vendor_type:   pendingEntry.vendor_type || '',
      notes:         pendingEntry.notes || '',
      photo,
      photo_label:   photoLabel,
      confidence_score: 0.95,
      collected_by:  collector?.name,
      collected_by_email: collector?.email,
      synced:        false,
      valid_until:   new Date(Date.now()+180*86400000).toISOString().split('T')[0],
      via:           'ai_chat',
    };
    entry.quality_score = qScore(entry);
    setEntries(prev => [...prev, entry]);

    if (online && collector?.token) {
      pushEntry(entry, collector.token).then(ok => {
        if (ok) setEntries(prev => prev.map(e => e.id===entry.id ? {...e,synced:true} : e));
        else setOffline(prev => [...prev, entry]);
      });
    } else {
      setOffline(prev => [...prev, entry]);
    }

    setMessages(prev => [...prev, {
      role:'ai',
      text:`✅ Saved! ${entry.item_display} — KES ${entry.value.toLocaleString()}. Entry #${entries.length+1} today 💪\n\nAnother item here, or moving to a new stall?`,
      ts: Date.now(),
    }]);
    setPendingEntry(null); setPhoto(null); setPhotoLabel('');
  };

  // ── PUSH TO BACKEND ────────────────────────────────────────────────────────
  const pushEntry = async (entry, token) => {
    try {
      const r = await fetch(`${API_BASE}/api/v1/collector/submit`, {
        method:'POST',
        headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
        body: JSON.stringify({
          item:entry.item, value:entry.value, unit:entry.unit, currency:'KES',
          category:entry.category, region:entry.region, county:entry.market,
          gps_coords:entry.gps, confidence_score:entry.confidence_score,
          source_name:entry.source, vendor_type:entry.vendor_type,
          context_summary:entry.notes, collected_by:entry.collected_by,
          valid_until:entry.valid_until,
        }),
      });
      return r.ok;
    } catch { return false; }
  };

  const doAutoSync = async () => {
    if (!offline.length || !collector?.token) return;
    setSyncSt('syncing');
    const still = [];
    for (const e of offline) {
      const ok = await pushEntry(e, collector.token);
      if (ok) setEntries(prev => prev.map(x => x.id===e.id ? {...x,synced:true} : x));
      else still.push(e);
    }
    setOffline(still);
    setSyncSt(still.length===0 ? 'done' : 'error');
    setTimeout(() => setSyncSt('idle'), 3000);
  };

  const exportCSV = () => {
    if (!entries.length) { alert('No data yet'); return; }
    const h = ['Date','Item','Value','Unit','Category','Region','Market','GPS','Quality','Synced'];
    const rows = entries.map(e=>[e.date,e.item_display||e.item,e.value,e.unit,e.category,e.region,e.market||'',e.gps||'',e.quality_score||0,e.synced?'Yes':'No']);
    const blob = new Blob([[h,...rows].map(r=>r.join(',')).join('\n')],{type:'text/csv'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=`afriscout_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  const handlePhoto = e => {
    const f=e.target.files[0]; if(!f) return;
    const reader=new FileReader();
    reader.onloadend=()=>{ setPhoto(reader.result); setPhotoLabel(`${f.name} · ${(f.size/1024).toFixed(0)}KB`); };
    reader.readAsDataURL(f);
  };

  // Region entry counts
  const regionCounts = {};
  entries.forEach(e => { regionCounts[e.region_id] = (regionCounts[e.region_id]||0)+1; });

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (!collector) return (
    <div style={{...S.page, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes glow{0%,100%{box-shadow:0 0 30px rgba(249,115,22,0.2)}50%{box-shadow:0 0 50px rgba(249,115,22,0.4)}}`}</style>
      <div style={{width:'100%', maxWidth:360, padding:'0 24px'}}>
        <div style={{textAlign:'center', marginBottom:36}}>
          <div style={{width:70, height:70, background:'linear-gradient(135deg,#F97316,#c2410c)', borderRadius:22, display:'flex', alignItems:'center', justifyContent:'center', fontSize:34, margin:'0 auto 14px', animation:'glow 3s ease-in-out infinite'}}>🔥</div>
          <div style={{fontSize:30, fontWeight:800, color:C.orange, letterSpacing:'-1px'}}>AfriScout</div>
          <div style={{fontSize:12, color:'#334155', marginTop:5, fontFamily:'Space Mono,monospace'}}>Field Intelligence Network · v{APP_VERSION}</div>
        </div>
        <div style={S.card}>
          <div style={{marginBottom:14}}>
            <label style={S.label}>Scout Email</label>
            <input style={S.input} type="email" placeholder="scout@afrifoundry.com" value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} onKeyDown={e=>e.key==='Enter'&&doLogin()} />
          </div>
          <div style={{marginBottom:20}}>
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" placeholder="••••••••" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} onKeyDown={e=>e.key==='Enter'&&doLogin()} />
          </div>
          {loginErr && <div style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'9px 12px', fontSize:12, color:C.red, marginBottom:14}}>{loginErr}</div>}
          <button style={S.btnP} onClick={doLogin} disabled={loginBusy}>
            {loginBusy ? <RefreshCw size={16} style={{animation:'spin 1s linear infinite'}}/> : <User size={16}/>}
            {loginBusy ? 'Connecting...' : 'Enter Field Mode'}
          </button>
        </div>
        <div style={{textAlign:'center', fontSize:11, color:'#1e293b', marginTop:12}}>Offline-first · GPS-aware · AI-powered · 15 sectors</div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MAP VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === 'map') {
    const inRegion = gps ? (() => { const {region,dist} = nearestRegion(gps.lat,gps.lng); return dist < (region?.r||50) ? region : null; })() : null;

    return (
      <div style={S.page}>
        <style>{`
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.7}}
          @keyframes slideDown{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:translateY(0)}}
          @keyframes glow{0%,100%{box-shadow:0 0 12px rgba(249,115,22,0.2)}50%{box-shadow:0 0 25px rgba(249,115,22,0.5)}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
          .rgn:active{transform:scale(0.95);transition:transform 0.1s}
        `}</style>

        {/* GEOFENCE ALERT BANNER */}
        {nearbyAlert && (
          <div style={{position:'fixed', top:0, left:0, right:0, zIndex:200, background:'rgba(239,68,68,0.97)', backdropFilter:'blur(12px)', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, animation:'slideDown 0.3s ease', boxShadow:'0 4px 30px rgba(239,68,68,0.4)'}}>
            <div style={{fontSize:26}}>🔴</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800, fontSize:14, color:'#fff'}}>Data Gap — You're Near {nearbyAlert.region.name}!</div>
              <div style={{fontSize:12, color:'rgba(255,255,255,0.75)'}}>{nearbyAlert.dist}km away · CRITICAL priority · Collect now</div>
            </div>
            <button onClick={()=>startChat(nearbyAlert.region)} style={{background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', borderRadius:10, padding:'8px 14px', fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:'inherit'}}>
              Start →
            </button>
          </div>
        )}

        {/* HEADER */}
        <div style={{padding:'18px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:5}}>
              <div style={{width:32, height:32, background:'linear-gradient(135deg,#F97316,#c2410c)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17}}>🔥</div>
              <span style={{fontSize:19, fontWeight:800, color:C.orange, letterSpacing:'-0.5px'}}>AfriScout</span>
            </div>
            <div style={{display:'flex', gap:5, flexWrap:'wrap'}}>
              <span style={S.pill(online?C.green:C.orange)}>{online?'● Online':'● Offline'}</span>
              {gps && <span style={S.pill(C.green)}>📍 GPS</span>}
              {offline.length>0 && <span style={S.pill(C.orange)}>{offline.length} pending</span>}
              {syncSt==='done' && <span style={S.pill(C.green)}>✓ Synced</span>}
            </div>
          </div>
          <div style={{display:'flex', gap:6}}>
            <button style={{...S.btnS, padding:'8px 10px'}} onClick={()=>setView('dashboard')}><BarChart2 size={17}/></button>
            <button style={{...S.btnS, padding:'8px 10px', position:'relative'}} onClick={()=>setView('entries')}>
              <List size={17}/>
              {entries.length>0 && <span style={{position:'absolute', top:-6, right:-6, background:C.orange, color:'#fff', fontSize:9, fontWeight:700, width:17, height:17, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>{entries.length>99?'99+':entries.length}</span>}
            </button>
            <button style={{...S.btnS, padding:'8px 10px'}} onClick={()=>setView('settings')}><Settings size={17}/></button>
          </div>
        </div>

        {/* TODAY STRIP */}
        <div style={{margin:'0 16px 14px', background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.14)', borderRadius:14, padding:'11px 16px', display:'flex', alignItems:'center', gap:14}}>
          <div style={{flex:1}}>
            <div style={{fontSize:10, color:'#475569', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:5}}>Today's Mission</div>
            <div style={{background:'rgba(0,0,0,0.35)', borderRadius:4, height:6, overflow:'hidden'}}>
              <div style={{width:Math.min((todayCnt/GOAL_DAY)*100,100)+'%', height:'100%', background:`linear-gradient(90deg,${C.orange},${C.green})`, borderRadius:4, transition:'width 0.6s', boxShadow:'0 0 8px rgba(249,115,22,0.4)'}}/>
            </div>
          </div>
          <div style={{fontSize:24, fontWeight:800, color:todayCnt>=GOAL_DAY?C.green:C.orange, letterSpacing:'-0.5px', ...S.mono}}>
            {todayCnt}<span style={{fontSize:13, color:'#475569', fontWeight:400}}>/{GOAL_DAY}</span>
          </div>
        </div>

        {/* MAP HEADING */}
        <div style={{padding:'0 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{fontSize:11, fontWeight:700, color:'#334155', textTransform:'uppercase', letterSpacing:'1px'}}>Tap a region → AI collects</div>
          {inRegion && <span style={{...S.pill(C.green), fontSize:11}}>📍 {inRegion.name}</span>}
        </div>

        {/* KENYA MAP GRID */}
        <div style={{padding:'0 12px', marginBottom:14}}>
          {MAP_GRID.map((row, ri) => (
            <div key={ri} style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:6}}>
              {row.map((rid, ci) => {
                if (!rid) return <div key={ci}/>;
                const region = REGIONS.find(r=>r.id===rid);
                if (!region) return <div key={ci}/>;
                const cnt    = regionCounts[rid]||0;
                const isHere = inRegion?.id===rid;
                const col    = region.color;
                return (
                  <button key={ci} className="rgn" onClick={()=>startChat(region)} style={{
                    background: isHere ? col+'28' : 'rgba(12,12,24,0.9)',
                    border:`${isHere?'2':'1'}px solid ${col}${isHere?'70':'25'}`,
                    borderRadius:12, padding:'10px 4px', cursor:'pointer', textAlign:'center',
                    position:'relative', transition:'all 0.15s',
                    animation: isHere?'glow 2s ease-in-out infinite':'none',
                  }}>
                    <div style={{width:8, height:8, background:col, borderRadius:'50%', margin:'0 auto 5px', boxShadow:`0 0 6px ${col}`}}/>
                    <div style={{fontSize:10, fontWeight:700, color:'#e2e8f0', lineHeight:1.2, marginBottom:3}}>{region.name}</div>
                    <div style={{fontSize:10, color:'#334155', fontFamily:'Space Mono,monospace'}}>{cnt||'0'}</div>
                    {isHere && <div style={{position:'absolute', top:-5, right:-5, width:11, height:11, background:C.green, borderRadius:'50%', border:'2px solid #060610', animation:'pulse 1.5s ease-in-out infinite'}}/>}
                    {region.priority==='CRITICAL'&&cnt<3 && <div style={{position:'absolute', top:-4, left:-4, width:10, height:10, background:C.red, borderRadius:'50%', border:'2px solid #060610'}}/>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* LEGEND */}
        <div style={{padding:'0 16px 14px', display:'flex', gap:14, flexWrap:'wrap'}}>
          {[{c:C.red,l:'Critical'},{c:C.orange,l:'Low data'},{c:C.yellow,l:'Moderate'},{c:C.green,l:'Active'}].map(x=>(
            <div key={x.l} style={{display:'flex', alignItems:'center', gap:5}}>
              <div style={{width:7, height:7, background:x.c, borderRadius:'50%', boxShadow:`0 0 4px ${x.c}`}}/>
              <span style={{fontSize:11, color:'#475569'}}>{x.l}</span>
            </div>
          ))}
        </div>

        {/* CRITICAL PRIORITY LIST */}
        <div style={{padding:'0 16px'}}>
          <div style={{fontSize:10, fontWeight:700, color:'#334155', textTransform:'uppercase', letterSpacing:'1px', marginBottom:10}}>🎯 Priority Missions</div>
          {REGIONS.filter(r=>r.priority==='CRITICAL').map(r=>{
            const cnt  = regionCounts[r.id]||0;
            const gaps = GAPS[r.id]||[];
            return (
              <div key={r.id} onClick={()=>startChat(r)} style={{...S.card, borderLeft:`3px solid ${C.red}`, cursor:'pointer', display:'flex', alignItems:'center', gap:12, marginBottom:8}}>
                <div style={{fontSize:20}}>🔴</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:3}}>
                    <span style={{fontWeight:700, fontSize:13}}>{r.name}</span>
                    <span style={S.pill(C.red)}>CRITICAL</span>
                  </div>
                  <div style={{fontSize:11, color:'#475569', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{gaps[0]} · {gaps[1]}</div>
                </div>
                <div style={{textAlign:'right', flexShrink:0}}>
                  <div style={{fontSize:18, fontWeight:800, color:cnt>0?C.green:'#334155', fontFamily:'Space Mono,monospace'}}>{cnt}</div>
                  <div style={{fontSize:9, color:'#1e293b', fontFamily:'Space Mono,monospace'}}>pts</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AI CHAT COLLECT VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === 'chat') {
    const quickReplies = ['Done here','Next item','No photo','Survey instead'];
    return (
      <div style={{display:'flex', flexDirection:'column', height:'100vh', background:C.bg, fontFamily:"'DM Sans',system-ui,sans-serif"}}>
        <style>{`
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
          @keyframes blink{0%,100%{opacity:0.3}50%{opacity:1}}
          .msg{animation:fadeUp 0.2s ease}
        `}</style>

        {/* CHAT HEADER */}
        <div style={{background:'rgba(6,6,16,0.98)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, flexShrink:0}}>
          <button style={S.btnG} onClick={()=>setView('map')}>← Map</button>
          <div style={{flex:1}}>
            <div style={{fontWeight:800, fontSize:14, color:'#e2e8f0'}}>{chatRegion?.name}</div>
            <div style={{fontSize:10, color:'#334155', fontFamily:'Space Mono,monospace'}}>{chatRegion?.markets?.slice(0,3).join(' · ')}</div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            {gps && <span style={S.pill(C.green)}>📍</span>}
            <span style={{fontSize:13, fontWeight:800, color:C.orange, fontFamily:'Space Mono,monospace'}}>{todayCnt}/{GOAL_DAY}</span>
          </div>
        </div>

        {/* MESSAGES */}
        <div style={{flex:1, overflowY:'auto', padding:'16px 14px'}}>
          {messages.map((m,i) => (
            <div key={i} className="msg" style={{display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', marginBottom:14, alignItems:'flex-end', gap:8}}>
              {m.role==='ai' && (
                <div style={{width:30, height:30, background:'linear-gradient(135deg,#F97316,#c2410c)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0}}>🔥</div>
              )}
              <div style={{
                maxWidth:'80%',
                background: m.role==='ai' ? 'rgba(18,18,36,0.95)' : 'linear-gradient(135deg,#F97316,#ea6c10)',
                border: m.role==='ai' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                borderRadius: m.role==='ai' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                padding:'11px 14px', fontSize:14, color:m.role==='ai'?'#e2e8f0':'#fff',
                lineHeight:1.55, whiteSpace:'pre-wrap',
              }}>
                {m.text}
                <div style={{fontSize:9, color:m.role==='ai'?'#1e293b':'rgba(255,255,255,0.4)', marginTop:4, textAlign:'right', fontFamily:'Space Mono,monospace'}}>{timeAgo(m.ts)}</div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {chatBusy && (
            <div style={{display:'flex', alignItems:'flex-end', gap:8, marginBottom:14}}>
              <div style={{width:30, height:30, background:'linear-gradient(135deg,#F97316,#c2410c)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15}}>🔥</div>
              <div style={{background:'rgba(18,18,36,0.95)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px 16px 16px 4px', padding:'14px 16px', display:'flex', gap:5}}>
                {[0,1,2].map(i => <div key={i} style={{width:7, height:7, background:'#475569', borderRadius:'50%', animation:`blink 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
              </div>
            </div>
          )}

          {/* PENDING ENTRY SAVE CARD */}
          {pendingEntry && (
            <div style={{...S.card, border:`1px solid rgba(16,185,129,0.25)`, background:'rgba(16,185,129,0.04)', marginBottom:14}}>
              <div style={{fontSize:11, fontWeight:700, color:C.green, marginBottom:12, textTransform:'uppercase', letterSpacing:'0.8px'}}>✅ Ready to Save</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12}}>
                {[
                  ['Item',    pendingEntry.item_display||pendingEntry.item],
                  ['Price',   `KES ${parseFloat(pendingEntry.value||0).toLocaleString()}${pendingEntry.unit&&pendingEntry.unit!=='KES'?' '+pendingEntry.unit:''}`],
                  ['Vendor',  pendingEntry.vendor||'—'],
                  ['Type',    pendingEntry.vendor_type||'—'],
                ].map(([l,v]) => (
                  <div key={l} style={{background:'rgba(0,0,0,0.25)', borderRadius:8, padding:'8px 10px'}}>
                    <div style={{fontSize:9, color:'#475569', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2}}>{l}</div>
                    <div style={{fontSize:13, fontWeight:600, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{v}</div>
                  </div>
                ))}
              </div>
              <label style={{...S.btnS, cursor:'pointer', justifyContent:'center', width:'100%', boxSizing:'border-box', marginBottom:10, borderStyle:photo?'solid':'dashed', borderColor:photo?C.green:'rgba(255,255,255,0.1)', color:photo?C.green:'#475569'}}>
                <Camera size={14}/>{photo?`✓ ${photoLabel}`:'Attach Photo (optional)'}
                <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{display:'none'}}/>
              </label>
              <button style={S.btnP} onClick={saveEntry}>
                <Zap size={17}/> Save to AfriFoundry
              </button>
            </div>
          )}
          <div ref={chatEnd}/>
        </div>

        {/* INPUT AREA */}
        <div style={{background:'rgba(6,6,16,0.98)', borderTop:'1px solid rgba(255,255,255,0.05)', padding:'10px 14px 14px', flexShrink:0}}>
          {/* Quick replies */}
          {!pendingEntry && !chatBusy && messages.length>0 && messages[messages.length-1]?.role==='ai' && (
            <div style={{display:'flex', gap:6, marginBottom:10, overflowX:'auto'}}>
              {quickReplies.map(s => (
                <button key={s} onClick={()=>sendChat(s)} style={{background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:20, padding:'5px 12px', fontSize:12, color:C.orange, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit', fontWeight:600}}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <div style={{display:'flex', gap:8}}>
            <input
              style={{...S.input, flex:1, fontSize:15, padding:'12px 16px'}}
              placeholder={pendingEntry ? 'Entry ready — save it above ↑' : 'Type your response...'}
              value={chatInput}
              onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey&&!pendingEntry){ e.preventDefault(); sendChat(chatInput); } }}
              disabled={chatBusy||!!pendingEntry}
            />
            <button
              style={{...S.btnP, width:'auto', padding:'0 18px', boxShadow:'none', opacity:(!chatInput.trim()||chatBusy||pendingEntry)?0.4:1}}
              onClick={()=>sendChat(chatInput)}
              disabled={!chatInput.trim()||chatBusy||!!pendingEntry}
            >
              <Send size={17}/>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DASHBOARD — MISSION CONTROL
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === 'dashboard') {
    const wd      = weekDates();
    const wC      = wd.map(d=>entries.filter(e=>e.date===d).length);
    const maxDay  = Math.max(...wC,1);
    const todayStr= new Date().toISOString().split('T')[0];
    const avgQ    = entries.length ? Math.round(entries.reduce((s,e)=>s+(e.quality_score||0),0)/entries.length) : 0;
    const totPct  = Math.min((entries.length/GOAL_TOTAL)*100,100);
    const days    = ['S','M','T','W','T','F','S'];
    let streak=0; for(let i=0;i<365;i++){const d=new Date();d.setDate(d.getDate()-i);if(entries.some(e=>e.date===d.toISOString().split('T')[0]))streak++;else if(i>0)break;}
    const dc={}; entries.forEach(e=>{dc[e.date]=(dc[e.date]||0)+1;}); const bestDay=Math.max(...Object.values(dc),0);
    const sc={}; entries.forEach(e=>{sc[e.category]=(sc[e.category]||0)+1;}); const topS=Object.entries(sc).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const R=52, circ=2*Math.PI*R, dash=circ*Math.min(todayCnt/GOAL_DAY,1);

    return (
      <div style={{...S.page, background:'#060610'}}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} .dr{animation:fadeUp 0.35s ease both} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{maxWidth:500,margin:'0 auto',padding:'0 16px'}}>
          <div className="dr" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 0 16px'}}>
            <div>
              <div style={{fontSize:10,color:'#1e293b',fontFamily:'Space Mono,monospace',letterSpacing:'1px',textTransform:'uppercase',marginBottom:2}}>{new Date().getHours()<12?'Morning':'Afternoon'} briefing</div>
              <div style={{fontSize:20,fontWeight:800,color:'#e2e8f0',letterSpacing:'-0.5px'}}>Mission Control</div>
            </div>
            <button style={S.btnG} onClick={()=>setView('map')}>← Map</button>
          </div>

          {/* Ring + streak + best */}
          <div className="dr" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            <div style={{background:'rgba(249,115,22,0.05)',border:'1px solid rgba(249,115,22,0.15)',borderRadius:18,padding:'18px 12px',display:'flex',flexDirection:'column',alignItems:'center'}}>
              <div style={{position:'relative',width:116,height:116,marginBottom:8}}>
                <svg width="116" height="116" style={{transform:'rotate(-90deg)'}}>
                  <circle cx="58" cy="58" r={R} fill="none" stroke="rgba(249,115,22,0.1)" strokeWidth={6}/>
                  <circle cx="58" cy="58" r={R} fill="none" stroke={todayCnt>=GOAL_DAY?C.green:C.orange} strokeWidth={6} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ-dash} style={{transition:'stroke-dashoffset 1s ease',filter:`drop-shadow(0 0 5px ${todayCnt>=GOAL_DAY?C.green:C.orange})`}}/>
                </svg>
                <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                  <div style={{fontSize:30,fontWeight:800,color:todayCnt>=GOAL_DAY?C.green:C.orange,letterSpacing:'-1px',lineHeight:1}}>{todayCnt}</div>
                  <div style={{fontSize:10,color:'#475569',fontFamily:'Space Mono,monospace'}}>/{GOAL_DAY}</div>
                </div>
              </div>
              <div style={{fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.8px'}}>Today</div>
              {todayCnt>=GOAL_DAY&&<div style={{fontSize:10,color:C.green,fontWeight:700,marginTop:3}}>🎉 Crushed it!</div>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{background:'rgba(251,191,36,0.06)',border:'1px solid rgba(251,191,36,0.15)',borderRadius:14,padding:'14px',flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}><span style={{fontSize:18}}>🔥</span><span style={{fontSize:26,fontWeight:800,color:'#fbbf24',letterSpacing:'-1px'}}>{streak}</span></div>
                <div style={{fontSize:9,color:'#475569',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.8px'}}>Day Streak</div>
              </div>
              <div style={{background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.15)',borderRadius:14,padding:'14px',flex:1}}>
                <div style={{fontSize:26,fontWeight:800,color:C.green,letterSpacing:'-1px',marginBottom:3}}>{bestDay}</div>
                <div style={{fontSize:9,color:'#475569',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.8px'}}>Best Day</div>
              </div>
            </div>
          </div>

          {/* Operation 10K */}
          <div className="dr" style={{background:'linear-gradient(135deg,rgba(249,115,22,0.07),transparent)',border:'1px solid rgba(249,115,22,0.12)',borderRadius:16,padding:'14px 16px',marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:10}}>
              <div>
                <div style={{fontSize:9,color:'#1e293b',fontFamily:'Space Mono,monospace',letterSpacing:'1px',textTransform:'uppercase'}}>Operation 10K</div>
                <div style={{fontSize:22,fontWeight:800,color:C.orange,letterSpacing:'-0.5px'}}>{entries.length.toLocaleString()}<span style={{fontSize:12,color:'#475569',fontWeight:400}}> / 10,000</span></div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:20,fontWeight:800,color:'#e2e8f0'}}>{totPct.toFixed(1)}%</div>
                <div style={{fontSize:9,color:'#475569',fontFamily:'Space Mono,monospace'}}>{(GOAL_TOTAL-entries.length).toLocaleString()} left</div>
              </div>
            </div>
            <div style={{background:'rgba(0,0,0,0.4)',borderRadius:6,height:10,overflow:'hidden'}}>
              <div style={{width:totPct+'%',height:'100%',background:`linear-gradient(90deg,${C.orange},${C.green})`,borderRadius:6,boxShadow:`0 0 10px rgba(249,115,22,0.4)`,transition:'width 1s'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:9,color:'#1e293b',fontFamily:'Space Mono,monospace'}}>
              <span>Avg Q: {avgQ}%</span><span>Field: {entries.filter(e=>e.mode==='field').length}</span><span>Sectors: {Object.keys(sc).length}/15</span>
            </div>
          </div>

          {/* Weekly */}
          <div className="dr" style={{...S.card,marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.8px'}}>Weekly Rhythm</div>
              <div style={{fontSize:11,color:C.orange,fontWeight:700,fontFamily:'Space Mono,monospace'}}>{wC.reduce((a,b)=>a+b,0)} pts</div>
            </div>
            <div style={{display:'flex',alignItems:'flex-end',gap:5,height:90}}>
              {wd.map((d,i)=>{
                const cnt=wC[i],isToday=d===todayStr,met=cnt>=GOAL_DAY;
                return (
                  <div key={d} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                    <div style={{fontSize:9,fontWeight:700,minHeight:12,color:met?C.green:cnt>0?C.orange:'transparent',fontFamily:'Space Mono,monospace'}}>{cnt||''}</div>
                    <div style={{width:'100%',background:'#0a0a18',borderRadius:4,height:68,display:'flex',alignItems:'flex-end',overflow:'hidden'}}>
                      <div style={{width:'100%',height:Math.max((cnt/maxDay)*100,3)+'%',background:met?C.green:isToday?C.orange:cnt>0?'#2a3a52':'#0d0d1a',borderRadius:4,boxShadow:isToday?`0 0 8px rgba(249,115,22,0.5)`:met?`0 0 6px rgba(16,185,129,0.4)`:'none',transition:'height 0.8s cubic-bezier(0.34,1.56,0.64,1)'}}/>
                    </div>
                    <div style={{fontSize:9,color:isToday?C.orange:'#334155',fontWeight:isToday?800:400,fontFamily:'Space Mono,monospace'}}>{days[new Date(d).getDay()]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sectors */}
          {topS.length>0&&(
            <div className="dr" style={{...S.card,marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:12}}>Sector Intel</div>
              {topS.map(([sec,cnt])=>{
                const s=SECTORS.find(x=>x.id===sec);
                return (
                  <div key={sec} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <span style={{fontSize:15,width:20}}>{s?.icon||'📦'}</span>
                    <span style={{fontSize:11,color:'#64748b',width:72,flexShrink:0,fontWeight:600}}>{s?.name||sec}</span>
                    <div style={{flex:1,background:'#0a0a18',borderRadius:3,height:5,overflow:'hidden'}}>
                      <div style={{width:Math.round((cnt/entries.length)*100)+'%',height:'100%',background:`linear-gradient(90deg,${C.orange},${C.green})`,borderRadius:3}}/>
                    </div>
                    <span style={{fontSize:10,color:'#334155',width:24,textAlign:'right',fontFamily:'Space Mono,monospace'}}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent */}
          <div className="dr" style={S.card}>
            <div style={{fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:12}}>Recent Intel</div>
            {entries.length===0
              ? <div style={{color:'#1e293b',fontSize:13,textAlign:'center',padding:'16px 0'}}>No entries yet — tap the map to start</div>
              : entries.slice(-5).reverse().map(e=>(
                <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:'#d1d5db',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.item_display||e.item.replace(/_/g,' ')}</div>
                    <div style={{fontSize:10,color:'#475569'}}>{e.category} · {e.region}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0,paddingLeft:10}}>
                    <div style={{fontSize:13,fontWeight:800,color:C.green,fontFamily:'Space Mono,monospace'}}>KES {e.value.toLocaleString()}</div>
                    <div style={{fontSize:9,color:'#334155',fontFamily:'Space Mono,monospace'}}>{timeAgo(e.timestamp)}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENTRIES
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === 'entries') return (
    <div style={S.page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{maxWidth:500,margin:'0 auto',padding:'0 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'18px 0 14px'}}>
          <button style={S.btnG} onClick={()=>setView('map')}>← Map</button>
          <span style={{fontSize:18,fontWeight:800,flex:1}}>Intel Log ({entries.length})</span>
          <button style={S.btnG} onClick={exportCSV}><Download size={14}/> CSV</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
          {[{l:'Collected',v:entries.length,c:C.orange},{l:'Synced',v:entries.filter(e=>e.synced).length,c:C.green},{l:'Pending',v:offline.length,c:offline.length>0?C.orange:'#475569'}].map(s=>(
            <div key={s.l} style={{...S.card,textAlign:'center',padding:'12px 8px',marginBottom:0}}>
              <div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div>
              <div style={{fontSize:11,color:'#475569'}}>{s.l}</div>
            </div>
          ))}
        </div>
        {offline.length>0&&online&&(
          <div style={{...S.card,display:'flex',alignItems:'center',gap:10,background:'rgba(249,115,22,0.05)',border:'1px solid rgba(249,115,22,0.15)'}}>
            <span style={{flex:1,fontSize:13}}>{offline.length} waiting to sync</span>
            <button style={{...S.btnS,padding:'6px 12px',fontSize:12}} onClick={doAutoSync}>
              {syncSt==='syncing'?<RefreshCw size={13} style={{animation:'spin 1s linear infinite'}}/>:'Sync Now'}
            </button>
          </div>
        )}
        {entries.length===0
          ? <div style={{...S.card,textAlign:'center',padding:'48px 20px'}}>
              <div style={{fontSize:36,marginBottom:12}}>📋</div>
              <div style={{color:'#334155',marginBottom:16}}>No entries yet</div>
              <button style={S.btnP} onClick={()=>setView('map')}>Open Map</button>
            </div>
          : entries.slice().reverse().map(e=>(
              <div key={e.id} style={{...S.card,marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13}}>{e.item_display||e.item.replace(/_/g,' ')}</div>
                    <div style={{fontSize:11,color:'#475569'}}>{e.category} · {e.region}{e.market?' · '+e.market:''}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:15,fontWeight:800,color:C.green,fontFamily:'Space Mono,monospace'}}>KES {e.value.toLocaleString()}</div>
                    <div style={{fontSize:10,color:e.synced?C.green:'#334155'}}>{e.synced?'☁ Synced':'📴 Local'}</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  <span style={S.pill('#475569')}>{e.date}</span>
                  {e.gps&&<span style={S.pill(C.green)}>📍 GPS</span>}
                  {e.photo&&<span style={S.pill(C.purple)}>📸</span>}
                  {e.via==='ai_chat'&&<span style={S.pill(C.orange)}>🤖 AI</span>}
                  <span style={S.pill(e.quality_score>=80?C.green:e.quality_score>=60?C.orange:'#475569')}>Q:{e.quality_score||0}%</span>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={S.page}>
      <div style={{maxWidth:500,margin:'0 auto',padding:'0 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'18px 0 14px'}}>
          <button style={S.btnG} onClick={()=>setView('map')}>← Map</button>
          <span style={{fontSize:18,fontWeight:800}}>Settings</span>
        </div>
        <div style={S.card}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{collector.name}</div>
          <div style={{fontSize:12,color:'#475569',marginBottom:8}}>{collector.email}</div>
          {collector.offline&&<span style={S.pill(C.orange)}>Offline Mode</span>}
        </div>
        <div style={S.card}>
          <div style={{fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:12}}>Data</div>
          {[['Total entries',entries.length],['Synced',entries.filter(e=>e.synced).length],['Pending sync',offline.length],['Storage',(JSON.stringify(entries).length/1024).toFixed(1)+'KB']].map(([l,v])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <span style={{color:'#64748b'}}>{l}</span>
              <strong style={{color:l==='Pending sync'&&v>0?C.orange:'#e2e8f0'}}>{v}</strong>
            </div>
          ))}
          <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:14}}>
            <button style={{...S.btnS,justifyContent:'center'}} onClick={exportCSV}><Download size={14}/>Export CSV</button>
            {offline.length>0&&online&&<button style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',color:C.green,borderRadius:12,padding:12,fontWeight:700,cursor:'pointer',fontSize:13}} onClick={doAutoSync}>☁ Sync {offline.length} Pending</button>}
            <button style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:C.red,borderRadius:12,padding:12,fontWeight:700,cursor:'pointer',fontSize:13}} onClick={()=>{if(window.confirm('Delete ALL data? Cannot be undone.')){setEntries([]);setOffline([]);}}}>🗑 Clear All Data</button>
          </div>
        </div>
        <div style={{...S.card,marginBottom:16}}>
          <div style={{fontSize:11,color:'#1e293b',lineHeight:1.9}}>
            <strong style={{color:'#475569'}}>AfriScout v{APP_VERSION}</strong><br/>
            Map-first · AI chat collection · Geofence alerts<br/>
            15 sectors · Offline-first · 5-scout network ready<br/>
            Mark Gakuya · AfriFoundry Limited
          </div>
        </div>
        <button style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:C.red,borderRadius:14,padding:14,fontWeight:700,cursor:'pointer',fontSize:14,width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontFamily:'inherit'}} onClick={doLogout}>
          <LogOut size={15}/>Log Out
        </button>
      </div>
    </div>
  );
}
