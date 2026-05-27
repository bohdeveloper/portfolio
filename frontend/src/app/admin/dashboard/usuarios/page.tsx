'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  role: 'super_admin' | 'editor' | 'viewer';
  active: number;
}

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ username: '', password: '', role: 'editor' });

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
      } else if (res.status === 403) {
        router.replace('/admin/dashboard');
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username) return;

    try {
      if (formMode === 'create') {
        if (!form.password) return;
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to create user');
      } else if (editingId) {
        const res = await fetch(`/api/admin/users?id=${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form.password ? form : { username: form.username, role: form.role }),
        });
        if (!res.ok) throw new Error('Failed to update user');
      }
      setShowForm(false);
      setForm({ username: '', password: '', role: 'editor' });
      setEditingId(null);
      loadUsers();
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      loadUsers();
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setForm({ username: user.username, password: '', role: user.role });
    setFormMode('edit');
    setShowForm(true);
  };

  return (
    <div style={{
      background: 'var(--adm-bg)',
      minHeight: 'calc(100vh - 88px)',
      padding: '2rem 1.5rem',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--adm-text)', fontSize: '24px', fontWeight: 500, marginBottom: '0.5rem' }}>
            Gestión de Usuarios
          </h1>
          <p style={{ color: 'var(--adm-muted)', fontSize: '13px' }}>
            Crear y administrar usuarios del sistema
          </p>
        </div>

        {/* New User Button */}
        <button
          onClick={() => {
            setFormMode('create');
            setForm({ username: '', password: '', role: 'editor' });
            setEditingId(null);
            setShowForm(true);
          }}
          style={{
            background: 'var(--primary)',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '1.5rem',
          }}
        >
          + Nuevo Usuario
        </button>

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'var(--adm-card)',
              border: '1px solid var(--adm-border)',
              borderRadius: '10px',
              padding: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--adm-muted)', marginBottom: '0.5rem' }}>
                Usuario
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--adm-bg)',
                  border: '1px solid var(--adm-border)',
                  borderRadius: '6px',
                  color: 'var(--adm-text)',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {formMode === 'create' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--adm-muted)', marginBottom: '0.5rem' }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--adm-bg)',
                    border: '1px solid var(--adm-border)',
                    borderRadius: '6px',
                    color: 'var(--adm-text)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--adm-muted)', marginBottom: '0.5rem' }}>
                Rol
              </label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--adm-bg)',
                  border: '1px solid var(--adm-border)',
                  borderRadius: '6px',
                  color: 'var(--adm-text)',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="viewer">Viewer (Solo lectura)</option>
                <option value="editor">Editor (CRUD propio)</option>
                <option value="super_admin">Super Admin (Todo)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  background: 'var(--primary)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {formMode === 'create' ? 'Crear' : 'Actualizar'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: 'var(--adm-border)',
                  color: 'var(--adm-text)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Users Table */}
        {loading ? (
          <p style={{ color: 'var(--adm-muted)', fontSize: '13px' }}>Cargando...</p>
        ) : users.length === 0 ? (
          <p style={{ color: 'var(--adm-muted)', fontSize: '13px' }}>No hay usuarios</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--adm-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--adm-muted)', fontWeight: 500 }}>Usuario</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--adm-muted)', fontWeight: 500 }}>Rol</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--adm-muted)', fontWeight: 500 }}>Estado</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--adm-muted)', fontWeight: 500 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--adm-border)' }}>
                    <td style={{ padding: '12px', color: 'var(--adm-text)' }}>{user.username}</td>
                    <td style={{ padding: '12px', color: 'var(--primary)' }}>{user.role}</td>
                    <td style={{ padding: '12px', color: user.active ? '#1D6B45' : '#999' }}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleEdit(user)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          marginRight: '12px',
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#d9534f',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
