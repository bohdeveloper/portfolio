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
    margin-left: auto; background: none; cursor: pointer; font-family: inherit;
    border: 1px solid var(--adm-border); border-radius: 6px; padding: 5px 12px;
    font-size: 12px; color: var(--adm-muted); transition: border-color 0.15s, color 0.15s;
  }
  .moneta-copy-month-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
  .moneta-copy-month-btn:disabled { opacity: 0.4; cursor: not-allowed; }

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
   Borrar el campo real y confirmar con Enter lo resetea a null. */
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
    const n = parseFloat(amountVal);
    if (!isNaN(n)) onAmountSave(item.id, n);
    setEditAmount(false);
  }
  function confirmReal() {
    const t = realVal.trim();
    onRealSave?.(item.id, t === '' ? null : (parseFloat(t) || 0));
    setEditReal(false);
  }

  const hasReal = item.real_amount != null;

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
        <input className="mitem-cell-input" type="number" step="0.01" value={amountVal} autoFocus
          onChange={e => setAmountVal(e.target.value)}
          onBlur={confirmAmount}
          onKeyDown={e => { if (e.key === 'Enter') confirmAmount(); if (e.key === 'Escape') setEditAmount(false); }} />
      ) : (
        <span className="mitem-cell" onClick={startAmount} title="Editar previsto">
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
          <input className="mitem-cell-input" type="number" step="0.01" value={realVal} autoFocus
            placeholder="Vaciar = borrar"
            onChange={e => setRealVal(e.target.value)}
            onBlur={confirmReal}
            onKeyDown={e => { if (e.key === 'Enter') confirmReal(); if (e.key === 'Escape') setEditReal(false); }} />
        ) : (
          <span className="mitem-cell" onClick={startReal}
            title={hasReal ? 'Editar importe real' : 'Añadir importe real'}
            style={{ color: hasReal ? 'var(--primary)' : 'var(--adm-muted)', opacity: hasReal ? 1 : 0.4 }}>
            {hasReal ? fmt(item.real_amount!) : '—'}
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

  const summary = profile.summary;
  const closed  = !!(summary?.closed);

  /* ── Cálculos ─────────────────────────────────────── */
  const gastos   = profile.items.filter(i => i.type === 'gasto');
  const ingresos = profile.items.filter(i => i.type === 'ingreso');

  const totalPrevGastos   = gastos.reduce((s, i) => s + i.amount, 0);
  const totalPrevIngresos = ingresos.reduce((s, i) => s + i.amount, 0);

  /* Real: solo suma los ítems que tienen real_amount establecido */
  const gastosConReal   = gastos.filter(i => i.real_amount != null);
  const totalRealGastos = gastosConReal.reduce((s, i) => s + i.real_amount!, 0);
  const hasAnyReal      = gastosConReal.length > 0;

  const ahorroEstimado = totalPrevIngresos - totalPrevGastos;
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
    fetch(`/api/moneta/item?id=${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
  }

  function handleRealSave(id: number, real_amount: number | null) {
    onUpdate(profile.id, items => items.map(i => i.id === id ? { ...i, real_amount } : i));
    fetch(`/api/moneta/item?id=${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ real_amount }),
    });
  }

  function handleNameSave(id: number, name: string) {
    onUpdate(profile.id, items => items.map(i => i.id === id ? { ...i, name } : i));
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
      <div className="moneta-section-label">Gastos</div>
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

      <div className="moneta-total-row">
        <span className="mch-name">Total gastos</span>
        <span className="mch-cell" style={{ color: '#ef4444' }}>{fmt(totalPrevGastos)}</span>
        <span className="mch-copy" />
        <span className="mch-cell" style={{ color: hasAnyReal ? '#ef4444' : 'var(--adm-muted)', opacity: hasAnyReal ? 1 : 0.3 }}>
          {hasAnyReal ? fmt(totalRealGastos) : '—'}
        </span>
        <span className="mch-del" />
      </div>

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
  const [profiles,  setProfiles]  = useState<Profile[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [copying,   setCopying]   = useState(false);
  const [activeTab, setActiveTab] = useState(0);
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
        <button className="moneta-month-btn" onClick={prevMonth}>‹</button>
        <span className="moneta-month-label">{monthLabel(date.year, date.month)}</span>
        <button className="moneta-month-btn" onClick={nextMonth}>›</button>
        {loading && <span style={{ fontSize: 12, color: 'var(--adm-muted)' }}>Cargando...</span>}
        <button
          className="moneta-copy-month-btn"
          onClick={copyPrevMonth}
          disabled={copying || loading}
          title={(() => { const f = fromDate(date.year, date.month); return `Copiar ítems de ${monthLabel(f.year, f.month)}`; })()}
        >
          {copying ? 'Copiando...' : '↑ Copiar mes anterior'}
        </button>
      </div>

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
    </div>
  );
}
