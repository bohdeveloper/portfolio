'use client';

import { useEffect, useState, useCallback } from 'react';

/* ── Tipos ─────────────────────────────────────────────────────────── */
interface Profile {
  sex: string; age: number; height_cm: number; activity_factor: number;
}
interface Biometric {
  id: number; date: string; weight_kg: number;
  waist_cm: number | null; hip_cm: number | null; neck_cm: number | null;
  chest_cm: number | null; bicep_cm: number | null; thigh_cm: number | null;
  bmi: number | null; body_fat_pct: number | null; lean_mass_kg: number | null;
  bmr: number | null; tdee: number | null;
}
interface DailyRec {
  id: number; date: string; kcal_exercise: number | null; kcal_intake: number | null;
}
interface Stats {
  today: { kcal_exercise: number | null; kcal_intake: number | null };
  latest: Biometric | null;
  tdee: number;
  week:  { days: number; total_intake: number | null; total_exercise: number | null; avg_intake: number | null; avg_exercise: number | null; balance: number | null };
  month: { days: number; total_intake: number | null; total_exercise: number | null; avg_intake: number | null; avg_exercise: number | null; balance: number | null };
  history:    { date: string; kcal_exercise: number | null; kcal_intake: number | null; balance: number | null }[];
  bioHistory: { date: string; weight_kg: number; body_fat_pct: number | null; bmi: number | null }[];
}

/* ── Helpers ────────────────────────────────────────────────────────── */
const today = () => new Date().toISOString().slice(0, 10);
const n1 = (v: number | null | undefined) => v != null ? v.toFixed(1) : '—';
const n0 = (v: number | null | undefined) => v != null ? Math.round(v).toString() : '—';

function bmiLabel(bmi: number | null) {
  if (!bmi) return '';
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25)   return 'Normal';
  if (bmi < 30)   return 'Sobrepeso';
  return 'Obesidad';
}

function balanceBadge(balance: number | null) {
  if (balance === null) return null;
  const color = balance > 0 ? '#ef4444' : balance < -100 ? '#22c55e' : '#f59e0b';
  const sign  = balance > 0 ? '+' : '';
  return { label: `${sign}${Math.round(balance)} kcal`, color };
}

const ACTIVITY_LABELS: Record<string, string> = {
  '1.2':   'Sedentario (sin ejercicio)',
  '1.375': 'Ligero (1-3 días/sem)',
  '1.55':  'Moderado (3-5 días/sem)',
  '1.725': 'Activo (6-7 días/sem)',
  '1.9':   'Muy activo (2x/día)',
};

/* ── SVG line chart minimalista ─────────────────────────────────────── */
function LineChart({ data, color = '#00e7eb', label }: {
  data: { x: string; y: number | null }[];
  color?: string; label: string;
}) {
  const pts = data.filter(d => d.y !== null) as { x: string; y: number }[];
  if (pts.length < 2) return (
    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--adm-muted)', fontSize: 13 }}>
      Sin datos suficientes para mostrar la gráfica
    </div>
  );

  const W = 540, H = 120, PAD = 12;
  const ys = pts.map(p => p.y);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rangeY = maxY - minY || 1;

  const sx = (i: number) => PAD + (i / (pts.length - 1)) * (W - PAD * 2);
  const sy = (v: number) => H - PAD - ((v - minY) / rangeY) * (H - PAD * 2);

  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(i).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  const area = `${path} L${sx(pts.length - 1).toFixed(1)},${H} L${sx(0).toFixed(1)},${H} Z`;

  const first = pts[0], last = pts[pts.length - 1];
  const diff  = last.y - first.y;
  const diffLabel = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--adm-muted)' }}>{label}</span>
        <span style={{ fontSize: 12, color: diff > 0 ? '#ef4444' : '#22c55e', fontWeight: 500 }}>
          {diffLabel}
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', height: 100 }}>
        <defs>
          <linearGradient id={`grad-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grad-${label.replace(/\s/g, '')})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={sx(pts.length - 1)} cy={sy(last.y)} r="3" fill={color} />
        <text x={sx(pts.length - 1)} y={sy(last.y) - 7} fontSize="10" fill={color} textAnchor="middle">{last.y.toFixed(1)}</text>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--adm-muted)', marginTop: 2 }}>
        <span>{first.x.slice(5)}</span><span>{last.x.slice(5)}</span>
      </div>
    </div>
  );
}

/* ── Bar chart para balance calórico ─────────────────────────────────── */
function BalanceChart({ data }: { data: { date: string; balance: number | null }[] }) {
  const pts = data.filter(d => d.balance !== null) as { date: string; balance: number }[];
  if (pts.length < 2) return (
    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--adm-muted)', fontSize: 13 }}>
      Sin datos suficientes para mostrar el balance
    </div>
  );

  const W = 540, H = 100, PAD = 12;
  const maxAbs = Math.max(...pts.map(p => Math.abs(p.balance)), 1);
  const barW   = Math.max(2, (W - PAD * 2) / pts.length - 2);
  const midY   = H / 2;

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--adm-muted)', marginBottom: 6 }}>Balance calórico diario</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', height: 90 }}>
        <line x1={PAD} y1={midY} x2={W - PAD} y2={midY} stroke="var(--adm-border)" strokeWidth="1" />
        {pts.map((p, i) => {
          const x   = PAD + (i / pts.length) * (W - PAD * 2);
          const pct = Math.abs(p.balance) / maxAbs;
          const bh  = pct * (midY - PAD);
          const y   = p.balance > 0 ? midY : midY - bh;
          const col = p.balance > 0 ? '#ef4444' : '#22c55e';
          return <rect key={p.date} x={x} y={y} width={barW} height={bh} fill={col} opacity="0.75" rx="1" />;
        })}
      </svg>
      <div style={{ display: 'flex', gap: 16, fontSize: 11, marginTop: 4 }}>
        <span style={{ color: '#22c55e' }}>▮ Déficit</span>
        <span style={{ color: '#ef4444' }}>▮ Superávit</span>
      </div>
    </div>
  );
}

/* ── CSS ────────────────────────────────────────────────────────────── */
const STYLES = `
  .bio-wrap { min-height:calc(100vh - 88px); background:var(--adm-bg); font-family:system-ui,sans-serif; color:var(--adm-text); }
  .bio-topbar { display:flex; align-items:center; gap:12px; padding:1rem 1.5rem; border-bottom:1px solid var(--adm-border); background:var(--adm-hdr); }
  .bio-title { font-size:17px; font-weight:600; color:var(--primary); margin-right:auto; }
  .bio-tabs { display:flex; border-bottom:1px solid var(--adm-border); background:var(--adm-card); }
  .bio-tab { padding:10px 20px; font-size:13px; font-weight:500; cursor:pointer; background:none; border:none; border-bottom:2px solid transparent; color:var(--adm-muted); font-family:inherit; transition:color 0.15s; }
  .bio-tab.active { color:var(--primary); border-bottom-color:var(--primary); }
  .bio-body { padding:1.5rem; max-width:860px; margin:0 auto; }
  .bio-section { margin-bottom:2rem; }
  .bio-section-title { font-size:14px; font-weight:600; color:var(--adm-label); text-transform:uppercase; letter-spacing:.05em; margin-bottom:1rem; }
  .bio-card { background:var(--adm-card); border:1px solid var(--adm-border); border-radius:10px; padding:1.25rem; margin-bottom:1rem; }
  .bio-form-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:.75rem; }
  .bio-field { display:flex; flex-direction:column; gap:4px; }
  .bio-label { font-size:11px; color:var(--adm-label); font-weight:500; text-transform:uppercase; letter-spacing:.04em; }
  .bio-input { background:var(--adm-input); border:1px solid var(--adm-border); border-radius:6px; padding:7px 10px; color:var(--adm-text); font-size:14px; font-family:inherit; outline:none; transition:border-color .15s; }
  .bio-input:focus { border-color:var(--primary); }
  .bio-select { background:var(--adm-input); border:1px solid var(--adm-border); border-radius:6px; padding:7px 10px; color:var(--adm-text); font-size:14px; font-family:inherit; outline:none; cursor:pointer; }
  .bio-btn { background:var(--primary); color:#000; border:none; border-radius:6px; padding:8px 18px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:opacity .15s; }
  .bio-btn:hover { opacity:.85; }
  .bio-btn:disabled { opacity:.4; cursor:default; }
  .bio-btn-ghost { background:none; border:1px solid var(--adm-border); color:var(--adm-muted); border-radius:6px; padding:6px 14px; font-size:12px; cursor:pointer; font-family:inherit; }
  .bio-btn-ghost:hover { border-color:var(--primary); color:var(--primary); }
  .bio-kpis { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:.75rem; margin-bottom:1rem; }
  .bio-kpi { background:var(--adm-card); border:1px solid var(--adm-border); border-radius:8px; padding:1rem; text-align:center; }
  .bio-kpi-val { font-size:22px; font-weight:700; color:var(--primary); }
  .bio-kpi-lbl { font-size:11px; color:var(--adm-muted); margin-top:2px; }
  .bio-kpi-sub { font-size:11px; color:var(--adm-label); margin-top:1px; }
  .bio-table { width:100%; border-collapse:collapse; font-size:13px; }
  .bio-table th { text-align:left; padding:6px 10px; font-size:11px; font-weight:600; color:var(--adm-label); text-transform:uppercase; letter-spacing:.04em; border-bottom:1px solid var(--adm-border); }
  .bio-table td { padding:7px 10px; border-bottom:1px solid var(--adm-border); }
  .bio-table tr:last-child td { border-bottom:none; }
  .bio-table tr:hover td { background:var(--adm-input); }
  .bio-daily-inputs { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .bio-daily-box { background:var(--adm-card); border:1px solid var(--adm-border); border-radius:10px; padding:1.25rem; }
  .bio-daily-box-title { font-size:13px; font-weight:600; margin-bottom:.75rem; }
  .bio-daily-row { display:flex; gap:8px; align-items:center; }
  .bio-chart-wrap { background:var(--adm-card); border:1px solid var(--adm-border); border-radius:10px; padding:1.25rem; margin-bottom:1rem; }
  .bio-saving-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:var(--primary); animation:blink .8s infinite; margin-right:6px; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
  .bio-badge { display:inline-block; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600; }
  @media(max-width:600px) {
    .bio-form-grid { grid-template-columns:1fr 1fr; }
    .bio-daily-inputs { grid-template-columns:1fr; }
    .bio-kpis { grid-template-columns:repeat(2,1fr); }
  }
  @media(max-width:380px) {
    .bio-form-grid { grid-template-columns:1fr; }
    .bio-kpis { grid-template-columns:1fr 1fr; }
  }
`;

/* ── Subvista: Perfil ────────────────────────────────────────────────── */
function VistaProfile({ profile, onSaved }: { profile: Profile | null; onSaved: () => void }) {
  const [sex, setSex]    = useState(profile?.sex ?? 'male');
  const [age, setAge]    = useState(String(profile?.age ?? ''));
  const [height, setHeight] = useState(String(profile?.height_cm ?? ''));
  const [factor, setFactor] = useState(String(profile?.activity_factor ?? '1.375'));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]    = useState('');

  async function save() {
    setSaving(true); setMsg('');
    const r = await fetch('/api/bioptima/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sex, age: Number(age), height_cm: Number(height), activity_factor: Number(factor) }),
    });
    const j = await r.json() as { ok: boolean; error?: string };
    setSaving(false);
    setMsg(j.ok ? '¡Guardado!' : (j.error ?? 'Error'));
    if (j.ok) onSaved();
  }

  return (
    <div className="bio-body">
      <div className="bio-section">
        <div className="bio-section-title">Datos de perfil</div>
        <div className="bio-card">
          <div className="bio-form-grid">
            <div className="bio-field">
              <label className="bio-label">Sexo</label>
              <select className="bio-select" value={sex} onChange={e => setSex(e.target.value)}>
                <option value="male">Hombre</option>
                <option value="female">Mujer</option>
              </select>
            </div>
            <div className="bio-field">
              <label className="bio-label">Edad (años)</label>
              <input className="bio-input" type="number" min="10" max="120" value={age}
                onChange={e => setAge(e.target.value)} placeholder="30" />
            </div>
            <div className="bio-field">
              <label className="bio-label">Talla (cm)</label>
              <input className="bio-input" type="number" min="100" max="250" step="0.1" value={height}
                onChange={e => setHeight(e.target.value)} placeholder="175" />
            </div>
            <div className="bio-field" style={{ gridColumn: 'span 2' }}>
              <label className="bio-label">Nivel de actividad</label>
              <select className="bio-select" value={factor} onChange={e => setFactor(e.target.value)}>
                {Object.entries(ACTIVITY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="bio-btn" onClick={save} disabled={saving || !age || !height}>
              {saving ? <><span className="bio-saving-dot" />Guardando…</> : 'Guardar perfil'}
            </button>
            {msg && <span style={{ fontSize: 13, color: msg === '¡Guardado!' ? '#22c55e' : '#ef4444' }}>{msg}</span>}
          </div>
        </div>
      </div>

      {profile && (
        <div className="bio-section">
          <div className="bio-section-title">Información calculada</div>
          <div className="bio-card" style={{ fontSize: 13, color: 'var(--adm-muted)', lineHeight: 1.8 }}>
            <p>Los cálculos de <strong style={{ color: 'var(--adm-text)' }}>TMB, TDEE, IMC y % MG</strong> se generan automáticamente al guardar cada registro de biometría.</p>
            <p>Factor de actividad actual: <strong style={{ color: 'var(--primary)' }}>{ACTIVITY_LABELS[profile.activity_factor] ?? profile.activity_factor}</strong></p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Subvista: Biometría ─────────────────────────────────────────────── */
function VistaBiometria({ records, onSaved }: { records: Biometric[]; onSaved: () => void }) {
  const [date, setDate]       = useState(today());
  const [weight, setWeight]   = useState('');
  const [waist, setWaist]     = useState('');
  const [hip, setHip]         = useState('');
  const [neck, setNeck]       = useState('');
  const [chest, setChest]     = useState('');
  const [bicep, setBicep]     = useState('');
  const [thigh, setThigh]     = useState('');
  const [saving, setSaving]   = useState(false);
  const [last, setLast]       = useState<{ bmi: number | null; body_fat_pct: number | null; lean_mass_kg: number | null; bmr: number | null; tdee: number | null } | null>(null);
  const [msg, setMsg]         = useState('');

  async function save() {
    setSaving(true); setMsg('');
    const body: Record<string, unknown> = { date, weight_kg: Number(weight) };
    if (waist)  body.waist_cm  = Number(waist);
    if (hip)    body.hip_cm    = Number(hip);
    if (neck)   body.neck_cm   = Number(neck);
    if (chest)  body.chest_cm  = Number(chest);
    if (bicep)  body.bicep_cm  = Number(bicep);
    if (thigh)  body.thigh_cm  = Number(thigh);

    const r = await fetch('/api/bioptima/biometrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await r.json() as { ok: boolean; calc?: typeof last; error?: string };
    setSaving(false);
    if (j.ok) { setLast(j.calc ?? null); setMsg('¡Guardado!'); onSaved(); }
    else setMsg(j.error ?? 'Error al guardar');
  }

  async function del(id: number) {
    if (!confirm('¿Eliminar este registro?')) return;
    await fetch(`/api/bioptima/biometrics?id=${id}`, { method: 'DELETE' });
    onSaved();
  }

  return (
    <div className="bio-body">
      {last && (
        <div className="bio-kpis" style={{ marginBottom: '1.5rem' }}>
          <div className="bio-kpi"><div className="bio-kpi-val">{n1(last.bmi)}</div><div className="bio-kpi-lbl">IMC</div><div className="bio-kpi-sub">{bmiLabel(last.bmi)}</div></div>
          <div className="bio-kpi"><div className="bio-kpi-val">{n1(last.body_fat_pct)}%</div><div className="bio-kpi-lbl">Masa Grasa</div></div>
          <div className="bio-kpi"><div className="bio-kpi-val">{n1(last.lean_mass_kg)} kg</div><div className="bio-kpi-lbl">Masa Muscular</div></div>
          <div className="bio-kpi"><div className="bio-kpi-val">{n0(last.bmr)}</div><div className="bio-kpi-lbl">TMB (kcal)</div></div>
          <div className="bio-kpi"><div className="bio-kpi-val">{n0(last.tdee)}</div><div className="bio-kpi-lbl">TDEE (kcal)</div></div>
        </div>
      )}

      <div className="bio-section">
        <div className="bio-section-title">Nuevo registro</div>
        <div className="bio-card">
          <div className="bio-form-grid">
            <div className="bio-field">
              <label className="bio-label">Fecha</label>
              <input className="bio-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="bio-field">
              <label className="bio-label">Peso (kg) *</label>
              <input className="bio-input" type="number" step="0.1" min="20" max="300" value={weight}
                onChange={e => setWeight(e.target.value)} placeholder="75.5" />
            </div>
            <div className="bio-field">
              <label className="bio-label">Cintura (cm)</label>
              <input className="bio-input" type="number" step="0.1" value={waist} onChange={e => setWaist(e.target.value)} placeholder="82" />
            </div>
            <div className="bio-field">
              <label className="bio-label">Cadera (cm)</label>
              <input className="bio-input" type="number" step="0.1" value={hip} onChange={e => setHip(e.target.value)} placeholder="98" />
            </div>
            <div className="bio-field">
              <label className="bio-label">Cuello (cm)</label>
              <input className="bio-input" type="number" step="0.1" value={neck} onChange={e => setNeck(e.target.value)} placeholder="38" />
            </div>
            <div className="bio-field">
              <label className="bio-label">Tórax (cm)</label>
              <input className="bio-input" type="number" step="0.1" value={chest} onChange={e => setChest(e.target.value)} placeholder="100" />
            </div>
            <div className="bio-field">
              <label className="bio-label">Bícep (cm)</label>
              <input className="bio-input" type="number" step="0.1" value={bicep} onChange={e => setBicep(e.target.value)} placeholder="35" />
            </div>
            <div className="bio-field">
              <label className="bio-label">Muslo (cm)</label>
              <input className="bio-input" type="number" step="0.1" value={thigh} onChange={e => setThigh(e.target.value)} placeholder="55" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="bio-btn" onClick={save} disabled={saving || !weight}>
              {saving ? <><span className="bio-saving-dot" />Guardando…</> : 'Guardar registro'}
            </button>
            {msg && <span style={{ fontSize: 13, color: msg === '¡Guardado!' ? '#22c55e' : '#ef4444' }}>{msg}</span>}
          </div>
        </div>
      </div>

      {records.length > 0 && (
        <div className="bio-section">
          <div className="bio-section-title">Historial</div>
          <div className="bio-card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="bio-table">
              <thead>
                <tr>
                  <th>Fecha</th><th>Peso</th><th>IMC</th><th>% MG</th><th>MM</th><th>TMB</th><th>TDEE</th><th></th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.weight_kg} kg</td>
                    <td>{n1(r.bmi)} <span style={{ fontSize: 10, color: 'var(--adm-muted)' }}>{bmiLabel(r.bmi)}</span></td>
                    <td>{r.body_fat_pct != null ? `${n1(r.body_fat_pct)}%` : '—'}</td>
                    <td>{r.lean_mass_kg != null ? `${n1(r.lean_mass_kg)} kg` : '—'}</td>
                    <td>{n0(r.bmr)}</td>
                    <td>{n0(r.tdee)}</td>
                    <td>
                      <button className="bio-btn-ghost" onClick={() => del(r.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Subvista: Diario ────────────────────────────────────────────────── */
function VistaDiario({ daily, tdee, onSaved }: { daily: DailyRec[]; tdee: number; onSaved: () => void }) {
  const todayStr = today();
  const todayRec = daily.find(d => d.date === todayStr);

  const [exVal, setExVal]   = useState(todayRec?.kcal_exercise != null ? String(todayRec.kcal_exercise) : '');
  const [inVal, setInVal]   = useState(todayRec?.kcal_intake   != null ? String(todayRec.kcal_intake)   : '');
  const [savEx, setSavEx]   = useState(false);
  const [savIn, setSavIn]   = useState(false);
  const [msgEx, setMsgEx]   = useState('');
  const [msgIn, setMsgIn]   = useState('');

  async function saveField(field: 'exercise' | 'intake', value: string, setSaving: (v: boolean) => void, setMsg: (v: string) => void) {
    setSaving(true); setMsg('');
    const r = await fetch('/api/bioptima/daily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: todayStr, field, value: Number(value) }),
    });
    const j = await r.json() as { ok: boolean; error?: string };
    setSaving(false);
    setMsg(j.ok ? '¡Guardado!' : (j.error ?? 'Error'));
    if (j.ok) onSaved();
  }

  // Calcular balance de hoy con los valores actuales del estado
  const exNum   = exVal ? Number(exVal) : (todayRec?.kcal_exercise ?? null);
  const inNum   = inVal ? Number(inVal) : (todayRec?.kcal_intake   ?? null);
  const todayBal = (inNum !== null && tdee > 0) ? Math.round(inNum - (tdee + (exNum ?? 0))) : null;
  const badge    = balanceBadge(todayBal);

  return (
    <div className="bio-body">
      {/* Balance de hoy */}
      <div className="bio-kpis" style={{ marginBottom: '1.5rem' }}>
        <div className="bio-kpi">
          <div className="bio-kpi-val">{exNum != null ? n0(exNum) : '—'}</div>
          <div className="bio-kpi-lbl">Quemadas hoy (kcal)</div>
        </div>
        <div className="bio-kpi">
          <div className="bio-kpi-val">{inNum != null ? n0(inNum) : '—'}</div>
          <div className="bio-kpi-lbl">Ingeridas hoy (kcal)</div>
        </div>
        <div className="bio-kpi">
          <div className="bio-kpi-val" style={{ color: tdee > 0 ? 'var(--primary)' : 'var(--adm-muted)' }}>{n0(tdee || null)}</div>
          <div className="bio-kpi-lbl">TDEE (kcal/día)</div>
        </div>
        <div className="bio-kpi">
          {badge
            ? <><div className="bio-kpi-val" style={{ color: badge.color }}>{badge.label}</div><div className="bio-kpi-lbl">Balance hoy</div></>
            : <><div className="bio-kpi-val" style={{ color: 'var(--adm-muted)' }}>—</div><div className="bio-kpi-lbl">Balance hoy</div></>
          }
        </div>
      </div>

      {/* Inputs de calorías — 2 cajas independientes */}
      <div className="bio-section">
        <div className="bio-section-title">Registro del día — {todayStr}</div>
        <div className="bio-daily-inputs">
          <div className="bio-daily-box">
            <div className="bio-daily-box-title" style={{ color: '#22c55e' }}>🔥 Calorías quemadas</div>
            <div style={{ fontSize: 12, color: 'var(--adm-muted)', marginBottom: '.75rem' }}>Ejercicio del día</div>
            <div className="bio-daily-row">
              <input className="bio-input" style={{ flex: 1 }} type="number" min="0" max="5000" step="10"
                value={exVal} onChange={e => setExVal(e.target.value)}
                placeholder="ej. 350" />
              <button className="bio-btn" style={{ whiteSpace: 'nowrap' }}
                disabled={savEx || !exVal}
                onClick={() => saveField('exercise', exVal, setSavEx, setMsgEx)}>
                {savEx ? <><span className="bio-saving-dot" />…</> : 'Guardar'}
              </button>
            </div>
            {msgEx && <div style={{ marginTop: 6, fontSize: 12, color: msgEx === '¡Guardado!' ? '#22c55e' : '#ef4444' }}>{msgEx}</div>}
          </div>

          <div className="bio-daily-box">
            <div className="bio-daily-box-title" style={{ color: '#f59e0b' }}>🍽 Calorías ingeridas</div>
            <div style={{ fontSize: 12, color: 'var(--adm-muted)', marginBottom: '.75rem' }}>Total del día</div>
            <div className="bio-daily-row">
              <input className="bio-input" style={{ flex: 1 }} type="number" min="0" max="10000" step="50"
                value={inVal} onChange={e => setInVal(e.target.value)}
                placeholder="ej. 2200" />
              <button className="bio-btn" style={{ whiteSpace: 'nowrap' }}
                disabled={savIn || !inVal}
                onClick={() => saveField('intake', inVal, setSavIn, setMsgIn)}>
                {savIn ? <><span className="bio-saving-dot" />…</> : 'Guardar'}
              </button>
            </div>
            {msgIn && <div style={{ marginTop: 6, fontSize: 12, color: msgIn === '¡Guardado!' ? '#22c55e' : '#ef4444' }}>{msgIn}</div>}
          </div>
        </div>
      </div>

      {/* Historial de los últimos 30 días */}
      {daily.length > 0 && (
        <div className="bio-section">
          <div className="bio-section-title">Últimos registros</div>
          <div className="bio-card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="bio-table">
              <thead>
                <tr><th>Fecha</th><th>Quemadas (kcal)</th><th>Ingeridas (kcal)</th><th>Balance</th></tr>
              </thead>
              <tbody>
                {daily.map(d => {
                  const bal  = (d.kcal_intake !== null && tdee > 0)
                    ? Math.round(d.kcal_intake - (tdee + (d.kcal_exercise ?? 0))) : null;
                  const bg   = balanceBadge(bal);
                  return (
                    <tr key={d.id}>
                      <td style={{ color: d.date === todayStr ? 'var(--primary)' : undefined, fontWeight: d.date === todayStr ? 600 : undefined }}>{d.date}</td>
                      <td>{d.kcal_exercise != null ? n0(d.kcal_exercise) : '—'}</td>
                      <td>{d.kcal_intake   != null ? n0(d.kcal_intake)   : '—'}</td>
                      <td>{bg ? <span className="bio-badge" style={{ background: `${bg.color}22`, color: bg.color }}>{bg.label}</span> : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Subvista: Evolución ─────────────────────────────────────────────── */
function VistaEvolucion({ stats }: { stats: Stats | null }) {
  if (!stats) return <div className="bio-body" style={{ color: 'var(--adm-muted)', fontSize: 14 }}>Cargando…</div>;

  const { week, month, history, bioHistory } = stats;

  const weekBadge  = balanceBadge(week.balance);
  const monthBadge = balanceBadge(month.balance);

  return (
    <div className="bio-body">
      {/* KPIs resumen */}
      <div className="bio-kpis" style={{ marginBottom: '1.5rem' }}>
        <div className="bio-kpi">
          <div className="bio-kpi-val">{week.days}</div>
          <div className="bio-kpi-lbl">Días registrados (sem)</div>
        </div>
        <div className="bio-kpi">
          {weekBadge
            ? <><div className="bio-kpi-val" style={{ color: weekBadge.color }}>{weekBadge.label}</div><div className="bio-kpi-lbl">Balance semanal</div></>
            : <><div className="bio-kpi-val" style={{ color: 'var(--adm-muted)' }}>—</div><div className="bio-kpi-lbl">Balance semanal</div></>
          }
        </div>
        <div className="bio-kpi">
          <div className="bio-kpi-val">{n0(week.avg_intake)}</div>
          <div className="bio-kpi-lbl">Media ingesta sem (kcal)</div>
        </div>
        <div className="bio-kpi">
          {monthBadge
            ? <><div className="bio-kpi-val" style={{ color: monthBadge.color }}>{monthBadge.label}</div><div className="bio-kpi-lbl">Balance mensual</div></>
            : <><div className="bio-kpi-val" style={{ color: 'var(--adm-muted)' }}>—</div><div className="bio-kpi-lbl">Balance mensual</div></>
          }
        </div>
        <div className="bio-kpi">
          <div className="bio-kpi-val">{n0(month.avg_intake)}</div>
          <div className="bio-kpi-lbl">Media ingesta mes (kcal)</div>
        </div>
        <div className="bio-kpi">
          <div className="bio-kpi-val">{month.days}</div>
          <div className="bio-kpi-lbl">Días registrados (mes)</div>
        </div>
      </div>

      {/* Gráfica peso */}
      <div className="bio-chart-wrap">
        <LineChart
          data={bioHistory.map(r => ({ x: r.date, y: r.weight_kg }))}
          color="#00e7eb"
          label="Evolución de peso (kg)"
        />
      </div>

      {/* Gráfica % MG */}
      <div className="bio-chart-wrap">
        <LineChart
          data={bioHistory.map(r => ({ x: r.date, y: r.body_fat_pct }))}
          color="#f59e0b"
          label="Evolución % Masa Grasa"
        />
      </div>

      {/* Gráfica balance calórico */}
      <div className="bio-chart-wrap">
        <BalanceChart data={history.map(r => ({ date: r.date, balance: r.balance }))} />
      </div>
    </div>
  );
}

/* ── Página principal ────────────────────────────────────────────────── */
type Tab = 'perfil' | 'biometria' | 'diario' | 'evolucion';

export default function BioptimaPage() {
  const [tab, setTab]             = useState<Tab>('diario');
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [biometrics, setBiometrics] = useState<Biometric[]>([]);
  const [daily, setDaily]         = useState<DailyRec[]>([]);
  const [stats, setStats]         = useState<Stats | null>(null);
  const [loading, setLoading]     = useState(true);

  const fetchProfile = useCallback(async () => {
    const r = await fetch('/api/bioptima/profile');
    const j = await r.json() as { ok: boolean; profile: Profile | null };
    if (j.ok) setProfile(j.profile);
  }, []);

  const fetchBiometrics = useCallback(async () => {
    const r = await fetch('/api/bioptima/biometrics?limit=30');
    const j = await r.json() as { ok: boolean; records: Biometric[] };
    if (j.ok) setBiometrics(j.records);
  }, []);

  const fetchDaily = useCallback(async () => {
    const r = await fetch('/api/bioptima/daily?days=30');
    const j = await r.json() as { ok: boolean; records: DailyRec[]; tdee: number | null };
    if (j.ok) setDaily(j.records);
  }, []);

  const fetchStats = useCallback(async () => {
    const r = await fetch('/api/bioptima/stats');
    const j = await r.json() as { ok: boolean } & Stats;
    if (j.ok) setStats(j);
  }, []);

  useEffect(() => {
    Promise.all([fetchProfile(), fetchBiometrics(), fetchDaily(), fetchStats()])
      .finally(() => setLoading(false));
  }, [fetchProfile, fetchBiometrics, fetchDaily, fetchStats]);

  function refreshAll() {
    fetchProfile(); fetchBiometrics(); fetchDaily(); fetchStats();
  }

  const tdee = stats?.tdee ?? 0;

  return (
    <div className="bio-wrap">
      <style>{STYLES}</style>

      <div className="bio-topbar">
        <span className="bio-title">Bioptima</span>
        <span style={{ fontSize: 12, color: 'var(--adm-muted)' }}>Seguimiento dietético-deportivo</span>
      </div>

      <div className="bio-tabs">
        {(['diario', 'biometria', 'evolucion', 'perfil'] as Tab[]).map(t => (
          <button key={t} className={`bio-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {{ diario: 'Diario', biometria: 'Biometría', evolucion: 'Evolución', perfil: 'Perfil' }[t]}
          </button>
        ))}
      </div>
      <style>{`.bio-tabs { display: flex; }`}</style>

      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--adm-muted)', fontSize: 13 }}>
          Cargando…
        </div>
      )}

      {!loading && tab === 'perfil'    && <VistaProfile    profile={profile}     onSaved={refreshAll} />}
      {!loading && tab === 'biometria' && <VistaBiometria  records={biometrics}  onSaved={refreshAll} />}
      {!loading && tab === 'diario'    && <VistaDiario     daily={daily} tdee={tdee} onSaved={refreshAll} />}
      {!loading && tab === 'evolucion' && <VistaEvolucion  stats={stats} />}
    </div>
  );
}
