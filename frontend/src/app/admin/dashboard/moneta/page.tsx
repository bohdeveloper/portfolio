'use client';

import { useEffect, useState, useCallback } from 'react';

/* ── Tipos ─────────────────────────────────────────────────── */
interface Item {
  id: number;
  name: string;
  amount: number;
  type: 'gasto' | 'ingreso';
}

interface Profile {
  id: number;
  name: string;
  sort_order: number;
  items: Item[];
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

  .moneta-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0;
  }

  .moneta-col {
    padding: 1.25rem 1.5rem; border-right: 1px solid var(--adm-border);
  }
  .moneta-col:last-child { border-right: none; }
  .moneta-col-title {
    font-size: 16px; font-weight: 600; color: var(--primary); margin-bottom: 1.25rem;
  }

  /* Etiqueta de sección (GASTOS / INGRESOS) */
  .moneta-section-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--adm-muted);
    margin: 1rem 0 0.5rem; padding-bottom: 4px;
    border-bottom: 1px solid var(--adm-border);
  }
  .moneta-section-label:first-of-type { margin-top: 0; }

  /* Fila de ítem */
  .mitem-row {
    display: flex; align-items: center; gap: 6px; padding: 5px 0;
  }
  .mitem-name {
    flex: 1; font-size: 13px; overflow: hidden;
    text-overflow: ellipsis; white-space: nowrap;
  }
  .mitem-amount {
    font-size: 13px; font-weight: 500; text-align: right; cursor: pointer;
    padding: 2px 6px; border-radius: 4px; min-width: 85px;
    white-space: nowrap; transition: background 0.12s;
  }
  .mitem-amount:hover { background: var(--adm-border); }
  .mitem-amount-input {
    width: 85px; text-align: right; background: var(--adm-input);
    border: 1px solid var(--primary); border-radius: 4px;
    padding: 2px 6px; font-size: 13px; color: var(--adm-text);
    font-family: inherit; outline: none;
  }
  .mitem-del {
    background: none; border: none; cursor: pointer; padding: 1px 5px;
    color: var(--adm-muted); font-size: 15px; line-height: 1; border-radius: 3px;
    transition: color 0.12s; flex-shrink: 0;
  }
  .mitem-del:hover { color: #ef4444; }

  /* Fila total */
  .moneta-total-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 7px 0 3px; border-top: 1px solid var(--adm-border);
    margin-top: 4px; font-size: 13px; font-weight: 600;
  }

  /* Fila ahorro */
  .moneta-ahorro-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 0 4px; border-top: 2px solid var(--primary);
    margin-top: 8px; font-size: 14px; font-weight: 700;
  }

  /* Botón añadir */
  .madd-btn {
    display: flex; align-items: center; gap: 5px; width: 100%;
    background: none; border: 1px dashed var(--adm-border); border-radius: 5px;
    padding: 5px 10px; font-size: 12px; cursor: pointer; margin-top: 6px;
    color: var(--adm-muted); font-family: inherit; transition: border-color 0.12s, color 0.12s;
  }
  .madd-btn:hover { border-color: var(--primary); color: var(--primary); }

  /* Formulario inline de añadir */
  .madd-form {
    display: flex; gap: 6px; margin-top: 6px; align-items: center;
  }
  .madd-input {
    background: var(--adm-input); border: 1px solid var(--adm-border); border-radius: 5px;
    padding: 5px 8px; font-size: 12px; color: var(--adm-text);
    font-family: inherit; outline: none;
  }
  .madd-input:focus { border-color: var(--primary); }
  .madd-confirm {
    background: none; border: 1px solid var(--primary); border-radius: 5px;
    padding: 4px 8px; font-size: 12px; cursor: pointer;
    color: var(--primary); font-family: inherit; flex-shrink: 0;
  }
  .madd-cancel {
    background: none; border: 1px solid var(--adm-border); border-radius: 5px;
    padding: 4px 7px; font-size: 12px; cursor: pointer;
    color: var(--adm-muted); font-family: inherit; flex-shrink: 0;
  }

  @media (max-width: 700px) {
    .moneta-grid { grid-template-columns: 1fr; }
    .moneta-col { border-right: none; border-top: 1px solid var(--adm-border); }
    .moneta-col.hidden-mobile { display: none; }
    .moneta-tabs { display: flex; }
    .moneta-topbar { padding: 0.85rem 1rem; }
  }
`;

/* ── Fila de ítem existente ────────────────────────────────── */
function ItemRow({ item, onDelete, onAmountSave }: {
  item: Item;
  onDelete: (id: number) => void;
  onAmountSave: (id: number, amount: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val,     setVal]     = useState('');

  function startEdit() {
    setVal(item.amount > 0 ? String(item.amount) : '');
    setEditing(true);
  }

  function confirm() {
    const n = parseFloat(val);
    if (!isNaN(n)) onAmountSave(item.id, n);
    setEditing(false);
  }

  return (
    <div className="mitem-row">
      <span className="mitem-name">{item.name}</span>
      {editing ? (
        <input
          className="mitem-amount-input" type="number" step="0.01" value={val} autoFocus
          onChange={e => setVal(e.target.value)}
          onBlur={confirm}
          onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') setEditing(false); }}
        />
      ) : (
        <span className="mitem-amount" onClick={startEdit} title="Clic para editar importe">
          {item.amount > 0 ? fmt(item.amount) : <span style={{ color: 'var(--adm-muted)' }}>—</span>}
        </span>
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
      <input
        className="madd-input" style={{ flex: 1, minWidth: 0 }} placeholder="Concepto" autoFocus
        value={name} onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
      />
      <input
        className="madd-input" style={{ width: 76 }} placeholder="0,00" type="number" step="0.01"
        value={amount} onChange={e => setAmount(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
      />
      <button className="madd-confirm" onClick={submit} disabled={saving}>✓</button>
      <button className="madd-cancel" onClick={onCancel}>✕</button>
    </div>
  );
}

/* ── Columna de un perfil (Pareja / Personal) ───────────────── */
function ProfileColumn({ profile, year, month, isHidden, onUpdate }: {
  profile: Profile; year: number; month: number; isHidden: boolean;
  onUpdate: (profileId: number, updater: (items: Item[]) => Item[]) => void;
}) {
  const [addingType, setAddingType] = useState<'gasto' | 'ingreso' | null>(null);

  const gastos   = profile.items.filter(i => i.type === 'gasto');
  const ingresos = profile.items.filter(i => i.type === 'ingreso');

  const totalGastos   = gastos.reduce((s, i) => s + i.amount, 0);
  const totalIngresos = ingresos.reduce((s, i) => s + i.amount, 0);
  const ahorro        = totalIngresos - totalGastos;

  async function handleAdd(name: string, amount: number) {
    const type = addingType!;
    const res  = await fetch('/api/moneta/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profile.id, year, month, name, amount, type }),
    });
    const data = await res.json() as { ok: boolean; id: number };
    if (data.ok) {
      onUpdate(profile.id, items => [...items, { id: data.id, name, amount, type }]);
      setAddingType(null);
    }
  }

  /* Eliminación optimista: quita de estado inmediatamente, llama API en background */
  function handleDelete(id: number) {
    onUpdate(profile.id, items => items.filter(i => i.id !== id));
    fetch(`/api/moneta/item?id=${id}`, { method: 'DELETE' });
  }

  /* Edición de importe optimista */
  function handleAmountSave(id: number, amount: number) {
    onUpdate(profile.id, items => items.map(i => i.id === id ? { ...i, amount } : i));
    fetch(`/api/moneta/item?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
  }

  return (
    <div className={`moneta-col${isHidden ? ' hidden-mobile' : ''}`}>
      <div className="moneta-col-title">{profile.name}</div>

      {/* ── GASTOS ── */}
      <div className="moneta-section-label">Gastos</div>
      {gastos.map(item => (
        <ItemRow key={item.id} item={item}
          onDelete={handleDelete} onAmountSave={handleAmountSave} />
      ))}
      {addingType === 'gasto' ? (
        <AddItemForm onAdd={handleAdd} onCancel={() => setAddingType(null)} />
      ) : (
        <button className="madd-btn" onClick={() => setAddingType('gasto')}>
          + Añadir gasto
        </button>
      )}
      <div className="moneta-total-row">
        <span>Total gastos</span>
        <span style={{ color: '#ef4444' }}>{fmt(totalGastos)}</span>
      </div>

      {/* ── INGRESOS ── */}
      <div className="moneta-section-label" style={{ marginTop: '1.25rem' }}>Ingresos</div>
      {ingresos.map(item => (
        <ItemRow key={item.id} item={item}
          onDelete={handleDelete} onAmountSave={handleAmountSave} />
      ))}
      {addingType === 'ingreso' ? (
        <AddItemForm onAdd={handleAdd} onCancel={() => setAddingType(null)} />
      ) : (
        <button className="madd-btn" onClick={() => setAddingType('ingreso')}>
          + Añadir ingreso
        </button>
      )}
      <div className="moneta-total-row">
        <span>Total ingresos</span>
        <span style={{ color: '#22c55e' }}>{fmt(totalIngresos)}</span>
      </div>

      {/* ── AHORRO ── */}
      <div className="moneta-ahorro-row">
        <span>Ahorro</span>
        <span style={{ color: ahorro >= 0 ? '#22c55e' : '#ef4444' }}>{fmt(ahorro)}</span>
      </div>
    </div>
  );
}

/* ── Página principal ──────────────────────────────────────── */
export default function MonetaPage() {
  const [profiles,  setProfiles]  = useState<Profile[]>([]);
  const [loading,   setLoading]   = useState(true);
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

  function prevMonth() {
    setDate(({ year, month }) =>
      month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 });
  }
  function nextMonth() {
    setDate(({ year, month }) =>
      month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 });
  }

  return (
    <div className="moneta-wrap">
      <style>{STYLES}</style>

      {/* Barra superior */}
      <div className="moneta-topbar">
        <button className="moneta-month-btn" onClick={prevMonth}>‹</button>
        <span className="moneta-month-label">{monthLabel(date.year, date.month)}</span>
        <button className="moneta-month-btn" onClick={nextMonth}>›</button>
        {loading && <span style={{ fontSize: 12, color: 'var(--adm-muted)' }}>Cargando...</span>}
      </div>

      {/* Tabs para móvil */}
      <div className="moneta-tabs">
        {profiles.map((p, i) => (
          <button key={p.id} className={`moneta-tab${activeTab === i ? ' active' : ''}`}
            onClick={() => setActiveTab(i)}>
            {p.name}
          </button>
        ))}
      </div>

      {/* Grid de perfiles */}
      <div className="moneta-grid">
        {profiles.map((p, i) => (
          <ProfileColumn
            key={p.id}
            profile={p} year={date.year} month={date.month}
            isHidden={i !== activeTab}
            onUpdate={updateProfile}
          />
        ))}
      </div>
    </div>
  );
}
