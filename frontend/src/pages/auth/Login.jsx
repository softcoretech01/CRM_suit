import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { usePortal } from '../../context/PortalContext';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import { PORTALS } from '../../config/portals';
import { allowedPortalsFor, defaultMatrixFor } from '../../data/permissionDefaults';
import './auth.css';

// Login-card portal visuals (ordered Admin · Masters · CRM to match the design)
const LOGIN_PORTALS = [
  { id: 'admin', name: 'Admin', icon: 'bi-shield-lock-fill', grad: 'linear-gradient(135deg,#a78bfa,#7c3aed)', accent: '#7c3aed' },
  { id: 'masters', name: 'Masters', icon: 'bi-briefcase-fill', grad: 'linear-gradient(135deg,#22d3ee,#0891b2)', accent: '#0891b2' },
  { id: 'crm', name: 'CRM', icon: 'bi-graph-up-arrow', grad: 'linear-gradient(135deg,#fbbf24,#f97316)', accent: '#f97316' },
];

const FEATURES = [
  { icon: 'bi-diagram-3-fill', color: '#7c3aed', title: '360° Customer View', desc: 'All customer interactions in one place' },
  { icon: 'bi-scissors', color: '#db2777', title: 'Smarter Pipeline', desc: 'Track, forecast & close faster' },
  { icon: 'bi-people-fill', color: '#0891b2', title: 'Team Collaboration', desc: 'Work together, achieve more' },
  { icon: 'bi-graph-up-arrow', color: '#f97316', title: 'Data-Driven Growth', desc: 'Insights that drive decisions' },
];

function CubeLogo() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c4b5fd" /><stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="cubeLeft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8b5cf6" /><stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="cubeRight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7c3aed" /><stop offset="1" stopColor="#5b21b6" />
        </linearGradient>
      </defs>
      <polygon points="24,4 42,14 24,24 6,14" fill="url(#cubeTop)" />
      <polygon points="6,14 24,24 24,44 6,34" fill="url(#cubeLeft)" />
      <polygon points="42,14 24,24 24,44 42,34" fill="url(#cubeRight)" />
      <text x="24" y="31" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="15" fill="#fff">T</text>
    </svg>
  );
}

/* Techspire wordmark logo — "Techspire" + red dot */
function TechspireLogo({ height = 32 }) {
  return (
    <span className="ts-logo" style={{ fontSize: `${height}px` }}>
      Techspire<span className="ts-dot" aria-hidden="true" />
    </span>
  );
}

/* Compact decorative dashboard mockup shown in the hero */
function DashboardMock() {
  return (
    <div className="lp-dash" aria-hidden="true">
      <div className="dm-side">
        <div className="dm-logo"><span>T</span> TECHSPIRE</div>
        {['Dashboard', 'Leads', 'Companies', 'Contacts', 'Opportunities', 'Activities', 'Reports', 'Settings'].map((n, i) => (
          <div key={n} className={`dm-nav ${i === 0 ? 'active' : ''}`}><span className="dm-dot" />{n}</div>
        ))}
      </div>
      <div className="dm-main">
        <div className="dm-head">
          <div>
            <div className="dm-h1">Welcome back, Rajesh 👋</div>
            <div className="dm-h2">Here's what's happening with your business today.</div>
          </div>
          <div className="dm-ava"><i className="bi bi-person-fill" /></div>
        </div>
        <div className="dm-kpis">
          {[
            { l: 'Total Pipeline', v: '₹1.84 Cr', d: '↑ 12.4%' },
            { l: 'Active Opportunities', v: '128', d: '↑ 8.8%' },
            { l: 'Conversions', v: '28%', d: '↑ 4.2%' },
            { l: 'Activities Due', v: '34', d: '↑ 6.1%' },
          ].map((k) => (
            <div key={k.l} className="dm-kpi">
              <div className="dm-kl">{k.l}</div>
              <div className="dm-kv">{k.v}</div>
              <div className="dm-kd">{k.d} <span>vs last month</span></div>
            </div>
          ))}
        </div>
        <div className="dm-charts">
          <div className="dm-card">
            <div className="dm-ct">Pipeline Overview</div>
            <svg viewBox="0 0 260 96" className="dm-area" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ar1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f97316" stopOpacity="0.35" /><stop offset="1" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="ar2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#7c3aed" stopOpacity="0.3" /><stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,70 C30,50 50,60 80,40 C110,22 140,52 170,34 C200,20 230,40 260,26 L260,96 L0,96 Z" fill="url(#ar1)" />
              <path d="M0,70 C30,50 50,60 80,40 C110,22 140,52 170,34 C200,20 230,40 260,26" fill="none" stroke="#f97316" strokeWidth="2" />
              <path d="M0,82 C30,74 55,78 85,64 C115,50 140,70 170,58 C200,48 235,60 260,50 L260,96 L0,96 Z" fill="url(#ar2)" />
              <path d="M0,82 C30,74 55,78 85,64 C115,50 140,70 170,58 C200,48 235,60 260,50" fill="none" stroke="#7c3aed" strokeWidth="2" />
            </svg>
            <div className="dm-x">{['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m) => <span key={m}>{m}</span>)}</div>
          </div>
          <div className="dm-card">
            <div className="dm-ct">Top Products</div>
            <div className="dm-donut-wrap">
              <svg viewBox="0 0 42 42" className="dm-donut">
                <circle className="dm-ring" r="15.9" cx="21" cy="21" />
                <circle r="15.9" cx="21" cy="21" stroke="#7c3aed" strokeDasharray="45 55" strokeDashoffset="25" />
                <circle r="15.9" cx="21" cy="21" stroke="#0891b2" strokeDasharray="25 75" strokeDashoffset="80" />
                <circle r="15.9" cx="21" cy="21" stroke="#f97316" strokeDasharray="18 82" strokeDashoffset="105" />
                <circle r="15.9" cx="21" cy="21" stroke="#db2777" strokeDasharray="12 88" strokeDashoffset="123" />
              </svg>
              <div className="dm-legend">
                {[['Manufacturing ERP', '45%', '#7c3aed'], ['Hospital Management', '25%', '#0891b2'], ['HRMS & Payroll', '18%', '#f97316'], ['Others', '12%', '#db2777']].map(([n, p, c]) => (
                  <div key={n} className="dm-leg"><span style={{ background: c }} />{n}<b>{p}</b></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signIn } = usePortal();
  const { login } = useAuth();
  const { users, roles, fetchAll } = useCrm();

  const [portalId, setPortalId] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Resolve the entered username against the real users loaded from the backend
  const findUser = (input) => {
    const q = input.trim().toLowerCase();
    return users.find((u) =>
      (u.username || '').toLowerCase() === q ||
      (u.email || '').toLowerCase() === q ||
      (u.name || '').toLowerCase() === q ||
      (u.name || '').toLowerCase().split(' ')[0] === q
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    if (!portalId) err.portal = 'Please select a portal';
    if (!username.trim()) err.username = 'Username is required';
    if (!password) err.password = 'Password is required';
    setErrors(err);
    if (Object.keys(err).length) {
      if (err.portal) toast.error('Error', err.portal);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.detail === "Maximum concurrent users reached for this company.") {
          toast.error('Limit Reached', 'The maximum number of concurrent users are already logged in.');
        } else {
          toast.error('Login failed', data.detail || 'Invalid credentials');
        }
        setLoading(false);
        return;
      }

      const user = data.user;
      
      // Enforce portal access based on the user's role permissions.
      // Prefer the real permission matrix the backend returns (source of truth,
      // reflects anything configured on the Permissions screen). Only fall back
      // to a role-name default when the role has no permissions configured yet,
      // so a brand-new role isn't accidentally locked out of every portal.
      const backendMatrix = user.permissions || user.matrix;
      const role = roles.find((r) => r.code === user.role_code || r.name === user.role_name);
      const hasBackendMatrix = backendMatrix && typeof backendMatrix === 'object'
        && allowedPortalsFor(backendMatrix).length > 0;
      const matrix = hasBackendMatrix
        ? backendMatrix
        : (role?.matrix || defaultMatrixFor(user.role_name || user.role_code || ''));
      const allowed = allowedPortalsFor(matrix);
      if (!allowed.includes(portalId)) {
        const allowedNames = allowed.map((p) => PORTALS[p]?.short).filter(Boolean).join(', ') || 'no portals';
        toast.error(
          'Access denied',
          `Your role (${user.role_name}) does not have access to the ${PORTALS[portalId].name}. Allowed: ${allowedNames}.`
        );
        setLoading(false);
        return;
      }

      // Store auth token in sessionStorage so other API calls can use it
      sessionStorage.setItem('token', data.access_token);
      localStorage.setItem('access_token', data.access_token);

      // Sign in locally
      login({
        id: user.id,
        role_id: user.role_id,
        tenant_company_id: user.tenant_company_id,
        tenant_company_name: user.tenant_company_name || user.company_name,
        companyName: user.tenant_company_name || user.company_name,
        name: user.full_name || user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        role: user.role_name,
        role_code: user.role_code || user.role_name,
        permissions: user.permissions,
        profile_pic: user.profile_pic || '',
        avatarColor: user.color || '#2563eb',
      });

      // Enter the portal first so login can't be blocked by a data refresh
      signIn(portalId);
      toast.success('Signed in', `Welcome ${user.full_name || user.name || user.username} — ${user.tenant_company_name || user.company_name || 'System'}`);
      navigate(PORTALS[portalId].home);

      // Refresh app data now that we have an auth token (fire-and-forget)
      try { if (fetchAll) fetchAll(); } catch (_) { /* ignore */ }
    } catch (e) {
      toast.error('Login failed', 'Network error or server is down.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login2">
      {/* ============ LEFT ============ */}
      <div className="lp-left">
        <div className="lp-brand">
          <TechspireLogo height={34} />
          <span className="lp-suite">CRM SUITE</span>
        </div>

        <div className="lp-hero">
          <h1>
            One CRM.<br />
            <span className="grad">Limitless</span> Possibilities.
          </h1>
        </div>

        <div className="lp-visual">

          <DashboardMock />

          <div className="lp-float upcoming">
            <div className="lf-title">Upcoming Activities</div>
            {[
              { i: 'bi-camera-video-fill', c: '#2563eb', t: 'Demo with ABC Manufacturing', s: 'Today, 11:30 AM' },
              { i: 'bi-telephone-fill', c: '#16a34a', t: 'Follow-up Call - GreenTech', s: 'Today, 02:00 PM' },
              { i: 'bi-file-earmark-text-fill', c: '#db2777', t: 'Proposal Discussion - SunPower', s: 'Tomorrow, 10:00 AM' },
            ].map((a) => (
              <div key={a.t} className="lf-row">
                <span className="lf-ic" style={{ background: a.c }}><i className={`bi ${a.i}`} /></span>
                <span className="lf-body"><span className="lf-t">{a.t}</span><span className="lf-s">{a.s}</span></span>
              </div>
            ))}
            <div className="lf-link">View all activities →</div>
          </div>

          <div className="lp-float tasks">
            <div className="lf-head">
              <span className="lf-title">Tasks Completed</span>
              <span className="lf-week">This Week ▾</span>
            </div>
            <div className="lf-tasks">
              <div className="lf-ring">
                <svg viewBox="0 0 42 42">
                  <circle className="lf-ring-bg" r="15.9" cx="21" cy="21" />
                  <circle className="lf-ring-fg" r="15.9" cx="21" cy="21" strokeDasharray="76 24" strokeDashoffset="25" />
                </svg>
                <span className="lf-pct">76%</span>
              </div>
              <div className="lf-tasktxt">
                <div className="lf-great">Great job!</div>
                <div className="lf-sub">You've completed 23 of 30 tasks</div>
              </div>
            </div>
            <div className="lf-link">Go to tasks →</div>
          </div>
        </div>

        <div className="lp-features">
          {FEATURES.map((f) => (
            <div key={f.title} className="lp-feat">
              <span className="lf-fic" style={{ background: `${f.color}1a`, color: f.color }}><i className={`bi ${f.icon}`} /></span>
              <div>
                <div className="lp-feat-t">{f.title}</div>
                <div className="lp-feat-d">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============ RIGHT ============ */}
      <div className="lp-right">

        <div className="login-card animate-up">
          <div className="lc-brand-mobile">
            <TechspireLogo height={26} />
            <span className="lp-suite">CRM SUITE</span>
          </div>

          <h2>Welcome back! <span className="wave">👋</span></h2>
          <p className="lc-sub">Sign in to your Techspire CRM account</p>

          <div className="lc-label">Select your portal</div>
          <div className="portal-cards" role="radiogroup" aria-label="Choose portal">
            {LOGIN_PORTALS.map((p) => {
              const active = portalId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`pcard ${active ? 'active' : ''}`}
                  onClick={() => setPortalId(p.id)}
                  style={{ '--acc': p.accent }}
                >
                  {active && <i className="bi bi-check-circle-fill pcard-check" />}
                  <span className="pcard-ic" style={{ background: p.grad }}><i className={`bi ${p.icon}`} /></span>
                  <span className="pcard-name">{p.name}</span>
                  <span className="pcard-sub">Portal</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} noValidate>
            <div className="lc-field">
              <label className="lc-flabel">Username</label>
              <div className="lc-input">
                <i className="bi bi-person" />
                <input
                  className={errors.username ? 'err' : ''}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Hint: try 'admin' or 'marketing'"
                  autoComplete="username"
                />
              </div>
              {errors.username && <div className="field-error"><i className="bi bi-exclamation-circle" /> {errors.username}</div>}
            </div>

            <div className="lc-field">
              <div className="lc-flabel-row">
                <label className="lc-flabel">Password</label>
              </div>
              <div className="lc-input">
                <i className="bi bi-lock" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={errors.password ? 'err' : ''}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button type="button" className="lc-eye" onClick={() => setShowPwd((s) => !s)} aria-label="Toggle password">
                  <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
              {errors.password && <div className="field-error"><i className="bi bi-exclamation-circle" /> {errors.password}</div>}
            </div>

            <label className="lc-remember">
              <input type="checkbox" defaultChecked />
              <span>Remember me for 30 days</span>
            </label>

            <button type="submit" className="lc-submit" disabled={loading}>
              {loading ? (<><span className="spinner-border spinner-border-sm" /> Signing in…</>) : (<><i className="bi bi-box-arrow-in-right" /> Sign in</>)}
            </button>
          </form>

          <div className="lc-foot">
            <div><i className="bi bi-shield-check" /> Your data is protected with enterprise-grade security</div>
            <div className="lc-copy">© 2026 Techspire CRM. All rights reserved.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
