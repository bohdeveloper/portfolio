'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

/* ── Tipos ─────────────────────────────────────────────────── */
interface Transaction {
  id: number;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: number | null;
  description: string;
  owner: 'me' | 'partner' | 'shared';
  created_at: string;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  budget_limit: number | null;
  type: 'income' | 'expense' | 'both';
  sort_order: number;
}

interface MonthStats {
  income: number;
  expenses: number;
  balance: number;
  savings_goal: number;
  by_category: { id: number; name: string; color: string; icon: string; total: number }[];
  trend: { month: string; income: number; expenses: number }[];
}

type View = 'dashboard' | 'transactions' | 'categories';

/* ── Helpers ───────────────────────────────────────────────── */

/* Formatea un número como moneda €, forzando 2 decimales */
function fmt(n: number) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

/* Convierte "2025-06" en "Junio 2025" */
function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1)
    .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

/* Convierte "2025-06" (string de trend) en etiqueta corta "Jun" */
function shortMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'short' });
}

const OWNER_LABELS: Record<string, string> = { me: 'Yo', partner: 'Pareja', shared: 'Ambos' };

/* ── Estilos CSS del módulo ────────────────────────────────── */
const ECO_STYLES = `
  /* Contenedor principal */
  .eco-wrap {
    min-height: calc(100vh - 88px);
    background: var(--adm-bg);
    font-family: system-ui, sans-serif;
    color: var(--adm-text);
  }

  /* Barra de navegación de vistas */
  .eco-nav {
    display: flex; gap: 0; border-bottom: 1px solid var(--adm-border);
    background: var(--adm-hdr); padding: 0 1.5rem;
  }
  .eco-nav-btn {
    padding: 14px 20px; font-size: 13px; font-weight: 500; cursor: pointer;
    background: none; border: none; border-bottom: 2px solid transparent;
    color: var(--adm-muted); font-family: inherit; transition: color 0.15s, border-color 0.15s;
  }
  .eco-nav-btn:hover { color: var(--adm-text); }
  .eco-nav-btn.active { color: var(--primary); border-bottom-color: var(--primary); }

  /* Cabecera con selector de mes */
  .eco-month-bar {
    display: flex; align-items: center; gap: 12px;
    padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--adm-border);
  }
  .eco-month-btn {
    background: none; border: 1px solid var(--adm-border); border-radius: 6px;
    padding: 5px 12px; color: var(--adm-text); cursor: pointer; font-size: 13px;
    font-family: inherit; transition: border-color 0.15s, color 0.15s;
  }
  .eco-month-btn:hover { border-color: var(--primary); color: var(--primary); }
  .eco-month-label { font-size: 14px; font-weight: 500; color: var(--adm-text); min-width: 140px; text-align: center; }

  /* Cards de resumen */
  .eco-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; padding: 1.5rem; }
  .eco-card {
    background: var(--adm-card); border: 1px solid var(--adm-border); border-radius: 10px;
    padding: 1.1rem 1.25rem;
  }
  .eco-card-label { font-size: 11px; color: var(--adm-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
  .eco-card-value { font-size: 22px; font-weight: 600; }
  .eco-card-value.income   { color: #22c55e; }
  .eco-card-value.expense  { color: #ef4444; }
  .eco-card-value.balance  { color: var(--primary); }
  .eco-card-value.neutral  { color: var(--adm-text); }

  /* Barra de progreso de meta de ahorro */
  .eco-goal-bar { height: 6px; background: var(--adm-border); border-radius: 3px; margin-top: 8px; overflow: hidden; }
  .eco-goal-fill { height: 100%; border-radius: 3px; background: var(--primary); transition: width 0.4s; }

  /* Botones de acción genéricos */
  .ebtn {
    border-radius: 7px; font-size: 12px; font-weight: 500; cursor: pointer;
    font-family: inherit; transition: background 0.15s, color 0.15s, border-color 0.15s;
    background: transparent; padding: 7px 14px;
  }
  .ebtn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ebtn-p { border: 1px solid var(--primary); color: var(--primary); }
  .ebtn-p:hover { background: var(--primary); color: #000; }
  .ebtn-d { border: 1px solid #ef4444; color: #ef4444; }
  .ebtn-d:hover { background: #ef4444; color: #fff; }
  .ebtn-g { border: 1px solid var(--adm-border); color: var(--adm-text); }
  .ebtn-g:hover { border-color: var(--primary); color: var(--primary); }

  /* Tabla de transacciones */
  .eco-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .eco-table th {
    text-align: left; padding: 8px 12px; font-size: 11px; font-weight: 500;
    color: var(--adm-muted); text-transform: uppercase; letter-spacing: 0.05em;
    border-bottom: 1px solid var(--adm-border); white-space: nowrap;
  }
  .eco-table td { padding: 9px 12px; border-bottom: 1px solid var(--adm-border); vertical-align: middle; }
  .eco-table tr:last-child td { border-bottom: none; }
  .eco-table tr:hover td { background: var(--adm-hdr); }

  /* Badge de categoría con color */
  .cat-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 500;
    white-space: nowrap;
  }

  /* Formulario de transacción */
  .eco-form { background: var(--adm-card); border: 1px solid var(--adm-border); border-radius: 10px; padding: 1.25rem; margin-bottom: 1rem; }
  .eco-form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem; }
  .eco-input {
    background: var(--adm-input); border: 1px solid var(--adm-border); border-radius: 6px;
    padding: 7px 10px; font-size: 13px; color: var(--adm-text); font-family: inherit;
    width: 100%; box-sizing: border-box; outline: none;
  }
  .eco-input:focus { border-color: var(--primary); }
  .eco-label { font-size: 11px; color: var(--adm-muted); margin-bottom: 4px; display: block; }

  /* Grid de categorías */
  .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
  .cat-card {
    background: var(--adm-card); border: 1px solid var(--adm-border); border-radius: 10px;
    padding: 1rem; display: flex; flex-direction: column; gap: 6px;
  }
  .cat-card-name { font-size: 13px; font-weight: 500; }
  .cat-card-meta { font-size: 11px; color: var(--adm-muted); }

  /* Gráfica donut Chart.js */
  .eco-chart-wrap { width: 200px; height: 200px; margin: 0 auto; }

  /* Filtro de transacciones */
  .eco-filters { display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0 1.5rem 1rem; }

  /* Responsive: en móvil la grid de cards pasa a 2 columnas */
  @media (max-width: 640px) {
    .eco-cards { grid-template-columns: 1fr 1fr; }
    .eco-form-grid { grid-template-columns: 1fr 1fr; }
    .eco-month-bar { padding: 1rem; }
    .eco-nav-btn { padding: 12px 14px; font-size: 12px; }
  }
  @media (max-width: 400px) {
    .eco-cards { grid-template-columns: 1fr; }
  }
`;

/* ── Formulario de transacción (reutilizado en dashboard y transacciones) ── */
function TransactionForm({
  categories,
  initial,
  onSave,
  onCancel,
}: {
  categories: Category[];
  initial?: Partial<Transaction>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    id:          initial?.id          ?? undefined,
    date:        initial?.date        ?? today,
    amount:      initial?.amount      ?? '',
    type:        initial?.type        ?? 'expense',
    category_id: initial?.category_id ?? '',
    description: initial?.description ?? '',
    owner:       initial?.owner       ?? 'me',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function set(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.date || !form.amount) { setErr('Fecha e importe son obligatorios'); return; }
    setSaving(true); setErr('');
    const res = await fetch('/api/economia/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        amount:      parseFloat(String(form.amount)),
        category_id: form.category_id ? Number(form.category_id) : null,
      }),
    }).then(r => r.json()).catch(() => ({ ok: false }));
    setSaving(false);
    if (res.ok) onSave();
    else setErr('Error al guardar');
  }

  /* Categorías filtradas según tipo de transacción */
  const filteredCats = categories.filter(c => c.type === form.type || c.type === 'both');

  return (
    <div className="eco-form">
      <div className="eco-form-grid">
        <div>
          <label className="eco-label">Fecha</label>
          <input className="eco-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div>
          <label className="eco-label">Importe (€)</label>
          <input className="eco-input" type="number" min="0" step="0.01" placeholder="0.00"
            value={form.amount} onChange={e => set('amount', e.target.value)} />
        </div>
        <div>
          <label className="eco-label">Tipo</label>
          <select className="eco-input" value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
        </div>
        <div>
          <label className="eco-label">Categoría</label>
          <select className="eco-input" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
            <option value="">Sin categoría</option>
            {filteredCats.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="eco-label">Descripción</label>
          <input className="eco-input" type="text" placeholder="Concepto..." maxLength={120}
            value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div>
          <label className="eco-label">Quién</label>
          <select className="eco-input" value={form.owner} onChange={e => set('owner', e.target.value)}>
            <option value="me">Yo</option>
            <option value="partner">Pareja</option>
            <option value="shared">Ambos</option>
          </select>
        </div>
      </div>
      {err && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="ebtn ebtn-p" onClick={save} disabled={saving}>
          {saving ? 'Guardando...' : (form.id ? 'Actualizar' : 'Añadir')}
        </button>
        <button className="ebtn ebtn-g" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

/* ── Formulario de categoría ───────────────────────────────── */
function CategoryForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Category>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    id:           initial?.id           ?? undefined,
    name:         initial?.name         ?? '',
    color:        initial?.color        ?? '#6366f1',
    icon:         initial?.icon         ?? '💰',
    budget_limit: initial?.budget_limit ?? '',
    type:         initial?.type         ?? 'expense',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  function set(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.name) { setErr('El nombre es obligatorio'); return; }
    setSaving(true); setErr('');
    const res = await fetch('/api/economia/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        budget_limit: form.budget_limit ? parseFloat(String(form.budget_limit)) : null,
      }),
    }).then(r => r.json()).catch(() => ({ ok: false }));
    setSaving(false);
    if (res.ok) onSave();
    else setErr('Error al guardar');
  }

  return (
    <div className="eco-form">
      <div className="eco-form-grid">
        <div>
          <label className="eco-label">Nombre</label>
          <input className="eco-input" type="text" placeholder="Nombre..." maxLength={40}
            value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label className="eco-label">Color</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
              style={{ width: 36, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
            <input className="eco-input" type="text" value={form.color} style={{ flex: 1 }}
              onChange={e => set('color', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="eco-label">Emoji / Icono</label>
          <input className="eco-input" type="text" maxLength={4} value={form.icon}
            onChange={e => set('icon', e.target.value)} />
        </div>
        <div>
          <label className="eco-label">Tipo</label>
          <select className="eco-input" value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
            <option value="both">Ambos</option>
          </select>
        </div>
        <div>
          <label className="eco-label">Presupuesto mensual (€, opcional)</label>
          <input className="eco-input" type="number" min="0" step="0.01" placeholder="Sin límite"
            value={form.budget_limit} onChange={e => set('budget_limit', e.target.value)} />
        </div>
      </div>
      {err && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="ebtn ebtn-p" onClick={save} disabled={saving}>
          {saving ? 'Guardando...' : (form.id ? 'Actualizar' : 'Crear')}
        </button>
        <button className="ebtn ebtn-g" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

/* ── Gráfica donut de gastos por categoría (Chart.js vía CDN) ─ */
function DonutChart({ data }: { data: MonthStats['by_category'] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<unknown>(null);

  useEffect(() => {
    if (!data.length) return;
    const w = window as unknown as { Chart?: new (...a: unknown[]) => unknown & { destroy(): void } };

    function render() {
      if (!canvasRef.current || !w.Chart) return;
      /* Destruye la instancia anterior para evitar conflictos al re-renderizar */
      if (chartRef.current) (chartRef.current as { destroy(): void }).destroy();
      chartRef.current = new w.Chart(canvasRef.current, {
        type: 'doughnut',
        data: {
          labels:   data.map(d => d.name),
          datasets: [{
            data:            data.map(d => d.total),
            backgroundColor: data.map(d => d.color),
            borderWidth:     0,
            hoverOffset:     4,
          }],
        },
        options: {
          plugins: { legend: { display: false }, tooltip: {
            callbacks: {
              /* Formatea el tooltip con símbolo € */
              label: (ctx: { raw: number }) => ` ${ctx.raw.toFixed(2)} €`,
            },
          }},
          cutout: '65%',
        },
      });
    }

    /* Carga Chart.js desde CDN si no está disponible globalmente */
    if (w.Chart) { render(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    s.onload = render;
    document.head.appendChild(s);

    return () => { if (chartRef.current) (chartRef.current as { destroy(): void }).destroy(); };
  }, [data]);

  return <canvas ref={canvasRef} style={{ maxWidth: 200, maxHeight: 200 }} />;
}

/* ── Vista Dashboard ───────────────────────────────────────── */
function DashboardView({
  stats, year, month, categories, onRefresh,
}: {
  stats: MonthStats | null; year: number; month: number;
  categories: Category[]; onRefresh: () => void;
}) {
  const [showForm, setShowForm]   = useState(false);
  const [goalEdit, setGoalEdit]   = useState(false);
  const [goalVal,  setGoalVal]    = useState('');
  const [savingGoal, setSavingGoal] = useState(false);
  const [lastTx, setLastTx]       = useState<Transaction[]>([]);

  /* Carga las últimas 8 transacciones del mes para el resumen rápido */
  useEffect(() => {
    fetch(`/api/economia/transactions?year=${year}&month=${month}`)
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Transaction[] }) => {
        if (res.ok) setLastTx((res.data ?? []).slice(0, 8));
      })
      .catch(() => {});
  }, [year, month]);

  async function saveGoal() {
    if (!goalVal) { setGoalEdit(false); return; }
    setSavingGoal(true);
    await fetch('/api/economia/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, month, savings_goal: parseFloat(goalVal) }),
    });
    setSavingGoal(false); setGoalEdit(false); onRefresh();
  }

  const income   = stats?.income   ?? 0;
  const expenses = stats?.expenses ?? 0;
  const balance  = stats?.balance  ?? 0;
  const goal     = stats?.savings_goal ?? 0;
  const goalPct  = goal > 0 ? Math.min((balance / goal) * 100, 100) : 0;

  return (
    <div>
      {/* Cards de resumen */}
      <div className="eco-cards">
        <div className="eco-card">
          <div className="eco-card-label">Ingresos</div>
          <div className="eco-card-value income">{fmt(income)}</div>
        </div>
        <div className="eco-card">
          <div className="eco-card-label">Gastos</div>
          <div className="eco-card-value expense">{fmt(expenses)}</div>
        </div>
        <div className="eco-card">
          <div className="eco-card-label">Balance</div>
          <div className={`eco-card-value ${balance >= 0 ? 'income' : 'expense'}`}>{fmt(balance)}</div>
        </div>
        <div className="eco-card">
          <div className="eco-card-label">
            Meta de ahorro&nbsp;
            <button
              onClick={() => { setGoalEdit(true); setGoalVal(String(goal || '')); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 11, padding: 0 }}
            >✏️</button>
          </div>
          {goalEdit ? (
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <input className="eco-input" type="number" min="0" step="10" value={goalVal}
                onChange={e => setGoalVal(e.target.value)} style={{ width: 90 }} autoFocus />
              <button className="ebtn ebtn-p" style={{ padding: '4px 10px' }} onClick={saveGoal} disabled={savingGoal}>✓</button>
              <button className="ebtn ebtn-g" style={{ padding: '4px 8px' }} onClick={() => setGoalEdit(false)}>✕</button>
            </div>
          ) : (
            <div className="eco-card-value neutral">{goal > 0 ? fmt(goal) : '—'}</div>
          )}
          {goal > 0 && (
            <div className="eco-goal-bar">
              <div className="eco-goal-fill" style={{ width: `${goalPct}%`, background: goalPct >= 100 ? '#22c55e' : 'var(--primary)' }} />
            </div>
          )}
          {goal > 0 && (
            <div style={{ fontSize: 10, color: 'var(--adm-muted)', marginTop: 4 }}>
              {goalPct.toFixed(0)}% alcanzado
            </div>
          )}
        </div>
      </div>

      {/* Formulario rápido + gráfica */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', padding: '0 1.5rem 1.5rem' }}>
        <div>
          {showForm ? (
            <TransactionForm
              categories={categories}
              onSave={() => { setShowForm(false); onRefresh(); setLastTx([]); }}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <button className="ebtn ebtn-p" style={{ marginBottom: '1rem' }}
              onClick={() => setShowForm(true)}>
              + Nueva transacción
            </button>
          )}

          {/* Últimas transacciones del mes */}
          {lastTx.length > 0 && (
            <div style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--adm-border)', fontSize: 12, color: 'var(--adm-muted)', fontWeight: 500 }}>
                Últimas transacciones
              </div>
              <table className="eco-table">
                <tbody>
                  {lastTx.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: 'var(--adm-muted)', fontSize: 11, whiteSpace: 'nowrap' }}>{t.date}</td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.description || '—'}
                      </td>
                      <td>
                        {t.category_name && (
                          <span className="cat-badge" style={{ background: (t.category_color ?? '#888') + '22', color: t.category_color ?? '#888' }}>
                            {t.category_icon} {t.category_name}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap',
                        color: t.type === 'income' ? '#22c55e' : '#ef4444' }}>
                        {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Gráfica donut de gastos por categoría */}
        {(stats?.by_category ?? []).length > 0 && (
          <div style={{ minWidth: 220 }}>
            <div style={{ fontSize: 11, color: 'var(--adm-muted)', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Gastos por categoría
            </div>
            <DonutChart data={stats!.by_category} />
            {/* Leyenda de la gráfica */}
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {stats!.by_category.slice(0, 6).map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--adm-text)' }}>{c.name}</span>
                  <span style={{ color: 'var(--adm-muted)' }}>{fmt(c.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Vista Transacciones ───────────────────────────────────── */
function TransactionsView({
  year, month, categories, onRefresh,
}: {
  year: number; month: number; categories: Category[]; onRefresh: () => void;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editing,      setEditing]      = useState<Transaction | null>(null);
  const [filterType,   setFilterType]   = useState('');
  const [filterCat,    setFilterCat]    = useState('');
  const [filterOwner,  setFilterOwner]  = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/economia/transactions?year=${year}&month=${month}`)
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Transaction[] }) => {
        if (res.ok) setTransactions(res.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  async function del(id: number) {
    if (!confirm('¿Eliminar esta transacción?')) return;
    await fetch(`/api/economia/transactions?id=${id}`, { method: 'DELETE' });
    load(); onRefresh();
  }

  /* Aplica los filtros activos */
  const filtered = transactions.filter(t =>
    (!filterType  || t.type === filterType) &&
    (!filterCat   || String(t.category_id) === filterCat) &&
    (!filterOwner || t.owner === filterOwner)
  );

  const totalFiltered = filtered.reduce((acc, t) =>
    acc + (t.type === 'income' ? t.amount : -t.amount), 0);

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Filtros */}
      <div className="eco-filters" style={{ padding: 0, marginBottom: '1rem' }}>
        <select className="eco-input" style={{ width: 'auto' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="income">Ingresos</option>
          <option value="expense">Gastos</option>
        </select>
        <select className="eco-input" style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select className="eco-input" style={{ width: 'auto' }} value={filterOwner} onChange={e => setFilterOwner(e.target.value)}>
          <option value="">Todos</option>
          <option value="me">Yo</option>
          <option value="partner">Pareja</option>
          <option value="shared">Ambos</option>
        </select>
        {(filterType || filterCat || filterOwner) && (
          <button className="ebtn ebtn-g" onClick={() => { setFilterType(''); setFilterCat(''); setFilterOwner(''); }}>
            × Limpiar
          </button>
        )}
        <button className="ebtn ebtn-p" style={{ marginLeft: 'auto' }}
          onClick={() => { setShowForm(true); setEditing(null); }}>
          + Nueva transacción
        </button>
      </div>

      {/* Formulario inline */}
      {(showForm || editing) && (
        <TransactionForm
          categories={categories}
          initial={editing ?? undefined}
          onSave={() => { setShowForm(false); setEditing(null); load(); onRefresh(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {loading && <p style={{ color: 'var(--adm-muted)', fontSize: 13 }}>Cargando...</p>}

      {!loading && filtered.length === 0 && (
        <p style={{ color: 'var(--adm-muted)', fontSize: 13 }}>No hay transacciones para este período.</p>
      )}

      {/* Tabla de transacciones */}
      {!loading && filtered.length > 0 && (
        <div style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table className="eco-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Quién</th>
                <th style={{ textAlign: 'right' }}>Importe</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ color: 'var(--adm-muted)', whiteSpace: 'nowrap' }}>{t.date}</td>
                  <td style={{ maxWidth: 220 }}>{t.description || '—'}</td>
                  <td>
                    {t.category_name ? (
                      <span className="cat-badge" style={{ background: (t.category_color ?? '#888') + '22', color: t.category_color ?? '#888' }}>
                        {t.category_icon} {t.category_name}
                      </span>
                    ) : <span style={{ color: 'var(--adm-muted)', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ color: 'var(--adm-muted)', fontSize: 11 }}>{OWNER_LABELS[t.owner] ?? t.owner}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap',
                    color: t.type === 'income' ? '#22c55e' : '#ef4444' }}>
                    {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="ebtn ebtn-g" style={{ padding: '3px 8px', marginRight: 4 }}
                      onClick={() => { setEditing(t); setShowForm(false); }}>✏️</button>
                    <button className="ebtn ebtn-d" style={{ padding: '3px 8px' }}
                      onClick={() => del(t.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Total del período filtrado */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--adm-border)', textAlign: 'right',
            fontSize: 13, fontWeight: 600, color: totalFiltered >= 0 ? '#22c55e' : '#ef4444' }}>
            Resultado: {totalFiltered >= 0 ? '+' : ''}{fmt(totalFiltered)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Vista Categorías ──────────────────────────────────────── */
function CategoriesView({ categories, onRefresh }: { categories: Category[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<Category | null>(null);

  async function del(id: number, name: string) {
    if (!confirm(`¿Eliminar la categoría "${name}"? Las transacciones asociadas quedarán sin categoría.`)) return;
    await fetch(`/api/economia/categories?id=${id}`, { method: 'DELETE' });
    onRefresh();
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button className="ebtn ebtn-p" onClick={() => { setShowForm(true); setEditing(null); }}>
          + Nueva categoría
        </button>
      </div>

      {(showForm || editing) && (
        <CategoryForm
          initial={editing ?? undefined}
          onSave={() => { setShowForm(false); setEditing(null); onRefresh(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      <div className="cat-grid">
        {categories.map(c => (
          <div key={c.id} className="cat-card" style={{ borderLeft: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 22 }}>{c.icon}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="ebtn ebtn-g" style={{ padding: '2px 7px' }}
                  onClick={() => { setEditing(c); setShowForm(false); }}>✏️</button>
                <button className="ebtn ebtn-d" style={{ padding: '2px 7px' }}
                  onClick={() => del(c.id, c.name)}>🗑</button>
              </div>
            </div>
            <div className="cat-card-name">{c.name}</div>
            <div className="cat-card-meta">
              {c.type === 'income' ? 'Ingreso' : c.type === 'expense' ? 'Gasto' : 'Ambos'}
              {c.budget_limit ? ` · ${fmt(c.budget_limit)}/mes` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Página principal ──────────────────────────────────────── */
export default function EconomiaPage() {
  const [view,       setView]       = useState<View>('dashboard');
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats,      setStats]      = useState<MonthStats | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });

  const { year, month } = currentDate;

  /* Carga categorías una sola vez al montar (no dependen del mes) */
  useEffect(() => {
    fetch('/api/economia/categories')
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Category[] }) => {
        if (res.ok) setCategories(res.data ?? []);
      })
      .catch(() => {});
  }, []);

  /* Carga estadísticas del mes seleccionado */
  const loadStats = useCallback(() => {
    setLoading(true);
    fetch(`/api/economia/stats?year=${year}&month=${month}`)
      .then(r => r.json())
      .then((res: { ok: boolean; data?: MonthStats }) => {
        if (res.ok) setStats(res.data ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year, month]);

  useEffect(() => { loadStats(); }, [loadStats]);

  /* Navegación de meses: adelante y atrás */
  function prevMonth() {
    setCurrentDate(({ year, month }) =>
      month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
    );
  }
  function nextMonth() {
    setCurrentDate(({ year, month }) =>
      month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
    );
  }

  return (
    <div className="eco-wrap">
      <style>{ECO_STYLES}</style>

      {/* Barra de navegación de vistas */}
      <nav className="eco-nav">
        {(['dashboard', 'transactions', 'categories'] as View[]).map(v => (
          <button key={v} className={`eco-nav-btn${view === v ? ' active' : ''}`} onClick={() => setView(v)}>
            {v === 'dashboard' ? 'Resumen' : v === 'transactions' ? 'Transacciones' : 'Categorías'}
          </button>
        ))}
      </nav>

      {/* Selector de mes (visible en resumen y transacciones) */}
      {view !== 'categories' && (
        <div className="eco-month-bar">
          <button className="eco-month-btn" onClick={prevMonth}>‹ Anterior</button>
          <span className="eco-month-label">{monthLabel(year, month)}</span>
          <button className="eco-month-btn" onClick={nextMonth}>Siguiente ›</button>
          {loading && <span style={{ fontSize: 12, color: 'var(--adm-muted)', marginLeft: 8 }}>Actualizando...</span>}
        </div>
      )}

      {/* Contenido de la vista activa */}
      {view === 'dashboard' && (
        <DashboardView
          stats={stats} year={year} month={month}
          categories={categories} onRefresh={loadStats}
        />
      )}
      {view === 'transactions' && (
        <TransactionsView
          year={year} month={month}
          categories={categories} onRefresh={loadStats}
        />
      )}
      {view === 'categories' && (
        <CategoriesView categories={categories} onRefresh={() => {
          /* Recarga categorías tras crear/editar/borrar */
          fetch('/api/economia/categories')
            .then(r => r.json())
            .then((res: { ok: boolean; data?: Category[] }) => { if (res.ok) setCategories(res.data ?? []); });
        }} />
      )}
    </div>
  );
}
