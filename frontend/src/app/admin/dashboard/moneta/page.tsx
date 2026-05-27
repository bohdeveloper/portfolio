'use client';

import { useEffect, useState, useCallback } from 'react';

/* ── Tipos ─────────────────────────────────────────────────── */
interface Category {
  id: number;
  profile_id: number;
  name: string;
  planned_amount: number;
  type: 'income' | 'expense';
  parent_id: number | null;
  sort_order: number;
  actual: number;
  has_actual: boolean;
  children: Category[];
}

interface Profile {
  id: number;
  name: string;
  sort_order: number;
  categories: Category[];
}

/* ── Helpers ───────────────────────────────────────────────── */

/* Formatea número como "1.300,00 €" */
function fmt(n: number) {
  if (!n && n !== 0) return '—';
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

/* Convierte {year, month} en "Mayo 2025" */
function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1)
    .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    .replace(/^(.)/, s => s.toUpperCase());
}

/* Suma total de categorías raíz (excluye hijos para no duplicar) */
function rootTotal(cats: Category[], type: 'income' | 'expense', field: 'planned_amount' | 'actual') {
  return cats
    .filter(c => c.type === type && !c.parent_id)
    .reduce((acc, c) => acc + (c[field] ?? 0), 0);
}

/* ── Estilos ───────────────────────────────────────────────── */
const STYLES = `
  .moneta-wrap {
    min-height: calc(100vh - 88px); background: var(--adm-bg);
    font-family: system-ui, sans-serif; color: var(--adm-text);
  }
  /* Barra superior: selector de mes y controles */
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

  /* Tabs de perfil en móvil */
  .moneta-tabs { display: none; border-bottom: 1px solid var(--adm-border); }
  .moneta-tab {
    padding: 10px 20px; font-size: 13px; font-weight: 500; cursor: pointer;
    background: none; border: none; border-bottom: 2px solid transparent;
    color: var(--adm-muted); font-family: inherit; transition: color 0.15s;
  }
  .moneta-tab.active { color: var(--primary); border-bottom-color: var(--primary); }

  /* Grid de perfiles en escritorio */
  .moneta-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0; min-height: calc(100vh - 160px);
  }
  .moneta-profile {
    padding: 1.5rem; border-right: 1px solid var(--adm-border);
  }
  .moneta-profile:last-child { border-right: none; }
  .moneta-profile-name {
    font-size: 16px; font-weight: 600; color: var(--primary);
    margin-bottom: 1.25rem; letter-spacing: 0.02em;
    display: flex; align-items: center; justify-content: space-between;
  }

  /* Sección GASTOS / INGRESOS */
  .moneta-section-title {
    font-size: 10px; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--adm-muted);
    margin: 1.25rem 0 0.6rem; padding-bottom: 4px;
    border-bottom: 1px solid var(--adm-border);
  }

  /* Tabla de categorías */
  .moneta-table { width: 100%; border-collapse: collapse; }
  .moneta-table td { padding: 5px 0; vertical-align: middle; font-size: 13px; }

  /* Nombre de la categoría */
  .mcat-name { padding-right: 8px; }
  .mcat-name.child { padding-left: 16px; color: var(--adm-muted); font-size: 12px; }
  .mcat-name.child::before { content: '└ '; }

  /* Celdas de importe */
  .mcat-plan {
    text-align: right; color: var(--adm-muted); font-size: 12px;
    white-space: nowrap; padding-right: 12px; min-width: 80px;
  }
  .mcat-real {
    text-align: right; white-space: nowrap; min-width: 90px;
    font-size: 13px; font-weight: 500;
  }
  /* El importe real clicable para editar */
  .mcat-real-val {
    cursor: pointer; padding: 2px 6px; border-radius: 4px;
    transition: background 0.12s;
    display: inline-block; min-width: 70px; text-align: right;
  }
  .mcat-real-val:hover { background: var(--adm-border); }
  .mcat-real-val.entered { color: var(--primary); }
  .mcat-real-val.not-entered { color: var(--adm-muted); }

  /* Input inline de edición */
  .mcat-input {
    width: 80px; text-align: right; background: var(--adm-input);
    border: 1px solid var(--primary); border-radius: 4px;
    padding: 2px 6px; font-size: 13px; color: var(--adm-text);
    font-family: inherit; outline: none;
  }

  /* Filas de total y ahorro */
  .moneta-total-row td {
    padding: 8px 0 4px; font-weight: 600; font-size: 13px;
    border-top: 1px solid var(--adm-border);
  }
  .moneta-ahorro-row td {
    padding: 10px 0 4px; font-size: 14px; font-weight: 700;
    color: var(--primary); border-top: 2px solid var(--primary);
    margin-top: 8px;
  }

  /* Botones pequeños */
  .mbtn {
    background: none; border: 1px solid var(--adm-border); border-radius: 5px;
    padding: 3px 8px; font-size: 11px; cursor: pointer; font-family: inherit;
    color: var(--adm-muted); transition: border-color 0.12s, color 0.12s;
  }
  .mbtn:hover { border-color: var(--primary); color: var(--primary); }
  .mbtn-del:hover { border-color: #ef4444; color: #ef4444; }

  /* Formulario inline añadir categoría */
  .moneta-add-form {
    display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;
  }
  .moneta-add-input {
    background: var(--adm-input); border: 1px solid var(--adm-border); border-radius: 5px;
    padding: 4px 8px; font-size: 12px; color: var(--adm-text); font-family: inherit;
    outline: none;
  }
  .moneta-add-input:focus { border-color: var(--primary); }

  /* Responsive: en móvil una sola columna con tabs */
  @media (max-width: 700px) {
    .moneta-grid { grid-template-columns: 1fr; }
    .moneta-profile { border-right: none; border-top: 1px solid var(--adm-border); }
    .moneta-profile.hidden { display: none; }
    .moneta-tabs { display: flex; }
    .moneta-topbar { padding: 0.85rem 1rem; }
  }
`;

/* ── Formulario inline para añadir categoría ───────────────── */
function AddCategoryForm({
  profileId, parentId, type, nextOrder,
  onSave, onCancel,
}: {
  profileId: number; parentId: number | null; type: 'income' | 'expense';
  nextOrder: number; onSave: () => void; onCancel: () => void;
}) {
  const [name,   setName]   = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name) return;
    setSaving(true);
    await fetch('/api/moneta/category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: profileId, name, planned_amount: parseFloat(amount) || 0,
        type, parent_id: parentId, sort_order: nextOrder,
      }),
    });
    setSaving(false); onSave();
  }

  return (
    <div className="moneta-add-form">
      <input className="moneta-add-input" style={{ width: 120 }} placeholder="Nombre" autoFocus
        value={name} onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onCancel(); }} />
      <input className="moneta-add-input" style={{ width: 80 }} placeholder="0.00" type="number"
        value={amount} onChange={e => setAmount(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onCancel(); }} />
      <button className="mbtn" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
        onClick={save} disabled={saving}>✓</button>
      <button className="mbtn" onClick={onCancel}>✕</button>
    </div>
  );
}

/* ── Fila de categoría (con hijos opcionales) ──────────────── */
function CategoryRow({
  cat, year, month, editMode,
  onActualSaved, onDeleted,
}: {
  cat: Category; year: number; month: number; editMode: boolean;
  onActualSaved: (id: number, val: number) => void;
  onDeleted: (id: number) => void;
}) {
  const [editActualId, setEditActualId] = useState<number | null>(null);
  const [inputVal,     setInputVal]     = useState('');
  const [addChild,     setAddChild]     = useState(false);
  const [editName,     setEditName]     = useState(cat.name);
  const [editAmount,   setEditAmount]   = useState(String(cat.planned_amount));
  const [savingPlan,   setSavingPlan]   = useState(false);

  /* Importe real efectivo: si hay hijos con actual, suma los hijos; si no, el propio */
  const childrenActualSum = cat.children.reduce((acc, c) => acc + (c.actual ?? 0), 0);
  const effectiveActual   = cat.children.length > 0 && cat.children.some(c => c.has_actual)
    ? childrenActualSum
    : cat.actual;

  function startEdit(id: number, currentVal: number) {
    setEditActualId(id); setInputVal(currentVal > 0 ? String(currentVal) : '');
  }

  async function saveActual(id: number) {
    const val = parseFloat(inputVal);
    if (!isNaN(val)) {
      await fetch('/api/moneta/actual', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: id, year, month, amount: val }),
      });
      onActualSaved(id, val);
    }
    setEditActualId(null);
  }

  async function savePlan() {
    setSavingPlan(true);
    await fetch('/api/moneta/category', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: cat.id, profile_id: cat.profile_id, name: editName,
        planned_amount: parseFloat(editAmount) || 0,
        type: cat.type, parent_id: cat.parent_id, sort_order: cat.sort_order,
      }),
    });
    setSavingPlan(false);
  }

  async function del(id: number) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    await fetch(`/api/moneta/category?id=${id}`, { method: 'DELETE' });
    onDeleted(id);
  }

  /* Celda de importe real editable al hacer clic */
  function ActualCell({ id, val, hasActual }: { id: number; val: number; hasActual: boolean }) {
    if (editActualId === id) {
      return (
        <input className="mcat-input" type="number" step="0.01" value={inputVal} autoFocus
          onChange={e => setInputVal(e.target.value)}
          onBlur={() => saveActual(id)}
          onKeyDown={e => { if (e.key === 'Enter') saveActual(id); if (e.key === 'Escape') setEditActualId(null); }} />
      );
    }
    return (
      <span className={`mcat-real-val ${hasActual || val > 0 ? 'entered' : 'not-entered'}`}
        onClick={() => startEdit(id, val)}
        title="Clic para editar el importe real">
        {(hasActual || val > 0) ? fmt(val) : '—'}
      </span>
    );
  }

  return (
    <>
      <tr>
        <td className="mcat-name">
          {editMode ? (
            <input className="moneta-add-input" value={editName} style={{ width: 110 }}
              onChange={e => setEditName(e.target.value)}
              onBlur={savePlan} onKeyDown={e => { if (e.key === 'Enter') savePlan(); }} />
          ) : (
            <span>{cat.name}</span>
          )}
        </td>
        <td className="mcat-plan">
          {editMode ? (
            <input className="moneta-add-input" type="number" step="0.01" value={editAmount}
              style={{ width: 70, textAlign: 'right' }}
              onChange={e => setEditAmount(e.target.value)}
              onBlur={savePlan} onKeyDown={e => { if (e.key === 'Enter') savePlan(); }} />
          ) : (
            fmt(cat.planned_amount)
          )}
          {savingPlan && <span style={{ fontSize: 10, color: 'var(--adm-muted)' }}> ✓</span>}
        </td>
        <td className="mcat-real">
          {/* Si tiene hijos, el real se calcula de los hijos; si no, es editable directo */}
          {cat.children.length > 0
            ? <span style={{ color: cat.children.some(c => c.has_actual) ? 'var(--primary)' : 'var(--adm-muted)', fontSize: 13 }}>
                {cat.children.some(c => c.has_actual) ? fmt(childrenActualSum) : '—'}
              </span>
            : <ActualCell id={cat.id} val={cat.actual} hasActual={cat.has_actual} />
          }
        </td>
        {editMode && (
          <td style={{ paddingLeft: 6 }}>
            <button className="mbtn mbtn-del" onClick={() => del(cat.id)}>✕</button>
          </td>
        )}
      </tr>

      {/* Hijos (sub-categorías) */}
      {cat.children.map(ch => (
        <tr key={ch.id}>
          <td className="mcat-name child">
            {editMode ? (
              <ChildEditRow child={ch} onSaved={() => {}} onDeleted={onDeleted} />
            ) : (
              ch.name
            )}
          </td>
          <td className="mcat-plan">{fmt(ch.planned_amount)}</td>
          <td className="mcat-real">
            <ActualCell id={ch.id} val={ch.actual} hasActual={ch.has_actual} />
          </td>
          {editMode && (
            <td style={{ paddingLeft: 6 }}>
              <button className="mbtn mbtn-del" onClick={() => del(ch.id)}>✕</button>
            </td>
          )}
        </tr>
      ))}

      {/* Formulario inline para añadir sub-categoría */}
      {editMode && !cat.parent_id && (
        <tr>
          <td colSpan={4} style={{ paddingLeft: 16, paddingTop: 2 }}>
            {addChild ? (
              <AddCategoryForm
                profileId={cat.profile_id} parentId={cat.id} type={cat.type}
                nextOrder={cat.children.length + 1}
                onSave={() => { setAddChild(false); /* el padre recarga */ }}
                onCancel={() => setAddChild(false)}
              />
            ) : (
              <button className="mbtn" style={{ fontSize: 10, marginTop: 2 }}
                onClick={() => setAddChild(true)}>+ sub</button>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

/* Edición inline de nombre/importe de una sub-categoría existente */
function ChildEditRow({ child, onSaved, onDeleted }: {
  child: Category; onSaved: () => void; onDeleted: (id: number) => void;
}) {
  const [name,   setName]   = useState(child.name);
  const [amount, setAmount] = useState(String(child.planned_amount));

  async function save() {
    await fetch('/api/moneta/category', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: child.id, profile_id: child.profile_id, name,
        planned_amount: parseFloat(amount) || 0,
        type: child.type, parent_id: child.parent_id, sort_order: child.sort_order,
      }),
    });
    onSaved();
  }

  return (
    <span style={{ display: 'flex', gap: 4 }}>
      <input className="moneta-add-input" value={name} style={{ width: 90 }}
        onChange={e => setName(e.target.value)}
        onBlur={save} onKeyDown={e => { if (e.key === 'Enter') save(); }} />
    </span>
  );
}

/* ── Vista de un perfil (Pareja / Personal) ───────────────── */
function ProfileView({
  profile, year, month, editMode,
  onReload,
}: {
  profile: Profile; year: number; month: number; editMode: boolean;
  onReload: () => void;
}) {
  const [addingType, setAddingType] = useState<'income' | 'expense' | null>(null);

  /* Actualiza el actual localmente sin recargar todo (optimistic UI) */
  function handleActualSaved(id: number, val: number) {
    /* Simplificamos: recarga desde API para que los totales sean correctos */
    onReload();
  }

  function handleDeleted(_id: number) { onReload(); }

  const expenses = profile.categories.filter(c => c.type === 'expense' && !c.parent_id);
  const incomes  = profile.categories.filter(c => c.type === 'income'  && !c.parent_id);

  const planExpenses = expenses.reduce((a, c) => a + c.planned_amount, 0);
  const planIncomes  = incomes.reduce( (a, c) => a + c.planned_amount, 0);
  const planAhorro   = planIncomes - planExpenses;

  /* Actual: suma de raíces que tienen real (ya sea directo o desde hijos) */
  function rootActual(cats: Category[]) {
    return cats.reduce((acc, c) => {
      if (c.children.length > 0 && c.children.some(ch => ch.has_actual)) {
        return acc + c.children.reduce((s, ch) => s + ch.actual, 0);
      }
      return acc + (c.has_actual ? c.actual : 0);
    }, 0);
  }

  const hasAnyExpenseActual = expenses.some(c =>
    c.has_actual || c.children.some(ch => ch.has_actual));
  const hasAnyIncomeActual  = incomes.some(c => c.has_actual);

  const realExpenses = hasAnyExpenseActual ? rootActual(expenses) : null;
  const realIncomes  = hasAnyIncomeActual  ? rootActual(incomes)  : null;
  const realAhorro   = (realIncomes !== null || realExpenses !== null)
    ? (realIncomes ?? 0) - (realExpenses ?? 0) : null;

  return (
    <div className="moneta-profile">
      {/* Cabecera del perfil */}
      <div className="moneta-profile-name">
        <span>{profile.name}</span>
        <button className="mbtn" onClick={() => onReload()} title="Recargar">↻</button>
      </div>

      {/* Columnas Plan / Real */}
      <table className="moneta-table">
        <colgroup>
          <col style={{ width: '100%' }} />
          <col style={{ width: 90 }} />
          <col style={{ width: 95 }} />
          {editMode && <col style={{ width: 30 }} />}
        </colgroup>
        <thead>
          <tr>
            <th style={{ fontSize: 10, color: 'var(--adm-muted)', fontWeight: 500, textAlign: 'left', paddingBottom: 4 }}>
              Categoría
            </th>
            <th style={{ fontSize: 10, color: 'var(--adm-muted)', fontWeight: 500, textAlign: 'right', paddingRight: 12, paddingBottom: 4 }}>
              Plan
            </th>
            <th style={{ fontSize: 10, color: 'var(--adm-muted)', fontWeight: 500, textAlign: 'right', paddingBottom: 4 }}>
              Real
            </th>
            {editMode && <th />}
          </tr>
        </thead>

        <tbody>
          {/* ── GASTOS ── */}
          <tr><td colSpan={editMode ? 4 : 3}><div className="moneta-section-title">Gastos</div></td></tr>

          {expenses.map(cat => (
            <CategoryRow key={cat.id} cat={cat} year={year} month={month} editMode={editMode}
              onActualSaved={handleActualSaved} onDeleted={handleDeleted} />
          ))}

          {/* Botón añadir categoría de gasto */}
          {editMode && (
            <tr>
              <td colSpan={4} style={{ paddingTop: 6 }}>
                {addingType === 'expense' ? (
                  <AddCategoryForm
                    profileId={profile.id} parentId={null} type="expense"
                    nextOrder={expenses.length + 1}
                    onSave={() => { setAddingType(null); onReload(); }}
                    onCancel={() => setAddingType(null)}
                  />
                ) : (
                  <button className="mbtn" onClick={() => setAddingType('expense')}>+ categoría</button>
                )}
              </td>
            </tr>
          )}

          {/* Total gastos */}
          <tr className="moneta-total-row">
            <td>TOTAL GASTOS</td>
            <td className="mcat-plan" style={{ fontWeight: 600, color: '#ef4444' }}>{fmt(planExpenses)}</td>
            <td className="mcat-real" style={{ color: '#ef4444' }}>
              {realExpenses !== null ? fmt(realExpenses) : '—'}
            </td>
            {editMode && <td />}
          </tr>

          {/* ── INGRESOS ── */}
          <tr><td colSpan={editMode ? 4 : 3}><div className="moneta-section-title">Ingresos</div></td></tr>

          {incomes.map(cat => (
            <CategoryRow key={cat.id} cat={cat} year={year} month={month} editMode={editMode}
              onActualSaved={handleActualSaved} onDeleted={handleDeleted} />
          ))}

          {editMode && (
            <tr>
              <td colSpan={4} style={{ paddingTop: 6 }}>
                {addingType === 'income' ? (
                  <AddCategoryForm
                    profileId={profile.id} parentId={null} type="income"
                    nextOrder={incomes.length + 1}
                    onSave={() => { setAddingType(null); onReload(); }}
                    onCancel={() => setAddingType(null)}
                  />
                ) : (
                  <button className="mbtn" onClick={() => setAddingType('income')}>+ categoría</button>
                )}
              </td>
            </tr>
          )}

          {/* Total ingresos */}
          <tr className="moneta-total-row">
            <td>TOTAL INGRESOS</td>
            <td className="mcat-plan" style={{ fontWeight: 600, color: '#22c55e' }}>{fmt(planIncomes)}</td>
            <td className="mcat-real" style={{ color: '#22c55e' }}>
              {realIncomes !== null ? fmt(realIncomes) : '—'}
            </td>
            {editMode && <td />}
          </tr>

          {/* ── AHORRO ── */}
          <tr className="moneta-ahorro-row">
            <td>AHORRO</td>
            <td className="mcat-plan" style={{ fontWeight: 700, color: planAhorro >= 0 ? '#22c55e' : '#ef4444', fontSize: 14 }}>
              {fmt(planAhorro)}
            </td>
            <td className="mcat-real" style={{ color: realAhorro !== null ? (realAhorro >= 0 ? '#22c55e' : '#ef4444') : 'var(--adm-muted)', fontSize: 14 }}>
              {realAhorro !== null ? fmt(realAhorro) : '—'}
            </td>
            {editMode && <td />}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ── Página principal ──────────────────────────────────────── */
export default function MonetaPage() {
  const [profiles,  setProfiles]  = useState<Profile[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [editMode,  setEditMode]  = useState(false);
  const [activeTab, setActiveTab] = useState(0);  // para móvil
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
        {loading && <span style={{ fontSize: 12, color: 'var(--adm-muted)' }}>Actualizando...</span>}
        <button
          className="mbtn"
          style={{ marginLeft: 'auto', borderColor: editMode ? 'var(--primary)' : undefined,
            color: editMode ? 'var(--primary)' : undefined }}
          onClick={() => setEditMode(e => !e)}
        >
          {editMode ? '✓ Guardar plan' : '✏️ Editar plan'}
        </button>
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
          <div key={p.id} className={`${i !== activeTab ? 'hidden-mobile' : ''}`}
            style={{ display: 'contents' }}>
            <ProfileView
              profile={p} year={date.year} month={date.month}
              editMode={editMode} onReload={load}
            />
          </div>
        ))}
      </div>

      {/* Añadir la clase hidden en móvil a través del CSS de tabs */}
      <style>{`
        @media (max-width: 700px) {
          .moneta-grid > div:not(:nth-child(${activeTab + 1})) .moneta-profile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
