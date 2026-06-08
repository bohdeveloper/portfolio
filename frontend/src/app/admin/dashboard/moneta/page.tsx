'use client';

import { useEffect, useState, useCallback } from 'react';

/* ── Tipos ─────────────────────────────────────────────────── */
interface Item {
  id: number;
  name: string;
  amount: number;
  real_amount: number | null;
  type: 'gasto' | 'ingreso';
}

interface Summary {
  saldo_inicial: number | null;
  closed: number;
  closed_at: string | null;
}

interface Profile {
  id: number;
  name: string;
  sort_order: number;
  items: Item[];
  summary: Summary | null;
}

interface HistoryRow {
  profile_id: number; profile_name: string;
  year: number; month: number;
  ingresos_prev: number; gastos_prev: number; gastos_real: number; n_real: number;
}

/* ── Helpers ───────────────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1)
    .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    .replace(/^(.)/, s => s.toUpperCase());
}

/* ── Estilos ───────────────────────────────────────────────── */
const STYLES = `
  .moneta-wrap {
    min-height: calc(100vh - 88px); background: var(--adm-bg);
    font-family: system-ui, sans-serif; color: var(--adm-text);
  }
  .moneta-topbar {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    padding: 1rem 1.5rem; border-bottom: 1px solid var(--adm-border);
    background: var(--adm-hdr);
  }
  .moneta-month-btn {
    background: none; border: 1px solid var(--adm-border); border-radius: 6px;
    padding: 5px 14px; color: var(--adm-text); cursor: pointer;
    font-size: 13px; font-family: inherit; transition: border-color 0.15s, color 0.15s;
  }
  .moneta-month-btn:hover { border-color: var(--primary); color: var(--primary); }
  .moneta-month-label { font-size: 15px; font-weight: 500; min-width: 150px; text-align: center; }

  .moneta-tabs { display: none; border-bottom: 1px solid var(--adm-border); }
  .moneta-tab {
    padding: 10px 20px; font-size: 13px; font-weight: 500; cursor: pointer;
    background: none; border: none; border-bottom: 2px solid transparent;
    color: var(--adm-muted); font-family: inherit; transition: color 0.15s;
  }
  .moneta-tab.active { color: var(--primary); border-bottom-color: var(--primary); }

  .moneta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
  .moneta-col { padding: 1.25rem 1.5rem; border-right: 1px solid var(--adm-border); }
  .moneta-col:last-child { border-right: none; }
  .moneta-col-title { font-size: 16px; font-weight: 600; color: var(--primary); }

  /* Saldo inicial */
  .moneta-saldo-row {
    display: flex; align-items: center; gap: 8px;
    margin: 0.6rem 0 0; font-size: 12px; color: var(--adm-muted);
  }
  .moneta-saldo-val {
    cursor: pointer; padding: 2px 6px; border-radius: 4px; font-size: 12px;
    transition: background 0.12s; color: var(--adm-text);
  }
  .moneta-saldo-val.empty { color: var(--adm-muted); font-style: italic; }
  .moneta-saldo-val:hover { background: var(--adm-border); }
  .moneta-saldo-input {
    width: 95px; background: var(--adm-input); border: 1px solid var(--primary);
    border-radius: 4px; padding: 2px 8px; font-size: 12px; color: var(--adm-text);
    font-family: inherit; outline: none;
  }

  /* Sección */
  .moneta-section-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--adm-muted); margin: 1.1rem 0 0; padding-bottom: 4px;
    border-bottom: 1px solid var(--adm-border);
  }

  /* Cabeceras columna (gastos) */
  .moneta-col-headers { display: flex; align-items: center; gap: 6px; padding: 5px 0 2px; }
  .mch-name { flex: 1; }
  .mch-cell { width: 83px; text-align: right; font-size: 10px; color: var(--adm-muted); letter-spacing: 0.05em; }
  .mch-copy { width: 22px; }
  .mch-del  { width: 22px; }

  /* Fila de ítem */
  .mitem-row { display: flex; align-items: center; gap: 6px; padding: 5px 0; }

  /* Nombre editable */
  .mitem-name {
    flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    cursor: pointer; border-radius: 3px; padding: 2px 3px; transition: background 0.1s;
  }
  .mitem-name:hover { background: var(--adm-border); }
  .mitem-name-input {
    flex: 1; min-width: 0; background: var(--adm-input); border: 1px solid var(--primary);
    border-radius: 4px; padding: 2px 6px; font-size: 13px; color: var(--adm-text);
    font-family: inherit; outline: none;
  }

  /* Importe editable */
  .mitem-cell {
    width: 83px; text-align: right; font-size: 13px; font-weight: 500; cursor: pointer;
    padding: 2px 6px; border-radius: 4px; white-space: nowrap;
    transition: background 0.12s; flex-shrink: 0;
  }
  .mitem-cell:hover { background: var(--adm-border); }
  .mitem-cell-input {
    width: 83px; text-align: right; background: var(--adm-input);
    border: 1px solid var(--primary); border-radius: 4px;
    padding: 2px 6px; font-size: 13px; color: var(--adm-text);
    font-family: inherit; outline: none; flex-shrink: 0;
  }

  /* Botón copiar previsto → real */
  .mitem-copy {
    background: none; border: none; cursor: pointer; padding: 1px 3px;
    color: var(--adm-muted); font-size: 11px; transition: color 0.12s, background 0.1s;
    flex-shrink: 0; width: 22px; text-align: center; border-radius: 3px;
  }
  .mitem-copy:hover { color: var(--primary); background: var(--adm-border); }

  /* Borrar ítem */
  .mitem-del {
    background: none; border: none; cursor: pointer; padding: 1px 4px;
    color: var(--adm-muted); font-size: 15px; line-height: 1; border-radius: 3px;
    transition: color 0.12s; flex-shrink: 0; width: 22px;
  }
  .mitem-del:hover { color: #ef4444; }

  /* Fila de total */
  .moneta-total-row {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 0 3px; border-top: 1px solid var(--adm-border);
    margin-top: 4px; font-size: 13px; font-weight: 600;
  }

  /* AHORRO */
  .moneta-ahorro-row {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 10px 0 4px; border-top: 2px solid var(--primary);
    margin-top: 8px; font-size: 14px; font-weight: 700;
  }

  /* Cerrar mes */
  .moneta-cerrar-btn {
    width: 100%; padding: 8px; margin-top: 1.25rem;
    background: none; border: 1px solid var(--adm-border); border-radius: 8px;
    color: var(--adm-muted); font-family: inherit; font-size: 12px;
    cursor: pointer; transition: border-color 0.15s, color 0.15s;
  }
  .moneta-cerrar-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
  .moneta-cerrar-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Card mes cerrado */
  .moneta-closed-card {
    margin-top: 1.25rem; padding: 12px 14px;
    background: rgba(0,231,235,0.05); border: 1px solid rgba(0,231,235,0.25);
    border-radius: 8px;
  }
  html.light .moneta-closed-card {
    background: rgba(0,168,191,0.05); border-color: rgba(0,168,191,0.3);
  }
  .moneta-reabrir-btn {
    background: none; border: 1px solid var(--adm-border); border-radius: 5px;
    padding: 3px 10px; font-size: 11px; cursor: pointer; margin-top: 8px;
    color: var(--adm-muted); font-family: inherit; transition: border-color 0.12s, color 0.12s;
  }
  .moneta-reabrir-btn:hover { border-color: var(--adm-muted); color: var(--adm-text); }

  /* Botón añadir */
  .madd-btn {
    display: flex; align-items: center; gap: 5px; width: 100%;
    background: none; border: 1px dashed var(--adm-border); border-radius: 5px;
    padding: 5px 10px; font-size: 12px; cursor: pointer; margin-top: 6px;
    color: var(--adm-muted); font-family: inherit; transition: border-color 0.12s, color 0.12s;
  }
  .madd-btn:hover { border-color: var(--primary); color: var(--primary); }

  /* Formulario añadir */
  .madd-form { display: flex; gap: 6px; margin-top: 6px; align-items: center; }
  .madd-input {
    background: var(--adm-input); border: 1px solid var(--adm-border); border-radius: 5px;
    padding: 5px 8px; font-size: 12px; color: var(--adm-text); font-family: inherit; outline: none;
  }
  .madd-input:focus { border-color: var(--primary); }
  .madd-confirm {
    background: none; border: 1px solid var(--primary); border-radius: 5px;
    padding: 4px 8px; font-size: 12px; cursor: pointer; color: var(--primary);
    font-family: inherit; flex-shrink: 0;
  }
  .madd-cancel {
    background: none; border: 1px solid var(--adm-border); border-radius: 5px;
    padding: 4px 7px; font-size: 12px; cursor: pointer; color: var(--adm-muted);
    font-family: inherit; flex-shrink: 0;
  }

  /* Botón copiar mes anterior */
  .moneta-copy-month-btn {
    background: none; cursor: pointer; font-family: inherit;
    border: 1px solid var(--adm-border); border-radius: 6px; padding: 5px 12px;
    font-size: 12px; color: var(--adm-muted); transition: border-color 0.15s, color 0.15s;
  }
  .moneta-copy-month-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
  .moneta-copy-month-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Pestañas de página */
  .moneta-page-tabs {
    display: flex; border-bottom: 1px solid var(--adm-border); background: var(--adm-hdr);
  }
  .moneta-page-tab {
    padding: 10px 22px; font-size: 13px; font-weight: 500; cursor: pointer;
    background: none; border: none; border-bottom: 2px solid transparent;
    color: var(--adm-muted); font-family: inherit; transition: color 0.15s;
  }
  .moneta-page-tab.active { color: var(--primary); border-bottom-color: var(--primary); }

  /* Estadísticas */
  .moneta-stats { padding: 1.5rem; }
  .moneta-stats-msg { padding: 1.5rem; font-size: 13px; color: var(--adm-muted); }
  .moneta-stats-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px; margin-bottom: 2rem;
  }
  .moneta-stats-card {
    background: var(--adm-hdr); border: 1px solid var(--adm-border);
    border-radius: 10px; padding: 1rem 1.25rem;
  }
  .moneta-stats-card-title { font-size: 15px; font-weight: 600; margin-bottom: 0.75rem; }
  .moneta-stat-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 5px 0; border-bottom: 1px solid var(--adm-border); font-size: 13px;
  }
  .moneta-stat-row:last-child { border-bottom: none; }
  .moneta-stat-label { color: var(--adm-muted); }
  .moneta-stat-value { font-weight: 500; }

  /* Gráfica histórico */
  .moneta-history {
    padding: 0 0 1rem;
  }
  .moneta-history-title {
    font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--adm-muted); margin-bottom: 0.75rem;
  }

  @media (max-width: 700px) {
    .moneta-grid { grid-template-columns: 1fr; }
    .moneta-col { border-right: none; border-top: 1px solid var(--adm-border); }
    .moneta-col.hidden-mobile { display: none; }
    .moneta-tabs { display: flex; }
    .moneta-topbar { padding: 0.85rem 1rem; }
    .mitem-cell, .mitem-cell-input, .mch-cell { width: 72px; }
  }
`;

/* ── Fila de ítem ─────────────────────────────────────────────
   Nombre y previsto son clicables para editar.
   showReal = true (gastos): muestra botón "=" y columna real.
   Borrar el campo real y confirmar con Enter lo resetea a null.
   El flujo de edición inline es: click sobre el valor → se monta un <input>
   con autoFocus → al salir (blur) o al pulsar Enter se llama al handler del padre
   → el padre actualiza el estado optimistamente y dispara el PATCH a la API. */
function ItemRow({ item, showReal, onDelete, onAmountSave, onRealSave, onNameSave }: {
  item: Item; showReal?: boolean;
  onDelete:     (id: number) => void;
  onAmountSave: (id: number, amount: number) => void;
  onRealSave?:  (id: number, real: number | null) => void;
  onNameSave?:  (id: number, name: string) => void;
}) {
  const [editName,   setEditName]   = useState(false);
  const [editAmount, setEditAmount] = useState(false);
  const [editReal,   setEditReal]   = useState(false);
  const [nameVal,    setNameVal]    = useState('');
  const [amountVal,  setAmountVal]  = useState('');
  const [realVal,    setRealVal]    = useState('');

  function startName()   { setNameVal(item.name);                                       setEditName(true); }
  function startAmount() { setAmountVal(item.amount ? String(item.amount) : '');         setEditAmount(true); }
  function startReal()   { setRealVal(item.real_amount != null ? String(item.real_amount) : ''); setEditReal(true); }

  function confirmName() {
    const t = nameVal.trim();
    if (t && t !== item.name) onNameSave?.(item.id, t);
    setEditName(false);
  }
  function confirmAmount() {
    const raw = amountVal.trim();
    let finalVal: number;
    if (raw.startsWith('+')) finalVal = item.amount + (parseFloat(raw.slice(1)) || 0);
    else { finalVal = parseFloat(raw.replace(',', '.')); if (isNaN(finalVal)) { setEditAmount(false); return; } }
    if (finalVal >= 0) onAmountSave(item.id, finalVal);
    setEditAmount(false);
  }
  // Vaciar el campo y confirmar equivale a borrar el importe real (null).
  // Prefijo "+" suma al valor actual del real (o a 0 si no tiene).
  function confirmReal() {
    const t = realVal.trim();
    if (t === '') { onRealSave?.(item.id, null); }
    else if (t.startsWith('+')) { onRealSave?.(item.id, (item.real_amount ?? 0) + (parseFloat(t.slice(1)) || 0)); }
    else { onRealSave?.(item.id, parseFloat(t.replace(',', '.')) || 0); }
    setEditReal(false);
  }

  const hasReal      = item.real_amount != null;
  const isOverBudget = showReal && hasReal && item.real_amount! > item.amount;

  return (
    <div className="mitem-row">
      {/* Nombre editable */}
      {editName ? (
        <input className="mitem-name-input" value={nameVal} autoFocus
          onChange={e => setNameVal(e.target.value)}
          onBlur={confirmName}
          onKeyDown={e => { if (e.key === 'Enter') confirmName(); if (e.key === 'Escape') setEditName(false); }} />
      ) : (
        <span className="mitem-name" onClick={startName} title="Clic para editar nombre">{item.name}</span>
      )}

      {/* Previsto editable */}
      {editAmount ? (
        <input className="mitem-cell-input" type="text" inputMode="decimal" value={amountVal} autoFocus
          placeholder="+N para sumar"
          onChange={e => setAmountVal(e.target.value)}
          onBlur={confirmAmount}
          onKeyDown={e => { if (e.key === 'Enter') confirmAmount(); if (e.key === 'Escape') setEditAmount(false); }} />
      ) : (
        <span className="mitem-cell" onClick={startAmount} title="Editar previsto · escribe +N para sumar al actual">
          {item.amount > 0 ? fmt(item.amount) : <span style={{ color: 'var(--adm-muted)' }}>—</span>}
        </span>
      )}

      {/* Copiar previsto → real (solo gastos) */}
      {showReal && (
        <button className="mitem-copy" title="Copiar previsto al real"
          onClick={() => onRealSave?.(item.id, item.amount)}>=</button>
      )}

      {/* Real editable (solo gastos) */}
      {showReal && (
        editReal ? (
          <input className="mitem-cell-input" type="text" inputMode="decimal" value={realVal} autoFocus
            placeholder="+N · vacío = borrar"
            onChange={e => setRealVal(e.target.value)}
            onBlur={confirmReal}
            onKeyDown={e => { if (e.key === 'Enter') confirmReal(); if (e.key === 'Escape') setEditReal(false); }} />
        ) : (
          <span className="mitem-cell" onClick={startReal}
            title={
              isOverBudget
                ? `⚠ ${fmt(item.real_amount! - item.amount)} sobre el previsto`
                : hasReal ? 'Editar importe real' : 'Añadir importe real'
            }
            style={{ color: isOverBudget ? '#ef4444' : hasReal ? 'var(--primary)' : 'var(--adm-muted)', opacity: hasReal ? 1 : 0.4 }}>
            {isOverBudget ? `⚠ ${fmt(item.real_amount!)}` : hasReal ? fmt(item.real_amount!) : '—'}
          </span>
        )
      )}

      <button className="mitem-del" onClick={() => onDelete(item.id)} title="Eliminar">×</button>
    </div>
  );
}

/* ── Formulario inline para añadir ítem ────────────────────── */
function AddItemForm({ onAdd, onCancel }: {
  onAdd: (name: string, amount: number) => Promise<void>;
  onCancel: () => void;
}) {
  const [name,   setName]   = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setSaving(true);
    await onAdd(name.trim(), parseFloat(amount) || 0);
    setSaving(false);
  }

  return (
    <div className="madd-form">
      <input className="madd-input" style={{ flex: 1, minWidth: 0 }} placeholder="Concepto" autoFocus
        value={name} onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }} />
      <input className="madd-input" style={{ width: 76 }} placeholder="0,00" type="number" step="0.01"
        value={amount} onChange={e => setAmount(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }} />
      <button className="madd-confirm" onClick={submit} disabled={saving}>✓</button>
      <button className="madd-cancel" onClick={onCancel}>✕</button>
    </div>
  );
}

/* ── Vista de estadísticas ──────────────────────────────────── */
const COLORS = ['var(--primary)', '#a78bfa'];

function StatsView() {
  const [rows,    setRows]    = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/moneta/history')
      .then(r => r.json())
      .then((res: { ok: boolean; data?: HistoryRow[] }) => {
        if (res.ok) setRows(res.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="moneta-stats-msg">Cargando estadísticas...</div>;
  if (!rows.length) return <div className="moneta-stats-msg">Sin datos históricos aún. Añade ítems a algún mes para ver estadísticas.</div>;

  /* Meses únicos ordenados ASC */
  const seenM = new Set<string>();
  const allMonths: { year: number; month: number; key: string }[] = [];
  for (const r of rows) {
    const key = `${r.year}-${String(r.month).padStart(2, '0')}`;
    if (!seenM.has(key)) { seenM.add(key); allMonths.push({ year: r.year, month: r.month, key }); }
  }
  allMonths.sort((a, b) => a.key.localeCompare(b.key));

  /* Perfiles únicos */
  const profilesSeen = new Map<number, string>();
  for (const r of rows) if (!profilesSeen.has(r.profile_id)) profilesSeen.set(r.profile_id, r.profile_name);
  const profiles = Array.from(profilesSeen.entries());

  // Construye un mapa (mes-perfil → ahorro) eligiendo la fuente más fidedigna:
  // si el mes tiene al menos un gasto real registrado (n_real > 0) se usa
  // gastos_real; si no, se usa el estimado. Esto replica la misma lógica que
  // ProfileColumn usa en pantalla, garantizando consistencia entre la vista
  // de registros y la de estadísticas históricas.
  const ahorroMap = new Map<string, number>();
  for (const r of rows) {
    const mKey = `${r.year}-${String(r.month).padStart(2, '0')}`;
    ahorroMap.set(`${mKey}-${r.profile_id}`,
      r.n_real > 0 ? r.ingresos_prev - r.gastos_real : r.ingresos_prev - r.gastos_prev);
  }

  /* Estadísticas por perfil */
  interface PS { id: number; name: string; total: number; avg: number;
    best: { year: number; month: number; v: number };
    worst: { year: number; month: number; v: number };
    positive: number; count: number; }
  const pStats: PS[] = profiles.map(([pid, pname]) => {
    const ms = allMonths
      .filter(m => ahorroMap.has(`${m.key}-${pid}`))
      .map(m => ({ ...m, v: ahorroMap.get(`${m.key}-${pid}`)! }));
    if (!ms.length) return null;
    const total = ms.reduce((s, m) => s + m.v, 0);
    return { id: pid, name: pname, total, avg: total / ms.length,
      best:  ms.reduce((a, b) => a.v >= b.v ? a : b),
      worst: ms.reduce((a, b) => a.v <= b.v ? a : b),
      positive: ms.filter(m => m.v >= 0).length, count: ms.length };
  }).filter((s): s is PS => s !== null);

  /* Parámetros gráfica */
  const allVals = [...ahorroMap.values()];
  const maxV    = Math.max(...allVals, 1);
  const minV    = Math.min(...allVals, 0);
  const range   = Math.max(maxV - minV, 1);
  const H = 150, PAD_L = 52, PAD_T = 10, PAD_B = 28, PAD_R = 8;
  const BAR_W = 18, BAR_GAP = 4, GRP_GAP = 16;
  const grpW  = profiles.length * BAR_W + (profiles.length - 1) * BAR_GAP;
  const svgW  = PAD_L + allMonths.length * (grpW + GRP_GAP) - GRP_GAP + PAD_R;
  const svgH  = H + PAD_T + PAD_B;
  const toY   = (v: number) => PAD_T + ((maxV - v) / range) * H;
  const zeroY = toY(0);
  const fmtTick = (v: number) => {
    const abs = Math.abs(Math.round(v));
    return (v < 0 ? '-' : '') + (abs >= 1000 ? `${(abs / 1000).toFixed(1)}k` : abs) + '€';
  };
  const ticks = [maxV, maxV / 2, 0, minV / 2, minV]
    .filter((v, i, a) => a.indexOf(v) === i)
    .filter(v => v !== 0 || minV < 0);

  const shortMon = (y: number, m: number) =>
    new Date(y, m - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      .replace(/^(.)/, s => s.toUpperCase()).split(' de ')[0];

  return (
    <div className="moneta-stats">

      {/* ── Tarjetas resumen ── */}
      <div className="moneta-stats-grid">
        {pStats.map((p, pi) => (
          <div key={p.id} className="moneta-stats-card">
            <div className="moneta-stats-card-title" style={{ color: COLORS[pi % COLORS.length] }}>{p.name}</div>
            <div className="moneta-stat-row">
              <span className="moneta-stat-label">Ahorro acumulado</span>
              <span className="moneta-stat-value" style={{ color: p.total >= 0 ? '#22c55e' : '#ef4444' }}>{fmt(p.total)}</span>
            </div>
            <div className="moneta-stat-row">
              <span className="moneta-stat-label">Media mensual</span>
              <span className="moneta-stat-value" style={{ color: p.avg >= 0 ? '#22c55e' : '#ef4444' }}>{fmt(p.avg)}</span>
            </div>
            <div className="moneta-stat-row">
              <span className="moneta-stat-label">Mejor mes</span>
              <span className="moneta-stat-value" style={{ color: '#22c55e' }}>
                {shortMon(p.best.year, p.best.month)} — {fmt(p.best.v)}
              </span>
            </div>
            <div className="moneta-stat-row">
              <span className="moneta-stat-label">Peor mes</span>
              <span className="moneta-stat-value" style={{ color: p.worst.v < 0 ? '#ef4444' : 'var(--adm-text)' }}>
                {shortMon(p.worst.year, p.worst.month)} — {fmt(p.worst.v)}
              </span>
            </div>
            <div className="moneta-stat-row">
              <span className="moneta-stat-label">Meses positivos</span>
              <span className="moneta-stat-value">{p.positive} de {p.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Gráfica de evolución ── */}
      <div className="moneta-history">
        <div className="moneta-history-title">Evolución del ahorro mensual</div>
        <div style={{ overflowX: 'auto' }}>
          <svg width={Math.max(svgW, 280)} height={svgH}
            style={{ display: 'block', overflow: 'visible', fontFamily: 'system-ui, sans-serif' }}>
            {ticks.map(v => (
              <g key={v}>
                <line x1={PAD_L} x2={svgW - PAD_R} y1={toY(v)} y2={toY(v)}
                  style={{ stroke: 'var(--adm-border)', strokeWidth: v === 0 ? 1.5 : 0.5,
                    strokeDasharray: v === 0 ? undefined : '3 4' }} />
                <text x={PAD_L - 4} y={toY(v) + 4}
                  style={{ fontSize: 9, fill: 'var(--adm-muted)', textAnchor: 'end' } as React.CSSProperties}>
                  {fmtTick(v)}
                </text>
              </g>
            ))}
            {allMonths.map((m, mi) => {
              const gx = PAD_L + mi * (grpW + GRP_GAP);
              return (
                <g key={m.key}>
                  <text x={gx + grpW / 2} y={svgH - 2}
                    style={{ fontSize: 9, fill: 'var(--adm-muted)', textAnchor: 'middle' } as React.CSSProperties}>
                    {new Date(m.year, m.month - 1).toLocaleDateString('es-ES', { month: 'short' })} {String(m.year).slice(2)}
                  </text>
                  {profiles.map(([pid, pname], pi) => {
                    const val  = ahorroMap.get(`${m.key}-${pid}`) ?? 0;
                    const barH = Math.max(Math.abs((val / range) * H), 2);
                    const bx   = gx + pi * (BAR_W + BAR_GAP);
                    const by   = val >= 0 ? zeroY - barH : zeroY;
                    return (
                      <rect key={pid} x={bx} y={by} width={BAR_W} height={barH} rx={2}
                        style={{ fill: COLORS[pi % COLORS.length], opacity: 0.85 }}>
                        <title>{pname}: {val >= 0 ? '+' : ''}{Math.round(val)} €</title>
                      </rect>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 8, paddingLeft: PAD_L }}>
          {profiles.map(([pid, name], pi) => (
            <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--adm-muted)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, display: 'inline-block',
                background: COLORS[pi % COLORS.length], opacity: 0.85 }} />
              {name}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ── Columna de un perfil ───────────────────────────────────── */
function ProfileColumn({ profile, year, month, isHidden, onUpdate, onSummaryUpdate }: {
  profile: Profile; year: number; month: number; isHidden: boolean;
  onUpdate:        (profileId: number, updater: (items: Item[]) => Item[]) => void;
  onSummaryUpdate: (profileId: number, updates: Partial<Summary>) => void;
}) {
  const [addingType,   setAddingType]   = useState<'gasto' | 'ingreso' | null>(null);
  const [editingSaldo, setEditingSaldo] = useState(false);
  const [saldoVal,     setSaldoVal]     = useState('');
  const [closing,      setClosing]      = useState(false);
  const [saveStatus,   setSaveStatus]   = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastUpdated,  setLastUpdated]  = useState<string | null>(null);

  function stampUpdate() {
    const now = new Date();
    setLastUpdated(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
  }

  const summary = profile.summary;
  const closed  = !!(summary?.closed);

  /* ── Cálculos ─────────────────────────────────────── */
  const gastos   = profile.items.filter(i => i.type === 'gasto');
  const ingresos = profile.items.filter(i => i.type === 'ingreso');

  const totalPrevGastos   = gastos.reduce((s, i) => s + i.amount, 0);
  const totalPrevIngresos = ingresos.reduce((s, i) => s + i.amount, 0);

  // Solo se suma el real de los ítems que tienen real_amount explícito (≠ null).
  // Si no hay ninguno, ahorroReal es null y se muestra únicamente el estimado.
  // Esto evita que ítems sin importe real tiren el total hacia abajo: el ahorro
  // real solo se activa cuando el usuario ha registrado al menos un gasto real.
  const gastosConReal   = gastos.filter(i => i.real_amount != null);
  const totalRealGastos = gastosConReal.reduce((s, i) => s + i.real_amount!, 0);
  const hasAnyReal      = gastosConReal.length > 0;

  const ahorroEstimado = totalPrevIngresos - totalPrevGastos;
  // ahorroReal solo existe si hay al menos un gasto con importe real registrado
  const ahorroReal     = hasAnyReal ? totalPrevIngresos - totalRealGastos : null;

  /* Saldo final = saldo_inicial + ahorro real (si ambos disponibles) */
  const saldoFinal = (summary?.saldo_inicial != null && ahorroReal !== null)
    ? summary.saldo_inicial + ahorroReal : null;

  /* ── Handlers de ítems ────────────────────────────── */
  async function handleAdd(name: string, amount: number) {
    const type = addingType!;
    const res  = await fetch('/api/moneta/item', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profile.id, year, month, name, amount, type }),
    });
    const data = await res.json() as { ok: boolean; id: number };
    if (data.ok) {
      onUpdate(profile.id, items => [...items, { id: data.id, name, amount, real_amount: null, type }]);
      setAddingType(null);
    }
  }

  function handleDelete(id: number) {
    onUpdate(profile.id, items => items.filter(i => i.id !== id));
    fetch(`/api/moneta/item?id=${id}`, { method: 'DELETE' });
  }

  function handleAmountSave(id: number, amount: number) {
    onUpdate(profile.id, items => items.map(i => i.id === id ? { ...i, amount } : i));
    stampUpdate();
    fetch(`/api/moneta/item?id=${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
  }

  // doMove equivalente para el importe real: actualiza el estado local
  // de forma optimista antes de la llamada a la API y muestra feedback
  // visual a través de saveStatus ('saving' → 'saved'/'error' → 'idle').
  // El timeout de 2s devuelve el indicador a idle sin necesidad de acción del usuario.
  async function handleRealSave(id: number, real_amount: number | null) {
    onUpdate(profile.id, items => items.map(i => i.id === id ? { ...i, real_amount } : i));
    stampUpdate();
    setSaveStatus('saving');
    try {
      const res  = await fetch(`/api/moneta/item?id=${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ real_amount }),
      });
      const data = await res.json() as { ok: boolean };
      setSaveStatus(data.ok ? 'saved' : 'error');
    } catch {
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus('idle'), 2000);
  }

  function handleNameSave(id: number, name: string) {
    onUpdate(profile.id, items => items.map(i => i.id === id ? { ...i, name } : i));
    stampUpdate();
    fetch(`/api/moneta/item?id=${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  }

  /* ── Handlers de resumen ──────────────────────────── */
  async function saveSaldoInicial(val: string) {
    const n = parseFloat(val);
    const saldo = isNaN(n) ? null : n;
    onSummaryUpdate(profile.id, { saldo_inicial: saldo });
    setEditingSaldo(false);
    fetch('/api/moneta/summary', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profile.id, year, month, saldo_inicial: saldo }),
    });
  }

  // Cierre de mes: consolida el estado actual del mes de forma permanente.
  // Se envía action:'close' a la API, que guarda el snapshot de ahorro
  // real/estimado y la fecha de cierre. El mes queda en solo lectura para el
  // usuario hasta que lo reabra con handleReopenMes. El confirm previo
  // muestra el ahorro definitivo (real si existe, estimado si no) para que
  // el usuario pueda revisar antes de confirmar la operación.
  async function handleCerrarMes() {
    const lines = [
      `¿Cerrar ${monthLabel(year, month)} para ${profile.name}?`,
      '',
      hasAnyReal
        ? `Ahorro real: ${fmt(ahorroReal!)}`
        : `Ahorro estimado: ${fmt(ahorroEstimado)}`,
      saldoFinal !== null ? `Saldo final est.: ${fmt(saldoFinal)}` : '',
      '',
      'Podrás reabrirlo si necesitas corregir algo.',
    ].filter(l => l !== undefined && !(l === '' && !hasAnyReal)).join('\n');

    if (!confirm(lines)) return;
    setClosing(true);
    const res  = await fetch('/api/moneta/summary', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profile.id, year, month, action: 'close' }),
    });
    const data = await res.json() as { ok: boolean };
    if (data.ok) onSummaryUpdate(profile.id, { closed: 1, closed_at: new Date().toISOString() });
    setClosing(false);
  }

  async function handleReopenMes() {
    const res  = await fetch('/api/moneta/summary', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profile.id, year, month, action: 'reopen' }),
    });
    const data = await res.json() as { ok: boolean };
    if (data.ok) onSummaryUpdate(profile.id, { closed: 0, closed_at: null });
  }

  return (
    <div className={`moneta-col${isHidden ? ' hidden-mobile' : ''}`}>

      {/* ── Cabecera: nombre + saldo inicial ── */}
      <div className="moneta-col-title">{profile.name}</div>
      <div className="moneta-saldo-row">
        <span>Saldo inicial:</span>
        {editingSaldo ? (
          <input className="moneta-saldo-input" type="number" step="0.01" autoFocus
            value={saldoVal}
            onChange={e => setSaldoVal(e.target.value)}
            onBlur={() => saveSaldoInicial(saldoVal)}
            onKeyDown={e => { if (e.key === 'Enter') saveSaldoInicial(saldoVal); if (e.key === 'Escape') setEditingSaldo(false); }}
          />
        ) : (
          <span
            className={`moneta-saldo-val${summary?.saldo_inicial == null ? ' empty' : ''}`}
            onClick={() => { setSaldoVal(summary?.saldo_inicial != null ? String(summary.saldo_inicial) : ''); setEditingSaldo(true); }}
            title="Clic para editar el saldo inicial del mes"
          >
            {summary?.saldo_inicial != null ? fmt(summary.saldo_inicial) : 'Sin definir'}
          </span>
        )}
      </div>

      {/* ── GASTOS ── */}
      <div className="moneta-section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Gastos</span>
        <span style={{ fontSize: 10, fontWeight: 400 }}>
          {saveStatus === 'saving' && <span style={{ color: 'var(--adm-muted)' }}>Guardando…</span>}
          {saveStatus === 'saved'  && <span style={{ color: '#22c55e' }}>✓ Guardado</span>}
          {saveStatus === 'error'  && <span style={{ color: '#ef4444' }}>⚠ Error al guardar</span>}
          {saveStatus === 'idle' && lastUpdated && <span style={{ color: 'var(--adm-muted)' }}>Últ. mod. {lastUpdated}</span>}
        </span>
      </div>
      <div className="moneta-col-headers">
        <span className="mch-name" />
        <span className="mch-cell">PREVISTO</span>
        <span className="mch-copy" />
        <span className="mch-cell">REAL</span>
        <span className="mch-del" />
      </div>

      {gastos.map(item => (
        <ItemRow key={item.id} item={item} showReal
          onDelete={handleDelete}
          onAmountSave={handleAmountSave}
          onRealSave={handleRealSave}
          onNameSave={handleNameSave}
        />
      ))}

      {addingType === 'gasto' ? (
        <AddItemForm onAdd={handleAdd} onCancel={() => setAddingType(null)} />
      ) : (
        <button className="madd-btn" onClick={() => setAddingType('gasto')}>+ Añadir gasto</button>
      )}

      {(() => {
        const overTotal = hasAnyReal && totalRealGastos > totalPrevGastos;
        return (
          <div className="moneta-total-row">
            <span className="mch-name" style={{ color: overTotal ? '#ef4444' : undefined }}>
              {overTotal ? '⚠ Total gastos' : 'Total gastos'}
            </span>
            <span className="mch-cell" style={{ color: '#ef4444' }}>{fmt(totalPrevGastos)}</span>
            <span className="mch-copy" />
            <span className="mch-cell"
              title={overTotal ? `⚠ ${fmt(totalRealGastos - totalPrevGastos)} sobre el presupuesto` : undefined}
              style={{ color: hasAnyReal ? '#ef4444' : 'var(--adm-muted)', opacity: hasAnyReal ? 1 : 0.3 }}>
              {hasAnyReal ? fmt(totalRealGastos) : '—'}
            </span>
            <span className="mch-del" />
          </div>
        );
      })()}

      {/* ── INGRESOS ── */}
      <div className="moneta-section-label" style={{ marginTop: '1.25rem' }}>Ingresos</div>

      {ingresos.map(item => (
        <ItemRow key={item.id} item={item}
          onDelete={handleDelete}
          onAmountSave={handleAmountSave}
          onNameSave={handleNameSave}
        />
      ))}

      {addingType === 'ingreso' ? (
        <AddItemForm onAdd={handleAdd} onCancel={() => setAddingType(null)} />
      ) : (
        <button className="madd-btn" onClick={() => setAddingType('ingreso')}>+ Añadir ingreso</button>
      )}

      <div className="moneta-total-row">
        <span style={{ flex: 1 }}>Total ingresos</span>
        <span style={{ color: '#22c55e' }}>{fmt(totalPrevIngresos)}</span>
      </div>

      {/* ── AHORRO ── */}
      <div className="moneta-ahorro-row">
        <span>Ahorro</span>
        {ahorroReal !== null ? (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--adm-muted)', fontWeight: 400, marginBottom: 2 }}>
              Previsto: {fmt(ahorroEstimado)}
            </div>
            <div style={{ fontSize: 15, color: ahorroReal >= 0 ? '#22c55e' : '#ef4444' }}>
              Real: {fmt(ahorroReal)}
            </div>
          </div>
        ) : (
          <span style={{ color: ahorroEstimado >= 0 ? '#22c55e' : '#ef4444' }}>{fmt(ahorroEstimado)}</span>
        )}
      </div>

      {/* ── Cerrar mes / Mes cerrado ── */}
      {closed ? (
        <div className="moneta-closed-card">
          <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.08em' }}>
            ✓ MES CERRADO
            {summary?.closed_at && (
              <span style={{ color: 'var(--adm-muted)', fontWeight: 400, marginLeft: 6 }}>
                {new Date(summary.closed_at).toLocaleDateString('es-ES')}
              </span>
            )}
          </div>
          {ahorroReal !== null && (
            <div style={{ fontSize: 13, marginTop: 6 }}>
              Ahorro real:{' '}
              <strong style={{ color: ahorroReal >= 0 ? '#22c55e' : '#ef4444' }}>{fmt(ahorroReal)}</strong>
            </div>
          )}
          {saldoFinal !== null && (
            <div style={{ fontSize: 13, marginTop: 3 }}>
              Saldo final est.:{' '}
              <strong style={{ color: 'var(--adm-text)' }}>{fmt(saldoFinal)}</strong>
            </div>
          )}
          <button className="moneta-reabrir-btn" onClick={handleReopenMes}>Reabrir mes</button>
        </div>
      ) : (
        <button className="moneta-cerrar-btn" onClick={handleCerrarMes} disabled={closing}>
          {closing ? 'Cerrando...' : 'Cerrar mes'}
        </button>
      )}

    </div>
  );
}

/* ── Página principal ──────────────────────────────────────── */
export default function MonetaPage() {
  const [profiles,    setProfiles]    = useState<Profile[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [copying,     setCopying]     = useState(false);
  const [activeTab,   setActiveTab]   = useState(0);
  const [pageTab, setPageTab] = useState<'registros' | 'estadisticas'>('registros');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/moneta/data?year=${date.year}&month=${date.month}`)
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Profile[] }) => {
        if (res.ok) setProfiles(res.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [date.year, date.month]);

  useEffect(() => { load(); }, [load]);

  function updateProfile(profileId: number, updater: (items: Item[]) => Item[]) {
    setProfiles(ps => ps.map(p =>
      p.id === profileId ? { ...p, items: updater(p.items) } : p
    ));
  }

  function updateSummary(profileId: number, updates: Partial<Summary>) {
    setProfiles(ps => ps.map(p => {
      if (p.id !== profileId) return p;
      const base: Summary = p.summary ?? { saldo_inicial: null, closed: 0, closed_at: null };
      return { ...p, summary: { ...base, ...updates } };
    }));
  }

  function prevMonth() {
    setDate(({ year, month }) =>
      month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 });
  }
  function nextMonth() {
    setDate(({ year, month }) =>
      month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 });
  }
  function fromDate(year: number, month: number) {
    return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  }

  function exportCSV() {
    const rows = [`Perfil;Tipo;Concepto;Previsto (€);Real (€)`];
    for (const p of profiles) {
      for (const item of p.items) {
        rows.push([
          p.name,
          item.type === 'gasto' ? 'Gasto' : 'Ingreso',
          item.name,
          item.amount.toFixed(2).replace('.', ','),
          item.real_amount != null ? item.real_amount.toFixed(2).replace('.', ',') : '',
        ].join(';'));
      }
    }
    const blob = new Blob(['﻿' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `moneta-${date.year}-${String(date.month).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* Siempre pide confirmación antes de copiar */
  async function copyPrevMonth() {
    const from = fromDate(date.year, date.month);
    if (!confirm(
      `¿Copiar los ítems de ${monthLabel(from.year, from.month)} a ${monthLabel(date.year, date.month)}?\n\n` +
      `Se añadirán los ítems previstos sin los importes reales.`
    )) return;
    setCopying(true);
    const res  = await fetch('/api/moneta/copy', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_year: from.year, from_month: from.month, to_year: date.year, to_month: date.month }),
    });
    const data = await res.json() as { ok: boolean; error?: string };
    setCopying(false);
    if (data.ok) load();
    else alert(data.error ?? 'Error al copiar');
  }

  return (
    <div className="moneta-wrap">
      <style>{STYLES}</style>

      <div className="moneta-topbar">
        {pageTab === 'registros' ? (
          <>
            <button className="moneta-month-btn" onClick={prevMonth}>‹</button>
            <span className="moneta-month-label">{monthLabel(date.year, date.month)}</span>
            <button className="moneta-month-btn" onClick={nextMonth}>›</button>
            {loading && <span style={{ fontSize: 12, color: 'var(--adm-muted)' }}>Cargando...</span>}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="moneta-month-btn" onClick={exportCSV} disabled={loading}
                title="Descargar datos del mes en CSV">↓ CSV</button>
              <button
                className="moneta-copy-month-btn"
                onClick={copyPrevMonth}
                disabled={copying || loading}
                title={(() => { const f = fromDate(date.year, date.month); return `Copiar ítems de ${monthLabel(f.year, f.month)}`; })()}
              >
                {copying ? 'Copiando...' : '↑ Copiar mes anterior'}
              </button>
            </div>
          </>
        ) : (
          <span className="moneta-month-label" style={{ fontSize: 14, fontWeight: 600 }}>Estadísticas</span>
        )}
      </div>

      <div className="moneta-page-tabs">
        <button className={`moneta-page-tab${pageTab === 'registros' ? ' active' : ''}`}
          onClick={() => setPageTab('registros')}>Registros</button>
        <button className={`moneta-page-tab${pageTab === 'estadisticas' ? ' active' : ''}`}
          onClick={() => setPageTab('estadisticas')}>Estadísticas</button>
      </div>

      {pageTab === 'registros' && (
        <>
          <div className="moneta-tabs">
            {profiles.map((p, i) => (
              <button key={p.id} className={`moneta-tab${activeTab === i ? ' active' : ''}`}
                onClick={() => setActiveTab(i)}>
                {p.name}
              </button>
            ))}
          </div>
          <div className="moneta-grid">
            {profiles.map((p, i) => (
              <ProfileColumn
                key={p.id}
                profile={p} year={date.year} month={date.month}
                isHidden={i !== activeTab}
                onUpdate={updateProfile}
                onSummaryUpdate={updateSummary}
              />
            ))}
          </div>
        </>
      )}

      {pageTab === 'estadisticas' && <StatsView />}
    </div>
  );
}
