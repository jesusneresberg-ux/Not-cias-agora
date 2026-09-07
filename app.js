const cats=['Todas','Brasil','Mundo','Economia','Tecnologia','Esportes'];
let cat='Todas', q='', dark=localStorage.getItem('na-dark')==='1', allItems=[], showingFavs=false;

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const catsEl=$('#cats');

if(dark) document.body.classList.add('dark');

cats.forEach(c=>{
  const b=document.createElement('button');
  b.textContent=c==='Todas'?'Destaques':c;
  b.dataset.cat=c;
  b.onclick=()=>selectCategory(c);
  catsEl.append(b);
});

function esc(s){
  return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function safeUrl(s){
  try{
    const u=new URL(s,location.href);
    return ['http:','https:'].includes(u.protocol)?u.href:'#';
  }catch{return '#'}
}
function date(d){
  if(!d)return 'agora';
  const dt=new Date(d);
  if(Number.isNaN(dt.getTime())) return 'agora';
  return dt.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
}
function favorites(){
  try{return JSON.parse(localStorage.getItem('na-favorites')||'[]')}catch{return []}
}
function saveFavorites(items){localStorage.setItem('na-favorites',JSON.stringify(items.slice(0,100)))}
function isFavorite(link){return favorites().some(x=>x.link===link)}
function toggleFavorite(item){
  let list=favorites();
  const i=list.findIndex(x=>x.link===item.link);
  if(i>=0) list.splice(i,1); else list.unshift(item);
  saveFavorites(list);
  if(showingFavs) render(list,true); else render(allItems,false);
}
function openNews(url){
  const u=safeUrl(url);
  if(u!=='#') location.href=u;
}
function setActive(){
  $$('.nav-link,[data-cat]').forEach(b=>b.classList.toggle('active',b.dataset.cat===cat&&!showingFavs));
  $('#pageTitle').textContent=showingFavs?'Favoritos':cat==='Todas'?'Principais notícias':cat;
}
function render(items, fromFavs=false){
  setActive();
  $('#resultCount').textContent=`${items.length} ${items.length===1?'notícia':'notícias'}`;
  if(!items.length){
    $('#lead').innerHTML='';
    $('#grid').innerHTML=`<div class="empty">${fromFavs?'Você ainda não salvou notícias.':'Nenhuma notícia encontrada.'}</div>`;
    $('#latestMini').innerHTML='';
    return;
  }

  const x=items[0], xUrl=safeUrl(x.link), fav=isFavorite(x.link);
  $('#lead').innerHTML=`
    <article class="lead">
      <div class="pic">${x.image?`<img src="${esc(x.image)}" alt="">`:''}</div>
      <div class="lead-content">
        <div class="tag">${esc(x.category||'Notícia')}</div>
        <h2>${esc(x.title)}</h2>
        <p>${esc(x.description)}</p>
        <div class="meta">${esc(x.source)} • ${date(x.pubDate)}</div>
        <div class="actions">
          <button class="read-btn" id="leadOpen">Ler notícia</button>
          <button class="save-btn" id="leadSave" title="Salvar">${fav?'★':'☆'}</button>
        </div>
      </div>
    </article>`;
  $('#leadOpen').onclick=()=>openNews(xUrl);
  $('#leadSave').onclick=()=>toggleFavorite(x);

  $('#grid').innerHTML=items.slice(1).map((n,i)=>`
    <article class="card">
      <div class="thumb">${n.image?`<img src="${esc(n.image)}" alt="" loading="lazy">`:''}</div>
      <div>
        <div class="tag">${esc(n.category||'Notícia')}</div>
        <h3><button data-open="${i+1}">${esc(n.title)}</button></h3>
        <p>${esc(n.description)}</p>
        <div class="card-actions">
          <div class="meta">${esc(n.source)} • ${date(n.pubDate)}</div>
          <button class="save-btn" data-save="${i+1}" title="Salvar">${isFavorite(n.link)?'★':'☆'}</button>
        </div>
      </div>
    </article>`).join('');

  $$('[data-open]').forEach(b=>b.onclick=()=>openNews(items[Number(b.dataset.open)].link));
  $$('[data-save]').forEach(b=>b.onclick=()=>toggleFavorite(items[Number(b.dataset.save)]));

  $('#latestMini').innerHTML=items.slice(0,5).map((n,i)=>`
    <div class="mini-item">
      <button data-mini="${i}">${esc(n.title)}</button>
      <small>${esc(n.source)} • ${date(n.pubDate)}</small>
    </div>`).join('');
  $$('[data-mini]').forEach(b=>b.onclick=()=>openNews(items[Number(b.dataset.mini)].link));
}
function selectCategory(c){
  cat=c; showingFavs=false; load();
}
async function load(){
  document.body.classList.add('loading');
  $('#refresh').textContent='…';
  try{
    const u=`/api/news?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(q)}`;
    const r=await fetch(u,{cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const data=await r.json();
    allItems=data.items||[];
    render(allItems,false);
    const dt=data.updatedAt?new Date(data.updatedAt):new Date();
    $('#updatedText').textContent='ATUALIZADO '+dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  }catch(e){
    $('#lead').innerHTML='';
    $('#grid').innerHTML='<div class="error">Servidor de notícias indisponível. Tente novamente em instantes.</div>';
    $('#updatedText').textContent='SEM CONEXÃO';
  }finally{
    document.body.classList.remove('loading');
    $('#refresh').textContent='↻';
  }
}
function setQuery(v){
  q=v;
  if($('#search')) $('#search').value=v;
  if($('#searchDesktop')) $('#searchDesktop').value=v;
  showingFavs=false;
  clearTimeout(window.__naSearchTimer);
  window.__naSearchTimer=setTimeout(load,300);
}

$('#search').oninput=e=>setQuery(e.target.value);
$('#searchDesktop').oninput=e=>setQuery(e.target.value);
$('#theme').onclick=()=>{
  dark=!dark;
  document.body.classList.toggle('dark',dark);
  localStorage.setItem('na-dark',dark?'1':'0');
  $('#theme').textContent=dark?'☀':'☾';
};
$('#theme').textContent=dark?'☀':'☾';
$('#refresh').onclick=()=> showingFavs ? render(favorites(),true) : load();

$$('.nav-link[data-cat],.bottom [data-cat],.side-row[data-cat]').forEach(b=>{
  b.onclick=()=>selectCategory(b.dataset.cat);
});

function showFavorites(){
  showingFavs=true;
  render(favorites(),true);
}
$('#fav').onclick=showFavorites;
$('#showFavs').onclick=showFavorites;

load();
setInterval(()=>{if(!showingFavs)load()},15*60*1000);
