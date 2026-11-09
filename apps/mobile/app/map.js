window.startTerrainMap=()=>{
'use strict';
if(window.__terrainInitialized)return;window.__terrainInitialized=true;
const $=id=>document.getElementById(id);
const params={exag:10,pitch:55};
const compactGraphics=matchMedia('(pointer: coarse)').matches;
const normalPixelRatio=compactGraphics?Math.min(window.devicePixelRatio||1,1.5):null;
const vectorStyle='https://tiles.openfreemap.org/styles/liberty';
const glyphs='https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const status=(msg)=>$('status').textContent=msg;
let activeMode='terrain';
const cameraState={terrain:{center:[107.8437763,34.1401745],zoom:7.06,pitch:55,bearing:-18},globe:{center:[105,32],zoom:1.8,pitch:0,bearing:0}};
if (!window.maplibregl){$('mapOverlay').textContent='未能加载地图引擎。';return;}
const mountainLabels=[
 ['秦岭',107.83,33.95],['太行山脉',113.72,38.23],['天山山脉',84.52,42.63],['阿尔泰山脉',88.82,48.01],['昆仑山脉',85.16,35.80],['祁连山脉',99.42,38.03],['喜马拉雅山脉',86.30,28.25],['横断山脉',99.93,29.06],['贺兰山',105.80,38.83],['阴山山脉',110.23,41.30],['大兴安岭',121.65,50.18],['小兴安岭',128.67,48.40],['长白山脉',127.97,42.47],['南岭',112.27,25.15],['武夷山脉',117.72,27.52],['吕梁山',111.48,37.50],['阿尔金山脉',90.18,38.20],['冈底斯山脉',83.00,31.05],['念青唐古拉山脉',91.3,30.25],['燕山山脉',117.3,40.65]
];
const lakeLabels=[
 ['青海湖',100.15,36.89],['鄱阳湖',116.27,29.13],['洞庭湖',112.84,29.25],['太湖',120.18,31.20],['巢湖',117.55,31.55],['洪泽湖',118.64,33.24],['纳木错',90.60,30.74],['滇池',102.69,24.85],['洱海',100.19,25.81],['博斯腾湖',87.03,41.94],['赛里木湖',81.21,44.62],['呼伦湖',117.55,48.97],['兴凯湖',132.28,45.10],['羊卓雍错',90.66,28.92],['扎陵湖',97.21,34.88],['鄂陵湖',97.72,34.91]
];
const riverLabels=[
 ['长江',112.35,30.57],['黄河',109.80,35.05],['珠江',113.14,23.25],['雅鲁藏布江',91.35,29.10],['澜沧江',99.65,27.0],['怒江',98.9,26.2],['黑龙江',128.4,49.8],['松花江',126.9,46.2],['塔里木河',84.1,40.66],['额尔齐斯河',86.68,47.20],['淮河',116.4,32.90],['汉江',111.67,32.45],['嘉陵江',106.3,31.7],['岷江',103.88,30.78],['湘江',112.8,27.60],['赣江',115.7,27.73],['西江',111.65,23.45],['渭河',108.45,34.35],['辽河',122.65,42.15],['海河',117.36,39.08],['澧水',110.55,29.5],['乌江',107.4,28.4],['金沙江',99.60,27.65],['沱江',105.07,29.63],['沅江',110.64,27.36],['钱塘江',119.6,29.78]
];
const fc=(arr)=>({type:'FeatureCollection',features:arr.map(([name,lon,lat])=>({type:'Feature',properties:{name},geometry:{type:'Point',coordinates:[lon,lat]}}))});
let map;
try {
 map=new maplibregl.Map({
 container:'map',style:vectorStyle,
 center:[107.8437763,34.1401745],zoom:7.06,pitch:55,bearing:-18,
 maxPitch:90,maxZoom:16,minZoom:1,pixelRatio:normalPixelRatio,
 canvasContextAttributes:{antialias:!compactGraphics,preserveDrawingBuffer:true},
 touchZoomRotate:true,touchPitch:true,attributionControl:false
 });
} catch (err) {
 $('mapLoadingText').textContent='当前浏览器未能启用三维渲染。请在手机的 Safari 或 Chrome 中打开。';
 console.error(err);
 return;
}
map.addControl(new maplibregl.NavigationControl({visualizePitch:true,showZoom:!compactGraphics,showCompass:true}),'top-right');
map.addControl(new maplibregl.ScaleControl({maxWidth:145,unit:'metric'}),'bottom-left');
map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-right');
function sourceAndLabel(id,data,paint){
 map.addSource(id,{type:'geojson',data:fc(data)});
 map.addLayer({id:id+'-text',type:'symbol',source:id,layout:{'text-field':['get','name'],'text-font':['Noto Sans Regular'],'text-size':paint.size,'text-letter-spacing':paint.spacing??0.06,'text-max-width':8,'text-allow-overlap':false,'text-optional':true,'text-padding':4},paint:{'text-color':paint.color,'text-halo-color':paint.halo,'text-halo-width':paint.haloWidth??1.4,'text-halo-blur':.4}});
}
let loaded=false,countyRequested=false,countyLoaded=false;
let loadingTimer=0;
const fallbackStyle={
 version:8,glyphs,
 sources:{basemap:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],tileSize:256,attribution:'Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, TomTom, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), swisstopo, and the GIS User Community'}},
 layers:[{id:'basemap-raster',type:'raster',source:'basemap'}]
};
function showLoadingMessage(s){$('mapOverlay').classList.remove('is-hidden');$('mapLoadingText').textContent=s;}
function switchBase(mode){
 loaded=false;countyLoaded=false;countyRequested=false;
 showLoadingMessage(mode==='raster'?'正在切换备用地形底图……':'正在连接中文矢量底图……');
 clearTimeout(loadingTimer);
 loadingTimer=setTimeout(()=>{if(!loaded)showLoadingMessage('底图加载超时，可能受到网络限制。');},16000);
 try{map.setStyle(mode==='raster'?fallbackStyle:vectorStyle,{diff:false});}
 catch(err){status('切换底图失败：'+err.message);}
}
$('fallbackBasemap').disabled=false;
$('fallbackBasemap').onclick=()=>switchBase('raster');
$('baseRaster').onclick=()=>switchBase('raster');
$('baseVector').onclick=()=>switchBase('vector');
loadingTimer=setTimeout(()=>{if(!loaded)showLoadingMessage('网络连接超时：请点击“切换备用底图”重试。');},16000);
map.on('style.load',()=>{
 try{
 loaded=true;clearTimeout(loadingTimer);
 map.setProjection({type:activeMode==='globe'?'globe':'mercator'});
 if(activeMode==='globe'&&typeof map.setSky==='function'){try{map.setSky({'sky-color':'#b9d8ed','horizon-blend':0.18,'space-color':'#071727','star-intensity':0.18});}catch(e){}}
 else if(typeof map.setSky==='function'){try{map.setSky(null);}catch(e){}}
 if(!map.getSource('dem'))map.addSource('dem',{type:'raster-dem',tiles:['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],tileSize:256,minzoom:0,maxzoom:14,encoding:'terrarium',attribution:'<a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener">AWS Terrain Tiles / Mapzen</a> · <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noopener">DEM sources</a>'});
 map.setTerrain({source:'dem',exaggeration:params.exag});
 const symbolLayer=map.getStyle().layers.find(l=>l.type==='symbol');
 map.addLayer({id:'earth-hillshade',type:'hillshade',source:'dem',paint:{'hillshade-shadow-color':'#293d32','hillshade-highlight-color':'#fffdf2','hillshade-accent-color':'#556e69','hillshade-exaggeration':0.46}},symbolLayer?.id);
 sourceAndLabel('mountains',mountainLabels,{size:['interpolate',['linear'],['zoom'],3,9,6,12,10,15],color:'#4d3b2e',halo:'#fff8e9',haloWidth:1.65,spacing:0.1});
 sourceAndLabel('lakes',lakeLabels,{size:['interpolate',['linear'],['zoom'],3,9,8,12],color:'#075d9d',halo:'#e4f5ff',haloWidth:1.5});
 sourceAndLabel('rivers',riverLabels,{size:['interpolate',['linear'],['zoom'],3,9,8,11],color:'#0761a5',halo:'#f1fbff',haloWidth:1.4});
 
 for(const [checkbox,layer] of [['showMountains','mountains-text'],['showLakes','lakes-text'],['showRivers','rivers-text'],['showShade','earth-hillshade']]){
   if(!$(checkbox).checked)map.setLayoutProperty(layer,'visibility','none');
 }
 $('mapOverlay').classList.add('is-hidden');
 status('地图已初始化，真实高程加载中。若山区始终平坦，请检查 AWS 高程瓦片是否被网络屏蔽。');
 if($('showCounties').checked)loadCounties();
 }catch(err){status('地图图层初始化失败：'+err.message);showLoadingMessage('图层加载异常：'+err.message);console.error(err);}
});
let lastErrorTime=0;
map.on('error',(e)=>{
 const msg=String(e?.error?.message||'未知网络异常');
 if(Date.now()-lastErrorTime>4500){status('地图资源出现加载错误：'+msg.slice(0,130));lastErrorTime=Date.now();}
 if(!loaded){showLoadingMessage('主底图加载失败，请点击“切换备用底图”。');}
});
async function loadCounties(){
 if(!loaded||countyRequested)return;
 countyRequested=true;
 status('正在尝试加载公开历史县级边界，首次下载可能较慢……');
 const boundaryURL='https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/CHN/ADM2/geoBoundaries-CHN-ADM2_simplified.geojson';
 try{
   const r=await fetch(boundaryURL);if(!r.ok)throw Error('HTTP '+r.status);
   const geo=await r.json();
   if(geo.type!=='FeatureCollection')throw Error('非预期县界格式');
   if(map.getSource('counties'))map.getSource('counties').setData(geo);
   else{
      map.addSource('counties',{type:'geojson',data:geo,attribution:'geoBoundaries · NASG China / Revolutionary GIS (2017), PDDL 1.0'});
      map.addLayer({id:'county-border',type:'line',source:'counties',minzoom:5.2,paint:{'line-color':'#b34750','line-opacity':['interpolate',['linear'],['zoom'],5.2,.2,7,.50,10,.72],'line-width':['interpolate',['linear'],['zoom'],5,0.3,9,0.95]}});
      map.addLayer({id:'county-name',type:'symbol',source:'counties',minzoom:8.5,layout:{'text-field':['coalesce',['get','shapeName'],['get','name']],'text-font':['Noto Sans Regular','Arial Unicode MS Regular'],'text-size':['interpolate',['linear'],['zoom'],8.5,10,12,13],'text-allow-overlap':false,'text-padding':10},paint:{'text-color':'#8f393d','text-halo-color':'#ffffff','text-halo-width':1.3}});
   }
   countyLoaded=true;countyVisibility();
   status(`县界已加载：${geo.features.length} 个历史区划多边形（不作为现行法定依据）。`);
 }catch(err){
   countyRequested=false;
   status('县界远程文件加载失败（地图地形仍可正常使用）：'+String(err.message).slice(0,80));
 }
}
function countyVisibility(){if(!loaded||!countyLoaded)return;const v=$('showCounties').checked?'visible':'none';for(const id of ['county-border','county-name'])map.setLayoutProperty(id,'visibility',v);}
for(const [control,layer] of [['showMountains','mountains-text'],['showLakes','lakes-text'],['showRivers','rivers-text'],['showShade','earth-hillshade']]){
 $(control).addEventListener('change',e=>{if(loaded&&map.getLayer(layer))map.setLayoutProperty(layer,'visibility',e.target.checked?'visible':'none');});
}
$('showCounties').addEventListener('change',()=>{if(!countyLoaded){if($('showCounties').checked)loadCounties();}else countyVisibility();});


map.on('click',e=>{ $('altitude').hidden=false; const h=loaded?map.queryTerrainElevation(e.lngLat):null; $('altNum').textContent=h===null||!Number.isFinite(h)?'加载中':Math.round(h/params.exag).toLocaleString('zh-CN')+' 米'; });
function setExag(n){params.exag=Number(n);$('exaggeration').value=params.exag;$('exagOut').textContent=params.exag.toFixed(1)+'×';$('tagExag').textContent=params.exag.toFixed(1)+'×';if(loaded)map.setTerrain({source:'dem',exaggeration:params.exag});}
function setPitch(n){params.pitch=Number(n);$('pitch').value=params.pitch;$('pitchOut').textContent=params.pitch+'°';$('tagPitch').textContent=params.pitch+'°';map.setPitch(params.pitch);}
$('exaggeration').addEventListener('input',e=>setExag(e.target.value));
for(const button of document.querySelectorAll('[data-exag]'))button.addEventListener('click',()=>setExag(button.dataset.exag));
$('pitch').addEventListener('input',e=>setPitch(e.target.value));
map.on('pitch',()=>{const n=Math.round(map.getPitch());params.pitch=n;$('pitch').value=n;$('pitchOut').textContent=n+'°';const tagPitch=$('tagPitch');if(tagPitch)tagPitch.textContent=n+'°';});

// Two display modes share the same live DEM terrain, labels and controls.
function updateModeButtons(mode){
 document.querySelectorAll('[data-map-mode]').forEach(b=>{const on=b.dataset.mapMode===mode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false');});
}
function updateModeTag(mode){
 $('tagMode').textContent=mode==='globe'?'地球仪':'平面展开';
}
function saveMapCamera(){
 const c=map.getCenter();cameraState[activeMode]={center:[c.lng,c.lat],zoom:map.getZoom(),pitch:map.getPitch(),bearing:map.getBearing()};
}
function switchMapMode(mode){
 if(!['globe','terrain'].includes(mode)||mode===activeMode)return;
 saveMapCamera();activeMode=mode;updateModeButtons(mode);updateModeTag(mode);
 document.body.classList.toggle('globe-mode',mode==='globe');
 const apply=()=>{
   if(activeMode!==mode||!loaded)return;
   map.setProjection({type:mode==='globe'?'globe':'mercator'});
   if(mode==='globe'){
     if(typeof map.setSky==='function'){try{map.setSky({'sky-color':'#b9d8ed','horizon-blend':0.18,'space-color':'#071727','star-intensity':0.18});}catch(e){}}
     map.flyTo({...cameraState.globe,duration:reducedMotion.matches?0:750});
     status('地球仪模式：球形地球与真实高程地形。可拖动旋转地球；海拔放大和斜俯视控制继续有效。');
   }else{
     if(typeof map.setSky==='function'){try{map.setSky(null);}catch(e){}}
     map.flyTo({...cameraState.terrain,duration:reducedMotion.matches?0:750});
     status('平面展开模式：保留真实高程地形、海拔放大和斜俯视角。');
   }
   map.resize();
 };
 if(loaded)apply();else map.once('style.load',apply);
}
document.querySelectorAll('[data-map-mode]').forEach(b=>b.addEventListener('click',()=>switchMapMode(b.dataset.mapMode)));

const presets={
 qinling:{center:[107.8437763,34.1401745],zoom:7.06,pitch:55,bearing:-18},
 china:{center:[104.1,35.3],zoom:3.48,pitch:38,bearing:-12},
 hengduan:{center:[99.63,28.5],zoom:6.65,pitch:58,bearing:-25},
 tianshan:{center:[84.80,42.7],zoom:6.6,pitch:58,bearing:-21},
 tibet:{center:[87.12,32.30],zoom:5.1,pitch:52,bearing:-25},
 sichuan:{center:[104.60,30.05],zoom:6.5,pitch:55,bearing:-25}
};
function flyToPreset(name){
 const preset={...presets[name]};
 if(name==='china'&&window.innerWidth<650){
  preset.zoom=Math.max(1.35,Math.min(2.6,Math.log2((window.innerWidth-38)*360/(512*64))));
  preset.pitch=12;
  preset.bearing=0;
 }
 if(reducedMotion.matches)map.jumpTo(preset);
 else map.flyTo({...preset,duration:850});
}
for(const button of document.querySelectorAll('[data-preset]'))button.addEventListener('click',()=>flyToPreset(button.dataset.preset));
$('homeView').addEventListener('click',()=>flyToPreset('qinling'));
$('reset').addEventListener('click',()=>{setExag(10);setPitch(55);status('已重置为 10 倍高程和 55° 斜俯视；高程最高可调到 100 倍，斜度可调到 90°。');});
let mouseTick=0;
map.on('mousemove',e=>{
 if(compactGraphics||!loaded||++mouseTick%4!==0)return;
 $('altitude').hidden=false;
 readElevation(e.lngLat);
});
map.on('mouseout',()=>{if(!compactGraphics)$('altitude').hidden=true;});
$('saveImg').addEventListener('click',async()=>{
 if(!loaded){status('底图未加载，暂不能导出。');return;}
 const btn=$('saveImg');btn.disabled=true;btn.textContent='高清图渲染中…';status('渲染双倍像素图像中，若显卡有限会自动采用较低分辨率。');
 try{
   if(typeof map.setPixelRatio==='function'){map.setPixelRatio(2);map.resize();}map.triggerRepaint();
   await new Promise(resolve=>{let finished=false;function done(){if(finished)return;finished=true;resolve();}map.once('idle',done);setTimeout(done,5500);});
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   const canvas=map.getCanvas();const url=canvas.toDataURL('image/png');
   const anchor=document.createElement('a');anchor.href=url;anchor.download=`中国三维地形_${params.exag}倍_${canvas.width}x${canvas.height}.png`;document.body.appendChild(anchor);anchor.click();anchor.remove();
   status(`已提交 ${canvas.width} × ${canvas.height} 像素 PNG 下载；图像仅包含地图，不含左侧操作面板。`);
 }catch(err){status('导出失败：'+err.message+'。可使用系统截图或适当缩小浏览器窗口后重试。');}
 finally{if(typeof map.setPixelRatio==='function')map.setPixelRatio(normalPixelRatio);map.resize();btn.disabled=false;btn.textContent='导出地图 · 2× PNG';}
});
$('riverFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
   const data=JSON.parse(await file.text());if(!['FeatureCollection','Feature'].includes(data.type))throw Error('请提供 GeoJSON');
   if(map.getLayer('custom-water-1'))for(const l of ['custom-water-1','custom-water-2','custom-water-3'])map.removeLayer(l);
   if(map.getSource('custom-water'))map.getSource('custom-water').setData(data);else map.addSource('custom-water',{type:'geojson',data});
   for(const lvl of [3,2,1]){
     map.addLayer({id:'custom-water-'+lvl,type:'line',source:'custom-water',filter:['==',['to-number',['get','level']],lvl],paint:{'line-color':lvl===1?'#0862b9':lvl===2?'#157cc3':'#61b2dd','line-width':lvl===1?3.3:lvl===2?1.9:1,'line-opacity':.95}});
   }
   status('分级水系已叠加（按输入 GeoJSON 的 level=1/2/3 属性区分）；未赋值的线不会显示。');
 }catch(err){status('无法导入水系：'+err.message);}finally{e.target.value='';}
});
};

(function(){
  const urls=['https://cdn.jsdelivr.net/npm/maplibre-gl@5.12.0/dist/maplibre-gl.js',
              'https://unpkg.com/maplibre-gl@5.12.0/dist/maplibre-gl.js'];
  function load(i){
    if(window.maplibregl){window.startTerrainMap();return;}
    if(i>=urls.length){
      document.getElementById('mapLoadingText').textContent='地图引擎加载失败，请联网后重新加载。';
      document.getElementById('status').textContent='地图引擎加载失败：两个备用域名均无法连接。';return;
    }
    const s=document.createElement('script');s.src=urls[i];s.async=true;
    s.onload=()=>{if(window.maplibregl)window.startTerrainMap();else load(i+1)};
    s.onerror=()=>load(i+1);document.head.appendChild(s);
  }
  window.addEventListener('DOMContentLoaded',()=>load(0));
})();
