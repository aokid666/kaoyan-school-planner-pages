const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let universities=[],activeSchool='',activeTab='directory',view='table';
function safeUrl(value){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
function link(url,label){return safeUrl(url)?`<a href="${esc(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`:''}
function programView(p){const directions=Array.isArray(p.directions)?p.directions:[];
 const heading=`<div class="program-title"><span class="degree ${p.degree==='专硕'?'professional':''}">${esc(p.degree)}</span><h3><span class="code">${esc(p.code)}</span>${esc(p.name)}<span class="mode">${esc(p.mode)}</span></h3></div>`;
 const directionText=directions.length?`<ul class="directions">${directions.map(d=>`<li><span class="direction-code">${esc(d.code)}</span><span>${esc(d.name)}</span></li>`).join('')}</ul>`:'<span class="subtle">暂未提供具体研究方向</span>';
 const details=`<div class="books"><strong>复试科目</strong>　${esc(p.retest||'待补充')}<p><strong>参考书目</strong>　${esc(p.book||'待补充')}</p></div>`;
 const rows=directions.length?directions:[{code:'—',name:'暂未提供具体研究方向'}];
 return `<article class="program">${heading}${view==='text'?`<div class="program-body"><div class="info-grid"><span>研究方向</span><div>${directionText}</div></div></div>`:`<div class="table-wrap"><table><thead><tr><th>方向</th><th>研究方向名称</th><th>学习方式</th></tr></thead><tbody>${rows.map(d=>`<tr><td>${esc(d.code)}</td><td class="wide">${esc(d.name)}</td><td style="white-space:nowrap">${esc(p.mode)}</td></tr>`).join('')}</tbody></table></div>`}${details}</article>`;
}
function directory(s){return `<div class="content-toolbar"><p>${esc(s.year)} 招生目录 · ${s.programs.length} 个专业，${s.programs.reduce((n,p)=>n+(p.directions||[]).length,0)} 个已整理方向</p><div class="view-switch" aria-label="展示方式"><button data-view="table" class="${view==='table'?'active':''}" aria-pressed="${view==='table'}">表格</button><button data-view="text" class="${view==='text'?'active':''}" aria-pressed="${view==='text'}">文字</button></div></div>${s.programs.map(programView).join('')}<p class="source">${link(s.source,'查看官方招生目录')}</p>`}
function empty(title,text){return `<div class="empty"><div class="symbol" aria-hidden="true">卷</div><h3>${title}</h3><p>${text}</p></div>`}
function brochures(s){if(!s.brochures?.length)return empty('招生简章待补充','你提供招生简章的文字、文件或链接后，会整理到这里。');return s.brochures.map(b=>`<article class="document"><span class="subtle">${esc(b.year||'')} 招生简章</span><h3>${esc(b.title)}</h3><p style="white-space:pre-wrap">${esc(b.text||'')}</p>${link(b.url,'查看招生简章原文')}</article>`).join('')}
function scores(s){if(!s.scores?.length)return empty('历年分数线待补充','你提供历年分数线后，会按年份和专业集中展示。');return `<div class="table-wrap"><table><thead><tr><th>年份</th><th>专业／方向</th><th>总分</th><th>政治</th><th>英语</th><th>专业课</th><th>口径／来源</th></tr></thead><tbody>${s.scores.map(r=>`<tr><td>${esc(r.year)}</td><td class="wide">${esc(r.program)}</td><td>${esc(r.total??'—')}</td><td>${esc(r.politics??'—')}</td><td>${esc(r.english??'—')}</td><td>${esc(r.subject??'—')}</td><td>${esc(r.scope||'')} ${link(r.url,'原文')}</td></tr>`).join('')}</tbody></table></div>`}
function render(){const s=universities.find(s=>s.id===activeSchool);if(!s)return;
 $('#schools').innerHTML=universities.map(u=>`<button data-school="${esc(u.id)}" class="${u.id===activeSchool?'active':''}" ${u.id===activeSchool?'aria-current="true"':''}><span class="school-dot"></span>${esc(u.name)}</button>`).join('');
 $('#school-name').textContent=s.name;$('#school-meta').textContent=[s.year+' 考研',s.department].filter(Boolean).join(' · ');
 for(const b of document.querySelectorAll('[data-tab]')){const on=b.dataset.tab===activeTab;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1}
 $('#content').setAttribute('aria-labelledby','tab-'+activeTab);$('#content').innerHTML=activeTab==='directory'?directory(s):activeTab==='brochures'?brochures(s):scores(s);
}
$('#schools').addEventListener('click',e=>{const b=e.target.closest('[data-school]');if(b){activeSchool=b.dataset.school;render()}});
for(const b of document.querySelectorAll('[data-tab]')){
 b.addEventListener('click',()=>{activeTab=b.dataset.tab;render()});
 b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...document.querySelectorAll('[data-tab]')];let index=tabs.indexOf(b);index=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;activeTab=tabs[index].dataset.tab;render();tabs[index].focus()});
}
$('#content').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b){view=b.dataset.view;render()}if(e.target.closest('[data-retry]'))load()});
async function load(){try{const res=await fetch('universities.json',{cache:'no-store'});if(!res.ok)throw new Error('资料文件读取失败');const data=await res.json();if(!Array.isArray(data)||!data.length)throw new Error('暂无院校资料');universities=data;activeSchool=universities.some(s=>s.id===activeSchool)?activeSchool:universities[0].id;render()}catch(error){$('#school-name').textContent='院校资料暂未加载';$('#content').innerHTML='<div class="empty"><h3>资料加载失败</h3><p>请检查网络后重试。</p><button class="retry" data-retry>重新加载</button></div>'}}
load();
