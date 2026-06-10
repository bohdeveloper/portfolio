'use client';

import { useEffect, useRef } from 'react';
import { CATS, DIAS, DIAS_F, SCHED, SCHED_SWITCH, Activity } from './tracker-data';

const CAT_CLS: Record<string, string> = {
  kronoshin: 'ckr', mente: 'cm', flex: 'cf', prep: 'cp',
  trabajo: 'cw', cardio: 'cc', shaolin: 'cs', psicologo: 'cpsi',
  dormir: 'cd', libre: 'cl',
};

const TRACKER_CSS = `
#tracker-root{font-family:system-ui,sans-serif;font-size:14px;background:#0f0f0f;color:#e8e6e0;padding-bottom:2rem}
.header-bar{padding:.75rem 1rem;background:#111;border-bottom:1px solid #1e1e1e;margin-bottom:.5rem}
.header-bar h2{font-size:16px;font-weight:500;margin-bottom:1px}
.header-bar p{font-size:11px;color:#555}
.tabs{display:flex;background:#1a1a1a;border-bottom:1px solid #2a2a2a;margin-bottom:.75rem;overflow-x:auto}
.tab{padding:9px 16px;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;font-size:13px;color:#999;white-space:nowrap}
.tab.active{color:#f0ede8;border-bottom-color:#5DCAA5;font-weight:500}
.page{display:none;padding:0 .75rem .75rem}.page.active{display:block}
.card{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:1rem;margin-bottom:1rem}
.g4{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:.75rem}
@media(min-width:640px){.g4{grid-template-columns:repeat(4,1fr)}}
.mc{background:#1e1e1e;border:1px solid #333;border-radius:8px;padding:.75rem;text-align:center}
.mc-v{font-size:20px;font-weight:500;color:#e8e6e0}
.mc-l{font-size:10px;color:#888;margin-top:2px}
.week-nav{display:flex;align-items:center;gap:10px;margin-bottom:.75rem}
.week-nav span{flex:1;text-align:center;font-size:13px;font-weight:500}
.btn{padding:6px 12px;border-radius:6px;border:1px solid #2a2a2a;background:#1e1e1e;cursor:pointer;font-size:12px;color:#ccc}
.btn:hover{background:#2a2a2a}
.btn-done{background:#1D6B45;border-color:#1D6B45;color:#fff}
.btn-miss{background:#7a2a1a;border-color:#7a2a1a;color:#fff}
.legend-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:.75rem}
.li{display:flex;align-items:center;gap:5px;font-size:11px;color:#aaa}
.ld{width:9px;height:9px;border-radius:2px;flex-shrink:0}
@media(min-width:640px){.li{font-size:13px}.ld{width:12px;height:12px;border-radius:3px}}
.sched-wrap{overflow-x:auto;overflow-y:auto;max-height:78vh;border:1px solid #2a2a2a;border-radius:10px}
.sched-inner{display:grid;min-width:640px}
.sched-head{display:grid;position:sticky;top:0;z-index:10;background:#111;border-bottom:1px solid #2a2a2a}
.sh-corner{background:#111;border-right:1px solid #2a2a2a}
.sh-day{padding:6px 4px;text-align:center;border-right:1px solid #1e1e1e}
.sh-day:last-child{border-right:none}
.sh-name{font-size:11px;font-weight:500;color:#ccc}
.sh-date{font-size:10px;color:#555;margin-top:1px}
.sh-day{cursor:pointer;transition:background .15s;border-radius:3px}
.sh-day:hover{background:rgba(255,255,255,0.03)}
.sh-edit-hint{font-size:9px;color:#2a2a2a;margin-top:2px;letter-spacing:.2px;transition:color .15s}
.sh-day:hover .sh-edit-hint,.sh-day.tod .sh-edit-hint{color:#3a9a6a}
.sh-day.tod{background:rgba(93,202,165,0.07)}
.sh-day.tod .sh-name{color:#5DCAA5;font-weight:600}
.sh-day.tod .sh-date{color:#3a9a6a}
.day-col.today-col{background:rgba(29,107,69,0.05)!important;border-left:1px solid rgba(93,202,165,0.1);border-right:1px solid rgba(93,202,165,0.14)!important}
.day-col.today-col::before{background-image:repeating-linear-gradient(to bottom,transparent,transparent calc(var(--sh)*1px - 1px),rgba(29,107,69,0.09) calc(var(--sh)*1px - 1px),rgba(29,107,69,0.09) calc(var(--sh)*1px))!important}
#day-cfg-ov{position:fixed;inset:0;z-index:150;background:#0f0f0f;transform:translateX(100%);transition:transform .28s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;overflow:hidden}
#day-cfg-ov.open{transform:translateX(0)}
#day-cfg-ov.today-day .dcfg-hdr{background:rgba(29,107,69,0.15);border-bottom-color:rgba(93,202,165,0.25)}
#day-cfg-ov.today-day #day-cfg-title{color:#5DCAA5}
.dcfg-hdr{padding:.75rem 1rem;background:#111;border-bottom:1px solid #1e1e1e;display:flex;align-items:center;gap:10px;flex-shrink:0}
.dcfg-hdr h2{font-size:15px;font-weight:500;color:#e8e6e0;margin:0;flex:1}
.today-badge{font-size:10px;padding:1px 7px;border-radius:10px;background:rgba(93,202,165,0.18);color:#5DCAA5;border:1px solid rgba(93,202,165,0.35);vertical-align:middle;margin-left:6px;font-weight:600;letter-spacing:.3px}
#day-cfg-scroll{flex:1;overflow-y:auto;padding:.75rem}
.tcrd{background:#1e1e1e;border:1px solid #2a2a2a;border-radius:8px;padding:.65rem 1rem;margin-bottom:.5rem;display:flex;align-items:center;gap:8px;transition:border-color .15s}
.tcrd:hover{border-color:#3a3a3a}
.ef-warn{display:none;font-size:11px;padding:6px 9px;background:rgba(230,168,23,0.08);border:1px solid rgba(230,168,23,0.25);border-radius:5px;color:#e6a817;margin-bottom:.4rem}
.btn-danger{border:1px solid #7a2a1a!important;color:#D85A30!important;background:#150808!important}
.btn-danger:hover{background:#200e0e!important}
.sched-body{display:grid;position:relative}
.time-col{display:flex;flex-direction:column}
.time-row{border-bottom:1px solid #1e1e1e;display:flex;align-items:flex-start;justify-content:flex-end;padding:1px 6px 0;font-size:9px;color:#555;background:#111;border-right:1px solid #2a2a2a;flex-shrink:0}
.time-row.hour-mark{border-bottom:1px solid #2f2f2f}
.day-col{position:relative;border-right:1px solid #1e1e1e}
.day-col:last-child{border-right:none}
.day-col::before{content:'';position:absolute;inset:0;background-image:repeating-linear-gradient(to bottom,transparent,transparent calc(var(--sh) * 1px - 1px),#1a1a1a calc(var(--sh) * 1px - 1px),#1a1a1a calc(var(--sh) * 1px));pointer-events:none;z-index:0}
.ab{position:absolute;left:2px;right:2px;border-radius:5px;border:1px solid rgba(255,255,255,.1);cursor:pointer;font-size:11px;font-weight:500;padding:3px 6px;text-align:left;line-height:1.35;overflow:hidden;transition:filter .15s,box-shadow .2s;border-left:3px solid rgba(255,255,255,.25);z-index:1}
.ab:hover{filter:brightness(1.25);z-index:5}
.ab.done::after{content:'✓';position:absolute;top:3px;right:5px;font-size:10px;color:#9ef5cb;font-weight:700}
.ab.miss::after{content:'✗';position:absolute;top:3px;right:5px;font-size:10px;color:#ffb3a0;font-weight:700}
.ab.fut{opacity:.2;cursor:default;pointer-events:none}
.ab.nt{cursor:default;opacity:.7}
.ab-time{display:block;font-size:9px;font-weight:400;opacity:.75;margin-top:1px;white-space:nowrap}
.now-line{position:absolute;left:0;right:0;height:2px;background:#5DCAA5;z-index:8;pointer-events:none}
.now-dot{position:absolute;left:-4px;top:-4px;width:10px;height:10px;border-radius:50%;background:#5DCAA5}
.ckr{background:#155e8a;border-left-color:rgba(255,255,255,.35)}
.cm{background:#3830a8;border-left-color:rgba(255,255,255,.35)}
.cf{background:#0e7858;border-left-color:rgba(255,255,255,.35)}
.cp{background:#2e2e2e;color:#999;border-left-color:#484848}
.cw{background:#10406a;border-left-color:rgba(255,255,255,.35)}
.cc{background:#943212;border-left-color:rgba(255,255,255,.35)}
.cs{background:#186e42;border-left-color:rgba(255,255,255,.35)}
.cpsi{background:#642888;border-left-color:rgba(255,255,255,.35)}
.cd{background:#0a0e18;color:#252e40;border-left-color:#252e40}
.cl{background:#1e1e1e;color:#555;border-left-color:#333}
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
.tip.tip-done{background:#182a20;border-color:rgba(93,202,165,.45)}.tip.tip-done strong{color:#9ef5cb}
.tip.tip-miss{background:#2a1710;border-color:rgba(216,90,48,.45)}.tip.tip-miss strong{color:#ffb3a0}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:200}
.modal{background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:1.25rem;width:340px;max-width:92vw}
.modal h3{margin-bottom:.35rem;color:#e8e6e0;font-size:14px}
.modal-sub{font-size:11px;color:#555;margin-bottom:.5rem}
.modal textarea{width:100%;background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:8px;font-size:13px;color:#e8e6e0;resize:vertical;min-height:65px;font-family:inherit}
.modal-btns{display:flex;gap:8px;margin-top:.65rem;justify-content:flex-end}
.hidden{display:none}
.cfg-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem}
.cfg-hdr h3{font-size:13px;font-weight:500;color:#e8e6e0;margin:0}
.cat-row{display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid #222;cursor:pointer;border-radius:4px;margin:0 -6px;transition:background .12s}
.cat-row:hover{background:rgba(255,255,255,0.04)}
.cat-row:last-child{border-bottom:none}
.cat-sw{width:14px;height:14px;border-radius:50%;flex-shrink:0;border:2px solid rgba(255,255,255,.15);cursor:pointer}
.cat-label{flex:1;font-size:13px;color:#ccc}
.task-row{display:flex;align-items:center;gap:8px;padding:7px 4px;border-bottom:1px solid #1e1e1e;cursor:pointer;border-radius:4px}
.task-row:hover{background:#222;margin:0 -4px;padding:7px 8px}
.task-row:last-child{border-bottom:none}
.task-time{font-size:11px;color:#555;width:86px;flex-shrink:0}
.task-name{flex:1;font-size:13px;color:#ccc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.task-badge{font-size:10px;padding:2px 6px;border-radius:3px;color:#fff;flex-shrink:0;max-width:82px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.task-track{font-size:11px;flex-shrink:0;width:14px;text-align:center}
.day-tabs-cfg{display:flex;gap:4px;margin-bottom:.75rem;flex-wrap:wrap}
.dt-btn{padding:4px 10px;border-radius:5px;border:1px solid #2a2a2a;background:#1e1e1e;cursor:pointer;font-size:11px;color:#888}
.dt-btn.active{background:#1D6B45;border-color:#1D6B45;color:#fff}
.btn-sm{padding:4px 10px;border-radius:5px;border:1px solid #2a2a2a;background:#1e1e1e;cursor:pointer;font-size:11px;color:#ccc}
.btn-sm:hover{background:#2a2a2a}
.btn-del{color:#D85A30!important;border-color:#4a1010!important;background:#150808!important}
.btn-del:hover{background:#200e0e!important}
.cfg-empty{font-size:12px;color:#444;padding:.4rem 0;font-style:italic;margin:0}
.form-row{margin-bottom:.6rem}
.form-row label{display:block;font-size:11px;color:#666;margin-bottom:3px}
.form-row input,.form-row select,.form-row textarea{width:100%;background:#111;border:1px solid #2a2a2a;border-radius:6px;padding:6px 8px;font-size:12px;color:#e8e6e0;font-family:inherit;box-sizing:border-box}
.form-row textarea{resize:vertical;min-height:48px}
.form-row select option{background:#1a1a1a;color:#e8e6e0}
.form-2col{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.tcrd.tcrd-fut{opacity:.35;cursor:default!important}
.trk-btn{font-size:10px;padding:2px 7px;border-radius:3px;border:1px solid;cursor:pointer;flex-shrink:0;background:transparent;line-height:1.4;transition:filter .15s}
.trk-btn.on{border-color:rgba(93,202,165,.45);color:#5DCAA5}
.trk-btn.off{border-color:#2a2a2a;color:#444}
.trk-btn:hover{filter:brightness(1.4)}
`;

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
html.light .tip.tip-done{background:#f0fff8;border-color:rgba(29,107,69,.35)}.light .tip.tip-done strong{color:#1D6B45}
html.light .tip.tip-miss{background:#fff5f2;border-color:rgba(160,40,20,.35)}.light .tip.tip-miss strong{color:#a83210}
html.light .modal{background:#fff;border-color:#e0e0e0}
html.light .modal h3{color:#1a1a1a}
html.light .modal-sub{color:#777}
html.light .modal textarea{background:#f5f5f5;border-color:#e0e0e0;color:#1a1a1a}
html.light .week-nav span{color:#1a1a1a}
html.light .cfg-hdr h3{color:#1a1a1a}
html.light .cat-row{border-bottom-color:#e8e8e8}
html.light .cat-row:hover{background:rgba(0,0,0,0.03)}
html.light .cat-label{color:#333}
html.light .task-row:hover{background:#f0f0f0}
html.light .task-time{color:#999}
html.light .task-name{color:#333}
html.light .dt-btn{background:#f0f0f0;border-color:#d0d0d0;color:#666}
html.light .btn-sm{background:#f0f0f0;border-color:#d0d0d0;color:#333}
html.light .btn-sm:hover{background:#e0e0e0}
html.light .form-row input,html.light .form-row select,html.light .form-row textarea{background:#f5f5f5;border-color:#e0e0e0;color:#1a1a1a}
html.light #day-cfg-ov{background:#f5f5f5}
html.light .dcfg-hdr{background:#fff;border-bottom-color:#e0e0e0}
html.light .dcfg-hdr h2{color:#1a1a1a}
html.light .tcrd{background:#fff;border-color:#e0e0e0}
html.light .tcrd:hover{border-color:#ccc}
html.light .day-col.today-col{background:rgba(0,168,191,0.05)!important;border-color:rgba(0,168,191,0.15)!important}
html.light .sh-day.tod{background:rgba(0,168,191,0.07)}
html.light .ef-warn{background:rgba(230,168,23,0.06);border-color:rgba(230,168,23,0.2)}
html.light #day-cfg-ov{background:#f5f5f5}
html.light .dcfg-hdr{background:#fff;border-bottom-color:#e0e0e0}
html.light .dcfg-hdr h2{color:#1a1a1a}
html.light .tcrd{background:#fff;border-color:#e0e0e0}
html.light .tcrd:hover{border-color:#ccc}
`;

const TRACKER_HTML = `
<div class="header-bar">
  <h2 id="tracker-username">⚡ Tracker</h2>
  <p id="tracker-subtitle"></p>
</div>
<div class="tabs">
  <button class="tab active" id="tab-semana">Semana</button>
  <button class="tab" id="tab-estadisticas">Estadísticas</button>
  <button class="tab" id="tab-resumen">Resumen</button>
  <button class="tab" id="tab-perdidas">Perdidas</button>
  <button class="tab" id="tab-configurar">Categorías</button>
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
<div id="configurar" class="page">
  <div class="card" id="cfg-cats-card">
    <div id="cfg-cats"></div>
  </div>
  <p style="font-size:11px;color:#444;margin-top:.5rem;font-style:italic">Para editar tareas, haz clic en la cabecera del día en la vista Semana.</p>
  <div class="card" style="margin-top:1rem">
    <div class="cfg-hdr" style="margin-bottom:.4rem"><h3 style="font-size:12px">Inicio del horario</h3></div>
    <p style="font-size:12px;color:#666;margin-bottom:.6rem">Oculta las tareas anteriores a esta fecha y limpia los registros históricos hasta ese momento.</p>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="date" id="cfg-sched-start" style="background:#111;border:1px solid #2a2a2a;border-radius:5px;padding:5px 8px;color:#e8e6e0;font-size:12px;font-family:inherit" />
      <button class="btn-sm" id="btn-sched-start-save">Aplicar</button>
      <button class="btn-sm btn-del" id="btn-sched-start-clear" style="padding:4px 8px">✕ Quitar</button>
    </div>
  </div>
</div>
<div id="day-cfg-ov">
  <div class="dcfg-hdr">
    <button class="btn" id="day-cfg-back" title="Volver a la semana">←</button>
    <button class="btn" id="day-cfg-prev" style="padding:6px 10px" title="Día anterior">‹</button>
    <h2 id="day-cfg-title" style="flex:1;text-align:center;font-size:14px"></h2>
    <button class="btn" id="day-cfg-next" style="padding:6px 10px" title="Día siguiente">›</button>
    <button class="btn-sm" id="day-cfg-add">+ Tarea</button>
  </div>
  <div id="day-cfg-scroll">
    <div id="day-cfg-tasks"></div>
  </div>
</div>
<div class="tip" id="tip"><strong id="tip-title"></strong><span id="tip-desc"></span><em class="tip-reason" id="tip-reason"></em></div>
<div id="modal" class="modal-bg hidden">
  <div class="modal">
    <h3 id="m-title"></h3>
    <p class="modal-sub" id="m-desc"></p>
    <p class="modal-sub" id="m-day"></p>
    <div id="m-status" style="margin-bottom:.5rem;font-size:12px"></div>
    <div id="m-reason-wrap" style="display:none;margin-bottom:.5rem">
      <label style="font-size:11px;color:#D85A30;display:block;margin-bottom:3px">Motivo <span style="opacity:.7">(obligatorio)</span></label>
      <textarea id="m-reason" placeholder="¿Por qué no se realizó?..."></textarea>
    </div>
    <div class="modal-btns">
      <button class="btn" id="modal-cancel">Cancelar</button>
      <button class="btn btn-miss" id="modal-miss">✗ Perdida</button>
      <button class="btn btn-done" id="modal-done">✓ Completada</button>
    </div>
  </div>
</div>
<div id="edit-modal" class="modal-bg hidden">
  <div class="modal" style="width:380px;max-width:94vw">
    <h3 id="em-title" style="margin-bottom:.75rem;font-size:14px;color:#e8e6e0"></h3>
    <div id="em-body"></div>
    <div class="modal-btns" style="margin-top:.75rem">
      <button class="btn" id="em-cancel">Cancelar</button>
      <button class="btn btn-done" id="em-save">Guardar</button>
    </div>
  </div>
</div>
<div id="action-modal" class="modal-bg hidden">
  <div class="modal" style="width:360px;max-width:94vw">
    <h3 id="am-title" style="font-size:14px;color:#e8e6e0;margin-bottom:.25rem"></h3>
    <p class="modal-sub" id="am-time" style="margin-bottom:.1rem"></p>
    <p class="modal-sub" id="am-day" style="margin-bottom:.5rem"></p>
    <div id="am-state" style="margin-bottom:.5rem;font-size:12px"></div>
    <div id="am-reason-wrap" style="display:none;margin-bottom:.5rem">
      <label style="font-size:11px;color:#D85A30;display:block;margin-bottom:3px">Motivo <span style="opacity:.7">(obligatorio)</span></label>
      <textarea id="am-reason" placeholder="¿Por qué no se realizó?..."></textarea>
    </div>
    <div class="modal-btns" style="flex-wrap:wrap;gap:6px;margin-top:.65rem">
      <button class="btn" id="am-cancel">Cancelar</button>
      <button class="btn" id="am-edit" style="border-color:#555;color:#aaa">✎ Editar</button>
      <button class="btn btn-miss" id="am-miss">✗ Perdida</button>
      <button class="btn btn-done" id="am-done">✓ Completada</button>
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
function dkLocal(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
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
function minToTime(min: number): string {
  const h = Math.floor(min / 60), m = min % 60;
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}
function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
function slugCat(label: string): string {
  const s = label.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 20);
  return s || 'cat_' + Date.now().toString(36);
}

type StateRecord = { done: boolean; reason: string; ts: number | string };
interface DynCat { id: number; cat_key: string; label: string; color: string; }
interface RawTask { id: number; day_index: number; activity_id: string; name: string; cat_key: string; start_min: number; end_min: number; description: string; track: number; }

function initTracker() {
  const PX_PER_MIN = 1.6;
  const DAY_START  = 5 * 60;
  const DAY_END    = 23 * 60;
  const SLOT_MIN   = 30;

  let state: Record<string, StateRecord> = {};
  let weekOffset = 0;
  let pending: { dKey: string; act: Activity; dayIdx: number } | null = null;
  let chart: unknown = null;
  let userId = 0;
  let dynCats: Record<string, DynCat> = {};
  let dynTasksByDay: Activity[][] = Array.from({ length: 7 }, () => []);
  let rawTaskMap: Record<string, RawTask> = {};
  let cfgDayIdx = 0;
  let cfgDayKey = '';
  let schedStartDate: string = (() => { try { return localStorage.getItem('tracker_sched_start') || ''; } catch { return ''; } })();
  let editMode: 'cat' | 'task' = 'cat';
  let editCatId = 0;
  let editTaskId = 0;
  let actionPending: { dKey: string; act: Activity; dayIdx: number; rawTask?: RawTask } | null = null;

  const NO_CAT = { label: 'Sin categoría', color: '#3a3a3a' };

  function getTextColor(hex: string): string {
    const h = hex.replace('#', '');
    if (h.length < 6) return '#fff';
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#111' : '#fff';
  }

  function getCatInfo(key: string): { label: string; color: string } {
    if (!key) return NO_CAT;
    if (dynCats[key]) return dynCats[key];
    if (key === '_none') return NO_CAT;
    const c = CATS[key];
    return c ? { label: c.label, color: c.color } : NO_CAT;
  }

  function applyScheduleData(res: { ok: boolean; user_id?: number; categories?: DynCat[]; tasks?: RawTask[] }) {
    if (!res.ok) return;
    userId = res.user_id ?? 0;
    dynCats = {};
    for (const c of (res.categories ?? [])) dynCats[c.cat_key] = c;
    rawTaskMap = {};
    dynTasksByDay = Array.from({ length: 7 }, () => []);
    for (const t of (res.tasks ?? [])) {
      dynTasksByDay[t.day_index].push({ id: t.activity_id, name: t.name, cat: t.cat_key, start: t.start_min, end: t.end_min, desc: t.description, track: !!t.track });
      rawTaskMap[t.day_index + '_' + t.activity_id] = t;
    }
    if (userId === 1) {
      document.getElementById('tracker-username')!.textContent = '⚡ Transformación Integral — Borja';
      document.getElementById('tracker-subtitle')!.textContent = 'Estoicismo · Shaolin · BIZIKI — Fase 1: Fundación';
    } else {
      document.getElementById('tracker-username')!.textContent = '⚡ Mi tracker';
    }
  }

  function loadSchedule() {
    fetch('/api/tracker/schedule')
      .then(r => r.json())
      .then((res: { ok: boolean; user_id?: number; categories?: DynCat[]; tasks?: RawTask[] }) => {
        applyScheduleData(res);
        loadState();
      })
      .catch(() => loadState());
  }

  function reloadSchedule() {
    fetch('/api/tracker/schedule')
      .then(r => r.json())
      .then((res: { ok: boolean; user_id?: number; categories?: DynCat[]; tasks?: RawTask[] }) => {
        applyScheduleData(res);
        renderAll();
        if (document.getElementById('configurar')?.classList.contains('active')) renderConfig();
        if (document.getElementById('day-cfg-ov')?.classList.contains('open')) renderDayCfgTasks();
      })
      .catch(() => {});
  }

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

  function renderAll() {
    renderWeek();
    renderStats();
    renderResumen();
    renderPerdidas();
    if (document.getElementById('configurar')?.classList.contains('active')) renderConfig();
  }

  function getSchedForDay(di: number, dayDate: Date): Activity[] {
    if (schedStartDate && dkLocal(dayDate) < schedStartDate) return [];
    if (userId === 1 && dk(dayDate) < SCHED_SWITCH) return SCHED[di] || [];
    return dynTasksByDay[di] || [];
  }

  // ── Tooltip ──────────────────────────────────────────────────────────────────
  const tipEl = document.getElementById('tip')!;
  function showTip(e: MouseEvent, name: string, desc: string, reason = '', done?: boolean | null) {
    document.getElementById('tip-title')!.textContent = name;
    document.getElementById('tip-desc')!.textContent = desc;
    const tipReason = document.getElementById('tip-reason')!;
    if (reason) { tipReason.textContent = '"' + reason + '"'; tipReason.style.display = 'block'; }
    else { tipReason.style.display = 'none'; }
    tipEl.classList.remove('tip-done', 'tip-miss');
    if (done === true)  tipEl.classList.add('tip-done');
    if (done === false) tipEl.classList.add('tip-miss');
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
    head.innerHTML = '<div class="sh-corner" style="min-height:44px"></div>';
    for (let di = 0; di < 7; di++) {
      const d = days[di], isT = d.getTime() === today.getTime();
      head.innerHTML += `<div class="sh-day${isT ? ' tod' : ''}" data-di="${di}" data-dkey="${dk(d)}" title="Configurar ${DIAS[di]}"><div class="sh-name">${DIAS[di]}</div><div class="sh-date">${d.getDate()} ${d.toLocaleDateString('es-ES', { month: 'short' })}</div><div class="sh-edit-hint">✎ editar</div></div>`;
    }
    document.querySelectorAll('.sh-day[data-di]').forEach(el => {
      el.addEventListener('click', () => {
        const di2 = parseInt((el as HTMLElement).dataset.di || '0');
        const dkey = (el as HTMLElement).dataset.dkey || '';
        openDayCfg(di2, dkey, DIAS_F[di2] + ', ' + days[di2].toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }));
      });
    });

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
    const catSet = new Set<string>();
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    for (let di = 0; di < 7; di++) {
      const d2 = days[di], dKey = dk(d2), isFut = d2 > today;
      const col = document.createElement('div');
      const isToday = d2.getTime() === today.getTime();
      col.className = 'day-col' + (isToday ? ' today-col' : '');
      col.style.cssText = `height:${totalH}px;--sh:${Math.round((SLOT_MIN / totalMins) * totalH)}px;`;

      for (const act of getSchedForDay(di, d2)) {
        const topPx = ((act.start - DAY_START) / totalMins) * totalH;
        const hPx   = ((act.end - act.start) / totalMins) * totalH;
        const rec   = state[ak(dKey, act.id)];
        const catInfo = getCatInfo(act.cat);
        const cls = CAT_CLS[act.cat] || '';

        if (act.cat !== 'prep' && act.cat !== 'libre' && act.cat !== 'dormir') catSet.add(act.cat);

        const el = document.createElement('button');
        if (cls && !dynCats[act.cat]) {
          el.className = 'ab ' + cls;
        } else {
          el.className = 'ab';
          el.style.background = catInfo.color;
          el.style.color = getTextColor(catInfo.color);
          el.style.borderLeftColor = 'rgba(255,255,255,.25)';
        }
        el.style.top = topPx + 'px';
        el.style.height = hPx + 'px';
        const timeStr = fmt(act.start) + '–' + fmt(act.end);
        if (hPx >= 28)      el.innerHTML = `<span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${act.name}</span><span class="ab-time">${timeStr}</span>`;
        else if (hPx >= 16) el.innerHTML = `<span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px">${act.name}</span>`;

        const isTaskFuture = isFut || (isToday && act.start > currentMin);
        if (act.track) totalActs++; // cuenta toda la semana para las estadísticas
        if (isTaskFuture) {
          el.classList.add('fut');
        } else {
          if (rec) {
            rec.done
              ? (el.classList.add('done'), act.track && doneActs++)
              : (el.classList.add('miss'), act.track && missActs++);
          }
          if (!act.track) {
            el.classList.add('nt');
          } else {
            ((dk2: string, a: Activity, di2: number, d3: Date) => {
              el.onclick = () => openModal(dk2, a, di2, DIAS_F[di2] + ' ' + d3.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
            })(dKey, act, di, d2);
          }
        }
        ((a: Activity, dstr: string) => {
          el.addEventListener('mouseenter', e => {
            const r = state[ak(dstr, a.id)];
            showTip(e as MouseEvent, a.name, a.desc, r?.reason || '', r ? r.done : null);
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

    const catOrderKeys = Object.keys(dynCats).length > 0 ? Object.keys(dynCats) : Object.keys(CATS);
    const sortedCats = [...catSet].sort((a, b) => catOrderKeys.indexOf(a) - catOrderKeys.indexOf(b));
    document.getElementById('legend')!.innerHTML = sortedCats.map(c => {
      const info = getCatInfo(c);
      return `<div class="li"><div class="ld" style="background:${info.color}"></div>${info.label}</div>`;
    }).join('');

    const wrap = document.getElementById('sched-wrap')!;
    const scrollTo = ((5 * 60 + 30 - DAY_START) / (DAY_END - DAY_START)) * totalH + 34;
    wrap.scrollTop = Math.max(0, scrollTo - 30);
  }

  // ── Modal (tracking) ─────────────────────────────────────────────────────────
  function openModal(dKey: string, act: Activity, dayIdx: number, dayLabel: string) {
    pending = { dKey, act, dayIdx };
    document.getElementById('m-title')!.textContent = act.name;
    document.getElementById('m-desc')!.textContent  = act.desc;
    document.getElementById('m-day')!.textContent   = dayLabel;
    const ex = state[ak(dKey, act.id)];
    const alreadyMiss = ex && !ex.done;
    (document.getElementById('m-reason') as HTMLTextAreaElement).value = ex?.reason || '';
    (document.getElementById('m-reason-wrap') as HTMLElement).style.display = alreadyMiss ? 'block' : 'none';
    const stEl = document.getElementById('m-status')!;
    stEl.innerHTML = ex
      ? (ex.done ? '<span style="color:#5DCAA5;font-weight:600">✓ Completada</span>' : '<span style="color:#ff7a5c;font-weight:600">✗ Perdida</span>')
      : '<span style="color:#555">Sin registrar</span>';
    document.getElementById('modal')!.classList.remove('hidden');
  }
  function closeModal() {
    document.getElementById('modal')!.classList.add('hidden');
    (document.getElementById('m-reason-wrap') as HTMLElement).style.display = 'none';
    pending = null;
  }
  function saveAct(done: boolean) {
    if (!pending) return;
    const reason = done ? '' : (document.getElementById('m-reason') as HTMLTextAreaElement).value.trim();
    if (!done && !reason) {
      const wrap = document.getElementById('m-reason-wrap') as HTMLElement;
      wrap.style.display = 'block';
      (document.getElementById('m-reason') as HTMLTextAreaElement).focus();
      return;
    }
    const key = ak(pending.dKey, pending.act.id);
    state[key] = { done, reason, ts: Date.now() };
    saveRecord(pending.dKey, pending.act.id, pending.dayIdx, done, reason);
    closeModal();
    renderAll();
  }

  // ── Action modal (tracking desde day-cfg) ────────────────────────────────────
  function openActionModal(act: Activity, dKey: string, dayIdx: number, rawTask?: RawTask) {
    actionPending = { dKey, act, dayIdx, rawTask };
    document.getElementById('am-title')!.textContent = act.name;
    document.getElementById('am-time')!.textContent = fmt(act.start) + '–' + fmt(act.end);
    document.getElementById('am-day')!.textContent = DIAS_F[dayIdx] + ', ' + new Date(dKey + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    const ex = state[ak(dKey, act.id)];
    const alreadyMiss = ex && !ex.done;
    (document.getElementById('am-reason') as HTMLTextAreaElement).value = ex?.reason || '';
    (document.getElementById('am-reason-wrap') as HTMLElement).style.display = alreadyMiss ? 'block' : 'none';
    const stEl = document.getElementById('am-state')!;
    stEl.innerHTML = ex
      ? (ex.done ? '<span style="color:#5DCAA5">✓ Completada</span>' : '<span style="color:#D85A30">✗ Perdida</span>')
      : '<span style="color:#555">Sin registrar</span>';
    document.getElementById('action-modal')!.classList.remove('hidden');
  }
  function closeActionModal() {
    document.getElementById('action-modal')!.classList.add('hidden');
    (document.getElementById('am-reason-wrap') as HTMLElement).style.display = 'none';
    actionPending = null;
  }
  function saveActionAct(done: boolean) {
    if (!actionPending) return;
    const reason = done ? '' : (document.getElementById('am-reason') as HTMLTextAreaElement).value.trim();
    if (!done && !reason) {
      const wrap = document.getElementById('am-reason-wrap') as HTMLElement;
      wrap.style.display = 'block';
      (document.getElementById('am-reason') as HTMLTextAreaElement).focus();
      return;
    }
    const key = ak(actionPending.dKey, actionPending.act.id);
    state[key] = { done, reason, ts: Date.now() };
    saveRecord(actionPending.dKey, actionPending.act.id, actionPending.dayIdx, done, reason);
    closeActionModal();
    renderAll();
    if (document.getElementById('day-cfg-ov')?.classList.contains('open')) renderDayCfgTasks();
  }

  // ── Stats ─────────────────────────────────────────────────────────────────────
  function renderStats() {
    const days = getDays(weekOffset);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const catKeys = Object.keys(dynCats).length > 0 ? Object.keys(dynCats) : Object.keys(CATS);
    const catData: Record<string, { total: number; done: number }> = {};
    catKeys.forEach(k => catData[k] = { total: 0, done: 0 });
    const dd = [0,0,0,0,0,0,0], dt = [0,0,0,0,0,0,0], dm = [0,0,0,0,0,0,0];
    let miss = 0;

    for (let di = 0; di < 7; di++) {
      const d2 = days[di];
      const dKey = dk(d2);
      const isFut = d2 > today;
      for (const act of getSchedForDay(di, d2)) {
        if (!act.track || isFut) continue;
        const rec = state[ak(dKey, act.id)];
        if (!catData[act.cat]) catData[act.cat] = { total: 0, done: 0 };
        catData[act.cat].total++; dt[di]++;
        if (rec?.done) { catData[act.cat].done++; dd[di]++; }
        if (rec && !rec.done) { miss++; dm[di]++; }
      }
    }

    let total = 0, done = 0;
    Object.values(catData).forEach(c => { total += c.total; done += c.done; });
    const pct  = total > 0 ? Math.round(done / total * 100) : 0;
    let streak = 0;
    for (let i = 0; i < 7; i++) { if (dt[i] > 0 && dd[i] === dt[i]) streak++; else break; }

    document.getElementById('stat-metrics')!.innerHTML =
      `<div class="mc"><div class="mc-v">${pct}%</div><div class="mc-l">Cumplimiento</div></div>` +
      `<div class="mc"><div class="mc-v" style="color:#5DCAA5">${done}</div><div class="mc-l">Completadas</div></div>` +
      `<div class="mc"><div class="mc-v" style="color:#D85A30">${miss}</div><div class="mc-l">Perdidas</div></div>` +
      `<div class="mc"><div class="mc-v" style="color:#534AB7">${streak}</div><div class="mc-l">Días perfectos</div></div>`;

    document.getElementById('cat-bars')!.innerHTML = catKeys
      .filter(k => catData[k] && catData[k].total > 0)
      .map(k => {
        const { total: t, done: d } = catData[k];
        const p = Math.round(d / t * 100);
        const info = getCatInfo(k);
        return `<div class="cr"><span class="cn">${info.label}</span><div style="flex:1"><div class="pb"><div class="pf" style="width:${p}%;background:${info.color}"></div></div></div><span class="cpct" style="color:${info.color}">${p}%</span></div>`;
      }).join('');

    if (chart) { (chart as { destroy(): void }).destroy(); chart = null; }
    const canvas = document.getElementById('dayChart') as HTMLCanvasElement | null;
    if (canvas) {
      chart = new (window as unknown as { Chart: new (ctx: unknown, cfg: unknown) => unknown }).Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: { labels: DIAS, datasets: [
          { label: 'Completadas', data: dd, backgroundColor: '#1D6B45', borderRadius: 3 },
          { label: 'Perdidas',    data: dm, backgroundColor: '#7a2a1a', borderRadius: 3 },
          { label: 'Total',       data: dt, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 3 },
        ]},
        options: {
          animation: false,
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
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const catKeys = Object.keys(dynCats).length > 0 ? Object.keys(dynCats) : Object.keys(CATS);
    const catData: Record<string, { total: number; done: number }> = {};
    catKeys.forEach(k => catData[k] = { total: 0, done: 0 });
    const dd = [0,0,0,0,0,0,0], dt = [0,0,0,0,0,0,0];
    let total = 0, done = 0, miss = 0;

    for (let di = 0; di < 7; di++) {
      const d2 = days[di];
      const dKey = dk(d2);
      const isFut = d2 > today;
      for (const act of getSchedForDay(di, d2)) {
        if (!act.track || isFut) continue;
        const rec = state[ak(dKey, act.id)];
        if (!catData[act.cat]) catData[act.cat] = { total: 0, done: 0 };
        total++; dt[di]++; catData[act.cat].total++;
        if (rec && rec.done) { done++; dd[di]++; catData[act.cat].done++; }
        if (rec && !rec.done) miss++;
      }
    }

    const el = document.getElementById('resumen-content')!;
    if (done === 0) { el.innerHTML = '<p style="color:#555;font-size:13px">Registra actividades para ver tu evolución.</p>'; return; }

    const pct = Math.round(done / total * 100);
    let bestD = 0;
    for (let i = 1; i < 7; i++) if (dd[i] > dd[bestD]) bestD = i;
    let worstD = 0;
    for (let i = 1; i < 7; i++) { const ra = dt[i] > 0 ? dd[i]/dt[i] : 1, rb = dt[worstD] > 0 ? dd[worstD]/dt[worstD] : 1; if (ra < rb) worstD = i; }
    const sorted = catKeys.filter(k => catData[k] && catData[k].total > 0).sort((a, b) => (catData[b].done/catData[b].total) - (catData[a].done/catData[a].total));
    const bestCat = sorted[0], worstCat = sorted[sorted.length - 1];

    let html = `<h3 style="margin-bottom:.75rem;font-size:14px">Resumen de semana</h3>` +
      `<div class="sb"><p style="font-weight:500">Cumplimiento global: ${pct}%</p><p style="font-size:11px;color:#555;margin-top:2px">${done} de ${total} actividades rastreadas.</p></div>` +
      `<div class="sb"><p style="font-weight:500">Mejor día: ${DIAS_F[bestD]}</p><p style="font-size:11px;color:#555;margin-top:2px">${dd[bestD]}/${dt[bestD]} actividades.</p></div>` +
      `<div class="sb sw"><p style="font-weight:500">Día a mejorar: ${DIAS_F[worstD]}</p><p style="font-size:11px;color:#555;margin-top:2px">${dd[worstD]}/${dt[worstD]} actividades.</p></div>`;
    if (bestCat) { const bc = catData[bestCat]; html += `<div class="sb"><p style="font-weight:500">Mejor categoría: ${getCatInfo(bestCat).label}</p><p style="font-size:11px;color:#555;margin-top:2px">${bc.done}/${bc.total} (${Math.round(bc.done/bc.total*100)}%)</p></div>`; }
    if (worstCat && worstCat !== bestCat) { const wc = catData[worstCat]; html += `<div class="sb sw"><p style="font-weight:500">Reforzar: ${getCatInfo(worstCat).label}</p><p style="font-size:11px;color:#555;margin-top:2px">${wc.done}/${wc.total} (${Math.round(wc.done/wc.total*100)}%)</p></div>`; }
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
    el.innerHTML = missed.map(m => {
      const info = getCatInfo(m.act.cat);
      return `<div class="mi"><div class="mi-d">${m.day} · <span style="color:${info.color}">${info.label}</span></div><div class="mi-n">${m.act.name}</div><div class="mi-r">${m.reason ? '"' + m.reason + '"' : 'Sin motivo registrado'}</div></div>`;
    }).join('');
  }

  // ── Configurar tab (solo categorías) ─────────────────────────────────────────
  function renderConfig() {
    renderCatsList();
  }

  function renderCatsList() {
    const noneInfo = getCatInfo('_none');
    const cats = Object.values(dynCats).filter(c => c.cat_key !== '_none');
    let inner = `<div class="cfg-hdr"><h3>Categorías</h3><button class="btn-sm" id="btn-add-cat">+ Añadir</button></div>`;
    inner += `<div class="cat-row" id="cat-row-none" style="cursor:pointer">` +
      `<div class="cat-sw" style="background:${noneInfo.color};pointer-events:none"></div>` +
      `<span class="cat-label" style="flex:1">${noneInfo.label} <span style="font-size:10px;color:#555">(defecto)</span></span>` +
      `<button class="btn-sm" id="btn-edit-none">Editar</button>` +
      `</div>`;
    if (cats.length > 0) {
      inner += cats.map(c =>
        `<div class="cat-row" data-cid="${c.id}">` +
        `<div class="cat-sw" style="background:${c.color};pointer-events:none"></div>` +
        `<span class="cat-label">${c.label}</span>` +
        `<button class="btn-sm btn-del btn-del-cat" data-cid="${c.id}" title="Eliminar">✕</button>` +
        `</div>`
      ).join('');
    }
    document.getElementById('cfg-cats')!.innerHTML = inner;

    document.getElementById('btn-add-cat')?.addEventListener('click', () => openCatModal(0));
    document.getElementById('btn-edit-none')?.addEventListener('click', () => openCatModal(-1));
    document.querySelectorAll('.cat-row[data-cid]').forEach(row => {
      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).classList.contains('btn-del-cat') ||
            (e.target as HTMLElement).classList.contains('btn-del')) return;
        openCatModal(parseInt((row as HTMLElement).dataset.cid || '0'));
      });
    });
    document.querySelectorAll('.btn-del-cat').forEach(btn =>
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt((btn as HTMLElement).dataset.cid || '0');
        if (!id || !confirm('¿Eliminar esta categoría?')) return;
        fetch('/api/tracker/categories?id=' + id, { method: 'DELETE' })
          .then(() => reloadSchedule())
          .catch(() => {});
      })
    );
  }

  function renderDayTabs() {
    const el = document.getElementById('cfg-day-tabs');
    if (!el) return;
    el.innerHTML = DIAS.map((d, i) =>
      `<button class="dt-btn${i === cfgDayIdx ? ' active' : ''}" data-di="${i}">${d}</button>`
    ).join('');
    el.querySelectorAll('.dt-btn').forEach(btn =>
      btn.addEventListener('click', () => {
        cfgDayIdx = parseInt((btn as HTMLElement).dataset.di || '0');
        renderDayTabs();
        renderTasksList();
      })
    );
  }

  function renderTasksList() {
    const el = document.getElementById('cfg-tasks-list');
    if (!el) return;
    const tasks = (dynTasksByDay[cfgDayIdx] || []).slice().sort((a, b) => a.start - b.start);
    let html = '';
    if (tasks.length === 0) {
      html = `<p class="cfg-empty">Sin tareas para el ${DIAS_F[cfgDayIdx]}.</p>`;
    } else {
      html = tasks.map(t => {
        const raw = rawTaskMap[cfgDayIdx + '_' + t.id];
        const info = getCatInfo(t.cat);
        return `<div class="task-row" data-aid="${t.id}">` +
          `<span class="task-time">${fmt(t.start)}–${fmt(t.end)}</span>` +
          `<span class="task-name">${t.name}</span>` +
          `<span class="task-badge" style="background:${info.color}">${info.label}</span>` +
          `<span class="task-track" style="color:${t.track ? '#5DCAA5' : '#444'}">${t.track ? '✓' : '—'}</span>` +
          `<button class="btn-sm btn-del btn-del-task" data-tid="${raw?.id || 0}" title="Eliminar">✕</button>` +
          `</div>`;
      }).join('');
    }
    html += `<div style="margin-top:.75rem"><button class="btn-sm" id="btn-add-task">+ Añadir tarea</button></div>`;
    el.innerHTML = html;

    el.querySelectorAll('.task-row').forEach((row, i) => {
      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).classList.contains('btn-del-task') || (e.target as HTMLElement).classList.contains('btn-del')) return;
        const raw = rawTaskMap[cfgDayIdx + '_' + tasks[i].id];
        if (raw) openTaskModal(raw);
      });
    });
    el.querySelectorAll('.btn-del-task').forEach(btn =>
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt((btn as HTMLElement).dataset.tid || '0');
        if (!id || !confirm('¿Eliminar esta tarea?')) return;
        fetch('/api/tracker/tasks?id=' + id, { method: 'DELETE' })
          .then(() => reloadSchedule())
          .catch(() => {});
      })
    );
    document.getElementById('btn-add-task')?.addEventListener('click', () => openTaskModal(null));
  }

  // ── Overlap check ─────────────────────────────────────────────────────────────
  function checkTaskOverlap(startMin: number, endMin: number, excludeActivityId?: string): string[] {
    return (dynTasksByDay[cfgDayIdx] || [])
      .filter(t => t.id !== excludeActivityId && startMin < t.end && t.start < endMin)
      .map(t => `${fmt(t.start)}–${fmt(t.end)} ${t.name}`);
  }

  // ── Day config overlay ────────────────────────────────────────────────────────
  function setDayCfgTitle(label: string, dayDate: Date) {
    const isToday = dkLocal(dayDate) === dkLocal(new Date());
    const ov = document.getElementById('day-cfg-ov')!;
    ov.classList.toggle('today-day', isToday);
    document.getElementById('day-cfg-title')!.innerHTML =
      label + (isToday ? '<span class="today-badge">HOY</span>' : '');
  }

  function openDayCfg(di: number, dKey: string, label: string) {
    cfgDayIdx = di;
    cfgDayKey = dKey;
    const days = getDays(weekOffset);
    setDayCfgTitle(label, days[di]);
    renderDayCfgTasks();
    document.getElementById('day-cfg-ov')!.classList.add('open');
  }

  function closeDayCfg() {
    document.getElementById('day-cfg-ov')!.classList.remove('open');
  }

  function navigateDayCfg(dir: number) {
    cfgDayIdx = (cfgDayIdx + 7 + dir) % 7;
    const days = getDays(weekOffset);
    cfgDayKey = dk(days[cfgDayIdx]);
    const label = DIAS_F[cfgDayIdx] + ', ' + days[cfgDayIdx].toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    setDayCfgTitle(label, days[cfgDayIdx]);
    renderDayCfgTasks();
  }

  function renderDayCfgTasks() {
    const tasks = (dynTasksByDay[cfgDayIdx] || []).slice().sort((a, b) => a.start - b.start);
    const el = document.getElementById('day-cfg-tasks')!;

    const todayNow = new Date(); todayNow.setHours(0,0,0,0);
    const dayDate = new Date(cfgDayKey + 'T00:00:00');
    const isFutureDay = dayDate > todayNow;
    const isTodayDay = dkLocal(dayDate) === dkLocal(new Date());
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

    let html = tasks.length === 0
      ? `<p class="cfg-empty" style="padding:.5rem 0">Sin tareas para este día. Usa "+ Tarea" para añadir.</p>`
      : tasks.map((t, i) => {
          const raw = rawTaskMap[cfgDayIdx + '_' + t.id];
          const info = getCatInfo(t.cat);
          const rec = state[ak(cfgDayKey, t.id)];
          const isTaskFuture = isFutureDay || (isTodayDay && t.start > nowMin);
          const stIcon = rec
            ? (rec.done ? `<span style="font-size:11px;color:#5DCAA5">✓</span>` : `<span style="font-size:11px;color:#D85A30">✗</span>`)
            : `<span style="font-size:11px;color:#2a2a2a">○</span>`;
          const trkCls = t.track ? 'on' : 'off';
          const trkLbl = t.track ? '✓ Rastr.' : '○ Rastr.';
          return `<div class="tcrd${isTaskFuture ? ' tcrd-fut' : ''}" style="cursor:${isTaskFuture ? 'default' : 'pointer'}" data-idx="${i}">` +
            `<span style="font-size:11px;color:#555;width:90px;flex-shrink:0;font-variant-numeric:tabular-nums">${fmt(t.start)}–${fmt(t.end)}</span>` +
            `<span style="flex:1;font-size:13px;color:#ccc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.name}</span>` +
            `<span style="font-size:10px;padding:2px 7px;border-radius:4px;color:#fff;background:${info.color};flex-shrink:0;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${info.label}</span>` +
            `<span style="width:16px;text-align:center;flex-shrink:0">${stIcon}</span>` +
            `<button class="trk-btn ${trkCls}" data-tid="${raw?.id || 0}" data-track="${t.track ? 1 : 0}" title="${t.track ? 'Rastreable — desactivar' : 'No rastreable — activar'}">${trkLbl}</button>` +
            `<button class="btn-sm btn-del dcfg-del" data-tid="${raw?.id || 0}" title="Eliminar" style="flex-shrink:0">✕</button>` +
            `</div>`;
        }).join('');

    el.innerHTML = html;

    // Tarjeta clickable solo para tareas NO futuras
    el.querySelectorAll('.tcrd:not(.tcrd-fut)').forEach((card) => {
      card.addEventListener('click', (e) => {
        const tgt = e.target as HTMLElement;
        if (tgt.classList.contains('dcfg-del') || tgt.classList.contains('btn-del') || tgt.classList.contains('trk-btn')) return;
        const idx = parseInt((card as HTMLElement).dataset.idx || '0');
        const raw = rawTaskMap[cfgDayIdx + '_' + tasks[idx].id];
        openActionModal(tasks[idx], cfgDayKey, cfgDayIdx, raw || undefined);
      });
    });

    // Toggle rastreable — usa PATCH parcial (solo id + track)
    el.querySelectorAll('.trk-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tid = parseInt((btn as HTMLElement).dataset.tid || '0');
        const newTrack = parseInt((btn as HTMLElement).dataset.track || '0') ? 0 : 1;
        if (!tid) return;
        fetch('/api/tracker/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: tid, track: newTrack }),
        }).then(() => reloadSchedule()).catch(() => {});
      });
    });

    el.querySelectorAll('.dcfg-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt((btn as HTMLElement).dataset.tid || '0');
        if (!id || !confirm('¿Eliminar esta tarea?')) return;
        fetch('/api/tracker/tasks?id=' + id, { method: 'DELETE' })
          .then(() => reloadSchedule())
          .catch(() => {});
      });
    });
  }

  // ── Edit modal ────────────────────────────────────────────────────────────────
  function openCatModal(catId: number) {
    editMode = 'cat';
    editCatId = catId;
    let cat: { label: string; color: string } | null = null;
    if (catId === -1) {
      cat = dynCats['_none'] || NO_CAT;
    } else if (catId > 0) {
      cat = Object.values(dynCats).find(c => c.id === catId) || null;
    }
    document.getElementById('em-title')!.textContent = catId === -1 ? 'Editar "Sin categoría"' : catId ? 'Editar categoría' : 'Nueva categoría';
    document.getElementById('em-body')!.innerHTML =
      `<div class="form-row"><label>Nombre</label><input type="text" id="ef-label" value="${cat?.label || ''}" placeholder="Nombre de la categoría" /></div>` +
      `<div class="form-row"><label>Color</label><input type="color" id="ef-color" value="${cat?.color || '#1a82b8'}" style="height:36px;cursor:pointer;padding:2px" /></div>`;
    document.getElementById('edit-modal')!.classList.remove('hidden');
    setTimeout(() => (document.getElementById('ef-label') as HTMLInputElement)?.focus(), 50);
  }

  function openTaskModal(raw: RawTask | null) {
    editMode = 'task';
    editTaskId = raw?.id || 0;
    document.getElementById('em-title')!.textContent = raw ? 'Editar tarea' : 'Nueva tarea';
    const noneLabel = getCatInfo('_none').label;
    const catOpts =
      `<option value="_none"${(!raw?.cat_key || raw.cat_key === '_none') ? ' selected' : ''}>— ${noneLabel}</option>` +
      Object.values(dynCats).filter(c => c.cat_key !== '_none').map(c =>
        `<option value="${c.cat_key}"${raw?.cat_key === c.cat_key ? ' selected' : ''}>${c.label}</option>`
      ).join('');
    document.getElementById('em-body')!.innerHTML =
      `<div class="form-row"><label>Nombre</label><input type="text" id="ef-name" value="${raw?.name || ''}" placeholder="Nombre de la tarea" /></div>` +
      `<div class="form-row"><label>Categoría</label><select id="ef-cat">${catOpts}</select></div>` +
      `<div class="form-2col"><div class="form-row"><label>Inicio</label><input type="time" id="ef-start" value="${minToTime(raw?.start_min ?? 8 * 60)}" /></div>` +
      `<div class="form-row"><label>Fin</label><input type="time" id="ef-end" value="${minToTime(raw?.end_min ?? 9 * 60)}" /></div></div>` +
      `<div id="ef-overlap-warn" class="ef-warn"></div>` +
      `<div class="form-row"><label>Descripción</label><textarea id="ef-desc" rows="2" placeholder="Descripción opcional...">${raw?.description || ''}</textarea></div>` +
      `<div class="form-row" style="display:flex;align-items:center;gap:8px;padding-top:.1rem">` +
      `<input type="checkbox" id="ef-track" style="width:auto;margin:0"${raw === null || raw.track ? ' checked' : ''} />` +
      `<label for="ef-track" style="margin:0;font-size:12px;color:#ccc">Rastrear cumplimiento</label></div>`;
    document.getElementById('edit-modal')!.classList.remove('hidden');
    setTimeout(() => {
      (document.getElementById('ef-name') as HTMLInputElement)?.focus();
      const startEl = document.getElementById('ef-start') as HTMLInputElement;
      const endEl   = document.getElementById('ef-end')   as HTMLInputElement;
      const warnEl  = document.getElementById('ef-overlap-warn')!;
      function checkOverlap() {
        const s = timeToMin(startEl?.value || ''), e = timeToMin(endEl?.value || '');
        if (e <= s) { warnEl.style.display = 'none'; return; }
        const hits = checkTaskOverlap(s, e, raw?.activity_id);
        if (hits.length) { warnEl.textContent = '⚠ Solapa con: ' + hits.join(', '); warnEl.style.display = 'block'; }
        else { warnEl.style.display = 'none'; }
      }
      startEl?.addEventListener('change', checkOverlap);
      endEl?.addEventListener('change', checkOverlap);
    }, 60);
  }

  function closeEditModal() { document.getElementById('edit-modal')!.classList.add('hidden'); }

  function saveEditModal() {
    if (editMode === 'cat') {
      const label = ((document.getElementById('ef-label') as HTMLInputElement)?.value || '').trim();
      const color = (document.getElementById('ef-color') as HTMLInputElement)?.value || '#555';
      if (!label) { alert('Introduce un nombre para la categoría.'); return; }
      if (editCatId === -1) {
        const existing = dynCats['_none'];
        if (existing) {
          fetch('/api/tracker/categories', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: existing.id, label, color }) })
            .then(() => { closeEditModal(); reloadSchedule(); }).catch(() => {});
        } else {
          fetch('/api/tracker/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cat_key: '_none', label, color }) })
            .then(() => { closeEditModal(); reloadSchedule(); }).catch(() => {});
        }
      } else if (editCatId) {
        fetch('/api/tracker/categories', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editCatId, label, color }) })
          .then(() => { closeEditModal(); reloadSchedule(); }).catch(() => {});
      } else {
        const cat_key = slugCat(label);
        fetch('/api/tracker/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cat_key, label, color }) })
          .then(() => { closeEditModal(); reloadSchedule(); }).catch(() => {});
      }
    } else {
      const name = ((document.getElementById('ef-name') as HTMLInputElement)?.value || '').trim();
      const cat_key = (document.getElementById('ef-cat') as HTMLSelectElement)?.value || '';
      const start_min = timeToMin((document.getElementById('ef-start') as HTMLInputElement)?.value || '08:00');
      const end_min   = timeToMin((document.getElementById('ef-end') as HTMLInputElement)?.value || '09:00');
      const description = ((document.getElementById('ef-desc') as HTMLTextAreaElement)?.value || '').trim();
      const track = (document.getElementById('ef-track') as HTMLInputElement)?.checked ? 1 : 0;
      if (!name) { alert('Introduce un nombre para la tarea.'); return; }
      if (end_min <= start_min) { alert('La hora de fin debe ser posterior al inicio.'); return; }
      if (editTaskId) {
        fetch('/api/tracker/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editTaskId, name, cat_key, start_min, end_min, description, track }) })
          .then(() => { closeEditModal(); reloadSchedule(); }).catch(() => {});
      } else {
        fetch('/api/tracker/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ day_index: cfgDayIdx, name, cat_key, start_min, end_min, description, track }) })
          .then(() => { closeEditModal(); reloadSchedule(); }).catch(() => {});
      }
    }
  }

  // ── Nav ───────────────────────────────────────────────────────────────────────
  function showPage(id: string, tabId: string) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(id)!.classList.add('active');
    document.getElementById(tabId)!.classList.add('active');
    if (id === 'configurar') renderConfig();
  }

  // ── Event listeners ────────────────────────────────────────────────────────────
  document.getElementById('btn-prev')!.onclick = () => { closeDayCfg(); weekOffset--; if (chart) { (chart as { destroy(): void }).destroy(); chart = null; } loadState(); };
  document.getElementById('btn-next')!.onclick = () => { closeDayCfg(); weekOffset++; if (chart) { (chart as { destroy(): void }).destroy(); chart = null; } loadState(); };
  document.getElementById('day-cfg-back')!.onclick = closeDayCfg;
  document.getElementById('day-cfg-prev')!.onclick = () => navigateDayCfg(-1);
  document.getElementById('day-cfg-next')!.onclick = () => navigateDayCfg(1);
  document.getElementById('day-cfg-add')!.onclick  = () => openTaskModal(null);
  // Inicializar input con valor guardado
  const schedStartInput = document.getElementById('cfg-sched-start') as HTMLInputElement | null;
  if (schedStartInput && schedStartDate) schedStartInput.value = schedStartDate;

  document.getElementById('btn-sched-start-save')?.addEventListener('click', () => {
    const val = (document.getElementById('cfg-sched-start') as HTMLInputElement)?.value || '';
    if (!val) { alert('Selecciona una fecha.'); return; }
    if (!confirm(`¿Aplicar inicio del horario desde el ${val}?\n\nSe ocultarán las tareas anteriores y se limpiarán los registros históricos hasta esa fecha.`)) return;
    schedStartDate = val;
    try { localStorage.setItem('tracker_sched_start', val); } catch {}
    fetch('/api/tracker/save?until=' + val, { method: 'DELETE' })
      .then(() => loadState())
      .catch(() => {});
    renderAll();
  });
  document.getElementById('btn-sched-start-clear')?.addEventListener('click', () => {
    schedStartDate = '';
    try { localStorage.removeItem('tracker_sched_start'); } catch {}
    const inp = document.getElementById('cfg-sched-start') as HTMLInputElement | null;
    if (inp) inp.value = '';
    renderAll();
  });
  document.getElementById('modal')!.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  document.getElementById('modal-cancel')!.onclick = closeModal;
  document.getElementById('modal-miss')!.onclick = () => {
    const wrap = document.getElementById('m-reason-wrap') as HTMLElement;
    if (wrap.style.display === 'none') { wrap.style.display = 'block'; (document.getElementById('m-reason') as HTMLTextAreaElement).focus(); return; }
    saveAct(false);
  };
  document.getElementById('modal-done')!.onclick = () => saveAct(true);
  document.getElementById('edit-modal')!.addEventListener('click', e => { if (e.target === e.currentTarget) closeEditModal(); });
  document.getElementById('em-cancel')!.onclick = closeEditModal;
  document.getElementById('em-save')!.onclick    = saveEditModal;
  document.getElementById('action-modal')!.addEventListener('click', e => { if (e.target === e.currentTarget) closeActionModal(); });
  document.getElementById('am-cancel')!.onclick = closeActionModal;
  document.getElementById('am-miss')!.onclick = () => {
    const wrap = document.getElementById('am-reason-wrap') as HTMLElement;
    if (wrap.style.display === 'none') { wrap.style.display = 'block'; (document.getElementById('am-reason') as HTMLTextAreaElement).focus(); return; }
    saveActionAct(false);
  };
  document.getElementById('am-done')!.onclick = () => saveActionAct(true);
  document.getElementById('am-edit')!.onclick    = () => {
    const raw = actionPending?.rawTask;
    closeActionModal();
    if (raw) openTaskModal(raw);
  };
  document.querySelectorAll('.tab').forEach(el => {
    (el as HTMLElement).addEventListener('click', function(this: HTMLElement) {
      showPage(this.id.replace('tab-', ''), this.id);
    });
  });

  loadSchedule();
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
