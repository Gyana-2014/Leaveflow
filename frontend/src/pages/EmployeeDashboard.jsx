import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../utils/AuthContext';
import { leaveAPI } from '../utils/api';

const LEAVE_TYPES = ['Annual', 'Sick', 'Casual', 'Maternity', 'Paternity', 'Unpaid', 'Other'];
const today = new Date().toISOString().split('T')[0];
const emptyForm = { type: 'Annual', start_date: today, end_date: today, reason: '' };

function StatusBadge({ status }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>;
}

function calcDays(start, end) {
  return Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchLeaves = useCallback(async () => {
    try {
      const { data } = await leaveAPI.getMy();
      setLeaves(data);
    } catch (err) {
      console.error('Failed to fetch leaves', err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await leaveAPI.apply(form);
      setSuccess('✅ Leave request submitted! The manager has been notified.');
      setForm(emptyForm);
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    pending: leaves.filter(l => l.status === 'Pending').length,
  };

  return (
    <>
      <div className="page-header">
        <h2>Welcome back, {user.name.split(' ')[0]} 👋</h2>
        <p>Manage your leave requests and track their status.</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(88,166,255,0.12)' }}>📋</div>
          <div className="stat-info"><div className="value">{stats.total}</div><div className="label">Total Requests</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(63,185,80,0.12)' }}>✅</div>
          <div className="stat-info"><div className="value">{stats.approved}</div><div className="label">Approved</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(210,153,34,0.12)' }}>⏳</div>
          <div className="stat-info"><div className="value">{stats.pending}</div><div className="label">Pending</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📝 Apply for Leave</div>
        {success && <div className="alert alert-success">{success}</div>}
        {error   && <div className="alert alert-error">⚠ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Leave Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ alignSelf: 'end' }}>
              <label style={{ color: 'var(--text-dim)' }}>Duration</label>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '10px 0' }}>
                {calcDays(form.start_date, form.end_date)} day(s)
              </div>
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={form.start_date} min={today}
                onChange={e => setForm({ ...form, start_date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={form.end_date} min={form.start_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })} required />
            </div>
            <div className="form-group full-width">
              <label>Reason</label>
              <textarea placeholder="Briefly describe the reason for your leave request…"
                value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                required rows={3} />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <><span className="loader" /> Submitting…</> : '🚀 Submit Request'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-title">📅 My Leave Requests</div>
        {fetching ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
            <span className="loader" style={{ width: 20, height: 20 }} /> Loading…
          </div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No leave requests yet. Submit your first one above!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Applied</th></tr>
              </thead>
              <tbody>
                {leaves.map(leave => (
                  <tr key={leave.id}>
                    <td><span style={{ fontWeight: 500 }}>{leave.type}</span></td>
                    <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                    <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {calcDays(leave.start_date, leave.end_date)}
                    </td>
                    <td style={{ maxWidth: 200, color: 'var(--text-muted)' }}>
                      <span title={leave.reason} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                        {leave.reason}
                      </span>
                    </td>
                    <td><StatusBadge status={leave.status} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(leave.created_at).toLocaleDateString()}
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
