/* 渲染每日行程卡片 + 雨天/備選切換 + 即時小工具 */
(function () {
  'use strict';

  // ---------- Google Maps 導航連結 ----------
  function mapsUrl(dest) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(dest) + '&travelmode=transit';
  }

  // ---------- Citymapper 導航連結 ----------
  // Citymapper 需要座標才能直接帶入目的地；只列有涵蓋的城市
  // （倫敦、牛津、溫莎、布萊頓、巴斯、華納影城），科茲窩鄉村／巨石陣／機場外國段不提供。
  var CM_COORDS = {
    '12 Halford Road, London SW6 1JT': [51.4846, -0.1965],
    'Ashmolean Museum, Oxford': [51.7554, -1.2600],
    'Bancone, 39 William IV Street, Covent Garden, London': [51.5093, -0.1258],
    'Big Ben, London': [51.5007, -0.1246],
    'Borough Market, London': [51.5055, -0.0910],
    'Brick Lane, London': [51.5217, -0.0714],
    'Brighton Palace Pier': [50.8194, -0.1367],
    'British Museum, London': [51.5194, -0.1270],
    'Buckingham Palace, London': [51.5014, -0.1419],
    'Camden Market, London': [51.5416, -0.1466],
    'Cecil Court, London': [51.5107, -0.1279],
    'Chinatown London': [51.5113, -0.1313],
    'Christ Church, Oxford': [51.7500, -1.2555],
    'Churchill War Rooms, London': [51.5022, -0.1291],
    'Columbia Road Flower Market, London': [51.5288, -0.0692],
    'Covent Garden Market, London': [51.5117, -0.1223],
    'Covered Market, Oxford': [51.7524, -1.2570],
    'Dishoom Covent Garden, London': [51.5127, -0.1268],
    "Dishoom King's Cross, London": [51.5353, -0.1257],
    'Euston Station, London': [51.5282, -0.1337],
    'Flat Iron Kensington, 9 Young Street, London W8 5EH': [51.5017, -0.1911],
    'Gloucester Road Station, London': [51.4945, -0.1829],
    'Greenwich Market, London': [51.4816, -0.0090],
    'Grosvenor Gardens, London SW1W 0DH': [51.4972, -0.1462],
    'Hawksmoor Seven Dials, London': [51.5136, -0.1262],
    'Heathrow Airport Terminal 3': [51.4700, -0.4543],
    "His Majesty's Theatre, Haymarket, London": [51.5081, -0.1320],
    'Horse Guards, Whitehall, London': [51.5045, -0.1272],
    'Kensington Palace, London': [51.5050, -0.1877],
    'Leadenhall Market, London': [51.5128, -0.0835],
    'LEGO Store Leicester Square, London': [51.5103, -0.1300],
    'Liberty London, Regent Street': [51.5140, -0.1400],
    'Liberty London': [51.5140, -0.1400],
    'London Eye, South Bank, London': [51.5033, -0.1196],
    "McDonald's King's Cross, London": [51.5309, -0.1214],
    'London Marylebone Station': [51.5225, -0.1631],
    'Lyceum Theatre, Wellington Street, London': [51.5116, -0.1198],
    'Magdalen Bridge Boathouse, Oxford': [51.7500, -1.2467],
    'Marks and Spencer, Kensington High Street, London': [51.5010, -0.1927],
    'National Gallery, London': [51.5089, -0.1283],
    'National Portrait Gallery, London': [51.5094, -0.1281],
    'Natural History Museum, London': [51.4967, -0.1764],
    'Old Spitalfields Market, London': [51.5197, -0.0757],
    'One New Change, London': [51.5138, -0.0958],
    'Oxford Street, London': [51.5152, -0.1418],
    'Paddington Station, London': [51.5154, -0.1755],
    'Primrose Hill, London': [51.5387, -0.1607],
    "Queen Mary's Rose Gardens, London": [51.5266, -0.1554],
    "Queen's House, Greenwich": [51.4813, -0.0059],
    'Radcliffe Camera, Oxford': [51.7534, -1.2540],
    'Roman Baths, Bath': [51.3811, -2.3590],
    'Royal Observatory Greenwich': [51.4769, -0.0005],
    'Seven Dials Market, London': [51.5143, -0.1279],
    'Sondheim Theatre, Shaftesbury Avenue, London': [51.5111, -0.1338],
    'St Dunstan in the East, London': [51.5097, -0.0824],
    "St James's Park, London": [51.5025, -0.1348],
    "St Paul's Cathedral, London": [51.5138, -0.0984],
    'Tate Modern, London': [51.5076, -0.0994],
    'Tower Bridge, London': [51.5055, -0.0754],
    'Tower Millennium Pier, London': [51.5077, -0.0780],
    'Tower of London West Gate': [51.5078, -0.0770],
    'Tower of London': [51.5081, -0.0759],
    'Victoria and Albert Museum, London': [51.4966, -0.1722],
    'Victoria Station, London SW1W 9LN': [51.4952, -0.1441],
    'Victoria Station, London': [51.4952, -0.1441],
    'Warner Bros. Studio Tour London': [51.6905, -0.4180],
    'Watford Junction Station': [51.6628, -0.3960],
    'Westminster Abbey, London': [51.4993, -0.1273],
    'Windsor Castle': [51.4839, -0.6044],
    "Word on the Water, King's Cross, London": [51.5346, -0.1244],
    // —— index.html 口袋名單／美食清單（靜態按鈕）——
    'Australia House, Strand, London': [51.5130, -0.1180],
    'Bancone, 39 William IV Street, London': [51.5093, -0.1258],
    'Beigel Bake, 159 Brick Lane, London': [51.5246, -0.0717],
    'Beigel Bake, Brick Lane, London': [51.5246, -0.0717],
    "Ben's Cookies Covent Garden, London": [51.5122, -0.1229],
    'Bread Ahead, Borough Market, London': [51.5052, -0.0912],
    'Burger and Lobster Soho, London': [51.5136, -0.1320],
    'Chestnut Bakery Covent Garden, London': [51.5110, -0.1210],
    'Cinnamon Bazaar, Covent Garden, London': [51.5105, -0.1223],
    'Circolo Popolare, Fitzrovia, London': [51.5178, -0.1341],
    'Crosstown Doughnuts Soho, London': [51.5136, -0.1354],
    'Cutter and Squidge, Soho, London': [51.5110, -0.1345],
    'Din Tai Fung, Covent Garden, London': [51.5107, -0.1234],
    'Duck and Waffle, Heron Tower, London': [51.5163, -0.0812],
    'Fortnum and Mason, Piccadilly, London': [51.5083, -0.1380],
    "God's Own Junkyard, Walthamstow, London": [51.5830, -0.0233],
    'Goddards at Greenwich, London': [51.4809, -0.0096],
    'Gold Mine, 102 Queensway, London': [51.5133, -0.1876],
    'Granger and Co Notting Hill, London': [51.5155, -0.1990],
    'Hamleys, Regent Street, London': [51.5124, -0.1400],
    'Harrods, Knightsbridge, London': [51.4994, -0.1632],
    'Honest Burgers Soho, London': [51.5133, -0.1330],
    'Horizon 22, 22 Bishopsgate, London': [51.5150, -0.0817],
    'John Lewis, Oxford Street, London': [51.5146, -0.1445],
    'Kanada-Ya St Giles, London': [51.5163, -0.1284],
    'Kenwood House, Hampstead, London': [51.5710, -0.1673],
    'Koya Soho, 50 Frith Street, London': [51.5137, -0.1312],
    'Kynance Mews, London': [51.4964, -0.1848],
    'Little Venice, London': [51.5230, -0.1837],
    'London Eye, London': [51.5033, -0.1196],
    'London Transport Museum, Covent Garden': [51.5119, -0.1214],
    'Maltby Street Market, London': [51.4993, -0.0748],
    'Ole and Steen, Oxford Circus, London': [51.5152, -0.1420],
    'Padella, Borough Market, London': [51.5051, -0.0905],
    'Poppies Fish and Chips Soho, London': [51.5127, -0.1315],
    'Regency Cafe, London': [51.4930, -0.1310],
    'Regency Cafe, Westminster, London': [51.4930, -0.1310],
    'Selfridges, 400 Oxford Street, London': [51.5145, -0.1527],
    "Shakespeare's Globe, London": [51.5081, -0.0972],
    "Sir John Soane's Museum, London": [51.5169, -0.1174],
    'The Breakfast Club Soho, London': [51.5142, -0.1370],
    'The Churchill Arms, Kensington, London': [51.5069, -0.1943],
    'The Garden at 120, London': [51.5122, -0.0805],
    'The Ivy Market Grill, Covent Garden, London': [51.5109, -0.1230],
    'Wallace Collection, London': [51.5173, -0.1531]
  };

  // 手機用 citymapper:// 直接喚起 app（網頁連結在手機常只開瀏覽器版）；電腦用網頁版
  var CM_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  function citymapperUrl(dest) {
    var c = CM_COORDS[dest];
    if (!c) return null;
    var q = 'endcoord=' + c[0] + '%2C' + c[1] + '&endname=' + encodeURIComponent(dest);
    return (CM_MOBILE ? 'citymapper://directions?' : 'https://citymapper.com/directions?') + q;
  }

  // ---------- 景點卡片 ----------
  function spotHtml(s) {
    var meta = [];
    if (s.price) meta.push('<span class="meta">💷 ' + s.price + '</span>');
    if (s.hours) meta.push('<span class="meta">🕐 ' + s.hours + '</span>');
    if (s.duration) meta.push('<span class="meta">⏳ ' + s.duration + '</span>');
    if (s.tube) meta.push('<span class="meta">🚇 ' + s.tube + '</span>');

    var links = [];
    if (s.map) {
      links.push('<a class="btn btn-map" href="' + mapsUrl(s.map) + '" target="_blank" rel="noopener">📍 導航</a>');
      var cm = citymapperUrl(s.map);
      if (cm) links.push('<a class="btn btn-map btn-cm" href="' + cm + '" target="_blank" rel="noopener">🚏 Citymapper</a>');
    }
    if (s.book) links.push('<a class="btn btn-book" href="' + s.book.url + '" target="_blank" rel="noopener">🎫 ' + s.book.label + '</a>');

    return '<div class="spot">' +
      '<div class="spot-time">' + (s.time || '') + '</div>' +
      '<div class="spot-body">' +
        '<h4>' + s.name + (s.en ? ' <span class="en">' + s.en + '</span>' : '') + '</h4>' +
        '<p>' + s.desc + '</p>' +
        (s.warn ? '<div class="spot-warn"><strong>⚠️ 注意事項</strong><ul>' + s.warn.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul></div>' : '') +
        (s.tips ? '<p class="spot-tip">💡 ' + s.tips + '</p>' : '') +
        (meta.length ? '<div class="spot-meta">' + meta.join('') + '</div>' : '') +
        (links.length ? '<div class="spot-links">' + links.join('') + '</div>' : '') +
      '</div>' +
    '</div>';
  }

  function planHtml(spots) {
    return '<div class="timeline">' + spots.map(spotHtml).join('') + '</div>';
  }

  // ---------- 每日卡片 ----------
  function dayHtml(d) {
    var tabs = ['<button class="tab active" data-plan="sun">☀️ 主方案</button>'];
    var panes = ['<div class="pane active" data-plan="sun">' + planHtml(d.spots) + '</div>'];

    if (d.rainSpots) {
      tabs.push('<button class="tab" data-plan="rain">🌧️ 雨天備案</button>');
      panes.push('<div class="pane" data-plan="rain">' +
        (d.rainNote ? '<p class="plan-note rain-note">🌧️ ' + d.rainNote + '</p>' : '') +
        planHtml(d.rainSpots) + '</div>');
    } else if (d.rainNote) {
      // 沒有獨立雨天行程，但有說明（例如本日天然防雨）
      panes[0] = '<div class="pane active" data-plan="sun"><p class="plan-note ok-note">✅ ' + d.rainNote + '</p>' + planHtml(d.spots) + '</div>';
    }

    if (d.altSpots) {
      tabs.push('<button class="tab" data-plan="alt">🔀 備選方案</button>');
      panes.push('<div class="pane" data-plan="alt">' +
        (d.altNote ? '<p class="plan-note alt-note">🔀 ' + d.altNote + '</p>' : '') +
        planHtml(d.altSpots) + '</div>');
    }

    return '<article class="day-card" id="' + d.id + '">' +
      '<header class="day-header">' +
        '<div class="day-date"><span class="d-num">' + d.date + '</span><span class="d-week">' + d.weekday + '</span></div>' +
        '<div class="day-title"><h3>' + d.title + '</h3><span class="day-theme">' + d.theme + '</span></div>' +
      '</header>' +
      '<div class="day-transport">🚆 ' + d.transport + '</div>' +
      (d.friend ? '<div class="day-friend">🤝 ' + d.friend + '</div>' : '') +
      (d.stay ? '<div class="day-stay">🛏️ ' + d.stay + '</div>' : '') +
      (tabs.length > 1 ? '<div class="tabs">' + tabs.join('') + '</div>' : '') +
      panes.join('') +
      (d.dayTips ? '<div class="day-tips"><strong>📌 小提醒</strong><ul>' + d.dayTips.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>' : '') +
    '</article>';
  }

  function renderDays() {
    var el = document.getElementById('days-container');
    el.innerHTML = window.TRIP.days.map(dayHtml).join('');
    el.addEventListener('click', function (e) {
      var btn = e.target.closest('.tab');
      if (!btn) return;
      var card = btn.closest('.day-card');
      var plan = btn.dataset.plan;
      card.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('active', t === btn); });
      card.querySelectorAll('.pane').forEach(function (p) { p.classList.toggle('active', p.dataset.plan === plan); });
    });
  }

  // ---------- 每日快速導覽列 ----------
  function renderDayNav() {
    var el = document.getElementById('day-nav');
    if (!el) return;
    el.innerHTML = window.TRIP.days.map(function (d) {
      return '<a href="#' + d.id + '">' + d.date + '</a>';
    }).join('');
  }

  // ---------- 即時天氣（Open-Meteo，免金鑰）----------
  function loadWeather() {
    var el = document.getElementById('weather-widget');
    if (!el) return;
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=51.5072&longitude=-0.1276' +
      '&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FLondon&forecast_days=7';
    var icons = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌧️', 61: '🌧️', 63: '🌧️', 65: '🌧️', 71: '🌨️', 80: '🌦️', 81: '🌧️', 82: '⛈️', 95: '⛈️' };
    fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      var cur = data.current;
      var html = '<div class="wx-now">倫敦現在 <strong>' + Math.round(cur.temperature_2m) + '°C</strong> ' + (icons[cur.weather_code] || '🌡️') + '</div><div class="wx-days">';
      for (var i = 0; i < data.daily.time.length; i++) {
        var dt = new Date(data.daily.time[i] + 'T12:00:00');
        var wd = ['日', '一', '二', '三', '四', '五', '六'][dt.getDay()];
        html += '<div class="wx-day"><span>' + (dt.getMonth() + 1) + '/' + dt.getDate() + '(' + wd + ')</span>' +
          '<span class="wx-icon">' + (icons[data.daily.weather_code[i]] || '🌡️') + '</span>' +
          '<span>' + Math.round(data.daily.temperature_2m_min[i]) + '–' + Math.round(data.daily.temperature_2m_max[i]) + '°</span>' +
          '<span class="wx-rain">☔ ' + data.daily.precipitation_probability_max[i] + '%</span></div>';
      }
      el.innerHTML = html + '</div>';
    }).catch(function () { el.style.display = 'none'; });
  }

  // ---------- 即時匯率（open.er-api.com，免金鑰）----------
  function loadFx() {
    var el = document.getElementById('fx-widget');
    if (!el) return;
    fetch('https://open.er-api.com/v6/latest/GBP').then(function (r) { return r.json(); }).then(function (data) {
      if (!data.rates || !data.rates.TWD) throw new Error('no rate');
      var rate = data.rates.TWD;
      el.innerHTML = '💱 即時匯率：£1 ≈ <strong>NT$' + rate.toFixed(1) + '</strong>' +
        '<span class="fx-samples">（£10 ≈ NT$' + Math.round(rate * 10) + '｜£50 ≈ NT$' + Math.round(rate * 50) + '｜£100 ≈ NT$' + Math.round(rate * 100) + '）</span>';
    }).catch(function () { el.style.display = 'none'; });
  }

  // ---------- 必辦清單 checkbox（localStorage 記憶）----------
  function initChecklist() {
    document.querySelectorAll('.checklist li').forEach(function (li, i) {
      var key = 'travel-uk-chk-' + i;
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.className = 'chk';
      box.checked = localStorage.getItem(key) === '1';
      li.classList.toggle('done', box.checked);
      box.addEventListener('change', function () {
        li.classList.toggle('done', box.checked);
        try { localStorage.setItem(key, box.checked ? '1' : '0'); } catch (e) {}
      });
      li.insertBefore(box, li.firstChild);
      // 點整列文字也能勾選（避免誤觸連結）
      li.addEventListener('click', function (e) {
        if (e.target.closest('a') || e.target === box) return;
        box.checked = !box.checked;
        box.dispatchEvent(new Event('change'));
      });
    });
  }

  // ---------- 行李清單收合（localStorage 記憶）----------
  function initPackingToggle() {
    var btn = document.getElementById('packing-toggle');
    var body = document.getElementById('packing-body');
    if (!btn || !body) return;
    function apply(hidden) {
      body.style.display = hidden ? 'none' : '';
      btn.textContent = hidden ? '展開 ▼' : '收合 ▲';
    }
    var hidden = localStorage.getItem('travel-uk-packing-hidden') === '1';
    apply(hidden);
    btn.addEventListener('click', function () {
      hidden = !hidden;
      apply(hidden);
      try { localStorage.setItem('travel-uk-packing-hidden', hidden ? '1' : '0'); } catch (e) {}
    });
  }

  // ---------- 靜態導航按鈕補上 Citymapper（口袋名單／美食清單） ----------
  function enhanceStaticMapLinks() {
    document.querySelectorAll('a.btn-map[href*="google.com/maps/dir"]').forEach(function (a) {
      var next = a.nextElementSibling;
      if (next && next.classList && next.classList.contains('btn-cm')) return; // 已有（動態渲染的卡片）
      var m = a.getAttribute('href').match(/destination=([^&]+)/);
      if (!m) return;
      var dest = decodeURIComponent(m[1].replace(/\+/g, ' '));
      var url = citymapperUrl(dest);
      if (!url) return;
      var cm = document.createElement('a');
      cm.className = 'btn btn-map btn-cm';
      cm.href = url;
      cm.target = '_blank';
      cm.rel = 'noopener';
      cm.textContent = '🚏 Citymapper';
      a.insertAdjacentElement('afterend', cm);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderDays();
    enhanceStaticMapLinks();
    renderDayNav();
    initChecklist();
    initPackingToggle();
    loadWeather();
    loadFx();
  });
})();
