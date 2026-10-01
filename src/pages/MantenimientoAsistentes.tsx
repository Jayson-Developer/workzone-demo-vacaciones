import React, { useMemo, useState } from 'react';
import type { User } from '../data/users';
import type { NavigateFn } from '../types';
import {
  ASISTENTES_EXEC,
  DIRECTORES_EXEC,
  getInitials,
  loadRelaciones,
  saveRelaciones,
  type AsistenteRelacion,
  type EstadoRelacion,
} from '../data/asistentesExec';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface Props {
  user: User;
  onNavigate: NavigateFn;
}

interface FormState {
  id: string | null;          // null = nueva relación
  director: string;
  areas: string;              // texto separado por comas
  asistente: string;
  estado: EstadoRelacion;
}

const EMPTY_FORM: FormState = { id: null, director: '', areas: '', asistente: '', estado: 'Activo' };

const parseAreas = (txt: string): string[] =>
  txt.split(',').map((a) => a.trim()).filter(Boolean);

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
const MantenimientoAsistentes: React.FC<Props> = ({ user, onNavigate }) => {
  const canView = user.role === 'administrador_gh';

  const [saved, setSaved]   = useState<AsistenteRelacion[]>(loadRelaciones);
  const [draft, setDraft]   = useState<AsistenteRelacion[]>(loadRelaciones);
  const [query, setQuery]   = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'Todos' | EstadoRelacion>('Todos');
  const [showFilter, setShowFilter]     = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [form, setForm]     = useState<FormState | null>(null);
  const [formError, setFormError] = useState('');
  const [toast, setToast]   = useState('');

  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return draft.filter((r) => {
      if (estadoFilter !== 'Todos' && r.estado !== estadoFilter) return false;
      if (!q) return true;
      return (
        r.director.toLowerCase().includes(q) ||
        r.asistente.toLowerCase().includes(q) ||
        r.areas.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [draft, query, estadoFilter]);

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  /* ── Acciones ──────────────────────────────────────────────────── */
  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2600);
  };

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));

  const openNew = () => { setFormError(''); setForm({ ...EMPTY_FORM }); };

  const openEdit = (r: AsistenteRelacion) => {
    setFormError('');
    setForm({ id: r.id, director: r.director, areas: r.areas.join(', '), asistente: r.asistente, estado: r.estado });
  };

  const handleDirectorChange = (name: string) => {
    const dir = DIRECTORES_EXEC.find((d) => d.name === name);
    setForm((f) => f && ({ ...f, director: name, areas: dir ? dir.areas.join(', ') : '' }));
  };

  const handleSubmitForm = () => {
    if (!form) return;
    if (!form.director || !form.asistente) {
      setFormError('Selecciona un director y un asistente exec.');
      return;
    }
    if (form.director === form.asistente) {
      setFormError('El director y el asistente no pueden ser la misma persona.');
      return;
    }
    const duplicated = draft.some(
      (r) => r.id !== form.id && r.director === form.director && r.asistente === form.asistente,
    );
    if (duplicated) {
      setFormError('Ya existe una relación entre este director y este asistente.');
      return;
    }
    const areas = parseAreas(form.areas);
    if (form.id) {
      setDraft((prev) => prev.map((r) =>
        r.id === form.id
          ? { ...r, director: form.director, areas, asistente: form.asistente, estado: form.estado }
          : r,
      ));
    } else {
      setDraft((prev) => [
        ...prev,
        { id: `rel-${Date.now()}`, director: form.director, areas, asistente: form.asistente, estado: form.estado },
      ]);
    }
    setForm(null);
  };

  const handleDelete = (id: string) => {
    setDraft((prev) => prev.filter((r) => r.id !== id));
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleDeleteSelected = () => {
    setDraft((prev) => prev.filter((r) => !selected.has(r.id)));
    setSelected(new Set());
  };

  const handleSave = () => {
    saveRelaciones(draft);
    setSaved(draft);
    showToast('Cambios guardados correctamente.');
  };

  const handleCancel = () => {
    setDraft(saved);
    setSelected(new Set());
    setQuery('');
    setEstadoFilter('Todos');
  };

  /* ── Acceso restringido ────────────────────────────────────────── */
  if (!canView) {
    return (
      <div className="ma-page">
        <div className="rp-no-access">
          <div className="rp-no-access-icon">🔒</div>
          <h3>Acceso restringido</h3>
          <p>Esta aplicación está disponible solo para administradores GH.</p>
        </div>
      </div>
    );
  }

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div className="ma-page">
      {/* Cabecera */}
      <div className="ma-head">
        <h2 className="ma-title">Mantenimiento de Asistentes Exec</h2>
        <button type="button" className="ma-back" onClick={() => onNavigate('inicio')}>
          ‹ Volver a Panel
        </button>
      </div>

      {/* Barra de herramientas */}
      <div className="ma-toolbar">
        <div className="ma-toolbar-left">
          <div className="rp-search-wrap ma-search">
            <svg className="rp-search-ico" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5" stroke="#888" strokeWidth="1.5" />
              <path d="M11 11l3.5 3.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className="rp-input"
              placeholder="Buscar"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="ma-filter-wrap">
            <button
              type="button"
              className="ma-filter-btn"
              onClick={() => setShowFilter((v) => !v)}
              aria-expanded={showFilter}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 3h12l-4.5 5.5V13l-3-1.5V8.5L2 3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
              Filtro
              {estadoFilter !== 'Todos' && <span className="ma-filter-dot" />}
            </button>
            {showFilter && (
              <div className="ma-filter-pop">
                <label className="rp-filter-label">Estado</label>
                <select
                  className="rp-select"
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value as 'Todos' | EstadoRelacion)}
                >
                  <option>Todos</option>
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </div>
            )}
          </div>

          {selected.size > 0 && (
            <button type="button" className="ma-bulk-delete" onClick={handleDeleteSelected}>
              Eliminar seleccionados ({selected.size})
            </button>
          )}
        </div>

        <button type="button" className="ma-btn-add" onClick={openNew}>
          <span aria-hidden="true">＋</span> Añadir Nueva Relación
        </button>
      </div>

      {/* Tabla */}
      <div className="ma-table-card">
        <div className="ma-table-scroll">
          <table className="ma-table">
            <thead>
              <tr>
                <th className="ma-col-check">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Seleccionar todos" />
                </th>
                <th>Director</th>
                <th>Áreas</th>
                <th>Asistente Exec</th>
                <th>Estado</th>
                <th className="ma-col-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={6} className="ma-empty">No hay relaciones registradas.</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="ma-col-check">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleRow(r.id)}
                      aria-label={`Seleccionar ${r.director}`}
                    />
                  </td>
                  <td>
                    <div className="ma-person">
                      <span className="ma-avatar">{getInitials(r.director)}</span>
                      {r.director}
                    </div>
                  </td>
                  <td className="ma-areas">[{r.areas.join(', ')}]</td>
                  <td>
                    <div className="ma-person">
                      <span className="ma-avatar">{getInitials(r.asistente)}</span>
                      {r.asistente}
                    </div>
                  </td>
                  <td>
                    <span className={`wz-status ${r.estado === 'Activo' ? 'status-success' : 'ma-status-inactive'}`}>
                      {r.estado}
                    </span>
                  </td>
                  <td className="ma-col-actions">
                    <div className="ma-actions">
                      <button type="button" className="ma-icon-btn ma-icon-btn--edit" title="Editar" onClick={() => openEdit(r)}>
                        <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path d="M11.5 4.5H5a1.5 1.5 0 00-1.5 1.5v9A1.5 1.5 0 005 16.5h9a1.5 1.5 0 001.5-1.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M14.5 3l2.5 2.5-7 7L7 13l.5-3 7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button type="button" className="ma-icon-btn ma-icon-btn--delete" title="Eliminar" onClick={() => handleDelete(r.id)}>
                        <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path d="M4 6h12M8 6V4h4v2M6 6l.7 10h6.6L14 6M8.5 9v4.5M11.5 9v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pie de acciones */}
      <div className="ma-footer-actions">
        {isDirty && <span className="ma-dirty">Tienes cambios sin guardar</span>}
        <button type="button" className="ma-btn-save" onClick={handleSave} disabled={!isDirty}>Guardar</button>
        <button type="button" className="ma-btn-cancel" onClick={handleCancel} disabled={!isDirty}>Cancelar</button>
      </div>

      {/* Modal añadir / editar */}
      {form && (
        <div className="ma-overlay" onClick={() => setForm(null)}>
          <div className="ma-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 className="ma-modal-title">{form.id ? 'Editar relación' : 'Añadir nueva relación'}</h3>

            <div className="ma-modal-body">
              <div className="rp-filter-field">
                <label className="rp-filter-label">Director</label>
                <select className="rp-select" value={form.director} onChange={(e) => handleDirectorChange(e.target.value)}>
                  <option value="">Seleccione</option>
                  {DIRECTORES_EXEC.map((d) => <option key={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div className="rp-filter-field">
                <label className="rp-filter-label">Áreas (separadas por coma)</label>
                <input
                  className="rp-input"
                  value={form.areas}
                  onChange={(e) => setForm({ ...form, areas: e.target.value })}
                  placeholder="Ej. Marketing, Ventas"
                />
              </div>
              <div className="rp-filter-field">
                <label className="rp-filter-label">Asistente Exec</label>
                <select className="rp-select" value={form.asistente} onChange={(e) => setForm({ ...form, asistente: e.target.value })}>
                  <option value="">Seleccione</option>
                  {ASISTENTES_EXEC.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="rp-filter-field">
                <label className="rp-filter-label">Estado</label>
                <select className="rp-select" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoRelacion })}>
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </div>
              {formError && <div className="ma-form-error">{formError}</div>}
            </div>

            <div className="ma-modal-actions">
              <button type="button" className="ma-btn-cancel" onClick={() => setForm(null)}>Cancelar</button>
              <button type="button" className="ma-btn-save" onClick={handleSubmitForm}>
                {form.id ? 'Aplicar' : 'Añadir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="ma-toast">{toast}</div>}
    </div>
  );
};

export default MantenimientoAsistentes;
