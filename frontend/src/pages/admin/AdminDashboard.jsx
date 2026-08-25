import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Card } from '../../components/common/Ui';
import { StatCard } from '../../components/common/PageParts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';

const activityData = [
  { name: 'Mon', apiCalls: 4000, activeUsers: 240, errors: 24 },
  { name: 'Tue', apiCalls: 3000, activeUsers: 139, errors: 12 },
  { name: 'Wed', apiCalls: 2000, activeUsers: 980, errors: 10 },
  { name: 'Thu', apiCalls: 2780, activeUsers: 390, errors: 40 },
  { name: 'Fri', apiCalls: 1890, activeUsers: 480, errors: 5 },
  { name: 'Sat', apiCalls: 2390, activeUsers: 380, errors: 12 },
  { name: 'Sun', apiCalls: 3490, activeUsers: 430, errors: 18 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_users: 28, active_roles: 4, system_alerts: 2, avg_uptime: 99.98 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch('/admin/dashboard');
        // Endpoint wraps the payload as { success, data: {...} }; unwrap it.
        const data = res?.data ?? res;
        if (data) setStats((s) => ({ ...s, ...data }));
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };
    
    const fetchLogs = async () => {
      try {
        const data = await apiFetch('/admin/audit-logs?page_size=5');
        if (data && data.items) {
          setRecentActivity(data.items.map(log => ({
            id: log.id,
            user: log.user_name || `User ${log.user_id}`,
            action: log.action,
            target: `${log.entity_type} ${log.entity_id}`,
            time: new Date(log.created_at).toLocaleString(),
            type: 'info'
          })));
        }
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      }
    };

    const fetchRoles = async () => {
      try {
        const data = await apiFetch('/admin/roles');
        if (data && data.data) {
          const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#6366f1'];
          setRoleData(data.data.map((r, i) => ({
            name: r.name,
            count: r.users ?? r.user_count ?? 0,
            color: colors[i % colors.length]
          })));
        }
      } catch (err) {
        console.error("Failed to fetch roles", err);
      }
    };

    Promise.all([fetchStats(), fetchLogs(), fetchRoles()]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page animate-up">
      <PageHeader
        title="Admin Dashboard"
        subtitle="System health, security, and usage overview"
        action={{ label: 'Manage Users', icon: 'bi-people', onClick: () => navigate('/users') }}
      />

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard label="Total Users" value={loading ? "..." : stats.total_users} icon="bi-people" trend={12} trendText="vs last month" color="var(--primary)" />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard label="Active Roles" value={loading ? "..." : stats.active_roles} icon="bi-shield-check" color="var(--success)" />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard label="System Alerts" value={loading ? "..." : stats.system_alerts} icon="bi-exclamation-triangle" trend={-1} trendText="vs last week" color="var(--warning)" />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard label="Avg. Uptime" value={loading ? "..." : `${stats.avg_uptime}%`} icon="bi-activity" color="var(--info)" />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <Card title="System Activity & Traffic (7 Days)">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" name="API Calls" dataKey="apiCalls" stroke="#4f46e5" fillOpacity={1} fill="url(#colorApi)" strokeWidth={2} />
                  <Area type="monotone" name="Active Users" dataKey="activeUsers" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        
        <div className="col-12 col-lg-4">
          <Card title="User Distribution by Role">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={roleData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={110} />
                  <RechartsTooltip cursor={{ fill: 'var(--bg-hover)' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" name="Users" radius={[0, 4, 4, 0]} barSize={20}>
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <Card title="Security & Audit Log">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User / System</th>
                    <th>Action Event</th>
                    <th>Target Object</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((log) => (
                    <tr key={log.id}>
                      <td className="text-muted-c fs-13"><i className="bi bi-clock me-1"/> {log.time}</td>
                      <td>
                        <span className="fw-5">{log.user}</span>
                      </td>
                      <td>
                        <span className={`badge bg-${log.type} bg-opacity-10 text-${log.type}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="text-muted-c">{log.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
