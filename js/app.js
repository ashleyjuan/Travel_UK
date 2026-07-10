/* 渲染每日行程卡片 + 雨天/備選切換 + 即時小工具 */
(function () {
  'use strict';

  // ---------- Google Maps 導航連結 ----------
  function mapsUrl(dest) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(dest) + '&travelmode=transit';
  }

  // ---------- 景點卡片 ----------
  function spotHtml(s) {
    var meta = [];
    if (s.price) meta.push('<span class="meta">💷 ' + s.price + '</span>');
    if (s.hours) meta.push('<span class="meta">🕐 ' + s.hours + '</span>');
    if (s.duration) meta.push('<span class="meta">⏳ ' + s.duration + '</span>');
    if (s.tube) meta.push('<span class="meta">🚇 ' + s.tube + '</span>');

    var links = [];
    if (s.map) links.push('<a class="btn btn-map" href="' + mapsUrl(s.map) + '" target="_blank" rel="noopener">📍 導航</a>');
    if (s.book) links.push('<a class="btn btn-book" href="' + s.book.url + '" target="_blank" rel="noopener">🎫 ' + s.book.label + '</a>');

    return '<div class="spot">' +
      '<div class="spot-time">' + (s.time || '') + '</div>' +
      '<div class="spot-body">' +
        '<h4>' + s.name + (s.en ? ' <span class="en">' + s.en + '</span>' : '') + '</h4>' +
        '<p>' + s.desc + '</p>' +
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

  document.addEventListener('DOMContentLoaded', function () {
    renderDays();
    renderDayNav();
    initChecklist();
    loadWeather();
    loadFx();
  });
})();
