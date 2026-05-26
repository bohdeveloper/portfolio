'use client';

import { useEffect, useRef } from 'react';
import { CATS, DIAS, DIAS_F, SCHED, SCHED_V2, SCHED_SWITCH, Activity, tm } from './tracker-data';

const TRACKER_CSS = `
#tracker-root{font-family:system-ui,sans-serif;font-size:14px;background:#0f0f0f;color:#e8e6e0;padding-bottom:2rem}
.header-bar{padding:.75rem 1rem;background:#111;border-bottom:1px solid #1e1e1e;margin-bottom:.5rem}
.header-bar h2{font-size:16px;font-weight:500;margin-bottom:1px}
.header-bar p{font-size:11px;color:#555}
.tabs{display:flex;background:#1a1a1a;border-bottom:1px solid #2a2a2a;margin-bottom:.75rem;overflow-x:auto}
.tab{padding:9px 16px;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;font-size:13px;color:#888;white-space:nowrap}
.tab.active{color:#e8e6e0;border-bottom-color:#5DCAA5;font-weight:500}
.page{display:none;padding:0 .75rem .75rem}.page.active{display:block}
.card{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:1rem;margin-bottom:1rem}
.g4{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:.75rem}
@media(min-width:640px){.g4{grid-template-columns:repeat(4,1fr)}}
.mc{background:#1e1e1e;border:1px solid #2a2a2a;border-radius:8px;padding:.75rem;text-align:center}
.mc-v{font-size:20px;font-weight:500}
.mc-l{font-size:10px;color:#666;margin-top:2px}
.week-nav{display:flex;align-items:center;gap:10px;margin-bottom:.75rem}
.week-nav span{flex:1;text-align:center;font-size:13px;font-weight:500}
.btn{padding:6px 12px;border-radius:6px;border:1px solid #2a2a2a;background:#1e1e1e;cursor:pointer;font-size:12px;color:#ccc}
.btn:hover{background:#2a2a2a}
.btn-done{background:#1D6B45;border-color:#1D6B45;color:#fff}
.btn-miss{background:#7a2a1a;border-color:#7a2a1a;color:#fff}
.legend-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:.75rem}
.li{display:flex;align-items:center;gap:5px;font-size:11px;color:#777}
.ld{width:9px;height:9px;border-radius:2px;flex-shrink:0}
@media(min-width:640px){.li{font-size:13px}.ld{width:12px;height:12px;border-radius:3px}}
.sched-wrap{overflow-x:auto;overflow-y:auto;max-height:78vh;border:1px solid #2a2a2a;border-radius:10px}
.sched-inner{display:grid;min-width:640px}
.sched-head{display:grid;position:sticky;top:0;z-index:10;background:#111;border-bottom:1px solid #2a2a2a}
.sh-corner{background:#111;border-right:1px solid #2a2a2a}
.sh-day{padding:6px 4px;text-align:center;border-right:1px solid #1e1e1e}
.sh-day:last-child{border-right:none}
.sh-name{font-size:11px;font-weight:500;color:#aaa}
.sh-date{font-size:10px;color:#555;margin-top:1px}
.sh-day.tod .sh-name{color:#5DCAA5}
.sh-day.tod .sh-date{color:#1D6B45}
.sched-body{display:grid;position:relative}
.time-col{display:flex;flex-direction:column}
.time-row{border-bottom:1px solid #1e1e1e;display:flex;align-items:flex-start;justify-content:flex-end;padding:1px 6px 0;font-size:9px;color:#555;background:#111;border-right:1px solid #2a2a2a;flex-shrink:0}
.time-row.hour-mark{border-bottom:1px solid #2f2f2f}
.day-col{position:relative;border-right:1px solid #1e1e1e}
.day-col:last-child{border-right:none}
.day-col::before{content:'';position:absolute;inset:0;background-image:repeating-linear-gradient(to bottom,transparent,transparent calc(var(--sh) * 1px - 1px),#1a1a1a calc(var(--sh) * 1px - 1px),#1a1a1a calc(var(--sh) * 1px));pointer-events:none;z-index:0}
.ab{position:absolute;left:2px;right:2px;border-radius:5px;border:none;cursor:pointer;font-size:10px;font-weight:500;padding:4px 6px;text-align:left;line-height:1.35;color:#fff;overflow:hidden;transition:filter .15s;border-left:3px solid rgba(255,255,255,.25);z-index:1}
.ab:hover{filter:brightness(1.25);z-index:5}
.ab.done{opacity:.65}.ab.done::after{content:'✓';position:absolute;top:3px;right:5px;font-size:9px;opacity:.9}
.ab.miss{opacity:.5;text-decoration:line-through}.ab.miss::after{content:'✗';position:absolute;top:3px;right:5px;font-size:9px;opacity:.9}
.ab.fut{opacity:.2;cursor:default;pointer-events:none}
.ab.nt{cursor:default;pointer-events:none}
.ab-time{display:block;font-size:8.5px;font-weight:400;opacity:.75;margin-top:1px}
.now-line{position:absolute;left:0;right:0;height:2px;background:#5DCAA5;z-index:8;pointer-events:none}
.now-dot{position:absolute;left:-4px;top:-4px;width:10px;height:10px;border-radius:50%;background:#5DCAA5}
.ckr{background:#1e5a7a}
.cm{background:#2e2880}.cf{background:#0d5e48}
.cp{background:#222;color:#666;border-left-color:#333}
.cw{background:#0e2d4a}.cc{background:#6a2308}.cs{background:#155234}.cpsi{background:#4a2060}
.cd{background:#0a0e18;color:#1e2840;border-left-color:#1e2840}
.cl{background:#141414;color:#666;border-left-color:#333}
.pb{height:5px;background:#1e1e1e;border-radius:3px;overflow:hidden;margin-top:4px}
.pf{height:100%;border-radius:3px;transition:width .3s}
.cr{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.cn{font-size:12px;color:#888;width:130px;flex-shrink:0}
.cpct{font-size:12px;font-weight:500;width:34px;text-align:right;flex-shrink:0}
#chart-wrap{position:relative;width:100%;height:180px}
.sb{border-left:3px solid #1D6B45;padding:7px 12px;margin-bottom:7px;border-radius:0 6px 6px 0;background:#1a1a1a}
.sw{border-left-color:#7a2a1a}
.mi{border-left:3px solid #7a2a1a;padding:7px 12px;margin-bottom:7px;border-radius:0 6px 6px 0;background:#1a1a1a}
.mi-d{font-size:10px;color:#555}
.mi-n{font-weight:500;font-size:13px;margin:2px 0}
.mi-r{font-size:12px;color:#555;font-style:italic}
.tip{position:fixed;background:#1c1c1c;border:1px solid #333;border-radius:8px;padding:8px 12px;font-size:12px;color:#bbb;max-width:240px;pointer-events:none;z-index:999;opacity:0;transition:opacity .1s;line-height:1.5}
.tip.on{opacity:1}
.tip strong{color:#e8e6e0;display:block;margin-bottom:2px;font-size:12px}
.tip-reason{display:block;color:#888;font-style:italic;margin-top:4px;font-size:11px;border-top:1px solid #2a2a2a;padding-top:4px}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:200}
.modal{background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:1.25rem;width:340px;max-width:92vw}
.modal h3{margin-bottom:.35rem;color:#e8e6e0;font-size:14px}
.modal-sub{font-size:11px;color:#555;margin-bottom:.5rem}
.modal textarea{width:100%;background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:8px;font-size:13px;color:#e8e6e0;resize:vertical;min-height:65px;font-family:inherit}
.modal-btns{display:flex;gap:8px;margin-top:.65rem;justify-content:flex-end}
.hidden{display:none}
`;

/* Light-mode overrides */
const LIGHT_CSS = `
html.light #tracker-root{background:#f5f5f5;color:#1a1a1a}
html.light .header-bar{background:#fff;border-bottom-color:#e0e0e0}
html.light .header-bar p{color:#777}
html.light .tabs{background:#f0f0f0;border-bottom-color:#e0e0e0}
html.light .tab{color:#666}
html.light .tab.active{color:#1a1a1a}
html.light .card{background:#fff;border-color:#e0e0e0}
html.light .mc{background:#f0f0f0;border-color:#e0e0e0}
html.light .mc-l{color:#888}
html.light .btn{background:#eeeeee;border-color:#d0d0d0;color:#333}
html.light .btn:hover{background:#dddddd}
html.light .li{color:#888}
html.light .sched-wrap{border-color:#e0e0e0}
html.light .sched-head{background:#f5f5f5;border-bottom-color:#e0e0e0}
html.light .sh-corner{background:#f5f5f5;border-right-color:#e0e0e0}
html.light .sh-day{border-right-color:#eeeeee}
html.light .sh-name{color:#444}
html.light .sh-date{color:#888}
html.light .time-row{background:#f5f5f5;border-bottom-color:#eeeeee;border-right-color:#e0e0e0;color:#aaa}
html.light .time-row.hour-mark{border-bottom-color:#dddddd}
html.light .day-col{border-right-color:#eeeeee}
html.light .day-col::before{background-image:repeating-linear-gradient(to bottom,transparent,transparent calc(var(--sh)*1px - 1px),#e8e8e8 calc(var(--sh)*1px - 1px),#e8e8e8 calc(var(--sh)*1px))}
html.light .cp{background:#e8e8e8;color:#bbb;border-left-color:#ccc}
html.light .cd{background:#e8e8e8;color:#ccc;border-left-color:#ccc}
html.light .cl{background:#eeeeee;color:#bbb;border-left-color:#ddd}
html.light .pb{background:#e0e0e0}
html.light .cn{color:#555}
html.light .sb{background:#f8f8f8}
html.light .mi{background:#f8f8f8}
html.light .mi-d{color:#888}
html.light .mi-r{color:#888}
html.light .tip{background:#fff;border-color:#e0e0e0;color:#444}
html.light .tip strong{color:#1a1a1a}
html.light .tip-reason{border-top-color:#e0e0e0;color:#888}
html.light .modal{background:#fff;border-color:#e0e0e0}
html.light .modal h3{color:#1a1a1a}
html.light .modal-sub{color:#777}
html.light .modal textarea{background:#f5f5f5;border-color:#e0e0e0;color:#1a1a1a}
html.light .week-nav span{color:#1a1a1a}
`;

const TRACKER_HTML = `
<div class="header-bar">
  <h2>⚡ Transformación Integral — Borja</h2>
  <p>Estoicismo · Shaolin · BIZIKI — Fase 1: Fundación</p>
</div>
<div class="tabs">
  <button class="tab active" id="tab-semana">Semana</button>
  <button class="tab" id="tab-estadisticas">Estadísticas</button>
  <button class="tab" id="tab-resumen">Resumen</button>
  <button class="tab" id="tab-perdidas">Perdidas</button>
</div>
<div id="semana" class="page active">
  <div class="week-nav">
    <button class="btn" id="btn-prev">‹</button>
    <span id="week-label"></span>
    <button class="btn" id="btn-next">›</button>
  </div>
  <div class="g4" id="quick-stats"></div>
  <div class="legend-row" id="legend"></div>
  <div class="sched-wrap" id="sched-wrap">
    <div class="sched-inner" id="sched-inner">
      <div class="sched-head" id="sched-head"></div>
      <div class="sched-body" id="sched-body"></div>
    </div>
  </div>
</div>
<div id="estadisticas" class="page">
  <div class="g4" id="stat-metrics"></div>
  <div class="card"><h3 style="margin-bottom:.75rem;font-size:14px">Cumplimiento por categoría</h3><div id="cat-bars"></div></div>
  <div class="card"><h3 style="margin-bottom:.75rem;font-size:14px">Actividades por día</h3><div id="chart-wrap"><canvas id="dayChart" role="img" aria-label="Actividades por día"></canvas></div></div>
</div>
<div id="resumen" class="page">
  <div class="card" id="resumen-content"><p style="color:#555;font-size:13px">Registra actividades para ver tu evolución.</p></div>
</div>
<div id="perdidas" class="page">
  <div id="perdidas-list"><p style="color:#555;font-size:13px">Sin actividades perdidas esta semana.</p></div>
</div>
<div class="tip" id="tip"><strong id="tip-title"></strong><span id="tip-desc"></span><em class="tip-reason" id="tip-reason"></em></div>
<div id="modal" class="modal-bg hidden">
  <div class="modal">
    <h3 id="m-title"></h3>
    <p class="modal-sub" id="m-desc"></p>
    <p class="modal-sub" id="m-day"></p>
    <textarea id="m-reason" placeholder="Motivo si no la realizas (opcional)..."></textarea>
    <div class="modal-btns">
      <button class="btn" id="modal-cancel">Cancelar</button>
      <button class="btn btn-miss" id="modal-miss">✗ Perdida</button>
      <button class="btn btn-done" id="modal-done">✓ Completada</button>
    </div>
  </div>
</div>
`;

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h + ':' + (m < 10 ? '0' : '') + m;
}
function dk(d: Date): string { return d.toISOString().slice(0, 10); }
function ak(dstr: string, id: string): string { return dstr + '_' + id; }
function getWS(off: number): Date {
  const n = new Date(), day = n.getDay(), m = new Date(n);
  m.setDate(n.getDate() - (day === 0 ? 6 : day - 1) + off * 7);
  m.setHours(0, 0, 0, 0);
  return m;
}
function getDays(off: number): Date[] {
  const ws = getWS(off), days: Date[] = [];
  for (let i = 0; i < 7; i++) { const d = new Date(ws); d.setDate(ws.getDate() + i); days.push(d); }
  return days;
}

/* Returns the correct schedule for a given day, switching to V2 from SCHED_SWITCH */
function getSchedForDay(di: number, dayDate: Date): Activity[] {
  return dk(dayDate) >= SCHED_SWITCH ? (SCHED_V2[di] || []) : (SCHED[di] || []);
}

type StateRecord = { done: boolean; reason: string; ts: number | string };

// ── Tracker logic (vanilla DOM, runs inside useEffect) ─────────────────────────
function initTracker() {
  const PX_PER_MIN = 1.6;
  const DAY_START  = 5 * 60;
  const DAY_END    = 23 * 60;
  const SLOT_MIN   = 30;

  let state: Record<string, StateRecord> = {};
  let weekOffset = 0;
  let pending: { dKey: string; act: Activity; dayIdx: number } | null = null;
  let chart: unknown = null;

  // ── API ──────────────────────────────────────────────────────────────────────
  function loadState() {
    fetch('/api/tracker/week?start=' + dk(getWS(weekOffset)))
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Array<{ date: string; activity_id: string; done: number; reason: string; updated_at: string }> }) => {
        if (res.ok && res.data) {
          state = {};
          for (const r of res.data) {
            state[ak(r.date, r.activity_id)] = { done: !!r.done, reason: r.reason || '', ts: r.updated_at };
          }
        }
        renderAll();
      })
      .catch(renderAll);
  }

  function saveRecord(dKey: string, actId: string, dayIdx: number, done: boolean, reason: string) {
    fetch('/api/tracker/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dKey, activity_id: actId, day_index: dayIdx, done: done ? 1 : 0, reason }),
    }).catch(() => {});
  }

  function renderAll() { renderWeek(); renderStats(); renderResumen(); renderPerdidas(); }

  // ── Tooltip ──────────────────────────────────────────────────────────────────
  const tipEl = document.getElementById('tip')!;
  function showTip(e: MouseEvent, name: string, desc: string, reason = '') {
    document.getElementById('tip-title')!.textContent = name;
    document.getElementById('tip-desc')!.textContent = desc;
    const tipReason = document.getElementById('tip-reason')!;
    if (reason) {
      tipReason.textContent = '"' + reason + '"';
      tipReason.style.display = 'block';
    } else {
      tipReason.style.display = 'none';
    }
    tipEl.classList.add('on');
    posTip(e);
  }
  function posTip(e: MouseEvent) {
    let x = e.clientX + 14, y = e.clientY - 10;
    if (x + 250 > window.innerWidth) x = e.clientX - 255;
    if (y + 110 > window.innerHeight) y = e.clientY - 115;
    tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px';
  }
  function hideTip() { tipEl.classList.remove('on'); }

  // ── Now line ─────────────────────────────────────────────────────────────────
  function drawNowLine() {
    document.getElementById('now-line')?.remove();
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    if (mins < DAY_START || mins >= DAY_END) return;
    const totalMins = DAY_END - DAY_START;
    const totalH = Math.round(totalMins * PX_PER_MIN);
    const pct = ((mins - DAY_START) / totalMins) * 100;
    document.querySelectorAll('.day-col').forEach((col, i) => {
      const line = document.createElement('div');
      line.className = 'now-line';
      if (i === 0) { line.id = 'now-line'; const dot = document.createElement('div'); dot.className = 'now-dot'; line.appendChild(dot); }
      line.style.top = pct + '%';
      col.appendChild(line);
    });
    void totalH;
  }

  // ── Render week ───────────────────────────────────────────────────────────────
  function renderWeek() {
    const days = getDays(weekOffset);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const totalMins = DAY_END - DAY_START;
    const totalH = Math.round(totalMins * PX_PER_MIN);

    document.getElementById('week-label')!.textContent =
      days[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ' — ' +
      days[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

    const head = document.getElementById('sched-head')!;
    head.style.gridTemplateColumns = '48px repeat(7,1fr)';
    head.innerHTML = '<div class="sh-corner" style="min-height:34px"></div>';
    for (let di = 0; di < 7; di++) {
      const d = days[di], isT = d.getTime() === today.getTime();
      head.innerHTML += `<div class="sh-day${isT ? ' tod' : ''}"><div class="sh-name">${DIAS[di]}</div><div class="sh-date">${d.getDate()} ${d.toLocaleDateString('es-ES', { month: 'short' })}</div></div>`;
    }

    const body = document.getElementById('sched-body')!;
    body.innerHTML = '';
    body.style.gridTemplateColumns = '48px repeat(7,1fr)';
    body.style.height = totalH + 'px';

    const timeCol = document.createElement('div');
    timeCol.className = 'time-col';
    timeCol.style.cssText = `position:relative;height:${totalH}px;`;
    for (let m = DAY_START; m < DAY_END; m += SLOT_MIN) {
      const tc = document.createElement('div');
      const hPx = ((m - DAY_START) / totalMins) * totalH;
      const slotH = (SLOT_MIN / totalMins) * totalH;
      tc.className = 'time-row' + (m % 60 === 0 ? ' hour-mark' : '');
      tc.style.cssText = `position:absolute;top:${hPx}px;left:0;right:0;height:${slotH}px;`;
      if (m % 60 === 0) tc.textContent = Math.floor(m / 60) + ':00';
      timeCol.appendChild(tc);
    }
    body.appendChild(timeCol);

    let totalActs = 0, doneActs = 0, missActs = 0;

    /* Dynamic legend: collect categories present this week */
    const catSet = new Set<string>();

    for (let di = 0; di < 7; di++) {
      const d2 = days[di], dKey = dk(d2), isFut = d2 > today;
      const col = document.createElement('div');
      col.className = 'day-col';
      col.style.cssText = `height:${totalH}px;--sh:${Math.round((SLOT_MIN / totalMins) * totalH)}px;`;

      for (const act of getSchedForDay(di, d2)) {
        const topPx = ((act.start - DAY_START) / totalMins) * totalH;
        const hPx   = ((act.end - act.start) / totalMins) * totalH;
        const rec   = state[ak(dKey, act.id)];
        const cat   = CATS[act.cat] || CATS.libre;

        if (act.cat !== 'prep' && act.cat !== 'libre' && act.cat !== 'dormir') catSet.add(act.cat);

        const el = document.createElement('button');
        el.className = 'ab ' + cat.cls;
        el.style.cssText = `top:${topPx}px;height:${hPx}px;`;
        const timeStr = fmt(act.start) + '–' + fmt(act.end);
        if (hPx >= 28)      el.innerHTML = `<span>${act.name}</span><span class="ab-time">${timeStr}</span>`;
        else if (hPx >= 16) el.innerHTML = `<span style="font-size:9px">${act.name}</span>`;

        if (isFut || !act.track) {
          el.classList.add(isFut ? 'fut' : 'nt');
        } else {
          totalActs++;
          if (rec) { rec.done ? (el.classList.add('done'), doneActs++) : (el.classList.add('miss'), missActs++); }
          ((dk2: string, a: Activity, di2: number, d3: Date) => {
            el.onclick = () => openModal(dk2, a, di2, DIAS_F[di2] + ' ' + d3.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
          })(dKey, act, di, d2);
        }
        /* Tooltip with reason on hover */
        ((a: Activity, dstr: string) => {
          el.addEventListener('mouseenter', e => {
            const r = state[ak(dstr, a.id)];
            showTip(e as MouseEvent, a.name, a.desc, r?.reason || '');
          });
          el.addEventListener('mousemove',  e => posTip(e as MouseEvent));
          el.addEventListener('mouseleave', hideTip);
        })(act, dKey);
        col.appendChild(el);
      }
      body.appendChild(col);
    }

    if (weekOffset === 0) setTimeout(drawNowLine, 50);

    const pct = totalActs > 0 ? Math.round(doneActs / totalActs * 100) : 0;
    document.getElementById('quick-stats')!.innerHTML =
      `<div class="mc"><div class="mc-v">${pct}%</div><div class="mc-l">Cumplimiento</div></div>` +
      `<div class="mc"><div class="mc-v" style="color:#5DCAA5">${doneActs}</div><div class="mc-l">Completadas</div></div>` +
      `<div class="mc"><div class="mc-v" style="color:#D85A30">${missActs}</div><div class="mc-l">Perdidas</div></div>` +
      `<div class="mc"><div class="mc-v" style="color:#666">${totalActs - doneActs - missActs}</div><div class="mc-l">Pendientes</div></div>`;

    /* Legend — dynamic, sorted by category order in CATS */
    const catOrder = Object.keys(CATS);
    const sortedCats = [...catSet].sort((a, b) => catOrder.indexOf(a) - catOrder.indexOf(b));
    document.getElementById('legend')!.innerHTML = sortedCats.map(c =>
      `<div class="li"><div class="ld" style="background:${CATS[c].color}"></div>${CATS[c].label}</div>`
    ).join('');

    const wrap = document.getElementById('sched-wrap')!;
    const scrollTo = ((tm(5, 30) - DAY_START) / totalMins) * totalH + 34;
    wrap.scrollTop = Math.max(0, scrollTo - 30);
  }

  // ── Modal ─────────────────────────────────────────────────────────────────────
  function openModal(dKey: string, act: Activity, dayIdx: number, dayLabel: string) {
    pending = { dKey, act, dayIdx };
    document.getElementById('m-title')!.textContent = act.name;
    document.getElementById('m-desc')!.textContent  = act.desc;
    document.getElementById('m-day')!.textContent   = dayLabel;
    const ex = state[ak(dKey, act.id)];
    (document.getElementById('m-reason') as HTMLTextAreaElement).value = ex ? (ex.reason || '') : '';
    document.getElementById('modal')!.classList.remove('hidden');
  }
  function closeModal() { document.getElementById('modal')!.classList.add('hidden'); pending = null; }
  function saveAct(done: boolean) {
    if (!pending) return;
    const reason = (document.getElementById('m-reason') as HTMLTextAreaElement).value.trim();
    const key = ak(pending.dKey, pending.act.id);
    state[key] = { done, reason, ts: Date.now() };
    saveRecord(pending.dKey, pending.act.id, pending.dayIdx, done, reason);
    closeModal();
    renderAll();
  }

  // ── Stats ─────────────────────────────────────────────────────────────────────
  function renderStats() {
    const days = getDays(weekOffset);
    const catData: Record<string, { total: number; done: number }> = {};
    Object.keys(CATS).forEach(k => catData[k] = { total: 0, done: 0 });
    const dd = [0,0,0,0,0,0,0], dt = [0,0,0,0,0,0,0];

    for (let di = 0; di < 7; di++) {
      const dKey = dk(days[di]);
      for (const act of getSchedForDay(di, days[di])) {
        if (!act.track) continue;
        const rec = state[ak(dKey, act.id)];
        catData[act.cat].total++; dt[di]++;
        if (rec && rec.done) { catData[act.cat].done++; dd[di]++; }
      }
    }

    let total = 0, done = 0;
    Object.values(catData).forEach(c => { total += c.total; done += c.done; });
    const pct  = total > 0 ? Math.round(done / total * 100) : 0;
    const miss = Object.values(state).filter(v => !v.done).length;
    let streak = 0;
    for (let i = 0; i < 7; i++) { if (dt[i] > 0 && dd[i] === dt[i]) streak++; else break; }

    document.getElementById('stat-metrics')!.innerHTML =
      `<div class="mc"><div class="mc-v">${pct}%</div><div class="mc-l">Cumplimiento</div></div>` +
      `<div class="mc"><div class="mc-v" style="color:#5DCAA5">${done}</div><div class="mc-l">Completadas</div></div>` +
      `<div class="mc"><div class="mc-v" style="color:#D85A30">${miss}</div><div class="mc-l">Perdidas</div></div>` +
      `<div class="mc"><div class="mc-v" style="color:#534AB7">${streak}</div><div class="mc-l">Días perfectos</div></div>`;

    document.getElementById('cat-bars')!.innerHTML = Object.keys(CATS)
      .filter(k => catData[k].total > 0)
      .map(k => {
        const { total: t, done: d } = catData[k];
        const p = Math.round(d / t * 100), col = CATS[k].color;
        return `<div class="cr"><span class="cn">${CATS[k].label}</span><div style="flex:1"><div class="pb"><div class="pf" style="width:${p}%;background:${col}"></div></div></div><span class="cpct" style="color:${col}">${p}%</span></div>`;
      }).join('');

    if (chart) { (chart as { destroy(): void }).destroy(); chart = null; }
    const canvas = document.getElementById('dayChart') as HTMLCanvasElement | null;
    if (canvas) {
      chart = new (window as unknown as { Chart: new (ctx: unknown, cfg: unknown) => unknown }).Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: { labels: DIAS, datasets: [
          { label: 'Completadas', data: dd, backgroundColor: '#1D6B45', borderRadius: 3 },
          { label: 'Total',       data: dt, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 3 },
        ]},
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#666', font: { size: 11 } } } },
          scales: {
            x: { ticks: { color: '#555', font: { size: 11 } }, grid: { color: '#1e1e1e' } },
            y: { ticks: { color: '#555', font: { size: 11 }, stepSize: 1 }, grid: { color: '#1e1e1e' }, beginAtZero: true },
          },
        },
      });
    }
  }

  // ── Resumen ───────────────────────────────────────────────────────────────────
  function renderResumen() {
    const days = getDays(weekOffset);
    const catData: Record<string, { total: number; done: number }> = {};
    Object.keys(CATS).forEach(k => catData[k] = { total: 0, done: 0 });
    const dd = [0,0,0,0,0,0,0], dt = [0,0,0,0,0,0,0];
    let total = 0, done = 0;

    for (let di = 0; di < 7; di++) {
      const dKey = dk(days[di]);
      for (const act of getSchedForDay(di, days[di])) {
        if (!act.track) continue;
        const rec = state[ak(dKey, act.id)];
        total++; dt[di]++; catData[act.cat].total++;
        if (rec && rec.done) { done++; dd[di]++; catData[act.cat].done++; }
      }
    }

    const el = document.getElementById('resumen-content')!;
    if (done === 0) { el.innerHTML = '<p style="color:#555;font-size:13px">Registra actividades para ver tu evolución.</p>'; return; }

    const pct = Math.round(done / total * 100);
    let bestD = 0;
    for (let i = 1; i < 7; i++) if (dd[i] > dd[bestD]) bestD = i;
    let worstD = 0;
    for (let i = 1; i < 7; i++) { const ra = dt[i] > 0 ? dd[i]/dt[i] : 1, rb = dt[worstD] > 0 ? dd[worstD]/dt[worstD] : 1; if (ra < rb) worstD = i; }
    const sorted = Object.keys(CATS).filter(k => catData[k].total > 0).sort((a, b) => (catData[b].done/catData[b].total) - (catData[a].done/catData[a].total));
    const bestCat = sorted[0], worstCat = sorted[sorted.length - 1];
    const miss = Object.values(state).filter(v => !v.done).length;

    let html = `<h3 style="margin-bottom:.75rem;font-size:14px">Resumen de semana</h3>` +
      `<div class="sb"><p style="font-weight:500">Cumplimiento global: ${pct}%</p><p style="font-size:11px;color:#555;margin-top:2px">${done} de ${total} actividades rastreadas.</p></div>` +
      `<div class="sb"><p style="font-weight:500">Mejor día: ${DIAS_F[bestD]}</p><p style="font-size:11px;color:#555;margin-top:2px">${dd[bestD]}/${dt[bestD]} actividades.</p></div>` +
      `<div class="sb sw"><p style="font-weight:500">Día a mejorar: ${DIAS_F[worstD]}</p><p style="font-size:11px;color:#555;margin-top:2px">${dd[worstD]}/${dt[worstD]} actividades.</p></div>`;
    if (bestCat) { const bc = catData[bestCat]; html += `<div class="sb"><p style="font-weight:500">Mejor categoría: ${CATS[bestCat].label}</p><p style="font-size:11px;color:#555;margin-top:2px">${bc.done}/${bc.total} (${Math.round(bc.done/bc.total*100)}%)</p></div>`; }
    if (worstCat && worstCat !== bestCat) { const wc = catData[worstCat]; html += `<div class="sb sw"><p style="font-weight:500">Reforzar: ${CATS[worstCat].label}</p><p style="font-size:11px;color:#555;margin-top:2px">${wc.done}/${wc.total} (${Math.round(wc.done/wc.total*100)}%)</p></div>`; }
    html += `<div class="sb sw"><p style="font-weight:500">Perdidas: ${miss}</p>${miss === 0 ? '<p style="font-size:11px;color:#5DCAA5;margin-top:2px">¡Semana perfecta!</p>' : ''}</div>`;
    html += `<p style="font-size:10px;color:#333;margin-top:1rem;font-style:italic">"Pierde la batalla, nunca la guerra." — Estoicismo</p>`;
    el.innerHTML = html;
  }

  // ── Perdidas ──────────────────────────────────────────────────────────────────
  function renderPerdidas() {
    const days = getDays(weekOffset);
    const missed: { day: string; act: Activity; reason: string }[] = [];
    for (let di = 0; di < 7; di++) {
      const dKey = dk(days[di]);
      for (const act of getSchedForDay(di, days[di])) {
        if (!act.track) continue;
        const rec = state[ak(dKey, act.id)];
        if (rec && !rec.done) missed.push({ day: DIAS_F[di] + ' ' + days[di].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), act, reason: rec.reason });
      }
    }
    const el = document.getElementById('perdidas-list')!;
    if (missed.length === 0) { el.innerHTML = '<p style="color:#555;font-size:13px">Sin actividades perdidas. ¡Camino de guerrero! ⚡</p>'; return; }
    el.innerHTML = missed.map(m =>
      `<div class="mi"><div class="mi-d">${m.day} · <span style="color:${CATS[m.act.cat].color}">${CATS[m.act.cat].label}</span></div><div class="mi-n">${m.act.name}</div><div class="mi-r">${m.reason ? '"' + m.reason + '"' : 'Sin motivo registrado'}</div></div>`
    ).join('');
  }

  // ── Nav ───────────────────────────────────────────────────────────────────────
  function showPage(id: string, tabId: string) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(id)!.classList.add('active');
    document.getElementById(tabId)!.classList.add('active');
  }

  // ── Event listeners ────────────────────────────────────────────────────────────
  document.getElementById('btn-prev')!.onclick = () => { weekOffset--; if (chart) { (chart as { destroy(): void }).destroy(); chart = null; } loadState(); };
  document.getElementById('btn-next')!.onclick = () => { weekOffset++; if (chart) { (chart as { destroy(): void }).destroy(); chart = null; } loadState(); };
  document.getElementById('modal')!.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  document.getElementById('modal-cancel')!.onclick = closeModal;
  document.getElementById('modal-miss')!.onclick   = () => saveAct(false);
  document.getElementById('modal-done')!.onclick   = () => saveAct(true);
  document.querySelectorAll('.tab').forEach(el => {
    (el as HTMLElement).addEventListener('click', function(this: HTMLElement) {
      showPage(this.id.replace('tab-', ''), this.id);
    });
  });

  loadState();
}

// ── React component ────────────────────────────────────────────────────────────
export default function TrackerPage() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const style = document.createElement('style');
    style.id = 'tracker-css';
    style.textContent = TRACKER_CSS + LIGHT_CSS;
    document.head.appendChild(style);

    const root = document.getElementById('tracker-root');
    if (!root) return;
    root.innerHTML = TRACKER_HTML;

    if ((window as unknown as { Chart?: unknown }).Chart) {
      initTracker();
    } else {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
      s.onload = initTracker;
      document.head.appendChild(s);
    }

    return () => { document.getElementById('tracker-css')?.remove(); };
  }, []);

  return <div id="tracker-root" style={{ minHeight: '100vh' }} />;
}
