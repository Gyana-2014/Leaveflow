import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../utils/AuthContext';
import { leaveAPI, employeeAPI } from '../utils/api';

// ── Shared helpers ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>;
}

function calcDays(start, end) {
  return Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 300,
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '14px 20px', fontSize: 13,
      color: 'var(--text)', boxShadow: 'var(--shadow)',
      animation: 'slideUp 0.25s ease', maxWidth: 360,
    }}>
      {message}
    </div>
  );
}

// ── Leave action modal ─────────────────────────────────────────────────────
function ActionModal({ leave, action, onConfirm, onClose }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const isReject = action === 'Rejected';

  async function handleConfirm() {
    setLoading(true);
    await onConfirm(leave.id, action, comment);
    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{isReject ? '❌ Reject Leave Request' : '✅ Approve Leave Request'}</h3>
        <div style={{
          background: 'var(--bg)', borderRadius: 8, padding: '14px 16px',
          marginBottom: 16, fontSize: 13, lineHeight: 1.8,
          border: '1px solid var(--border-light)'
        }}>
          <div><span style={{ color: 'var(--text-muted)' }}>Employee:</span> <strong>{leave.employee_name}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Type:</span> {leave.type}</div>
          <div><span style={{ color: 'var(--text-muted)' }}>Dates:</span> {new Date(leave.start_date).toDateString()} → {new Date(leave.end_date).toDateString()}</div>
          <div><span style={{ color: 'var(--text-muted)' }}>Reason:</span> {leave.reason}</div>
        </div>
        {isReject && (
          <div className="form-group">
            <label>Comment (optional)</label>
            <textarea
              placeholder="Add a note to the employee about why the leave was rejected…"
              value={comment} onChange={e => setComment(e.target.value)} rows={3}
            />
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className={`btn ${isReject ? 'btn-danger' : 'btn-success'}`}
            onClick={handleConfirm} disabled={loading}
          >
            {loading
              ? <><span className="loader" /> Processing…</>
              : isReject ? 'Confirm Rejection' : 'Confirm Approval'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add employee modal ─────────────────────────────────────────────────────
function AddEmployeeModal({ onSuccess, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await employeeAPI.add(form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee.');
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>➕ Add New Employee</h3>
        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>⚠ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Full Name</label>
            <input
              type="text" placeholder="e.g. Priya Sharma" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Email Address</label>
            <input
              type="email" placeholder="employee@company.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Temporary Password</label>
            <input
              type="password" placeholder="Min 6 characters" required minLength={6}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="loader" /> Adding…</> : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────────────
function DeleteConfirmModal({ employee, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm(employee.id);
    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>🗑️ Deactivate Employee</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
          Are you sure you want to deactivate <strong>{employee.name}</strong>?
          They will no longer be able to log in. This action can be reversed from the database.
        </p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={loading}>
            {loading ? <><span className="loader" /> Deactivating…</> : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Leaves Tab ─────────────────────────────────────────────────────────────
function LeavesTab() {
  const [leaves, setLeaves] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState('All');

  const fetchLeaves = useCallback(async () => {
    try {
      const { data } = await leaveAPI.getAll();
      setLeaves(data);
    } catch (err) {
      console.error('Failed to fetch leaves', err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  async function handleAction(id, status, comment) {
    try {
      await leaveAPI.process(id, { status, comment });
      setModal(null);
      showToast(status === 'Approved'
        ? '✅ Leave approved and employee notified.'
        : '❌ Leave rejected and employee notified.');
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed. Try again.');
    }
  }

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'Pending').length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length,
  };

  const filtered = filter === 'All' ? leaves : leaves.filter(l => l.status === filter);

  return (
    <>
      <Toast message={toast} />
      {modal && (
        <ActionModal
          leave={modal.leave} action={modal.action}
          onConfirm={handleAction} onClose={() => setModal(null)}
        />
      )}

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { icon: '📋', val: stats.total,    label: 'Total',    color: 'rgba(88,166,255,0.12)' },
          { icon: '⏳', val: stats.pending,  label: 'Pending',  color: 'rgba(210,153,34,0.12)' },
          { icon: '✅', val: stats.approved, label: 'Approved', color: 'rgba(63,185,80,0.12)'  },
          { icon: '❌', val: stats.rejected, label: 'Rejected', color: 'rgba(248,81,73,0.12)'  },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <div className="value">{s.val}</div>
              <div className="label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <span>📥 All Leave Requests</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter(f)}>
                {f}
                {f !== 'All' && (
                  <span style={{ marginLeft: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '1px 5px', fontSize: 10 }}>
                    {leaves.filter(l => l.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            <span className="loader" style={{ width: 20, height: 20 }} /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No {filter !== 'All' ? filter.toLowerCase() : ''} leave requests found.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th><th>Type</th><th>From</th><th>To</th>
                  <th>Days</th><th>Reason</th><th>Status</th><th>Applied</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(leave => (
                  <tr key={leave.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{leave.employee_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{leave.employee_id || leave.employee_email}</div>
                    </td>
                    <td>{leave.type}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(leave.start_date).toLocaleDateString()}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(leave.end_date).toLocaleDateString()}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {calcDays(leave.start_date, leave.end_date)}
                    </td>
                    <td style={{ maxWidth: 180 }}>
                      <span title={leave.reason} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160, color: 'var(--text-muted)', fontSize: 12 }}>
                        {leave.reason}
                      </span>
                    </td>
                    <td><StatusBadge status={leave.status} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {new Date(leave.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {leave.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-success btn-sm"
                            onClick={() => setModal({ leave, action: 'Approved' })}>Approve</button>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => setModal({ leave, action: 'Rejected' })}>Reject</button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>
                          {leave.manager_comment
                            ? <span title={leave.manager_comment} style={{ cursor: 'help', textDecoration: 'underline dotted' }}>Has note ✍️</span>
                            : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ── Employees Tab ──────────────────────────────────────────────────────────
function EmployeesTab() {
  const [employees, setEmployees] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState('');

  const fetchEmployees = useCallback(async () => {
    try {
      const { data } = await employeeAPI.getAll();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  async function handleDelete(id) {
    try {
      await employeeAPI.remove(id);
      setDeleteTarget(null);
      showToast('🗑️ Employee deactivated successfully.');
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed. Try again.');
    }
  }

  function handleAddSuccess() {
    setShowAddModal(false);
    showToast('✅ Employee added successfully.');
    fetchEmployees();
  }

  const active   = employees.filter(e => e.is_active);
  const inactive = employees.filter(e => !e.is_active);

  return (
    <>
      <Toast message={toast} />
      {showAddModal && <AddEmployeeModal onSuccess={handleAddSuccess} onClose={() => setShowAddModal(false)} />}
      {deleteTarget && <DeleteConfirmModal employee={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { icon: '👥', val: employees.length, label: 'Total',    color: 'rgba(88,166,255,0.12)' },
          { icon: '✅', val: active.length,    label: 'Active',   color: 'rgba(63,185,80,0.12)'  },
          { icon: '🚫', val: inactive.length,  label: 'Inactive', color: 'rgba(248,81,73,0.12)'  },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <div className="value">{s.val}</div>
              <div className="label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <span>👥 All Employees</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            ➕ Add Employee
          </button>
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            <span className="loader" style={{ width: 20, height: 20 }} /> Loading…
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <p>No employees yet. Add your first employee above!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th><th>Name</th><th>Email</th>
                  <th>Status</th><th>Added By</th><th>Joined</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} style={{ opacity: emp.is_active ? 1 : 0.5 }}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                        {emp.employee_id || '—'}
                      </span>
                    </td>
                    <td><span style={{ fontWeight: 500 }}>{emp.name}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{emp.email}</td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: emp.is_active ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)',
                        color: emp.is_active ? '#3fb950' : '#f85149',
                      }}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{emp.created_by_name || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(emp.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {emp.is_active ? (
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(emp)}>
                          Deactivate
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>Deactivated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ── Main Manager Dashboard ─────────────────────────────────────────────────
export default function ManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('leaves');

  return (
    <>
      <div className="page-header">
        <h2>Manager Dashboard 👔</h2>
        <p>Manage leave requests and your team members.</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { id: 'leaves',    label: '📥 Leave Requests' },
          { id: 'employees', label: '👥 Employees'      },
        ].map(tab => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ fontSize: 14 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'leaves'    && <LeavesTab />}
      {activeTab === 'employees' && <EmployeesTab />}
    </>
  );
}
