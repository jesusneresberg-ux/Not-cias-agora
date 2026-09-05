const express = require("express");
const Parser = require("rss-parser");
const path = require("path");
const app = express();
const parser = new Parser({timeout:10000});
const PORT = process.env.PORT || 3000;

const feeds = [
 {category:"Brasil", source:"Agência Brasil", url:"https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml"},
 {category:"Mundo", source:"CNN Brasil", url:"https://www.cnnbrasil.com.br/feed/"},
 {category:"Economia", source:"InfoMoney", url:"https://www.infomoney.com.br/feed/"},
 {category:"Tecnologia", source:"Olhar Digital", url:"https://olhardigital.com.br/feed/"}
];

let cache={time:0,items:[]};
async function loadNews(){
 const now=Date.now();
 if(now-cache.time<10*60*1000 && cache.items.length) return cache.items;
 const results=await Promise.allSettled(feeds.map(async f=>{
   const feed=await parser.parseURL(f.url);
   return (feed.items||[]).slice(0,12).map(x=>({
     title:x.title||"Sem título", link:x.link||"#", pubDate:x.isoDate||x.pubDate||"",
     source:f.source, category:f.category, description:(x.contentSnippet||x.content||"").replace(/<[^>]+>/g,"").slice(0,220),
     image:x.enclosure?.url || x["media:content"]?.url || null
   }));
 }));
 const items=results.flatMap(r=>r.status==="fulfilled"?r.value:[]);
 items.sort((a,b)=>new Date(b.pubDate)-new Date(a.pubDate));
 cache={time:now,items};
 return items;
}
app.get("/api/news",async(req,res)=>{
 try{
  const items=await loadNews();
  const q=(req.query.q||"").toLowerCase();
  const cat=req.query.category||"Todas";
  res.json({updatedAt:new Date(cache.time).toISOString(),items:items.filter(x=>(cat==="Todas"||x.category===cat)&&(!q||`${x.title} ${x.description}`.toLowerCase().includes(q)))});
 }catch(e){res.status(502).json({error:"Não foi possível atualizar os feeds agora."});}
});
app.use(express.static(path.join(__dirname,"app/src/main/assets")));
app.listen(PORT,()=>console.log(`Notícias Agora em http://localhost:${PORT}`));
