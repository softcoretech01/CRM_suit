import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Timeline, { activitiesToTimeline } from '../../components/common/Timeline';
import { Avatar, Badge, Section, Field, Tabs, Meter } from '../../components/common/Ui';
import { Drawer } from '../../components/common/Overlay';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
import { auditTrail } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { key: 'profile', label: 'Profile', icon: 'bi-person' },
  { key: 'security', label: 'Security', icon: 'bi-shield-lock' },
  { key: 'activity', label: 'Activity', icon: 'bi-clock-history' },
  { key: 'preferences', label: 'Preferences', icon: 'bi-sliders' },
];

const SESSIONS = [
  { id: 1, device: 'Chrome · Windows', location: 'Coimbatore, IN', ip: '49.37.xx.xx', last: 'Active now', current: true },
  { id: 2, device: 'Safari · iPhone 14', location: 'Coimbatore, IN', ip: '49.37.xx.xx', last: '2 hours ago', current: false },
  { id: 3, device: 'Edge · Windows', location: 'Chennai, IN', ip: '103.21.xx.xx', last: 'Yesterday', current: false },
];

function DetailRow({ label, value, mono }) {
  return (
    <div className="d-flex py-2" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="fs-13 text-muted-c" style={{ width: 180, flexShrink: 0 }}>{label}</div>
      <div className={`fs-13 fw-6 ${mono ? 'mono' : ''}`}>{value || '—'}</div>
    </div>
  );
}

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  const label = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const tone = ['var(--danger)', 'var(--danger)', 'var(--warning)', 'var(--secondary)', 'var(--success)'][score];
  return { score, label, tone, pct: (score / 4) * 100 };
}

export default function Profile() {
  const crm = useCrm();
  const toast = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [params, setParams] = useSearchParams();
  const active = params.get('tab') || 'profile';
  const setTab = (key) => setParams({ tab: key }, { replace: true });

  const user = { status: 'Active', ...currentUser };

  const [editDrawer, setEditDrawer] = useState(false);
  const [editForm, setEditForm] = useState({ name: user.name, designation: user.designation, mobile: user.mobile, email: user.email });

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [twoFa, setTwoFa] = useState(true);
  const strength = passwordStrength(pw.next);

  const [prefs, setPrefs] = useState({
    emailNotif: true, pushNotif: false, followupReminders: true,
    language: 'English', timezone: 'Asia/Kolkata (IST)', currency: 'INR (₹)',
  });

  const myTimeline = useMemo(() => {
    const mine = crm.activities.filter((a) => a.conductedBy === user.name);
    return activitiesToTimeline(mine);
  }, [crm.activities, user.name]);

  const myAudit = auditTrail.filter((a) => a.user === user.name);

  const saveProfile = () => {
    toast.success('Profile updated', 'Your profile changes were saved.');
    setEditDrawer(false);
  };

  const savePassword = () => {
    if (!pw.current) { toast.error('Current password required', 'Enter your current password.'); return; }
    if (pw.next.length < 8) { toast.error('Weak password', 'New password must be at least 8 characters.'); return; }
    if (pw.next !== pw.confirm) { toast.error('Passwords do not match', 'Re-enter matching passwords.'); return; }
    toast.success('Password changed', 'Your password was updated successfully.');
    setPw({ current: '', next: '', confirm: '' });
  };

  const savePrefs = () => toast.success('Preferences saved', 'Your preferences were updated.');

  return (
    <div className="page">
      <PageHeader title="My Profile" subtitle="Manage your account, security and preferences" icon="bi-person-circle" back="/dashboard" />

      {/* Header surface */}
      <div className="surface p-4 mb-4">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <Avatar name={user.name} size="xl" color={user.avatarColor} />
          <div style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="fw-7" style={{ fontSize: 20 }}>{user.name}</span>
              <Badge tone="tone-green" dot>{user.status}</Badge>
            </div>
            <div className="fs-13 text-secondary-c mt-1">{user.designation} · {user.department}</div>
            <div className="fs-12 text-muted-c mt-1"><i className="bi bi-envelope" /> {user.email} &nbsp; <i className="bi bi-telephone" /> {user.mobile}</div>
          </div>
          <div className="ms-auto">
            <button className="btn btn-light" onClick={() => setEditDrawer(true)}><i className="bi bi-pencil" /> Edit Profile</button>
          </div>
        </div>
      </div>

      <Tabs tabs={TABS} active={active} onChange={setTab} />

      {/* ---------- Profile ---------- */}
      {active === 'profile' && (
        <div className="surface p-4 mt-3">
          <Section title="Personal & Work Details" icon="bi-person-vcard">
            <div className="row">
              <div className="col-md-6">
                <DetailRow label="Employee Name" value={user.name} />
                <DetailRow label="Designation" value={user.designation} />
                <DetailRow label="Department" value={user.department} />
                <DetailRow label="Branch" value={user.branch} />
                <DetailRow label="Role" value={user.role} />
              </div>
              <div className="col-md-6">
                <DetailRow label="Email" value={user.email} />
                <DetailRow label="Mobile" value={user.mobile} mono />
                <DetailRow label="Reporting Manager" value="Vivek Nair" />
                <DetailRow label="Joining Date" value={formatDate('2021-03-15')} />
                <DetailRow label="Status" value={<Badge tone="tone-green" dot>{user.status}</Badge>} />
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ---------- Security ---------- */}
      {active === 'security' && (
        <div className="row g-3 mt-1">
          <div className="col-12 col-lg-6">
            <div className="surface p-4 h-100">
              <Section title="Change Password" icon="bi-key">
                <div className="row">
                  <Field label="Current Password" col={12}>
                    <input type="password" className="form-control" value={pw.current} onChange={(e) => setPw((s) => ({ ...s, current: e.target.value }))} placeholder="••••••••" />
                  </Field>
                  <Field label="New Password" col={12} hint={pw.next ? `Strength: ${strength.label}` : 'Use 8+ chars with a number, capital and symbol'}>
                    <input type="password" className="form-control" value={pw.next} onChange={(e) => setPw((s) => ({ ...s, next: e.target.value }))} placeholder="••••••••" />
                    {pw.next && <div className="mt-2"><Meter value={strength.pct} tone={strength.tone} /></div>}
                  </Field>
                  <Field label="Confirm New Password" col={12} error={pw.confirm && pw.next !== pw.confirm ? 'Passwords do not match' : ''}>
                    <input type="password" className="form-control" value={pw.confirm} onChange={(e) => setPw((s) => ({ ...s, confirm: e.target.value }))} placeholder="••••••••" />
                  </Field>
                </div>
                <button className="btn btn-primary" onClick={savePassword}><i className="bi bi-check-lg" /> Update Password</button>
              </Section>

              <Section title="Two-Factor Authentication" icon="bi-shield-check">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="fs-13 text-secondary-c" style={{ maxWidth: 320 }}>
                    Add an extra layer of security with an authenticator app.
                  </div>
                  <div className="form-check form-switch m-0">
                    <input className="form-check-input" type="checkbox" checked={twoFa} onChange={() => { setTwoFa((v) => !v); toast.info('2FA updated', `Two-factor authentication ${!twoFa ? 'enabled' : 'disabled'}.`); }} style={{ cursor: 'pointer' }} />
                  </div>
                </div>
              </Section>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="surface p-4 h-100">
              <Section title="Active Sessions" icon="bi-laptop">
                <div className="d-flex flex-column gap-2">
                  {SESSIONS.map((s) => (
                    <div key={s.id} className="d-flex align-items-center gap-3 p-2" style={{ border: '1px solid var(--border)', borderRadius: 10 }}>
                      <span className="d-inline-flex align-items-center justify-content-center" style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                        <i className="bi bi-display" />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="fw-6 fs-13">{s.device} {s.current && <Badge tone="tone-green">This device</Badge>}</div>
                        <div className="fs-12 text-muted-c">{s.location} · {s.ip} · {s.last}</div>
                      </div>
                      {!s.current && (
                        <button className="btn btn-light btn-sm" onClick={() => toast.success('Session revoked', `${s.device} was signed out.`)}>Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Activity ---------- */}
      {active === 'activity' && (
        <div className="surface p-4 mt-3">
          <Section title="Recent Activity" icon="bi-clock-history">
            {myTimeline.length > 0 ? (
              <Timeline groups={myTimeline} />
            ) : (
              <div className="d-flex flex-column gap-2">
                {myAudit.length === 0 && <div className="text-muted-c fs-13">No recent activity recorded.</div>}
                {myAudit.map((a, i) => (
                  <div key={i} className="d-flex align-items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="d-inline-flex align-items-center justify-content-center" style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                      <i className="bi bi-pencil-square" />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="fw-6 fs-13">{a.action} <span className="text-muted-c fw-5">· {a.entity}</span></div>
                      <div className="fs-12 text-muted-c">{a.from ? `${a.from} → ` : ''}{a.to}</div>
                    </div>
                    <div className="fs-12 text-muted-c text-nowrap">{formatDate(a.date, { short: true })} · {a.time}</div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {/* ---------- Preferences ---------- */}
      {active === 'preferences' && (
        <div className="surface p-4 mt-3">
          <Section title="Notifications" icon="bi-bell">
            {[
              ['emailNotif', 'Email notifications', 'Receive lead and deal updates via email'],
              ['pushNotif', 'Push notifications', 'Get browser push alerts'],
              ['followupReminders', 'Follow-up reminders', 'Remind me about pending follow-ups'],
            ].map(([key, title, desc]) => (
              <div key={key} className="d-flex align-items-center justify-content-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div className="fw-6 fs-13">{title}</div>
                  <div className="fs-12 text-muted-c">{desc}</div>
                </div>
                <div className="form-check form-switch m-0">
                  <input className="form-check-input" type="checkbox" checked={prefs[key]} onChange={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))} style={{ cursor: 'pointer' }} />
                </div>
              </div>
            ))}
          </Section>

          <Section title="Regional & Display" icon="bi-globe">
            <div className="row">
              <Field label="Language" col={4}>
                <select className="form-select" value={prefs.language} onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}>
                  {['English', 'Tamil', 'Hindi'].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Timezone" col={4}>
                <select className="form-select" value={prefs.timezone} onChange={(e) => setPrefs((p) => ({ ...p, timezone: e.target.value }))}>
                  {['Asia/Kolkata (IST)', 'Asia/Dubai (GST)', 'UTC'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Currency" col={4}>
                <select className="form-select" value={prefs.currency} onChange={(e) => setPrefs((p) => ({ ...p, currency: e.target.value }))}>
                  {['INR (₹)', 'USD ($)', 'AED (د.إ)'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Theme" col={12} hint="This build ships a light enterprise theme only.">
                <input className="form-control" value="Light (default)" readOnly />
              </Field>
            </div>
            <button className="btn btn-primary" onClick={savePrefs}><i className="bi bi-check-lg" /> Save Preferences</button>
          </Section>
        </div>
      )}

      <Drawer
        open={editDrawer}
        onClose={() => setEditDrawer(false)}
        title="Edit Profile"
        subtitle="Update your personal details"
        icon="bi-person-gear"
        width={520}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setEditDrawer(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveProfile}><i className="bi bi-check-lg" /> Save Changes</button>
          </>
        }
      >
        <Section title="Details" icon="bi-person-vcard">
          <div className="row">
            <Field label="Full Name" col={12}>
              <input className="form-control" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Designation" col={12}>
              <input className="form-control" value={editForm.designation} onChange={(e) => setEditForm((f) => ({ ...f, designation: e.target.value }))} />
            </Field>
            <Field label="Email" col={6}>
              <input type="email" className="form-control" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
            </Field>
            <Field label="Mobile" col={6}>
              <input className="form-control" value={editForm.mobile} onChange={(e) => setEditForm((f) => ({ ...f, mobile: e.target.value }))} />
            </Field>
          </div>
        </Section>
      </Drawer>
    </div>
  );
}
