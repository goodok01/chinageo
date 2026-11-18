/* ChinaGeo address search. Explicit submissions only; no autocomplete. */
window.initAddressSearch = function (map) {
  'use strict';
  const input = document.getElementById('addressQuery');
  const form = document.getElementById('addressSearch');
  const results = document.getElementById('addressResults');
  const status = document.getElementById('addressStatus');
  const submit = form.querySelector('button[type="submit"]');
  const clear = document.getElementById('clearAddress');
  let marker, controller, generation = 0, lastRequest = 0;
  function message(text) { status.textContent = text; }
  function locate(place) {
    const lon = Number(place.lon), lat = Number(place.lat);
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || Math.abs(lon) > 180 || Math.abs(lat) > 90) return;
    if (marker) marker.remove();
    const label = document.createElement('div');
    label.textContent = place.display_name;
    marker = new maplibregl.Marker({color: '#176c81'}).setLngLat([lon, lat])
      .setPopup(new maplibregl.Popup({maxWidth: '280px'}).setDOMContent(label)).addTo(map);
    const bounds = place.boundingbox?.map(Number);
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1000;
    if (bounds?.length === 4 && bounds.every(Number.isFinite) && bounds[0] < bounds[1] && bounds[2] < bounds[3] && bounds[0] >= -90 && bounds[1] <= 90 && bounds[2] >= -180 && bounds[3] <= 180) {
      map.fitBounds([[bounds[2], bounds[0]], [bounds[3], bounds[1]]], {
        padding: innerWidth > 760 ? {left: 390, right: 70, top: 70, bottom: 70} : {left: 30, right: 30, top: 30, bottom: 100},
        maxZoom: 14, duration
      });
    } else map.flyTo({center: [lon, lat], zoom: 13, duration});
    results.querySelectorAll('button').forEach(b => b.removeAttribute('aria-current'));
    message('已定位：' + place.display_name);
    if (innerWidth <= 760) { input.blur(); document.getElementById('panel').scrollTop = 0; }
  }
  clear.addEventListener('click', () => {
    generation++; controller?.abort(); controller = null;
    if (marker) marker.remove(); marker = null;
    input.value = ''; results.replaceChildren(); message('输入地名、地址，或“经度,纬度”。');
    submit.disabled = false; submit.textContent = '搜索'; input.focus();
  });
  input.addEventListener('input', () => {
    generation++; controller?.abort(); results.replaceChildren();
    submit.disabled = false; submit.textContent = '搜索'; message('输入完成后按回车或点击搜索。');
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) { message('请先输入地名或地址。'); input.focus(); return; }
    const version = ++generation;
    controller?.abort();
    results.replaceChildren();
    const coordinates = query.match(/^([+-]?\d+(?:\.\d+)?)\s*[,，]\s*([+-]?\d+(?:\.\d+)?)$/);
    if (coordinates) {
      if (Math.abs(Number(coordinates[1])) > 180 || Math.abs(Number(coordinates[2])) > 90) { message('坐标超出范围：经度 −180～180，纬度 −90～90。'); return; }
      locate({lon: coordinates[1], lat: coordinates[2], display_name: query}); return;
    }
    if (query.length < 2) { message('请输入至少两个字符，或输入经纬度。'); return; }
    if (Date.now() - lastRequest < 1500) { message('搜索过于频繁，请稍候再试。'); return; }
    lastRequest = Date.now();
    controller = new AbortController();
    const request = controller;
    const timeout = setTimeout(() => request.abort(), 12000);
    submit.disabled = true; submit.textContent = '搜索中…'; message('正在搜索地址…');
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.search = new URLSearchParams({q: query, format: 'jsonv2', limit: '5', 'accept-language': 'zh-CN,zh,en'});
      const response = await fetch(url, {signal: request.signal, referrerPolicy: 'strict-origin-when-cross-origin'});
      if (!response.ok) throw new Error(response.status === 429 ? '请求较多，请稍后重试。' : '地址服务暂不可用，请稍后重试。');
      const places = await response.json();
      if (version !== generation) return;
      if (!Array.isArray(places)) throw new Error('地址服务返回异常，请稍后重试。');
      const valid = places.filter(p => Number.isFinite(Number(p.lon)) && Number.isFinite(Number(p.lat)) && Math.abs(Number(p.lon)) <= 180 && Math.abs(Number(p.lat)) <= 90 && typeof p.display_name === 'string');
      if (!valid.length) { message('未找到结果。试试加上城市名，例如“北京市 故宫”。'); return; }
      for (const place of valid.slice(0, 5)) {
        const li = document.createElement('li'), button = document.createElement('button');
        button.type = 'button'; button.textContent = place.display_name;
        button.addEventListener('click', () => { locate(place); button.setAttribute('aria-current', 'location'); });
        li.appendChild(button); results.appendChild(li);
      }
      message('找到 ' + Math.min(valid.length, 5) + ' 个结果，点击定位。');
    } catch (error) {
      if (version === generation) message(error.name === 'AbortError' ? '搜索超时，请检查网络后重试。' : error.message === 'Failed to fetch' ? '无法连接地址服务，请检查网络后重试；也可输入经纬度。' : error.message);
    } finally {
      clearTimeout(timeout);
      if (version === generation) { submit.disabled = false; submit.textContent = '搜索'; }
    }
  });
  submit.disabled = false; message('输入地名、地址，或“经度,纬度”。');
};
