/* TWA Weather Data Marketplace — interactive prototype (no framework) */
'use strict';

/* ---------------- mock data ---------------- */
const PLANS = [
  {id:'starter',name:'Starter',period:'monthly',users:5,products:3,downloads:100,api:10000,storage:'5 GB'},
  {id:'pro',name:'Professional',period:'monthly',users:25,products:10,downloads:1000,api:100000,storage:'50 GB'},
  {id:'ent',name:'Enterprise',period:'annual',users:'Custom',products:'All',downloads:'Unlimited',api:'Custom',storage:'Custom'},
];
const CATEGORIES=['Precipitation','Cyclone & Storm','Sea Surface Temp','Wind & Pressure','Humidity','Satellite Imagery'];
const REGIONS=['SE Asia','South Asia','West Pacific','Indian Ocean','Caribbean','Global Tropics'];
const PRODUCTS=[
  {id:'dp-rain-sea',title:'Tropical Rainfall — SE Asia',cat:'Precipitation',region:'SE Asia',time:'2015–2026',vars:['precip_rate','accumulation'],datasets:6,entitled:true},
  {id:'dp-cyclone-wp',title:'Cyclone Tracks — West Pacific',cat:'Cyclone & Storm',region:'West Pacific',time:'2000–2026',vars:['track','intensity','radius'],datasets:9,entitled:true},
  {id:'dp-sst-io',title:'Sea Surface Temp — Indian Ocean',cat:'Sea Surface Temp',region:'Indian Ocean',time:'2010–2026',vars:['sst','anomaly'],datasets:4,entitled:true},
  {id:'dp-wind-sa',title:'Wind & Pressure — South Asia',cat:'Wind & Pressure',region:'South Asia',time:'2012–2026',vars:['u_wind','v_wind','mslp'],datasets:5,entitled:false},
  {id:'dp-hum-gt',title:'Humidity Profiles — Global Tropics',cat:'Humidity',region:'Global Tropics',time:'2018–2026',vars:['rh','specific_humidity'],datasets:3,entitled:false},
  {id:'dp-sat-carib',title:'Satellite Imagery — Caribbean',cat:'Satellite Imagery',region:'Caribbean',time:'2016–2026',vars:['ir','visible'],datasets:7,entitled:true},
];
const VERSIONS=[
  {v:'v2026.06',date:'2026-06-15',status:'published',size:'1.4 GB'},
  {v:'v2026.05',date:'2026-05-15',status:'published',size:'1.3 GB'},
  {v:'v2026.04',date:'2026-04-15',status:'deprecated',size:'1.3 GB'},
];
const MEMBERS=[
  {name:'Jaya Kranthi',email:'jk@acme.io',role:'Org Admin',status:'active',last:'2h ago'},
  {name:'Maria Cruz',email:'maria@acme.io',role:'User',status:'active',last:'1d ago'},
  {name:'Tom Reyes',email:'tom@acme.io',role:'User',status:'invited',last:'—'},
  {name:'Lena Park',email:'lena@acme.io',role:'User',status:'deactivated',last:'30d ago'},
];
const ORGS=[
  {name:'Acme Insurance',status:'active',plan:'Professional',members:18,term:'2026-12-01'},
  {name:'AgriTrade Co',status:'expiring_soon',plan:'Starter',members:4,term:'2026-07-02'},
  {name:'Pacific Shipping',status:'active',plan:'Enterprise',members:42,term:'2027-01-15'},
  {name:'Delta Energy',status:'suspended',plan:'Professional',members:11,term:'2026-05-30'},
  {name:'Reef Labs',status:'pending',plan:'—',members:0,term:'—'},
];
const JOBS=[
  {product:'Tropical Rainfall — SE Asia',v:'v2026.06',pushed:'2026-06-15 02:11',status:'published'},
  {product:'Cyclone Tracks — West Pacific',v:'v2026.06',pushed:'2026-06-15 02:30',status:'validated'},
  {product:'SST — Indian Ocean',v:'v2026.06',pushed:'2026-06-15 02:44',status:'failed'},
  {product:'Humidity — Global Tropics',v:'v2026.06',pushed:'2026-06-15 03:01',status:'partial'},
];
const ACTIVITY=[
  {t:'2026-06-18 09:12',actor:'Maria Cruz',action:'download',entity:'Tropical Rainfall v2026.06',result:'ok'},
  {t:'2026-06-18 08:40',actor:'API key ••3f9',action:'api-fetch',entity:'Cyclone Tracks v2026.06',result:'ok'},
  {t:'2026-06-17 16:22',actor:'Jaya Kranthi',action:'key-generate',entity:'consumption key',result:'ok'},
];
const NOTIFS=[
  {ico:'✅',title:'Subscription renewed',body:'Acme Insurance — Professional, through 2026-12-01',time:'2h',unread:true},
  {ico:'⬆️',title:'New version published',body:'Tropical Rainfall — SE Asia v2026.06 is available',time:'1d',unread:true},
  {ico:'⏰',title:'Plan expiring soon',body:'Your plan expires in 14 days — request a renewal',time:'2d',unread:true},
];
const APPROVALS=[
  {org:'Reef Labs',tier:'Starter',submitted:'2026-06-17',type:'Org application'},
  {org:'Acme Insurance',tier:'Enterprise',submitted:'2026-06-16',type:'Plan-change request'},
];

/* ---------------- nav config ---------------- */
const NAV={
  user:[
    {sec:'Workspace',items:[['#/dashboard','📊 Dashboard'],['#/catalog','🗂️ Catalog'],['#/search','🔍 Search'],['#/activity','🕑 My Activity']]},
    {sec:'Account',items:[['#/api-keys','🔑 API Keys'],['#/notifications','🔔 Notifications'],['#/settings','⚙️ Settings']]},
  ],
  orgadmin:[
    {sec:'Workspace',items:[['#/dashboard','📊 Dashboard'],['#/catalog','🗂️ Catalog'],['#/search','🔍 Search']]},
    {sec:'Organization',items:[['#/org/members','👥 Members'],['#/org/subscription','💳 Subscription'],['#/org/api-keys','🔑 API Keys'],['#/org/activity','🕑 Org Activity']]},
    {sec:'Account',items:[['#/notifications','🔔 Notifications'],['#/settings','⚙️ Settings']]},
  ],
  superadmin:[
    {sec:'Platform',items:[['#/admin/dashboard','📊 Dashboard'],['#/admin/approvals','✅ Approvals'],['#/admin/orgs','🏢 Organizations']]},
    {sec:'Catalog & Data',items:[['#/admin/catalog','🗂️ Catalog Authoring'],['#/admin/ingestion','📥 Ingestion'],['#/admin/plans','💳 Plans'],['#/admin/categories','🏷️ Categories'],['#/admin/keys','🔑 Ingestion Keys']]},
    {sec:'Governance',items:[['#/admin/audit','📜 Audit'],['#/settings','⚙️ Settings']]},
  ],
};
const HOME={user:'#/dashboard',orgadmin:'#/dashboard',superadmin:'#/admin/dashboard'};

/* ---------------- state + helpers ---------------- */
let role=localStorage.getItem('twa-role')||'user';
const $=s=>document.querySelector(s);
const el=(h)=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild;};
const pill=(s)=>{const m={active:'green',published:'green',ok:'green',pending:'blue',validated:'blue',invited:'blue',expiring_soon:'amber',partial:'amber',deprecated:'gray',archived:'gray',suspended:'red',expired:'red',failed:'red',rejected:'red',deactivated:'gray'};return `<span class="badge ${m[s]||'gray'}">${s.replace('_',' ')}</span>`;};
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.remove('hidden');setTimeout(()=>t.classList.add('hidden'),2200);}
function openModal(title,bodyHtml,foot){const m=$('#modal');m.innerHTML=`<div class="dlg-head">${title}</div><div class="dlg-body">${bodyHtml}</div><div class="dlg-foot">${foot}</div>`;m.showModal();m.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>m.close());}

/* ---------------- view renderers ---------------- */
const tile=(label,value,asof,href)=>`<div class="card tile"><div class="label">${label}</div><div class="value">${value}</div><div class="asof">${asof||''} ${href?`· <a href="${href}">view</a>`:''}</div></div>`;

const V={};
V['#/dashboard']=()=>{
  const orgBanner = role==='orgadmin'?`<div class="banner warn">Your plan (Professional) expires in 14 days. <a href="#/org/subscription">Request renewal →</a></div>`:'';
  return `${orgBanner}<div class="spread"><h1>Welcome back, Jaya</h1></div>
  <div class="grid tiles">
    ${tile('My downloads (this period)','37','data as of 2h ago','#/activity')}
    ${tile('Entitled data products','4','','#/catalog')}
    ${tile('API calls (this period)','12,480','of 100,000','#/org/api-keys')}
  </div>
  <h2 style="margin-top:24px">New for you</h2>
  <div class="card"><table><thead><tr><th>Data product</th><th>Version</th><th>Published</th><th></th></tr></thead><tbody>
    ${PRODUCTS.filter(p=>p.entitled).slice(0,3).map(p=>`<tr><td>${p.title}</td><td class="mono">v2026.06</td><td>2026-06-15</td><td><a href="#/catalog/${p.id}">Open</a></td></tr>`).join('')}
  </tbody></table></div>`;
};

V['#/catalog']=()=>{
  const cards=PRODUCTS.map(p=>{
    if(!p.entitled){
      const cta = role==='orgadmin' ? `<a class="btn sm secondary" href="#/org/subscription">Request access</a>` : `<span class="faint">Plan-limited — contact your Org Admin</span>`;
      return `<div class="card dp-card masked"><div class="spread" style="margin:0"><strong>${p.title}</strong><span class="lock">🔒</span></div><div class="meta"><span class="badge">${p.cat}</span><span>${p.region}</span><span>${p.time}</span></div><div>${cta}</div></div>`;
    }
    return `<div class="card dp-card"><strong>${p.title}</strong><div class="meta"><span class="badge blue">${p.cat}</span><span>📍 ${p.region}</span><span>🗓 ${p.time}</span><span>${p.datasets} datasets</span></div><div class="faint">${p.vars.join(', ')}</div><div><a class="btn sm" href="#/catalog/${p.id}">Open</a></div></div>`;
  }).join('');
  return `<div class="spread"><h1>Catalog</h1><span class="muted">${PRODUCTS.length} data products</span></div>
  <div class="filterbar">
    <div class="maplike" style="flex:1 1 100%">🗺️ Region map — click to filter (prototype)</div>
    <div class="row" style="flex:1 1 100%">
      ${REGIONS.map((r,i)=>`<span class="chip ${i===0?'on':''}">${r}</span>`).join('')}
    </div>
    <div class="row" style="flex:1 1 100%">
      <select class="ctrl"><option>All categories</option>${CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select>
      <input class="ctrl" type="month" value="2026-06" aria-label="From"> <span class="muted">to</span> <input class="ctrl" type="month" value="2026-06" aria-label="To">
      <select class="ctrl" aria-label="Granularity"><option>Daily</option><option>Hourly</option><option>Monthly</option></select>
    </div>
  </div>
  <div class="grid cards">${cards}</div>
  <div class="spread" style="margin-top:16px"><span class="faint">Showing 1–6 of 6</span><div class="row"><button class="btn sm secondary" disabled>Prev</button><button class="btn sm secondary" disabled>Next</button></div></div>`;
};

V['#/catalog/:id']=(id)=>{
  const p=PRODUCTS.find(x=>x.id===id)||PRODUCTS[0];
  if(!p.entitled) return `<div class="banner danger">🔒 Your plan doesn't include “${p.title}”. ${role==='orgadmin'?'<a href="#/org/subscription">Request access →</a>':'Contact your Org Admin.'}</div><a href="#/catalog">← Back to catalog</a>`;
  return `<a href="#/catalog">← Catalog</a><div class="spread"><h1>${p.title}</h1>${pill('published')}</div>
  <div class="meta muted row"><span class="badge blue">${p.cat}</span><span>📍 ${p.region}</span><span>🗓 ${p.time}</span></div>
  <div class="grid" style="grid-template-columns:2fr 1fr;margin-top:16px">
    <div class="card"><h3>Datasets & versions</h3><table><thead><tr><th>Version</th><th>Ingested</th><th>Status</th><th class="num">Size</th><th></th></tr></thead><tbody>
      ${VERSIONS.map(v=>`<tr><td class="mono">${v.v}</td><td>${v.date}</td><td>${pill(v.status)}</td><td class="num">${v.size}</td><td>${v.status==='deprecated'?'<span class="faint">deprecated</span>':`<button class="btn sm" onclick="dl()">Download</button>`}</td></tr>`).join('')}
    </tbody></table></div>
    <div class="card"><h3>Metadata</h3><p class="faint">Variables</p><div class="row">${p.vars.map(v=>`<span class="badge">${v}</span>`).join('')}</div>
      <p class="faint" style="margin-top:12px">Update cadence</p><div>Monthly</div>
      <p class="faint" style="margin-top:12px">Lineage</p><div class="muted">Curated from Phantom raw satellite feeds (push-ingested).</div></div>
  </div>`;
};

V['#/search']=()=>`<div class="spread"><h1>Search</h1></div>
  <div class="card"><div class="field"><label>Natural-language query</label><input class="ctrl" value="rainfall over the Philippines last monsoon season"></div>
  <div class="row" style="margin-top:10px"><span class="faint">Interpreted filters:</span><span class="chip on">📍 SE Asia</span><span class="chip on">🗓 Jun–Nov 2025</span><span class="chip on">precip_rate</span><span class="chip on">Precipitation</span></div>
  <p class="faint" style="margin-top:8px">Results are filtered to your entitlements.</p></div>
  <div class="grid cards" style="margin-top:16px">${PRODUCTS.filter(p=>p.entitled&&p.cat==='Precipitation').map(p=>`<div class="card dp-card"><strong>${p.title}</strong><div class="meta"><span class="badge blue">${p.cat}</span><span>${p.region}</span></div><a class="btn sm" href="#/catalog/${p.id}">Open</a></div>`).join('')||'<div class="empty"><div class="ico">🔍</div>No datasets match — try broadening the query.</div>'}</div>`;

const actTable=(rows)=>`<div class="card"><div class="spread" style="margin:0 0 8px"><div class="row"><select class="ctrl"><option>All actions</option><option>download</option><option>api-fetch</option></select><input class="ctrl" type="month" value="2026-06"></div><button class="btn sm secondary" onclick="toastCsv()">Export CSV</button></div>
  <table><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>Result</th></tr></thead><tbody>${rows.map(a=>`<tr><td class="mono">${a.t}</td><td>${a.actor}</td><td>${a.action}</td><td>${a.entity}</td><td>${pill(a.result)}</td></tr>`).join('')}</tbody></table></div>`;
V['#/activity']=()=>`<h1>My Activity</h1>${actTable(ACTIVITY)}`;
V['#/org/activity']=()=>`<h1>Organization Activity</h1>${actTable(ACTIVITY)}`;

const keyList=(scope)=>`<div class="spread"><h1>${scope} API Keys</h1><button class="btn" onclick="genKey()">+ Generate key</button></div>
  <div class="banner info">Keys draw from your org's shared quota pool (Professional: 100,000 API calls/mo). Usage counts are per-key for attribution.</div>
  <div class="card"><table><thead><tr><th>Name</th><th>Key</th><th>Scope</th><th class="num">Usage</th><th>Last used</th><th></th></tr></thead><tbody>
    <tr><td>prod-ingest-reader</td><td class="mono">twa_••••3f9</td><td>org entitlements</td><td class="num">8,210</td><td>2h ago</td><td><button class="btn sm danger" onclick="confirmRevoke()">Revoke</button></td></tr>
    <tr><td>analytics-pipeline</td><td class="mono">twa_••••a17</td><td>org entitlements</td><td class="num">4,270</td><td>1d ago</td><td><button class="btn sm danger" onclick="confirmRevoke()">Revoke</button></td></tr>
  </tbody></table></div>`;
V['#/api-keys']=()=>keyList('My');
V['#/org/api-keys']=()=>keyList('Organization');

V['#/notifications']=()=>`<div class="spread"><h1>Notifications</h1><div class="row"><span class="chip on">All</span><span class="chip">Unread</span></div></div>
  <div class="card" style="padding:0">${NOTIFS.map(n=>`<div style="display:flex;gap:12px;padding:14px;border-bottom:1px solid var(--border)"><div style="font-size:1.2rem">${n.ico}</div><div style="flex:1"><strong>${n.title}</strong> ${n.unread?'<span class="badge blue">new</span>':''}<div class="muted">${n.body}</div></div><div class="faint">${n.time}</div></div>`).join('')}</div>`;

V['#/settings']=()=>`<h1>Settings</h1>
  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))">
    <div class="card"><h3>Profile</h3><div class="field"><label>Name</label><input class="ctrl" value="Jaya Kranthi"></div><div class="field"><label>Email</label><input class="ctrl" value="jk@acme.io" disabled></div><button class="btn sm" style="margin-top:8px" onclick="toast('Profile saved')">Save</button></div>
    <div class="card"><h3>Password</h3><div class="field"><label>Current</label><input class="ctrl" type="password"></div><div class="field"><label>New</label><input class="ctrl" type="password"></div><button class="btn sm" style="margin-top:8px" onclick="toast('Password updated')">Update</button></div>
    <div class="card"><h3>Notification preferences</h3><label class="row"><input type="checkbox" checked> Subscription &amp; renewals</label><label class="row"><input type="checkbox" checked> New versions published</label><label class="row"><input type="checkbox"> Marketing</label></div>
    <div class="card"><h3>Danger zone</h3><p class="faint">Deactivating your account is irreversible.</p><button class="btn sm danger" onclick="confirmDeactivate()">Deactivate account</button></div>
  </div>`;

V['#/org/members']=()=>`<div class="spread"><h1>Members</h1><button class="btn" onclick="inviteModal()">+ Invite member</button></div>
  <div class="banner warn">18 of 25 seats used (Professional plan).</div>
  <div class="card"><div class="row" style="margin-bottom:8px"><input class="ctrl" placeholder="Search members…"><select class="ctrl"><option>All roles</option><option>Org Admin</option><option>User</option></select></div>
  <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last active</th><th></th></tr></thead><tbody>
    ${MEMBERS.map(m=>`<tr><td>${m.name}</td><td class="muted">${m.email}</td><td><span class="badge ${m.role==='Org Admin'?'blue':''}">${m.role}</span></td><td>${pill(m.status)}</td><td class="faint">${m.last}</td><td><button class="btn sm ghost" onclick="memberActions('${m.name}')">⋯</button></td></tr>`).join('')}
  </tbody></table></div>`;

V['#/org/subscription']=()=>{
  const used={users:18,umax:25,dl:740,dlmax:1000,api:12480,apimax:100000};
  const bar=(u,m)=>`<div class="usagebar"><span style="width:${Math.round(u/m*100)}%"></span></div>`;
  return `<h1>Subscription</h1>
  <div class="grid" style="grid-template-columns:1fr 1fr">
    <div class="card"><div class="spread" style="margin:0"><h3 style="margin:0">Professional</h3>${pill('expiring_soon')}</div>
      <p class="muted">Monthly · term ends <strong>2026-07-02</strong> (14 days)</p>
      <button class="btn" onclick="upgradeModal()">Request upgrade</button>
      <p class="faint" style="margin-top:8px">Plan changes are assigned by TWA on approval (no online payment).</p></div>
    <div class="card"><h3>Entitlement usage</h3>
      <p class="faint">Seats ${used.users}/${used.umax}</p>${bar(used.users,used.umax)}
      <p class="faint" style="margin-top:10px">Downloads ${used.dl}/${used.dlmax} · resets 2026-07-01</p>${bar(used.dl,used.dlmax)}
      <p class="faint" style="margin-top:10px">API calls ${used.api.toLocaleString()}/${used.apimax.toLocaleString()}</p>${bar(used.api,used.apimax)}
      <p class="faint" style="margin-top:12px">Entitled products</p><div class="row">${PRODUCTS.filter(p=>p.entitled).map(p=>`<span class="badge green">${p.title.split(' — ')[0]}</span>`).join('')}</div></div>
  </div>`;
};

/* ---- Super Admin ---- */
V['#/admin/dashboard']=()=>`<h1>Platform Dashboard</h1>
  <div class="grid tiles">
    ${tile('Pending approvals','2','','#/admin/approvals')}
    ${tile('Active orgs','3','of 5 total','#/admin/orgs')}
    ${tile('Ingestion (7d)','2 failed','data as of 1h ago','#/admin/ingestion')}
    ${tile('Subscriptions expiring','1','next 30 days','#/admin/orgs')}
    ${tile('Access requests','1','','#/admin/approvals')}
  </div>
  <h2 style="margin-top:24px">Top data products (downloads)</h2>
  <div class="card"><table><thead><tr><th>Data product</th><th class="num">Downloads (30d)</th></tr></thead><tbody>
    ${PRODUCTS.slice(0,4).map((p,i)=>`<tr><td>${p.title}</td><td class="num">${(900-i*180)}</td></tr>`).join('')}
  </tbody></table></div>`;

V['#/admin/approvals']=()=>`<h1>Approvals</h1>
  <div class="tabs"><span class="tab on">Org applications</span><span class="tab">Plan-change requests</span></div>
  <div class="card"><table><thead><tr><th>Type</th><th>Org</th><th>Requested tier</th><th>Submitted</th><th></th></tr></thead><tbody>
    ${APPROVALS.map(a=>`<tr><td>${a.type}</td><td><strong>${a.org}</strong></td><td>${a.tier}</td><td>${a.submitted}</td><td><button class="btn sm" onclick="reviewModal('${a.org}','${a.tier}')">Review</button></td></tr>`).join('')}
  </tbody></table></div>`;

V['#/admin/orgs']=()=>`<div class="spread"><h1>Organizations</h1><select class="ctrl"><option>All statuses</option><option>expiring_soon</option><option>suspended</option></select></div>
  <div class="card"><table><thead><tr><th>Organization</th><th>Status</th><th>Plan</th><th class="num">Members</th><th>Term ends</th><th></th></tr></thead><tbody>
    ${ORGS.map(o=>`<tr><td><strong>${o.name}</strong></td><td>${pill(o.status)}</td><td>${o.plan}</td><td class="num">${o.members}</td><td>${o.term}</td><td><button class="btn sm secondary" onclick="orgDrawer('${o.name}','${o.status}')">Manage</button></td></tr>`).join('')}
  </tbody></table></div>`;

V['#/admin/catalog']=()=>`<div class="spread"><h1>Catalog Authoring</h1><button class="btn" onclick="productModal()">+ New data product</button></div>
  <div class="card"><table><thead><tr><th>Data product</th><th>Category</th><th>Mapped tiers</th><th class="num">Datasets</th><th>Lifecycle</th><th></th></tr></thead><tbody>
    ${PRODUCTS.map(p=>`<tr><td>${p.title}</td><td><span class="badge">${p.cat}</span></td><td>${p.entitled?'Starter, Pro, Ent':'Pro, Ent'}</td><td class="num">${p.datasets}</td><td>${pill('published')}</td><td><button class="btn sm ghost" onclick="productModal('${p.title}')">Edit</button></td></tr>`).join('')}
  </tbody></table><p class="faint" style="padding:8px">Datasets are populated by push ingestion — not linked here.</p></div>`;

V['#/admin/ingestion']=()=>`<h1>Ingestion Console</h1>
  <div class="card"><div class="row" style="margin-bottom:8px"><select class="ctrl"><option>All statuses</option><option>failed</option><option>validated</option></select></div>
  <table><thead><tr><th>Data product</th><th>Version</th><th>Pushed</th><th>Status</th><th></th></tr></thead><tbody>
    ${JOBS.map(j=>`<tr><td>${j.product}</td><td class="mono">${j.v}</td><td class="mono">${j.pushed}</td><td>${pill(j.status)}</td><td>${j.status==='validated'?'<button class="btn sm" onclick="toast(\'Version published\')">Publish</button>':(j.status==='failed'||j.status==='partial')?'<button class="btn sm secondary" onclick="errDrawer()">View error</button>':''}</td></tr>`).join('')}
  </tbody></table></div>`;

V['#/admin/plans']=()=>`<div class="spread"><h1>Plan Management</h1><button class="btn" onclick="planModal()">+ New plan</button></div>
  <div class="card"><table><thead><tr><th>Plan</th><th>Period</th><th class="num">Users</th><th class="num">Products</th><th class="num">Downloads/mo</th><th class="num">API/mo</th><th></th></tr></thead><tbody>
    ${PLANS.map(p=>`<tr><td><strong>${p.name}</strong></td><td>${p.period}</td><td class="num">${p.users}</td><td class="num">${p.products}</td><td class="num">${p.downloads}</td><td class="num">${p.api.toLocale?p.api.toLocaleString():p.api}</td><td><button class="btn sm ghost" onclick="planModal('${p.name}')">Edit</button></td></tr>`).join('')}
  </tbody></table></div>`;

V['#/admin/categories']=()=>`<div class="spread"><h1>Categories</h1><button class="btn" onclick="openModal('New category','<div class=field><label>Name</label><input class=ctrl></div>','<button class=\\'btn secondary\\' data-close>Cancel</button><button class=\\'btn\\' data-close onclick=toast(\\'Category added\\')>Add</button>')">+ Add</button></div>
  <div class="card"><table><tbody>${CATEGORIES.map(c=>`<tr><td>🏷️ ${c}</td><td style="text-align:right"><button class="btn sm ghost">Edit</button></td></tr>`).join('')}</tbody></table></div>`;

V['#/admin/keys']=()=>`<div class="spread"><h1>Ingestion API Keys</h1><button class="btn" onclick="genKey('ingestion')">+ Generate ingestion key</button></div>
  <div class="card"><table><thead><tr><th>Name</th><th>Key</th><th>Scoped products</th><th class="num">Usage</th><th>Last used</th><th></th></tr></thead><tbody>
    <tr><td>phantom-pusher</td><td class="mono">twa_ing_••••b22</td><td>All products</td><td class="num">14,902</td><td>11m ago</td><td><button class="btn sm danger" onclick="confirmRevoke()">Revoke</button></td></tr>
  </tbody></table></div>`;

V['#/admin/audit']=()=>`<h1>Audit Log</h1>${actTable([{t:'2026-06-18 09:30',actor:'Super Admin',action:'org.approve',entity:'Reef Labs',result:'ok'},...ACTIVITY])}`;

/* ---------------- modals / actions (global) ---------------- */
window.dl=()=>{toast('Preparing download link…');setTimeout(()=>toast('Download ready (pre-signed URL)'),900);};
window.toastCsv=()=>toast('Generating CSV export…');
window.genKey=(kind)=>openModal((kind==='ingestion'?'Generate ingestion key':'Generate API key'),
  `<div class="field"><label>Key name</label><input class="ctrl" placeholder="e.g. analytics-pipeline"></div>`,
  `<button class="btn secondary" data-close>Cancel</button><button class="btn" onclick="revealKey()">Generate</button>`);
window.revealKey=()=>{$('#modal').querySelector('.dlg-body').innerHTML=`<div class="banner warn">Copy this key now — it won't be shown again.</div><div class="reveal"><span>twa_${Math.random().toString(36).slice(2,10)}_${Math.random().toString(36).slice(2,8)}</span><button class="btn sm" onclick="toast('Copied')">Copy</button></div>`;$('#modal').querySelector('.dlg-foot').innerHTML=`<button class="btn" data-close>Done</button>`;$('#modal').querySelector('[data-close]').onclick=()=>$('#modal').close();};
window.confirmRevoke=()=>openModal('Revoke key?','<p>This immediately disables the key. Requests using it will return 401.</p>','<button class="btn secondary" data-close>Cancel</button><button class="btn danger" data-close onclick="toast(\'Key revoked\')">Revoke</button>');
window.confirmDeactivate=()=>openModal('Deactivate account?','<div class="banner danger">This is irreversible. You will lose access immediately.</div>','<button class="btn secondary" data-close>Cancel</button><button class="btn danger" data-close onclick="toast(\'Account deactivated\')">Deactivate</button>');
window.inviteModal=()=>openModal('Invite member',`<div class="field"><label>Email</label><input class="ctrl" type="email"></div><div class="field"><label>Name</label><input class="ctrl"></div><div class="field"><label>Role</label><select class="ctrl"><option>User</option><option>Org Admin</option></select></div><div class="field"><label>Message (optional)</label><textarea class="ctrl"></textarea></div>`,'<button class="btn secondary" data-close>Cancel</button><button class="btn" data-close onclick="toast(\'Invite sent\')">Send invite</button>');
window.memberActions=(n)=>openModal(n,'<div class="grid" style="gap:8px"><button class="btn secondary" data-close onclick="toast(\'Role changed\')">Change role</button><button class="btn secondary" data-close onclick="toast(\'Promoted to Org Admin\')">Promote to Org Admin</button><button class="btn danger" data-close onclick="toast(\'Member deactivated\')">Deactivate</button></div>','<button class="btn ghost" data-close>Close</button>');
window.upgradeModal=()=>openModal('Request plan upgrade',`<p class="faint">A TWA Super Admin will assign the plan on approval.</p>${PLANS.map(p=>`<label class="card" style="display:block;padding:10px"><input type="radio" name="tier"> <strong>${p.name}</strong> — ${p.users} users · ${p.products} products · ${p.downloads} downloads/mo</label>`).join('')}`,'<button class="btn secondary" data-close>Cancel</button><button class="btn" data-close onclick="toast(\'Upgrade request submitted\')">Submit request</button>');
window.reviewModal=(org,tier)=>openModal(`Review — ${org}`,`<p><strong>Requested tier:</strong> ${tier}</p><p class="muted">Business: Insurance · Size: 50–200 · Contact: ops@${org.toLowerCase().replace(/\\s/g,'')}.com</p><div class="field"><label>Assign plan</label><select class="ctrl">${PLANS.map(p=>`<option>${p.name}</option>`).join('')}</select></div>`,'<button class="btn danger" data-close onclick="toast(\'Rejected\')">Reject</button><button class="btn" data-close onclick="toast(\'Approved &amp; plan assigned\')">Approve &amp; assign</button>');
window.orgDrawer=(org,status)=>openModal(`Manage — ${org}`,`<p>Status: ${pill(status)}</p><div class="field"><label>Assign / renew plan</label><select class="ctrl">${PLANS.map(p=>`<option>${p.name}</option>`).join('')}</select></div><div class="field"><label>Renew through</label><input class="ctrl" type="date" value="2026-12-01"></div>`,`<button class="btn danger" data-close onclick="toast('${status==='suspended'?'Reactivated':'Suspended'}')">${status==='suspended'?'Reactivate':'Suspend'}</button><button class="btn" data-close onclick="toast('Plan assigned / renewed')">Save</button>`);
window.productModal=(name)=>openModal(name?`Edit — ${name}`:'New data product',`<div class="field"><label>Title</label><input class="ctrl" value="${name||''}"></div><div class="field"><label>Category</label><select class="ctrl">${CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select></div><div class="field"><label>Region</label><select class="ctrl">${REGIONS.map(r=>`<option>${r}</option>`).join('')}</select></div><div class="field"><label>Tier mapping</label><div class="row">${PLANS.map(p=>`<label class="chip"><input type="checkbox" checked> ${p.name}</label>`).join('')}</div></div>`,'<button class="btn secondary" data-close>Cancel</button><button class="btn" data-close onclick="toast(\'Saved\')">Save</button>');
window.planModal=(name)=>openModal(name?`Edit — ${name}`:'New plan',`<div class="field"><label>Name</label><input class="ctrl" value="${name||''}"></div><div class="field"><label>Billing period</label><select class="ctrl"><option>monthly</option><option>annual</option></select></div><div class="row"><div class="field"><label>Max users</label><input class="ctrl" type="number" value="25"></div><div class="field"><label>Downloads/mo</label><input class="ctrl" type="number" value="1000"></div></div>`,'<button class="btn secondary" data-close>Cancel</button><button class="btn" data-close onclick="toast(\'Plan saved\')">Save</button>');
window.errDrawer=()=>openModal('Ingestion error','<div class="banner danger">Schema validation failed: missing variable <span class="mono">sst_anomaly</span> in pushed payload. Job quarantined.</div>','<button class="btn ghost" data-close>Close</button>');

/* ---------------- auth screens ---------------- */
function renderAuth(route){
  const a=$('#authroot');$('#approot').classList.add('hidden');a.classList.remove('hidden');
  if(route==='#/apply'){a.innerHTML=`<div class="authwrap"><div class="authcard" style="width:560px"><h1>Apply for access</h1><p class="muted">Request an organization account for the TWA Weather Data Marketplace.</p>
    <div class="field"><label>Organization name</label><input class="ctrl"></div>
    <div class="row"><div class="field" style="flex:1"><label>Business type</label><select class="ctrl"><option>Insurance</option><option>Agriculture</option><option>Shipping</option><option>Energy</option></select></div><div class="field" style="flex:1"><label>Company size</label><select class="ctrl"><option>1–50</option><option>50–200</option><option>200+</option></select></div></div>
    <div class="field"><label>Desired plan tier</label><div class="row">${PLANS.map((p,i)=>`<label class="chip ${i===1?'on':''}"><input type="radio" name="t" ${i===1?'checked':''}> ${p.name}</label>`).join('')}</div></div>
    <div class="field"><label>Intended use</label><textarea class="ctrl"></textarea></div>
    <button class="btn" style="width:100%;margin-top:8px" onclick="location.hash='#/apply/status'">Submit application</button>
    <p class="faint" style="text-align:center;margin-top:10px"><a href="#/login">Back to sign in</a></p></div></div>`;return;}
  if(route==='#/apply/status'){a.innerHTML=`<div class="authwrap"><div class="authcard"><div class="banner info">⏳ Your application is under review.</div><h1>Reef Labs</h1><p class="muted">Requested tier: Starter · submitted 2026-06-18</p><p class="faint">You'll receive an email when a TWA admin approves your organization.</p><a class="btn secondary" style="width:100%" href="#/login">Back to sign in</a></div></div>`;return;}
  // login
  a.innerHTML=`<div class="authwrap"><div class="authcard"><div class="row" style="justify-content:center;margin-bottom:8px"><span class="badge blue">TWA</span></div><h1 style="text-align:center">Sign in</h1><p class="muted" style="text-align:center">Weather Data Marketplace</p>
    <div class="field"><label>Email</label><input class="ctrl" value="jk@acme.io"></div>
    <div class="field"><label>Password</label><input class="ctrl" type="password" value="••••••••"></div>
    <button class="btn" style="width:100%;margin-top:8px" onclick="location.hash='${HOME[role]}'">Sign in</button>
    <p class="faint" style="text-align:center;margin-top:12px"><a href="#/apply">Apply for organization access</a></p></div></div>`;
}

/* ---------------- router ---------------- */
const AUTH_ROUTES=['#/login','#/apply','#/apply/status','#/verify','#/reset','#/invite'];
function renderNav(){
  $('#sidebar').innerHTML=NAV[role].map(s=>`<div class="navsec">${s.sec}</div>`+s.items.map(([h,l])=>`<a class="navlink" href="${h}">${l}</a>`).join('')).join('');
  const cur=location.hash||HOME[role];
  $('#sidebar').querySelectorAll('.navlink').forEach(a=>{if(a.getAttribute('href')===cur.split('/').slice(0,2).join('/')||a.getAttribute('href')===cur)a.classList.add('active');});
}
function router(){
  let h=location.hash||HOME[role];
  if(AUTH_ROUTES.some(r=>h.startsWith(r))){renderAuth(h);return;}
  $('#authroot').classList.add('hidden');$('#approot').classList.remove('hidden');
  let view, arg;
  if(/^#\/catalog\/.+/.test(h)){view=V['#/catalog/:id'];arg=h.split('/')[2];}
  else view=V[h];
  if(!view){view=V[HOME[role]];}
  $('#main').innerHTML=typeof view==='function'?view(arg):'<div class="empty">Not found</div>';
  $('#main').focus();
  renderNav();
}
/* ---------------- boot ---------------- */
function setRole(r){role=r;localStorage.setItem('twa-role',r);$('#roleSel').value=r;location.hash=HOME[r];router();}
window.addEventListener('hashchange',router);
document.addEventListener('DOMContentLoaded',()=>{
  $('#roleSel').value=role;
  $('#roleSel').addEventListener('change',e=>setRole(e.target.value));
  $('#themeToggle').addEventListener('click',()=>{const r=document.documentElement;r.dataset.theme=r.dataset.theme==='dark'?'light':'dark';});
  $('#bell').addEventListener('click',()=>location.hash='#/notifications');
  $('#globalsearch').addEventListener('keydown',e=>{if(e.key==='Enter')location.hash='#/search';});
  if(!location.hash)location.hash=HOME[role];
  router();
});
