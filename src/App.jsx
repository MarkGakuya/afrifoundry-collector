import React, { useState, useEffect } from 'react';
import {
  Camera, MapPin, Save, Download, Trash2, List,
  Settings, Award, RefreshCw, LogOut, User,
  BarChart2, Shield, AlertCircle
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE    = 'https://afrifoundry-api.onrender.com';
const APP_VERSION = '2.0.0';
const GOAL_DAY    = 15;
const GOAL_TOTAL  = 10000;
const OUTLIER_PCT = 0.40; // flag if ±40% from known median

// ─────────────────────────────────────────────────────────────────────────────
// 15 SECTORS
// ─────────────────────────────────────────────────────────────────────────────
const SECTORS = [
  { id:'agriculture',    name:'Agriculture',   icon:'🌾' },
  { id:'health',         name:'Health',         icon:'🏥' },
  { id:'energy',         name:'Energy',         icon:'⚡' },
  { id:'water',          name:'Water',          icon:'💧' },
  { id:'infrastructure', name:'Infrastructure', icon:'🏗️' },
  { id:'fintech',        name:'Fintech',        icon:'💰' },
  { id:'transport',      name:'Transport',      icon:'🚗' },
  { id:'education',      name:'Education',      icon:'📚' },
  { id:'food',           name:'Food',           icon:'🍽️' },
  { id:'retail',         name:'Retail',         icon:'🛍️' },
  { id:'telecom',        name:'Telecom',        icon:'📡' },
  { id:'housing',        name:'Housing',        icon:'🏠' },
  { id:'manufacturing',  name:'Manufacturing',  icon:'🏭' },
  { id:'technology',     name:'Technology',     icon:'💻' },
  { id:'tourism',        name:'Tourism',        icon:'🏖️' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 225+ ITEMS BY SECTOR
// ─────────────────────────────────────────────────────────────────────────────
const ITEMS = {
  agriculture: [
    'Maize seed (H614D) 2kg','Maize seed (H516) 2kg','Sorghum seed 1kg','Bean seed 1kg',
    'Sunflower seed 1kg','Cabbage seedlings (tray)','Tomato seedlings (tray)',
    'CAN fertilizer 50kg','DAP fertilizer 50kg','NPK fertilizer 50kg','Urea 50kg',
    'Pesticide Duduthrin 1L','Herbicide Roundup 1L','Fungicide Dithane 1kg',
    'Maize dry per 90kg bag','Tomatoes per crate','Onions per bag 50kg',
    'Potatoes per 50kg bag','Cabbages per head','Kale (sukuma) per bundle',
    'Chicken broiler live 1kg','Eggs per tray 30','Milk per litre raw',
    'Cattle mature bull','Goat mature','Pig mature',
    'Farm labour per day','Tractor hire per acre','Cold storage per kg/month',
  ],
  health: [
    'Consultation public clinic','Consultation private clinic','Consultation pharmacy',
    'Paracetamol pack 24s','Amoxicillin 500mg strip 10','Metronidazole 400mg strip 10',
    'ORS sachet','Malaria RDT test','Malaria treatment ALu 6 tabs',
    'Surgical gloves box 100','Face masks box 50','Hand sanitizer 500ml',
    'Blood pressure monitor','Thermometer digital','Oxygen concentrator hire/day',
    'Ambulance hire within county','Hospital bed public per day','Hospital bed private per day',
    'Lab test CBC','Lab test malaria smear','Lab test pregnancy','X-ray chest',
    'Ultrasound scan','Dental extraction','Eye test + glasses',
    'Sanitary pads pack 8','Contraceptive pills monthly','Family planning injection',
  ],
  energy: [
    'Kerosene per litre','Petrol per litre','Diesel per litre',
    'LPG gas 6kg full cylinder','LPG gas 13kg full cylinder',
    'Charcoal per 50kg bag','Firewood per bundle',
    'Solar panel 100W','Solar panel 250W','Solar battery 100Ah','Solar inverter 1000W',
    'Solar home installation basic','Solar lantern small','Solar lantern large',
    'Generator hire per day','Generator 2.5KVA price',
    'KPLC prepaid token per unit','Biogas digester household',
    'Energy saving bulb 15W','Extension cable 10m','Grid connection fee KPLC',
  ],
  water: [
    'Water per 20L jerry can','Water per month piped household',
    'Borehole drilling per metre','Water pump electric 0.5HP',
    'Water pump solar','Water pump manual',
    'Water tank 1000L plastic','Water tank 5000L','Water tank 10000L',
    'Water purification tablets 50s','Ceramic water filter','Water testing kit',
    'Irrigation pipe per metre','Drip irrigation kit 1 acre',
    'Rainwater harvesting tank 2500L','Water trucking per 10000L',
  ],
  infrastructure: [
    'Cement per 50kg bag','Iron sheet gauge 30 8ft','Iron sheet gauge 28 10ft',
    'Building sand per lorry 7t','Ballast per lorry','Hardcore per lorry',
    'Timber 2x4 per metre','Timber 4x4 per metre','Roofing nails per kg',
    'Concrete block per piece','Burnt brick per piece',
    'Plywood sheet 4x8ft','Paint 4L gloss','Paint 4L emulsion',
    'Floor tiles per m2','Steel rod 12mm per kg','Steel rod 10mm per kg',
    'Jua kali gate per m2','Mason per day','Builder labourer per day',
    'Plumber per day','Electrician per day','Carpenter per day',
  ],
  fintech: [
    'M-Pesa send KES 100','M-Pesa send KES 1000','M-Pesa send KES 5000',
    'M-Pesa withdrawal KES 100','M-Pesa withdrawal KES 1000','M-Pesa withdrawal KES 5000',
    'Bank transfer fee','SACCO loan interest rate monthly','Chama contribution per month',
    'Fuliza loan rate per day','Bank loan interest per year',
    'Motor insurance bodaboda annual','Motor insurance car annual',
    'NHIF contribution per month','NSSF contribution per month',
    'Float cost per KES 10000','Pesalink transfer fee','Agent float refill cost',
  ],
  transport: [
    'Matatu fare town route','Matatu fare inter-county',
    'Bodaboda fare per km','Taxi Uber/Bolt base fare',
    'SGR Nairobi-Mombasa fare','Bus fare cross-country',
    'Bodaboda second-hand price','Bodaboda new price','Tuk-tuk price',
    'Lorry hire per day','Pick-up truck hire per day',
    'Container Mombasa-Nairobi shipping','Clearing and forwarding per container',
    'Driver salary per month','Bodaboda daily earnings',
    'Vehicle inspection NTSA','Driving licence fee','PSV licence fee',
    'Motor insurance 3rd party annual','Motor insurance comprehensive annual',
    'Tyre 14 inch per piece','Engine oil 4L','Bodaboda service cost',
  ],
  education: [
    'Primary school fees per term public','Primary school fees per term private',
    'Secondary school fees per term public','Secondary school fees per term private',
    'University tuition per semester','TVET fees per semester',
    'Tutoring per hour primary','Tutoring per hour secondary',
    'Exercise book 96 pages','Textbook KCPE level','Textbook KCSE level',
    'School uniform shirt + trouser','School shoes','School bag',
    'School lunch per term','Boarding fee per term',
    'Laptop student basic','Calculator scientific',
    'Pre-school fees per month','Nursery fees per month',
  ],
  food: [
    'Unga maize flour 2kg','Unga wheat flour 2kg','Rice per kg','Sugar per kg',
    'Cooking oil 1L','Cooking oil 5L','Salt per 500g','Tea leaves 100g',
    'Milk fresh 500ml','Milk long life 500ml','Eggs per piece',
    'Beef per kg with bone','Beef per kg boneless','Chicken per kg live',
    'Tilapia per kg fresh','Omena dagaa per kg',
    'Chapati per piece','Mandazi per piece','Samosa per piece',
    'Chai cup','Lunch plate hotel basic','Lunch plate restaurant mid',
    'Soda Coke 300ml','Water bottle 500ml','Beer Tusker 500ml',
    'Tomatoes per kg','Onions per kg','Potatoes per kg',
    'Avocado per piece','Banana per bunch','Mango per piece',
    'Githeri per plate','Ugali + sukuma per plate','Nyama choma per kg',
  ],
  retail: [
    'Mobile phone basic feature','Mobile phone smart budget',
    'Shoes canvas local','Shoes leather mid-range',
    'T-shirt mitumba good','Trousers mitumba jeans','Dress mitumba',
    'Shirt new local brand','Dress new market',
    'Cooking pot 10L','Sufuria frying pan','Jiko charcoal stove',
    'Plastic chair per piece','Plastic table','Mattress 3x6 foam',
    'Blanket fleece','Mosquito net treated',
    'Soap bar Menengai','Washing powder 500g','Toothpaste 75ml','Lotion 400ml',
    'Sanitary pads pack','Baby diapers pack 10','Pampers jumbo pack',
    'TV second-hand 32 inch','Radio speaker portable',
  ],
  telecom: [
    'Safaricom SIM card','Airtel SIM card','Telkom SIM card',
    'Safaricom data 1GB daily','Safaricom data 5GB monthly','Safaricom data 10GB monthly',
    'Airtel data 1GB','Airtel unlimited daily',
    'Safaricom airtime KES 50','Call rate per min on-net',
    'Fibre home basic per month','Fibre home premium per month',
    'WiFi hotspot hire per day','Cyber cafe per hour',
    'Phone repair screen','Phone repair charging port','Phone charging per session',
  ],
  housing: [
    'Single room Nairobi Eastlands rent','Single room Mombasa rent',
    'Bedsitter Nairobi rent','Bedsitter Mombasa rent',
    '1-bedroom Nairobi mid rent','1-bedroom Mombasa mid rent',
    '2-bedroom Nairobi estate rent','2-bedroom Mombasa estate rent',
    'Plot per acre rural','Plot 50x100 peri-urban',
    'Land rent annual LTA','Caretaker salary per month',
    'NWSC water connection fee','KPLC single phase connection',
    'House painting per room','Roofing repair per m2',
    'Security deposit typical months','Agent fee % annual rent',
  ],
  manufacturing: [
    'Jua kali workshop rent per month','Welding gas per cylinder','Welding rod per kg',
    'Metal fabrication gate per m2','Blacksmith per day',
    'Plastic raw material per kg','Packaging material per unit',
    'Industrial sewing machine second-hand','Fabric per metre local',
    'Leather per sq foot','Shoemaking materials per pair',
    'Candle wax per kg','Soap base cold process per kg','Essential oil 100ml',
    'Printing A4 flyer per 100','Screen printing per piece',
    'Pottery clay per kg','Handicraft materials per set',
  ],
  technology: [
    'Laptop basic new','Laptop business grade new','Laptop second-hand good',
    'Desktop assembled','Monitor 22 inch','Printer inkjet',
    'Flash disk 32GB','External HDD 1TB','Router WiFi home',
    'Phone repair software','Phone repair charging port',
    'Microsoft 365 per month','Domain name per year',
    'Web hosting basic per year','Web hosting VPS per year',
    'Coding bootcamp fees','IT training per month',
    'CCTV camera basic','CCTV installation per camera',
    'POS machine purchase','POS machine hire per month',
  ],
  tourism: [
    'Hotel room budget per night','Hotel room mid-range per night','Hotel room 3-star per night',
    'Beach entry fee','National park entry resident','National park entry non-resident',
    'Safari day trip per person','Guide fee per day',
    'Curio wood carving','Curio kikoi cloth','Curio beaded jewellery',
    'Boat trip 2hrs','Snorkelling hire','Diving session',
    'Tourist transport per day','Conference room hire per day',
    'Restaurant tourist area lunch','Street food near beach',
  ],
};

// Known price medians for outlier detection (KES)
const PRICE_MEDIANS = {
  'unga maize flour 2kg':170,'milk fresh 500ml':35,'eggs per piece':15,
  'tomatoes per crate':1800,'petrol per litre':210,'diesel per litre':200,
  'kerosene per litre':130,'matatu fare town route':30,'bodaboda fare per km':50,
  'cement per 50kg bag':750,'single room nairobi eastlands rent':3500,
  'sugar per kg':160,'cooking oil 1l':230,'rice per kg':140,
  'unga wheat flour 2kg':145,'beef per kg with bone':600,'chicken per kg live':380,
  'lpg gas 6kg full cylinder':1200,'charcoal per 50kg bag':2500,
};

// ─────────────────────────────────────────────────────────────────────────────
// KENYA REGIONS + MARKETS
// ─────────────────────────────────────────────────────────────────────────────
const REGIONS = [
  { id:'nairobi',       name:'Nairobi',        markets:['Gikomba','Eastleigh','CBD','Westlands','Kibera','Karen','Ngong Road','Thika Road','Kayole','Githurai','Rongai'] },
  { id:'mombasa',       name:'Mombasa',         markets:['Kongowea','Likoni','Mtwapa','Nyali','Old Town','Bamburi','Changamwe','Kisauni','Mikindani','Tudor'] },
  { id:'kisumu',        name:'Kisumu',           markets:['CBD','Kondele','Kibuye','Migosi','Manyatta','Nyalenda','Mamboleo'] },
  { id:'nakuru',        name:'Nakuru',           markets:['CBD','Maili Nne','Lanet','Milimani','Flamingo','Section 58'] },
  { id:'eldoret',       name:'Eldoret',          markets:['CBD','Langas','Pioneer','Huruma','Kapseret','Kamukunji'] },
  { id:'thika',         name:'Thika',            markets:['CBD','Makongeni','Garissa Road','Kiandutu'] },
  { id:'rift_valley',   name:'Rift Valley',      markets:['Naivasha','Narok','Kericho','Bomet','Kajiado','Isinya'] },
  { id:'coast_other',   name:'Coast (Other)',     markets:['Kilifi','Malindi','Diani','Lamu','Kwale','Voi','Mariakani'] },
  { id:'western',       name:'Western',           markets:['Kakamega','Bungoma','Mumias','Webuye','Malaba'] },
  { id:'eastern',       name:'Eastern',           markets:['Machakos','Kitui','Meru','Embu','Garissa','Isiolo'] },
  { id:'central',       name:'Central',           markets:['Nyeri',"Murang'a",'Kiambu','Muranga','Karatina','Ol Kalou'] },
];

const UNITS = ['KES','KES/kg','KES/litre','KES/acre','KES/month','KES/day','KES/piece','KES/m²','KES/bag','%','hours','units'];

const VENDOR_TYPES = [
  'Supermarket','Kiosk / duka','Wholesale','Street vendor',
  'Market stall','Agro-vet','Pharmacy','Hospital / clinic',
  'SACCO / bank','Online / app','Hotel / restaurant','Other',
];

const SURVEY_TEMPLATES = [
  { id:'farmer',   name:'Farmer Pain Points',             icon:'🌾',
    questions:[
      {id:'q1',text:'Farm size (acres)',type:'number',unit:'acres'},
      {id:'q2',text:'Main crop grown',type:'text'},
      {id:'q3',text:'Seed cost per season',type:'number',unit:'KES'},
      {id:'q4',text:'Fertilizer cost per season',type:'number',unit:'KES'},
      {id:'q5',text:'Where do you sell produce?',type:'select',options:['Local market','Middleman','Direct consumer','Cooperative','Export']},
      {id:'q6',text:'Biggest challenge?',type:'text'},
      {id:'q7',text:'Would you use mobile farming advice?',type:'select',options:['Yes','No','Maybe']},
    ]},
  { id:'vendor',   name:'Market Vendor Survey',           icon:'🛍️',
    questions:[
      {id:'q1',text:'What do you sell?',type:'text'},
      {id:'q2',text:'Daily revenue (average)',type:'number',unit:'KES'},
      {id:'q3',text:'Daily expenses (rent + stock + transport)',type:'number',unit:'KES'},
      {id:'q4',text:'How do customers mostly pay?',type:'select',options:['Cash','M-Pesa','Both','Credit/delay']},
      {id:'q5',text:'Years in business',type:'number',unit:'years'},
      {id:'q6',text:'Biggest business challenge?',type:'text'},
    ]},
  { id:'clinic',   name:'Health Worker / Clinic',         icon:'🏥',
    questions:[
      {id:'q1',text:'Monthly operating budget',type:'number',unit:'KES'},
      {id:'q2',text:'Patients per day (average)',type:'number',unit:'patients'},
      {id:'q3',text:'Power outages per week',type:'number',unit:'times'},
      {id:'q4',text:'Generator cost per month',type:'number',unit:'KES'},
      {id:'q5',text:'Biggest operational challenge',type:'text'},
    ]},
  { id:'student',  name:'Student Idea Validation',        icon:'🎓',
    questions:[
      {id:'q1',text:'Innovation sector',type:'select',options:['Agriculture','Health','Water','Energy','Fintech','Retail','Technology','Other']},
      {id:'q2',text:'Describe the innovation (one sentence)',type:'text'},
      {id:'q3',text:'Target monthly revenue',type:'number',unit:'KES'},
      {id:'q4',text:'Validated with real users?',type:'select',options:['Yes','No','In progress']},
      {id:'q5',text:'Main challenge you face',type:'text'},
    ]},
  { id:'bodaboda', name:'Bodaboda / Transport Operator',  icon:'🏍️',
    questions:[
      {id:'q1',text:'Daily earnings (average)',type:'number',unit:'KES'},
      {id:'q2',text:'Daily fuel cost',type:'number',unit:'KES'},
      {id:'q3',text:'Bike owned or hired?',type:'select',options:['Own','Hired daily','Hired monthly','Loan']},
      {id:'q4',text:'Hire/loan cost per month',type:'number',unit:'KES'},
      {id:'q5',text:'Insurance per year',type:'number',unit:'KES'},
      {id:'q6',text:'Biggest cost or challenge',type:'text'},
    ]},
];

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const C = { orange:'#F97316', green:'#10B981', blue:'#38bdf8', purple:'#a78bfa', red:'#f87171', yellow:'#fbbf24' };

const S = {
  page:    { minHeight:'100vh', background:'linear-gradient(160deg,#080810 0%,#0f0f1a 60%,#080810 100%)', color:'#e2e8f0', fontFamily:"'DM Sans',system-ui,sans-serif", paddingBottom:40 },
  wrap:    { maxWidth:500, margin:'0 auto', padding:'0 16px' },
  card:    { background:'rgba(20,20,35,0.95)', border:'1px solid #1e1e30', borderRadius:16, padding:'16px 18px', marginBottom:14 },
  sm:      { background:'#0f0f1a', border:'1px solid #1e1e30', borderRadius:12, padding:'12px 14px', marginBottom:10 },
  input:   { width:'100%', background:'#0a0a14', border:'1px solid #2a2a40', borderRadius:10, color:'#e2e8f0', padding:'11px 14px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' },
  select:  { width:'100%', background:'#0a0a14', border:'1px solid #2a2a40', borderRadius:10, color:'#e2e8f0', padding:'11px 14px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' },
  ta:      { width:'100%', background:'#0a0a14', border:'1px solid #2a2a40', borderRadius:10, color:'#e2e8f0', padding:'11px 14px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit', resize:'vertical', minHeight:70 },
  label:   { display:'block', fontSize:11, fontWeight:700, color:'#64748b', marginBottom:6, letterSpacing:'0.6px', textTransform:'uppercase' },
  field:   { marginBottom:16 },
  btnP:    { width:'100%', background:'linear-gradient(135deg,#F97316,#ea6c10)', border:'none', color:'#fff', borderRadius:12, padding:14, fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit' },
  btnS:    { background:'#1a1a2e', border:'1px solid #2a2a40', color:'#94a3b8', borderRadius:10, padding:'10px 14px', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit' },
  btnG:    { background:'transparent', border:'none', color:'#64748b', cursor:'pointer', padding:6, borderRadius:8, display:'flex', alignItems:'center', gap:4, fontSize:12, fontFamily:'inherit' },
  h1:      { fontSize:20, fontWeight:800, letterSpacing:'-0.5px', margin:0 },
  h2:      { fontSize:16, fontWeight:700, margin:'0 0 14px 0' },
  pill:    (c) => ({ display:'inline-flex', alignItems:'center', gap:4, background:c+'22', color:c, border:`1px solid ${c}44`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700 }),
  warn:    { background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#fbbf24', marginBottom:12, lineHeight:1.5 },
  err:     { background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#f87171', marginBottom:12, lineHeight:1.5 },
  ok:      { background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#10B981', marginBottom:12, lineHeight:1.5 },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const freshForm = () => ({ sector:'', item:'', customItem:'', value:'', unit:'KES', region:'', market:'', vendorType:'', source:'', notes:'' });

function outlierCheck(item, value) {
  const key = item.toLowerCase();
  const med  = PRICE_MEDIANS[key];
  if (!med || !value) return null;
  const val  = parseFloat(value);
  const diff = Math.abs(val - med) / med;
  if (diff > OUTLIER_PCT) return `Price seems ${val > med ? 'HIGH' : 'LOW'} — typical is KES ${med.toLocaleString()}. Verify with vendor.`;
  return null;
}

function isDuplicate(entries, sector, item, region) {
  const today = new Date().toISOString().split('T')[0];
  const key   = item.toLowerCase().replace(/\s+/g, '_');
  return entries.some(e => e.date === today && e.category === sector && e.item === key && e.region_id === region);
}

function qualityScore(e) {
  let s = 60;
  if (e.gps)                                    s += 10;
  if (e.gps_accuracy != null && e.gps_accuracy < 10)  s += 10;
  else if (e.gps_accuracy != null && e.gps_accuracy < 50) s += 5;
  if (e.photo)       s += 10;
  if (e.source)      s += 5;
  if (e.vendorType)  s += 5;
  if (e.notes)       s += 5;
  return Math.min(s, 100);
}

function previewQuality(gps, photo, source, vendorType, notes) {
  return qualityScore({ gps, gps_accuracy: gps?.accuracy, photo, source, vendorType, notes });
}

function weekDates() {
  const today = new Date(); const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    out.push(d.toISOString().split('T')[0]);
  }
  return out;
}

function timeAgo(ts) {
  const m = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m/60)}h ago`;
  return `${Math.floor(m/1440)}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AfriScout() {
  // Auth
  const [collector,     setCollector]     = useState(null);
  const [loginForm,     setLoginForm]     = useState({ email:'', password:'' });
  const [loginErr,      setLoginErr]      = useState('');
  const [loginLoading,  setLoginLoading]  = useState(false);

  // Navigation
  const [view,   setView]   = useState('collect'); // collect | dashboard | entries | settings
  const [mode,   setMode]   = useState('field');   // field | survey

  // Connection
  const [online,  setOnline]  = useState(navigator.onLine);
  const [syncSt,  setSyncSt]  = useState('idle');   // idle | syncing | done | error

  // Data
  const [entries,  setEntries]  = useState([]);
  const [pending,  setPending]  = useState([]);
  const [todayCnt, setTodayCnt] = useState(0);
  const [goalBanner, setGoalBanner] = useState(false);

  // Form
  const [form,   setForm]   = useState(freshForm());
  const [gps,    setGps]    = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [photo,  setPhoto]  = useState(null);
  const [photoLabel, setPhotoLabel] = useState('');
  const [survey, setSurvey] = useState(null);
  const [surveyR, setSurveyR] = useState({});
  const [saving, setSaving] = useState(false);
  const [itemQ,  setItemQ]  = useState('');
  const [warnings, setWarnings] = useState([]);

  // ── BOOT ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const c = localStorage.getItem('afriscout_v2_collector');
    if (c) setCollector(JSON.parse(c));
    const e = localStorage.getItem('afriscout_v2_entries');
    if (e) { const p = JSON.parse(e); setEntries(p); countToday(p); }
    const q = localStorage.getItem('afriscout_v2_pending');
    if (q) setPending(JSON.parse(q));
  }, []);

  useEffect(() => {
    localStorage.setItem('afriscout_v2_entries', JSON.stringify(entries));
    countToday(entries);
  }, [entries]);

  useEffect(() => { localStorage.setItem('afriscout_v2_pending', JSON.stringify(pending)); }, [pending]);

  useEffect(() => {
    const on  = () => { setOnline(true);  autoSync(); };
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, [pending, collector]);

  function countToday(list) {
    const t = new Date().toISOString().split('T')[0];
    setTodayCnt(list.filter(e => e.date === t).length);
  }

  // ── LIVE WARNINGS ─────────────────────────────────────────────────────────
  useEffect(() => {
    const w = [];
    const itemName = form.item || form.customItem;
    if (itemName && form.value) {
      const o = outlierCheck(itemName, form.value);
      if (o) w.push('⚠ ' + o);
    }
    if (itemName && form.sector && form.region && isDuplicate(entries, form.sector, itemName, form.region)) {
      w.push('⚠ Possible duplicate — same item collected in this region today.');
    }
    if (gps && gps.accuracy > 50) {
      w.push(`⚠ Weak GPS (±${gps.accuracy.toFixed(0)}m). Move to open area for better signal.`);
    }
    setWarnings(w);
  }, [form.item, form.customItem, form.value, form.sector, form.region, gps]);

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const doLogin = async () => {
    if (!loginForm.email) { setLoginErr('Email required'); return; }
    setLoginLoading(true); setLoginErr('');
    try {
      const r = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email:loginForm.email, password:loginForm.password })
      });
      const d = await r.json();
      if (!r.ok) { setLoginErr(d.detail || 'Login failed'); setLoginLoading(false); return; }
      const c = { name:d.user.name, email:d.user.email, token:d.token };
      setCollector(c); localStorage.setItem('afriscout_v2_collector', JSON.stringify(c));
    } catch {
      // Offline fallback — still let them collect
      const c = { name:loginForm.email.split('@')[0], email:loginForm.email, token:null, offline:true };
      setCollector(c); localStorage.setItem('afriscout_v2_collector', JSON.stringify(c));
    }
    setLoginLoading(false);
  };

  const doLogout = () => {
    if (!window.confirm('Log out? Unsynced data stays on this device.')) return;
    localStorage.removeItem('afriscout_v2_collector');
    setCollector(null); setLoginForm({ email:'', password:'' });
  };

  // ── GPS ────────────────────────────────────────────────────────────────────
  const getGPS = () => {
    if (!navigator.geolocation) { alert('GPS not available'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const c = { lat:pos.coords.latitude, lng:pos.coords.longitude, accuracy:pos.coords.accuracy };
        if (c.lat < -5 || c.lat > 5 || c.lng < 33 || c.lng > 42) alert('⚠ GPS outside Kenya bounds — verify.');
        setGps(c); setGpsLoading(false);
      },
      () => { alert('Could not get GPS. Check permissions.'); setGpsLoading(false); },
      { enableHighAccuracy:true, timeout:15000, maximumAge:0 }
    );
  };

  // ── PHOTO ──────────────────────────────────────────────────────────────────
  const handlePhoto = e => {
    const f = e.target.files[0]; if (!f) return;
    if (f.size > 15*1024*1024) { alert('Photo too large. Max 15MB.'); return; }
    const r = new FileReader();
    r.onloadend = () => { setPhoto(r.result); setPhotoLabel(`${f.name} · ${(f.size/1024).toFixed(0)}KB`); };
    r.readAsDataURL(f);
  };

  // ── ITEM SUGGESTIONS ───────────────────────────────────────────────────────
  const suggestions = () => {
    if (!form.sector) return [];
    const all = ITEMS[form.sector] || [];
    if (!itemQ) return all;
    return all.filter(i => i.toLowerCase().includes(itemQ.toLowerCase()));
  };

  // ── VALIDATE ───────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = [];
    if (!form.sector) errs.push('Select a sector');
    if (!form.region) errs.push('Select a region');
    if (mode === 'field') {
      const item = form.item || form.customItem;
      if (!item.trim()) errs.push('Item name required');
      if (!form.value || parseFloat(form.value) <= 0) errs.push('Enter a price greater than 0');
      if (parseFloat(form.value) > 50000000) errs.push('Price too high — please verify');
    }
    if (mode === 'survey' && !survey) errs.push('Select a survey template');
    return errs;
  };

  // ── SAVE ENTRY ─────────────────────────────────────────────────────────────
  const saveEntry = async () => {
    const errs = validate();
    if (errs.length) { alert('⚠ Please fix:\n' + errs.join('\n')); return; }
    setSaving(true);

    const today   = new Date().toISOString().split('T')[0];
    const itemRaw = (form.item || form.customItem).trim();
    const reg     = REGIONS.find(r => r.id === form.region);

    const entry = {
      id:               `${form.sector}_${Date.now()}`,
      date:             today,
      timestamp:        new Date().toISOString(),
      mode,
      category:         form.sector,
      item:             itemRaw.toLowerCase().replace(/\s+/g, '_'),
      item_display:     itemRaw,
      value:            parseFloat(form.value) || 0,
      unit:             form.unit,
      currency:         'KES',
      region:           reg?.name || form.region,
      region_id:        form.region,
      county:           form.market || reg?.name,
      market:           form.market,
      gps:              gps ? `${gps.lat.toFixed(6)},${gps.lng.toFixed(6)}` : null,
      gps_accuracy:     gps?.accuracy ?? null,
      vendor_type:      form.vendorType,
      source:           form.source,
      notes:            form.notes,
      photo,
      photo_label:      photoLabel,
      survey_responses: mode === 'survey' ? surveyR : null,
      confidence_score: mode === 'field' ? 0.95 : 0.85,
      collected_by:     collector?.name,
      collected_by_email: collector?.email,
      synced:           false,
      valid_until:      new Date(Date.now()+180*86400000).toISOString().split('T')[0],
    };
    entry.quality_score = qualityScore(entry);

    setEntries(prev => [...prev, entry]);

    if (todayCnt + 1 >= GOAL_DAY) { setGoalBanner(true); setTimeout(() => setGoalBanner(false), 4000); }

    if (online && collector?.token) {
      const ok = await syncEntry(entry, collector.token);
      if (ok) setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, synced:true } : e));
      else setPending(prev => [...prev, entry]);
    } else {
      setPending(prev => [...prev, entry]);
    }

    // Reset
    setForm(freshForm()); setGps(null); setPhoto(null); setPhotoLabel('');
    setSurvey(null); setSurveyR({}); setItemQ(''); setWarnings([]);
    setSaving(false);
  };

  // ── SYNC ───────────────────────────────────────────────────────────────────
  const syncEntry = async (entry, token) => {
    try {
      const r = await fetch(`${API_BASE}/api/v1/collector/submit`, {
        method:'POST',
        headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
        body: JSON.stringify({
          item:entry.item, value:entry.value, unit:entry.unit, currency:'KES',
          category:entry.category, subcategory: entry.mode==='field'?'field_collected':'survey_data',
          region:entry.region, county:entry.county, gps_coords:entry.gps,
          confidence_score:entry.confidence_score,
          source_name:entry.source, source_type:entry.mode==='field'?'field_observation':'survey',
          vendor_type:entry.vendor_type, context_summary:entry.notes,
          survey_responses:entry.survey_responses, collected_by:entry.collected_by,
          valid_until:entry.valid_until, offline_collected:!online,
        }),
      });
      return r.ok;
    } catch { return false; }
  };

  const autoSync = async () => {
    if (!pending.length || !collector?.token) return;
    setSyncSt('syncing');
    const still = [];
    for (const e of pending) {
      const ok = await syncEntry(e, collector.token);
      if (ok) setEntries(prev => prev.map(x => x.id === e.id ? { ...x, synced:true } : x));
      else still.push(e);
    }
    setPending(still);
    setSyncSt(still.length === 0 ? 'done' : 'error');
    setTimeout(() => setSyncSt('idle'), 3000);
  };

  // ── EXPORT ─────────────────────────────────────────────────────────────────
  const exportJSON = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(entries,null,2)],{type:'application/json'}));
    a.download = `afriscout_${new Date().toISOString().split('T')[0]}.json`; a.click();
  };

  const exportCSV = () => {
    if (!entries.length) { alert('No data to export'); return; }
    const h = ['Date','Mode','Sector','Item','Value','Unit','Region','Market','GPS','GPS_Accuracy_m','Vendor_Type','Source','Quality_Score','Confidence','Synced','Notes'];
    const rows = entries.map(e => [
      e.date, e.mode, e.category, e.item_display||e.item,
      e.value, e.unit, e.region, e.market||'',
      e.gps||'', e.gps_accuracy?.toFixed(0)||'',
      e.vendor_type||'', e.source||'',
      e.quality_score||0, Math.round(e.confidence_score*100)+'%',
      e.synced?'Yes':'No', (e.notes||'').replace(/,/g,';'),
    ]);
    const blob = new Blob([[h,...rows].map(r=>r.join(',')).join('\n')],{type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `afriscout_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  const delEntry = id => {
    if (!window.confirm('Delete this entry?')) return;
    setEntries(entries.filter(e => e.id !== id));
    setPending(pending.filter(e => e.id !== id));
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (!collector) return (
    <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth:360, padding:'0 20px' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:64, height:64, background:'linear-gradient(135deg,#F97316,#c2410c)', borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 12px', boxShadow:'0 0 40px rgba(249,115,22,0.25)' }}>🔥</div>
          <div style={{ fontSize:26, fontWeight:800, color:C.orange, letterSpacing:'-0.5px' }}>AfriScout</div>
          <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>AfriFoundry Field Collector v{APP_VERSION}</div>
        </div>
        <div style={S.card}>
          <div style={S.field}>
            <label style={S.label}>Email</label>
            <input style={S.input} type="email" placeholder="you@email.com"
              value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})}
              onKeyDown={e=>e.key==='Enter'&&doLogin()} />
          </div>
          <div style={{...S.field,marginBottom:20}}>
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" placeholder="••••••••"
              value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})}
              onKeyDown={e=>e.key==='Enter'&&doLogin()} />
          </div>
          {loginErr && <div style={S.err}>{loginErr}</div>}
          <button style={S.btnP} onClick={doLogin} disabled={loginLoading}>
            {loginLoading ? <RefreshCw size={16} style={{animation:'spin 1s linear infinite'}}/> : <User size={16}/>}
            {loginLoading ? 'Connecting...' : 'Start Collecting'}
          </button>
        </div>
        <div style={{ textAlign:'center', fontSize:11, color:'#334155', marginTop:12 }}>
          Works offline · Data syncs automatically · Never loses data
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // DASHBOARD VIEW — MISSION CONTROL
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === 'dashboard') {
    const wd        = weekDates();
    const dayNames  = ['S','M','T','W','T','F','S'];
    const wCounts   = wd.map(d => entries.filter(e=>e.date===d).length);
    const maxDay    = Math.max(...wCounts, 1);
    const todayStr  = new Date().toISOString().split('T')[0];
    const avgQ      = entries.length ? Math.round(entries.reduce((s,e)=>s+(e.quality_score||0),0)/entries.length) : 0;
    const totalPct  = Math.min((entries.length/GOAL_TOTAL)*100, 100);
    const fieldCnt  = entries.filter(e=>e.mode==='field').length;
    const weekTotal = wCounts.reduce((a,b)=>a+b,0);

    // Streak — consecutive days with ≥1 entry going back from today
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(); d.setDate(d.getDate()-i);
      const ds = d.toISOString().split('T')[0];
      if (entries.some(e=>e.date===ds)) streak++;
      else if (i > 0) break;
    }

    // Best day ever
    const dayCounts = {};
    entries.forEach(e=>{ dayCounts[e.date]=(dayCounts[e.date]||0)+1; });
    const bestDay = Math.max(...Object.values(dayCounts), 0);

    // Sector counts
    const secCounts = {};
    entries.forEach(e=>{ secCounts[e.category]=(secCounts[e.category]||0)+1; });
    const topSecs = Object.entries(secCounts).sort((a,b)=>b[1]-a[1]).slice(0,6);
    const coveredSectors = Object.keys(secCounts).length;

    // Regions collected
    const regionCounts = {};
    entries.forEach(e=>{ if(e.region) regionCounts[e.region]=(regionCounts[e.region]||0)+1; });

    // Priority missions — gaps in coverage
    const MISSIONS = [
      { name:'Kisumu CBD',        region:'Kisumu',      icon:'🔴', priority:'CRITICAL', desc:'0 verified datapoints. Western hub.' },
      { name:'Nakuru Town',       region:'Nakuru',      icon:'🔴', priority:'CRITICAL', desc:'Major agri market. Grain prices needed.' },
      { name:'Eldoret CBD',       region:'Eldoret',     icon:'🟠', priority:'HIGH',     desc:'Logistics hub. Transport costs missing.' },
      { name:'Gikomba Market',    region:'Nairobi',     icon:'🟠', priority:'HIGH',     desc:'Needs monthly refresh. Mitumba prices.' },
      { name:'Kongowea Market',   region:'Mombasa',     icon:'🟢', priority:'ACTIVE',   desc:'Good coverage. Quarterly check.' },
      { name:'Eastleigh',         region:'Nairobi',     icon:'🟢', priority:'ACTIVE',   desc:'Retail strong. Add healthcare pricing.' },
    ].map(m => ({
      ...m,
      count: regionCounts[m.region] || 0,
    }));

    // SVG ring for today's goal
    const R = 54, STROKE = 7;
    const circ = 2 * Math.PI * R;
    const dayPct = Math.min(todayCnt / GOAL_DAY, 1);
    const dash   = circ * dayPct;

    // Hour greeting
    const hr = new Date().getHours();
    const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

    return (
      <div style={{ ...S.page, background:'#060610' }}>
        <style>{`
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
          @keyframes ringFill{from{stroke-dashoffset:${circ}}to{stroke-dashoffset:${circ - dash}}}
          @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(249,115,22,0.15)}50%{box-shadow:0 0 35px rgba(249,115,22,0.3)}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
          .dash-row{animation:fadeUp 0.4s ease both}
          .dash-row:nth-child(1){animation-delay:0.05s}
          .dash-row:nth-child(2){animation-delay:0.1s}
          .dash-row:nth-child(3){animation-delay:0.15s}
          .dash-row:nth-child(4){animation-delay:0.2s}
          .dash-row:nth-child(5){animation-delay:0.25s}
          .dash-row:nth-child(6){animation-delay:0.3s}
          .dash-row:nth-child(7){animation-delay:0.35s}
          .mission-card:hover{transform:translateX(2px);transition:transform 0.15s}
        `}</style>
        <div style={S.wrap}>

          {/* HEADER */}
          <div className="dash-row" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 0 20px' }}>
            <div>
              <div style={{ fontSize:11, color:'#475569', fontFamily:'Space Mono,monospace', letterSpacing:'1px', textTransform:'uppercase', marginBottom:3 }}>
                {greeting}, {collector?.name?.split(' ')[0] || 'Collector'}
              </div>
              <div style={{ fontSize:20, fontWeight:800, color:'#e2e8f0', letterSpacing:'-0.5px' }}>Mission Control</div>
            </div>
            <button style={{ ...S.btnG, fontSize:13, color:'#475569' }} onClick={()=>setView('collect')}>← Collect</button>
          </div>

          {/* HERO — Today's goal ring + streak */}
          <div className="dash-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>

            {/* Ring */}
            <div style={{ background:'rgba(249,115,22,0.04)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:20, padding:'20px 16px', display:'flex', flexDirection:'column', alignItems:'center', animation:'glow 3s ease-in-out infinite' }}>
              <div style={{ position:'relative', width:124, height:124, marginBottom:10 }}>
                <svg width="124" height="124" style={{ transform:'rotate(-90deg)' }}>
                  <circle cx="62" cy="62" r={R} fill="none" stroke="rgba(249,115,22,0.1)" strokeWidth={STROKE}/>
                  <circle cx="62" cy="62" r={R} fill="none" stroke={todayCnt>=GOAL_DAY?C.green:C.orange}
                    strokeWidth={STROKE} strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={circ - dash}
                    style={{ transition:'stroke-dashoffset 1s ease', filter:`drop-shadow(0 0 6px ${todayCnt>=GOAL_DAY?C.green:C.orange})` }}
                  />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ fontSize:32, fontWeight:800, color:todayCnt>=GOAL_DAY?C.green:C.orange, letterSpacing:'-1px', lineHeight:1 }}>{todayCnt}</div>
                  <div style={{ fontSize:11, color:'#475569', fontFamily:'Space Mono,monospace' }}>/{GOAL_DAY}</div>
                </div>
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.8px' }}>Today's Goal</div>
              {todayCnt >= GOAL_DAY && <div style={{ fontSize:11, color:C.green, marginTop:4, fontWeight:700 }}>🎉 Crushed it!</div>}
            </div>

            {/* Right stats */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {/* Streak */}
              <div style={{ background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.15)', borderRadius:14, padding:'14px 16px', flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                  <span style={{ fontSize:20 }}>🔥</span>
                  <span style={{ fontSize:28, fontWeight:800, color:'#fbbf24', letterSpacing:'-1px' }}>{streak}</span>
                </div>
                <div style={{ fontSize:10, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>Day Streak</div>
              </div>
              {/* Best day */}
              <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:14, padding:'14px 16px', flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
                <div style={{ fontSize:28, fontWeight:800, color:C.green, letterSpacing:'-1px', lineHeight:1, marginBottom:2 }}>{bestDay}</div>
                <div style={{ fontSize:10, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>Best Day</div>
              </div>
            </div>
          </div>

          {/* 10K MISSION PROGRESS */}
          <div className="dash-row" style={{ background:'linear-gradient(135deg,rgba(249,115,22,0.07),rgba(6,6,16,0))', border:'1px solid rgba(249,115,22,0.12)', borderRadius:16, padding:'16px 18px', marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:10 }}>
              <div>
                <div style={{ fontSize:10, color:'#475569', fontFamily:'Space Mono,monospace', letterSpacing:'1px', textTransform:'uppercase' }}>Operation 10K</div>
                <div style={{ fontSize:24, fontWeight:800, color:C.orange, letterSpacing:'-0.5px', lineHeight:1.1 }}>{entries.length.toLocaleString()}<span style={{ fontSize:13, color:'#475569', fontWeight:400, fontFamily:'Space Mono,monospace' }}> / 10,000</span></div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:22, fontWeight:800, color:'#e2e8f0', letterSpacing:'-0.5px' }}>{totalPct.toFixed(1)}%</div>
                <div style={{ fontSize:10, color:'#475569', fontFamily:'Space Mono,monospace' }}>{(GOAL_TOTAL-entries.length).toLocaleString()} remaining</div>
              </div>
            </div>
            {/* Segmented bar */}
            <div style={{ background:'rgba(0,0,0,0.4)', borderRadius:8, height:12, overflow:'hidden', position:'relative' }}>
              <div style={{ width:totalPct+'%', height:'100%', background:`linear-gradient(90deg,${C.orange},${C.green})`, borderRadius:8, transition:'width 1s ease', boxShadow:`0 0 12px rgba(249,115,22,0.4)` }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontSize:10, color:'#334155', fontFamily:'Space Mono,monospace' }}>
              <span>▪ Field: {fieldCnt}</span>
              <span>▪ Surveys: {entries.length-fieldCnt}</span>
              <span>▪ Sectors: {coveredSectors}/15</span>
              <span>▪ Quality: {avgQ}%</span>
            </div>
          </div>

          {/* WEEKLY RHYTHM */}
          <div className="dash-row" style={{ ...S.card, marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.8px' }}>This Week</div>
              <div style={{ fontSize:12, fontFamily:'Space Mono,monospace', color:C.orange, fontWeight:700 }}>{weekTotal} pts</div>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:100 }}>
              {wd.map((d,i)=>{
                const cnt     = wCounts[i];
                const barPct  = (cnt/maxDay)*100;
                const isToday = d===todayStr;
                const goalMet = cnt >= GOAL_DAY;
                const barColor= goalMet ? C.green : isToday ? C.orange : cnt > 0 ? '#2a3a52' : '#141420';
                return (
                  <div key={d} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                    <div style={{ fontSize:10, fontWeight:700, minHeight:14, color:goalMet?C.green:cnt>0?C.orange:'transparent', fontFamily:'Space Mono,monospace' }}>{cnt||''}</div>
                    <div style={{ width:'100%', background:'#0d0d1a', borderRadius:5, height:74, display:'flex', alignItems:'flex-end', overflow:'hidden', position:'relative' }}>
                      <div style={{ width:'100%', height:Math.max(barPct,4)+'%', background:barColor, borderRadius:5, transition:'height 0.8s cubic-bezier(0.34,1.56,0.64,1)', boxShadow:isToday?`0 0 10px rgba(249,115,22,0.5)`:goalMet?`0 0 8px rgba(16,185,129,0.4)`:'none' }}/>
                      {isToday && <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:C.orange, borderRadius:2 }}/>}
                    </div>
                    <div style={{ fontSize:10, color:isToday?C.orange:'#334155', fontWeight:isToday?800:400, fontFamily:'Space Mono,monospace' }}>{dayNames[new Date(d).getDay()]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NEXT DEPLOYMENT — Priority missions */}
          <div className="dash-row" style={{ marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ width:3, height:16, background:C.orange, borderRadius:2 }}/>
              <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.8px' }}>Next Deployment</div>
            </div>
            {MISSIONS.map((m,i)=>{
              const urgencyColor = m.priority==='CRITICAL'?C.red:m.priority==='HIGH'?C.orange:C.green;
              return (
                <div key={m.name} className="mission-card" style={{ background:'#0a0a18', border:`1px solid ${urgencyColor}22`, borderLeft:`3px solid ${urgencyColor}`, borderRadius:12, padding:'12px 14px', marginBottom:8, display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ fontSize:18, flexShrink:0 }}>{m.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                      <span style={{ fontWeight:700, fontSize:13, color:'#e2e8f0' }}>{m.name}</span>
                      <span style={{ fontSize:9, fontWeight:700, color:urgencyColor, background:urgencyColor+'18', border:`1px solid ${urgencyColor}33`, borderRadius:20, padding:'2px 7px', letterSpacing:'0.5px', flexShrink:0 }}>{m.priority}</span>
                    </div>
                    <div style={{ fontSize:11, color:'#475569', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.desc}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:16, fontWeight:800, color:m.count>0?C.green:'#475569', fontFamily:'Space Mono,monospace' }}>{m.count}</div>
                    <div style={{ fontSize:9, color:'#334155', fontFamily:'Space Mono,monospace' }}>pts</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SECTOR COVERAGE */}
          {topSecs.length > 0 && (
            <div className="dash-row" style={{ ...S.card, marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <div style={{ width:3, height:16, background:C.green, borderRadius:2 }}/>
                <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.8px' }}>Sector Intel</div>
              </div>
              {topSecs.map(([sec,cnt])=>{
                const s   = SECTORS.find(x=>x.id===sec);
                const pct = Math.round((cnt/entries.length)*100);
                return (
                  <div key={sec} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:9 }}>
                    <span style={{ fontSize:16, width:22, flexShrink:0 }}>{s?.icon||'📦'}</span>
                    <span style={{ fontSize:12, color:'#64748b', width:80, flexShrink:0, fontWeight:600 }}>{s?.name||sec}</span>
                    <div style={{ flex:1, background:'#0a0a18', borderRadius:4, height:6, overflow:'hidden' }}>
                      <div style={{ width:pct+'%', height:'100%', background:`linear-gradient(90deg,${C.orange},${C.green})`, borderRadius:4, transition:'width 1s ease' }}/>
                    </div>
                    <span style={{ fontSize:11, color:'#475569', width:28, textAlign:'right', fontFamily:'Space Mono,monospace' }}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* RECENT INTEL */}
          <div className="dash-row" style={S.card}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ width:3, height:16, background:C.blue, borderRadius:2 }}/>
              <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.8px' }}>Recent Intel</div>
            </div>
            {entries.length === 0
              ? <div style={{ textAlign:'center', padding:'20px 0', color:'#334155', fontSize:13 }}>No entries yet — start collecting</div>
              : entries.slice(-5).reverse().map(e=>(
                <div key={e.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#d1d5db', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{e.item_display||e.item.replace(/_/g,' ')}</div>
                    <div style={{ fontSize:10, color:'#475569', marginTop:1 }}>{e.category} · {e.region}{e.market?` · ${e.market}`:''}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0, paddingLeft:10 }}>
                    {e.mode==='field' && <div style={{ fontSize:14, fontWeight:800, color:C.green, fontFamily:'Space Mono,monospace' }}>KES {e.value.toLocaleString()}</div>}
                    <div style={{ fontSize:10, color:'#334155', fontFamily:'Space Mono,monospace' }}>{timeAgo(e.timestamp)}</div>
                  </div>
                </div>
              ))
            }
          </div>

          <div style={{ height:20 }}/>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENTRIES VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === 'entries') return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'18px 0 14px' }}>
          <button style={S.btnG} onClick={()=>setView('collect')}>← Back</button>
          <span style={{ ...S.h1, flex:1 }}>All Entries ({entries.length})</span>
          <button style={S.btnG} onClick={exportJSON}><Download size={15}/> JSON</button>
          <button style={S.btnG} onClick={exportCSV}><Download size={15}/> CSV</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
          {[
            { l:'Field',    v:entries.filter(e=>e.mode==='field').length,   c:C.green },
            { l:'Surveys',  v:entries.filter(e=>e.mode==='survey').length,  c:C.purple },
            { l:'Unsynced', v:entries.filter(e=>!e.synced).length,          c:C.orange },
          ].map(s=>(
            <div key={s.l} style={{ ...S.sm, textAlign:'center', marginBottom:0 }}>
              <div style={{ fontSize:20, fontWeight:800, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:11, color:'#64748b' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {pending.length>0 && online && (
          <div style={{ ...S.card, display:'flex', alignItems:'center', gap:10, background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.2)' }}>
            <span style={{ flex:1, fontSize:13 }}>{pending.length} waiting to sync</span>
            <button style={{ ...S.btnS, padding:'6px 12px', fontSize:12 }} onClick={autoSync}>
              {syncSt==='syncing'?<RefreshCw size={14} style={{animation:'spin 1s linear infinite'}}/>:'Sync Now'}
            </button>
          </div>
        )}

        {entries.length===0
          ? <div style={{ ...S.card, textAlign:'center', padding:'48px 20px' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>📋</div>
              <div style={{ color:'#64748b' }}>No entries yet</div>
              <button style={{ ...S.btnP, marginTop:16 }} onClick={()=>setView('collect')}>Start Collecting</button>
            </div>
          : entries.slice().reverse().map(e=>(
              <div key={e.id} style={S.sm}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:13 }}>{e.mode==='survey'?'📋 Survey':(e.item_display||e.item.replace(/_/g,' '))}</div>
                    <div style={{ fontSize:11, color:'#64748b' }}>{e.category} · {e.region}{e.market?` · ${e.market}`:''}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    {e.mode==='field' && <div style={{ fontSize:16, fontWeight:800, color:C.green }}>KES {e.value.toLocaleString()}</div>}
                    <div style={{ fontSize:10, color:e.synced?C.green:'#64748b' }}>{e.synced?'☁ Synced':'📴 Local'}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={S.pill('#64748b')}>{e.date}</span>
                  {e.gps && <span style={S.pill(C.green)}>📍 ±{e.gps_accuracy?.toFixed(0)||'?'}m</span>}
                  {e.photo && <span style={S.pill(C.purple)}>📸</span>}
                  <span style={S.pill(e.quality_score>=80?C.green:e.quality_score>=60?C.orange:'#64748b')}>Q:{e.quality_score||0}%</span>
                  <button style={{ ...S.btnG, color:C.red, marginLeft:'auto' }} onClick={()=>delEntry(e.id)}><Trash2 size={14}/></button>
                </div>
              </div>
            ))
        }
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === 'settings') return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'18px 0 14px' }}>
          <button style={S.btnG} onClick={()=>setView('collect')}>← Back</button>
          <span style={S.h1}>Settings</span>
        </div>

        <div style={S.card}>
          <div style={S.h2}>Collector</div>
          <div style={{ fontSize:15, fontWeight:700 }}>{collector.name}</div>
          <div style={{ fontSize:12, color:'#64748b', marginBottom:8 }}>{collector.email}</div>
          {collector.offline && <span style={S.pill(C.orange)}>Offline Mode</span>}
        </div>

        <div style={S.card}>
          <div style={S.h2}>Data</div>
          {[['Total entries',entries.length],['Synced',entries.filter(e=>e.synced).length],['Pending sync',pending.length],['Storage',(JSON.stringify(entries).length/1024).toFixed(1)+'KB']].map(([l,v])=>(
            <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color:'#94a3b8' }}>{l}</span>
              <strong style={{ color:l==='Pending sync'&&v>0?C.orange:'#e2e8f0' }}>{v}</strong>
            </div>
          ))}
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:14 }}>
            <button style={{ ...S.btnS, justifyContent:'center' }} onClick={exportJSON}><Download size={16}/>Export JSON</button>
            <button style={{ ...S.btnS, justifyContent:'center' }} onClick={exportCSV}><Download size={16}/>Export CSV</button>
            {pending.length>0&&online && (
              <button style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', color:C.green, borderRadius:10, padding:12, fontWeight:700, cursor:'pointer', fontSize:13 }} onClick={autoSync}>
                ☁ Sync {pending.length} Pending
              </button>
            )}
            <button style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.3)', color:C.red, borderRadius:10, padding:12, fontWeight:700, cursor:'pointer', fontSize:13 }} onClick={()=>{ if(window.confirm('Delete ALL data? Cannot be undone.')){ setEntries([]); setPending([]); }}}>
              🗑 Clear All Data
            </button>
          </div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize:12, color:'#64748b', lineHeight:1.8 }}>
            <strong style={{ color:'#94a3b8' }}>AfriScout v{APP_VERSION}</strong><br/>
            AfriFoundry Field Data Collector<br/>
            15 sectors · 225+ items · Offline-first<br/>
            Mark Gakuya · AfriFoundry Limited
          </div>
        </div>

        <button style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.3)', color:C.red, borderRadius:12, padding:14, fontWeight:700, cursor:'pointer', fontSize:14, width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit' }} onClick={doLogout}>
          <LogOut size={16}/>Log Out
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN COLLECT VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  const pct    = Math.min((todayCnt/GOAL_DAY)*100, 100);
  const reg    = REGIONS.find(r=>r.id===form.region);
  const suggs  = suggestions();
  const qPrev  = previewQuality(gps, photo, form.source, form.vendorType, form.notes);

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* HEADER */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 0 12px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{ width:32, height:32, background:'linear-gradient(135deg,#F97316,#c2410c)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>🔥</div>
              <span style={{ fontSize:19, fontWeight:800, color:C.orange }}>AfriScout</span>
            </div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              <span style={S.pill(online?C.green:C.orange)}>{online?'● Online':'● Offline'}</span>
              {pending.length>0 && <span style={S.pill(C.orange)}>{pending.length} pending</span>}
              {syncSt==='done' && <span style={S.pill(C.green)}>✓ Synced</span>}
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button style={{ ...S.btnS, padding:'8px 10px' }} onClick={()=>setView('dashboard')}><BarChart2 size={18}/></button>
            <button style={{ ...S.btnS, padding:'8px 10px', position:'relative' }} onClick={()=>setView('entries')}>
              <List size={18}/>
              {entries.length>0 && <span style={{ position:'absolute', top:-6, right:-6, background:C.orange, color:'#fff', fontSize:10, fontWeight:700, width:17, height:17, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{entries.length>99?'99+':entries.length}</span>}
            </button>
            <button style={{ ...S.btnS, padding:'8px 10px' }} onClick={()=>setView('settings')}><Settings size={18}/></button>
          </div>
        </div>

        {/* GOAL BAR */}
        <div style={{ ...S.card, background:'linear-gradient(135deg,rgba(249,115,22,0.09),rgba(16,185,129,0.05))', border:'1px solid rgba(249,115,22,0.15)', marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#94a3b8' }}>Today's Goal</span>
            <span style={{ fontSize:12, fontWeight:800, color:todayCnt>=GOAL_DAY?C.green:C.orange }}>{todayCnt} / {GOAL_DAY}</span>
          </div>
          <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:6, height:8, overflow:'hidden' }}>
            <div style={{ width:pct+'%', height:'100%', background:`linear-gradient(90deg,${C.orange},${C.green})`, borderRadius:6, transition:'width 0.6s' }}/>
          </div>
          {todayCnt>=GOAL_DAY && <div style={{ fontSize:11, color:C.green, marginTop:6, fontWeight:700 }}>🎉 Goal done! Keep going.</div>}
        </div>

        {goalBanner && (
          <div style={{ ...S.card, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <Award size={24} color={C.green}/>
            <div>
              <div style={{ fontWeight:700, color:C.green }}>Daily Goal Reached! 🎉</div>
              <div style={{ fontSize:12, color:'#94a3b8' }}>Outstanding field work today.</div>
            </div>
          </div>
        )}

        {/* MODE TOGGLE */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
          {[{id:'field',label:'📍 Field Data',ac:C.orange},{id:'survey',label:'📋 Survey',ac:C.purple}].map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id)}
              style={{ ...S.btnS, justifyContent:'center', padding:12, fontWeight:700, fontSize:14, border:`${mode===m.id?'2':'1'}px solid ${mode===m.id?m.ac:'#2a2a40'}`, color:mode===m.id?m.ac:'#64748b', background:mode===m.id?m.ac+'12':'#1a1a2e' }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* WARNINGS */}
        {warnings.map((w,i)=><div key={i} style={S.warn}>{w}</div>)}

        {/* FORM */}
        <div style={S.card}>

          {/* SECTOR */}
          <div style={S.field}>
            <label style={S.label}>Sector *</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:7 }}>
              {SECTORS.map(s=>(
                <button key={s.id} onClick={()=>{ setForm({...form,sector:s.id,item:'',customItem:''}); setItemQ(''); }}
                  style={{ background:form.sector===s.id?C.orange+'15':'#0a0a14', border:`1px solid ${form.sector===s.id?C.orange:'#2a2a40'}`, borderRadius:9, padding:'8px 4px', cursor:'pointer', color:form.sector===s.id?C.orange:'#64748b', fontSize:11, fontWeight:600, lineHeight:1.3 }}>
                  <div style={{ fontSize:17, marginBottom:2 }}>{s.icon}</div>{s.name}
                </button>
              ))}
            </div>
          </div>

          {/* REGION */}
          <div style={S.field}>
            <label style={S.label}>Region *</label>
            <select style={S.select} value={form.region} onChange={e=>setForm({...form,region:e.target.value,market:''})}>
              <option value="">Select region...</option>
              {REGIONS.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {/* MARKET CHIPS */}
          {reg && (
            <div style={S.field}>
              <label style={S.label}>Market / Area</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {reg.markets.map(m=>(
                  <button key={m} onClick={()=>setForm({...form,market:m})}
                    style={{ background:form.market===m?C.orange+'15':'#0a0a14', border:`1px solid ${form.market===m?C.orange:'#2a2a40'}`, borderRadius:20, padding:'4px 12px', cursor:'pointer', color:form.market===m?C.orange:'#64748b', fontSize:12, fontWeight:600 }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── FIELD MODE ── */}
          {mode==='field' && <>
            <div style={S.field}>
              <label style={S.label}>Item * {form.sector&&<span style={{ color:'#475569', textTransform:'none', fontWeight:400 }}>— {(ITEMS[form.sector]||[]).length} options</span>}</label>
              {form.sector && (
                <>
                  <input style={{ ...S.input, marginBottom:6 }} placeholder={`Search ${form.sector} items...`}
                    value={itemQ} onChange={e=>setItemQ(e.target.value)} />
                  {suggs.length>0 && (
                    <div style={{ background:'#0a0a14', border:'1px solid #2a2a40', borderRadius:10, maxHeight:160, overflowY:'auto', marginBottom:6 }}>
                      {suggs.slice(0,25).map(item=>(
                        <div key={item} onClick={()=>{ setForm({...form,item,customItem:''}); setItemQ(item); }}
                          style={{ padding:'9px 14px', cursor:'pointer', fontSize:13, color:form.item===item?C.orange:'#94a3b8', background:form.item===item?C.orange+'10':'transparent', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              <input style={S.input} placeholder="Or type custom item name..."
                value={form.customItem} onChange={e=>setForm({...form,customItem:e.target.value,item:''})} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:10, ...S.field }}>
              <div>
                <label style={S.label}>Price / Value *</label>
                <input style={S.input} type="number" min="0" placeholder="e.g. 1800"
                  value={form.value} onChange={e=>setForm({...form,value:e.target.value})} />
              </div>
              <div>
                <label style={S.label}>Unit</label>
                <select style={S.select} value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}>
                  {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, ...S.field }}>
              <div>
                <label style={S.label}>Vendor Type</label>
                <select style={S.select} value={form.vendorType} onChange={e=>setForm({...form,vendorType:e.target.value})}>
                  <option value="">Select...</option>
                  {VENDOR_TYPES.map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Vendor Name</label>
                <input style={S.input} placeholder="e.g. Mama Caro's" value={form.source} onChange={e=>setForm({...form,source:e.target.value})} />
              </div>
            </div>
          </>}

          {/* ── SURVEY MODE ── */}
          {mode==='survey' && <>
            <div style={S.field}>
              <label style={S.label}>Survey Template *</label>
              {SURVEY_TEMPLATES.map(t=>(
                <button key={t.id} onClick={()=>{ setSurvey(t); setSurveyR({}); }}
                  style={{ width:'100%', background:survey?.id===t.id?C.orange+'12':'#0a0a14', border:`1px solid ${survey?.id===t.id?C.orange:'#2a2a40'}`, borderRadius:10, padding:'10px 14px', cursor:'pointer', textAlign:'left', color:survey?.id===t.id?C.orange:'#94a3b8', fontWeight:600, fontSize:13, marginBottom:6, fontFamily:'inherit' }}>
                  {t.icon} {t.name}
                </button>
              ))}
            </div>
            {survey && survey.questions.map(q=>(
              <div key={q.id} style={S.field}>
                <label style={S.label}>{q.text}{q.unit?` (${q.unit})`:''}</label>
                {q.type==='text'   && <input  style={S.input}  onChange={e=>setSurveyR({...surveyR,[q.id]:e.target.value})} />}
                {q.type==='number' && <input  style={S.input} type="number" onChange={e=>setSurveyR({...surveyR,[q.id]:e.target.value})} />}
                {q.type==='select' && <select style={S.select} onChange={e=>setSurveyR({...surveyR,[q.id]:e.target.value})}>
                  <option value="">Select...</option>
                  {q.options.map(o=><option key={o} value={o}>{o}</option>)}
                </select>}
              </div>
            ))}
          </>}

          {/* NOTES */}
          <div style={S.field}>
            <label style={S.label}>Notes / Observations</label>
            <textarea style={S.ta} placeholder="Seasonal price? Shortage? Anything unusual..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
          </div>

          {/* GPS */}
          <div style={S.field}>
            <label style={S.label}>GPS Location</label>
            <div style={{ display:'flex', gap:8 }}>
              <div style={{ flex:1, background:'#0a0a14', border:`1px solid ${gps?(gps.accuracy<10?C.green:gps.accuracy<50?C.orange:C.red):'#2a2a40'}`, borderRadius:10, padding:'11px 14px', fontSize:13, color:gps?C.green:'#475569' }}>
                {gps ? `✓ ${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)} · ±${gps.accuracy.toFixed(0)}m` : 'No GPS yet'}
              </div>
              <button style={{ ...S.btnS, padding:'0 14px', flexShrink:0 }} onClick={getGPS} disabled={gpsLoading}>
                {gpsLoading?<RefreshCw size={16} style={{animation:'spin 1s linear infinite'}}/>:<MapPin size={16}/>} GPS
              </button>
            </div>
            {gps && <div style={{ fontSize:10, marginTop:4, color:gps.accuracy<10?C.green:gps.accuracy<50?C.orange:C.red }}>
              {gps.accuracy<10?'✓ Excellent (<10m)':gps.accuracy<50?'⚠ Moderate — acceptable':'⚠ Weak signal — move to open area'}
            </div>}
          </div>

          {/* PHOTO */}
          <div style={{ ...S.field, marginBottom:20 }}>
            <label style={S.label}>Photo Evidence {mode==='field'?'(Recommended)':''}</label>
            <label style={{ ...S.btnS, cursor:'pointer', justifyContent:'center', width:'100%', boxSizing:'border-box', borderStyle:photo?'solid':'dashed', borderColor:photo?C.green:'#2a2a40', color:photo?C.green:'#64748b' }}>
              <Camera size={16}/>
              {photo ? `✓ ${photoLabel}` : 'Capture / Choose Photo'}
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display:'none' }}/>
            </label>
            {photo && <div style={{ fontSize:10, color:'#64748b', marginTop:4 }}>Make sure price is clearly visible. No blur.</div>}
          </div>

          {/* QUALITY PREVIEW */}
          {(form.sector&&form.region) && (
            <div style={{ ...S.sm, display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <Shield size={16} color={C.orange}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>Quality score preview</div>
                <div style={{ background:'#0a0a14', borderRadius:4, height:5, overflow:'hidden' }}>
                  <div style={{ width:qPrev+'%', height:'100%', background:`linear-gradient(90deg,${C.orange},${C.green})`, borderRadius:4 }}/>
                </div>
              </div>
              <div style={{ fontSize:14, fontWeight:800, color:qPrev>=80?C.green:qPrev>=60?C.orange:C.red, fontFamily:'Space Mono,monospace' }}>{qPrev}%</div>
            </div>
          )}

          {/* SAVE */}
          <button style={S.btnP} onClick={saveEntry} disabled={saving}>
            {saving?<RefreshCw size={18} style={{animation:'spin 1s linear infinite'}}/>:<Save size={18}/>}
            {saving?'Saving...': `Save ${mode==='field'?'Field Data':'Survey'}`}
          </button>

          {syncSt!=='idle' && (
            <div style={{ textAlign:'center', fontSize:12, marginTop:10, color:syncSt==='done'?C.green:syncSt==='error'?C.red:C.orange }}>
              {syncSt==='syncing'&&'☁ Syncing to AfriFoundry...'}
              {syncSt==='done'&&'✅ Synced to server'}
              {syncSt==='error'&&'⚠ Some entries failed — will retry automatically'}
            </div>
          )}
        </div>

        {/* QUICK STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[{l:'Total',v:entries.length,c:C.orange},{l:'Field',v:entries.filter(e=>e.mode==='field').length,c:C.green},{l:'Surveys',v:entries.filter(e=>e.mode==='survey').length,c:C.purple}].map(s=>(
            <div key={s.l} style={{ ...S.sm, textAlign:'center', marginBottom:0 }}>
              <div style={{ fontSize:20, fontWeight:800, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:11, color:'#64748b' }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center', fontSize:11, color:'#334155', marginTop:16 }}>
          AfriScout v{APP_VERSION} · 15 sectors · 225+ items · Offline-first
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
