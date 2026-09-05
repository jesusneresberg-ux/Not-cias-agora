const cats=['Todas','Brasil','Mundo','Esportes','Economia','Tecnologia'];
let cat='Todas',q='',dark=false;
const catsEl=document.querySelector('#cats');
cats.forEach(c=>{let b=document.createElement('button');b.textContent=c;b.onclick=()=>{cat=c;load()};catsEl.append(b)});
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function render(items){
 [...catsEl.children].forEach((b,i)=>b.classList.toggle('active',cats[i]===cat));
 if(!items.length){document.querySelector('#lead').innerHTML='';document.querySelector('#grid').innerHTML='<p>Nenhuma notícia encontrada.</p>';return}
 const x=items[0];
 document.querySelector('#lead').innerHTML=`<article class="lead" onclick="openNews('${esc(x.link)}')"><div class="pic">${x.image?`<img src="${esc(x.image)}">`:''}</div><div class="content"><div class="tag">${esc(x.category)}</div><h1>${esc(x.title)}</h1><p>${esc(x.description)}</p><div class="meta">${esc(x.source)} • ${date(x.pubDate)}</div></div></article>`;
 document.querySelector('#grid').innerHTML=items.slice(1).map(x=>`<article class="card"><div class="row"><div><div class="tag">${esc(x.category)}</div><h2>${esc(x.title)}</h2><div class="meta">${esc(x.source)} • ${date(x.pubDate)}</div></div><button onclick="openNews('${esc(x.link)}')">→</button></div></article>`).join('');
}
function date(d){if(!d)return'hoje';return new Date(d).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
async function load(){document.querySelector('#refresh').textContent='…';try{const u=`/api/news?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(q)}`;const r=await fetch(u);const data=await r.json();render(data.items||[])}catch(e){document.querySelector('#grid').innerHTML='<p>Servidor indisponível. Tente atualizar novamente.</p>'}finally{document.querySelector('#refresh').textContent='↻'}}
function openNews(url){if(url&&url!=='#') location.href=url}
document.querySelector('#search').oninput=e=>{q=e.target.value;load()};
document.querySelector('#theme').onclick=()=>{dark=!dark;document.body.classList.toggle('dark',dark)};
document.querySelector('#refresh').onclick=load;
document.querySelectorAll('.bottom [data-cat]').forEach(b=>b.onclick=()=>{cat=b.dataset.cat;load()});
load(); setInterval(load,15*60*1000);
