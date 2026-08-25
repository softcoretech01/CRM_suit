import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import { Zap, ShieldCheck, LineChart, Wallet, CalendarCheck, AlertCircle, ArrowRight, Phone, Users, MapPin, CheckSquare, Plus, Calendar } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import PageHeader from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/PageParts';
import { Badge, Avatar, CardSkeleton, Skeleton } from '../../components/common/Ui';
import { inRange, defaultRange } from '../../components/common/DateRangeBar';
import { formatINR, formatDate, relativeDue, statusTone, priorityTone, getTodayISO } from '../../utils/format';

const SOURCE_DATA = [
  { name: 'Website', value: 28, color: '#2563eb' },
  { name: 'LinkedIn', value: 22, color: '#4f46e5' },
  { name: 'Referral', value: 18, color: '#16a34a' },
  { name: 'Google Ads', value: 14, color: '#d97706' },
  { name: 'WhatsApp', value: 10, color: '#0891b2' },
  { name: 'Manual Entry', value: 8, color: '#94a3b8' },
];

const REVENUE_DATA = [
  { month: 'Mar', actual: 32, forecast: 30 },
  { month: 'Apr', actual: 41, forecast: 38 },
  { month: 'May', actual: 38, forecast: 42 },
  { month: 'Jun', actual: 52, forecast: 48 },
  { month: 'Jul', actual: 61, forecast: 58 },
  { month: 'Aug', actual: 48, forecast: 72 },
  { month: 'Sep', actual: 0, forecast: 84 },
];



const LEADERBOARD = [
  { name: 'Arun Kumar', value: 4200000, deals: 8 },
  { name: 'Priya Sharma', value: 3600000, deals: 6 },
  { name: 'Karthik Raja', value: 3100000, deals: 5 },
  { name: 'Divya Lakshmi', value: 2400000, deals: 4 },
];

const dayOf = (v) => (v ? String(v).replace('T', ' ').slice(0, 10) : '');
const fuDate = (f) => f.next_followup_date || f.followup_date;
const fuDay = (f) => dayOf(fuDate(f));
const fuTime = (f) => { const v = fuDate(f); return v ? String(v).replace('T', ' ').slice(11, 16) : ''; };
const fuName = (f) => f.lead_name || f.opportunity_name || f.company_name || 'Follow-up';
const fuAction = (f) => [f.followup_type, f.activity].filter(Boolean).join(' · ') || 'Follow-up';
const isPending = (f) => f.status !== 'Done' && f.status !== 'Completed';
const isActiveOpp = (o) => !['Won', 'Lost'].includes(o.stage) && o.status !== 'WON' && o.status !== 'LOST';

export default function Dashboard() {
  const navigate = useNavigate();
  const { leads, opportunities, activities, followUps } = useCrm();
  const [loading, setLoading] = useState(true);
  const TODAY = getTodayISO();
  const def = defaultRange();
  const [fromDate, setFromDate] = useState(def.from);
  const [toDate, setToDate] = useState(def.to);
  const [range, setRange] = useState(def);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const handleSearch = () => {
    setRange({ from: fromDate, to: toDate });
  };

  const handleClear = () => {
    setFromDate('');
    setToDate('');
    setRange({ from: '', to: '' });
  };

  // Apply the date-range window (by record creation date) to the dashboard data.
  const fLeads = useMemo(() => leads.filter((l) => inRange(l.created_at, range)), [leads, range]);
  const fOpps = useMemo(() => opportunities.filter((o) => inRange(o.created_at, range)), [opportunities, range]);
  const fFollowUps = useMemo(() => followUps.filter((f) => inRange(f.created_at, range)), [followUps, range]);

  const kpis = useMemo(() => {
    const totalLeads = fLeads.length;
    const hot = fLeads.filter((l) => l.temperature === 'Hot').length;
    const activeOpps = fOpps.filter(isActiveOpp).length;
    const pipelineValue = fOpps.filter((o) => o.stage !== 'Lost').reduce((a, o) => a + (Number(o.value) || 0), 0);
    const dueFollowUps = fFollowUps.filter((f) => isPending(f) && fuDay(f) === TODAY).length;
    const overdueFollowUps = fFollowUps.filter((f) => isPending(f) && fuDay(f) && fuDay(f) < TODAY).length;
    return { totalLeads, qualified: hot, activeOpps, pipelineValue, dueFollowUps, overdueFollowUps };
  }, [fLeads, fOpps, fFollowUps, TODAY]);

  const todayList = fFollowUps.filter((f) => isPending(f) && fuDay(f) === TODAY).slice(0, 5);
  const overdueList = fFollowUps.filter((f) => isPending(f) && fuDay(f) && fuDay(f) < TODAY).slice(0, 4);
  // All pending follow-ups (overdue, due today, and upcoming), soonest first.
  const pendingList = fFollowUps
    .filter((f) => isPending(f) && fuDay(f))
    .sort((a, b) => (fuDay(a) < fuDay(b) ? -1 : 1))
    .slice(0, 6);

  const pipelineStages = useMemo(() => {
    const openLeads = fLeads.filter((l) => !['Closed', 'Cancelled'].includes(l.closure_status || 'Open')).length;
    const byStage = (s) => fOpps.filter((o) => o.stage === s).length;
    return [
      { name: 'Lead', count: openLeads, color: '#2563eb' },
      { name: 'Qualification', count: byStage('Qualification'), color: '#4f46e5' },
      { name: 'Requirement', count: byStage('Requirement'), color: '#7e22ce' },
      { name: 'Demo', count: byStage('Demo'), color: '#0891b2' },
      { name: 'Proposal', count: byStage('Proposal'), color: '#d97706' },
      { name: 'Won', count: byStage('Won'), color: '#16a34a' },
    ];
  }, [fLeads, fOpps]);

  const sourceData = useMemo(() => {
    const map = {};
    fLeads.forEach((l) => { const s = l.source || 'Direct'; map[s] = (map[s] || 0) + 1; });
    const palette = ['#2563eb', '#4f46e5', '#16a34a', '#d97706', '#0891b2', '#db2777', '#94a3b8'];
    const entries = Object.entries(map).map(([name, value], i) => ({ name, value, color: palette[i % palette.length] }));
    return entries.length ? entries : SOURCE_DATA;
  }, [fLeads]);

  const maxPipeline = Math.max(...pipelineStages.map((s) => s.count));



  return (
    <div className="page">
      <PageHeader
        title="Executive Dashboard"
        subtitle="Good Morning, Rajesh — here's your sales performance overview"
      />

      <div className="d-flex flex-wrap align-items-center gap-3 bg-white p-2 border rounded shadow-sm mb-4" style={{ width: 'fit-content' }}>
        <div className="d-flex align-items-center gap-2">
          <span className="fs-13 fw-6 text-secondary-c">From</span>
          <input type="date" className="form-control form-control-sm" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="fs-13 fw-6 text-secondary-c">To</span>
          <input type="date" className="form-control form-control-sm" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
        <div className="d-flex align-items-center gap-2 border-start ps-3">
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={handleSearch}>
            <i className="bi bi-search" /> Search
          </button>
          <button className="btn btn-light btn-sm d-flex align-items-center gap-2" onClick={handleClear}>
            <i className="bi bi-x-circle" /> Cancel
          </button>
        </div>
      </div>

      {/* KPI grid (6 Cards) */}
      <div className="grid mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon="bi-lightning-charge" iconColor="#2563eb" iconBg="#2563eb15" value={kpis.totalLeads} label="Total Leads" onClick={() => navigate('/leads')} />
            <StatCard icon="bi-shield-check" iconColor="#7e22ce" iconBg="#7e22ce15" value={kpis.qualified} label="Hot Leads" onClick={() => navigate('/leads')} />
            <StatCard icon="bi-graph-up-arrow" iconColor="#0891b2" iconBg="#0891b215" value={kpis.activeOpps} label="Active Opportunities" onClick={() => navigate('/opportunities')} />
            <StatCard icon="bi-calendar-check" iconColor="#d97706" iconBg="#d9770615" value={kpis.dueFollowUps} label="Follow-ups Today" onClick={() => navigate('/activities/followups')} />
            <StatCard icon="bi-exclamation-circle" iconColor="#dc2626" iconBg="#dc262615" value={kpis.overdueFollowUps} label="Overdue Follow-ups" onClick={() => navigate('/activities/followups')} />
          </>
        )}
      </div>

      {/* Charts row 1: Pipeline (Left), Follow-ups (Right) */}
      <div className="grid grid-2 mb-4">
        {/* Sales Pipeline funnel */}
        <div className="surface p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <div className="fw-7 fs-18">Sales Pipeline</div>
              <div className="fs-12 text-muted-c">Opportunities by stage</div>
            </div>
            <button className="btn btn-light btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => navigate('/opportunities')}>View <ArrowRight size={14} /></button>
          </div>
          {loading ? <Skeleton h={220} /> : (
            <div className="d-flex flex-column gap-2">
              {pipelineStages.map((s) => (
                <div key={s.name} className="d-flex align-items-center gap-3">
                  <div style={{ width: 90 }} className="fs-13 fw-6 text-secondary-c text-truncate">{s.name}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ width: `${(s.count / maxPipeline) * 100}%`, minWidth: 44, background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)`, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10, color: '#fff', fontWeight: 700, fontSize: 12.5, transition: 'width 0.5s' }}>
                      {s.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Follow-ups */}
        <div className="surface p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <div className="fw-7 fs-18">Upcoming Follow-ups</div>
              <div className="fs-12 text-muted-c">Your immediate action items</div>
            </div>
            <button className="btn btn-light btn-sm" onClick={() => navigate('/activities/followups')}>All</button>
          </div>
          {loading ? <Skeleton h={220} /> : (
            <div className="d-flex flex-column" style={{ gap: '1px', background: 'var(--border)' }}>
              {pendingList.length === 0 && (
                <div className="bg-white text-center text-muted-c py-5 fs-13"><CalendarCheck size={22} className="d-block mx-auto mb-2 text-secondary-c" />No pending follow-ups 🎉</div>
              )}
              {pendingList.map((f) => {
                const overdue = fuDay(f) < TODAY;
                const today = fuDay(f) === TODAY;
                return (
                  <div key={f.id} className="d-flex align-items-center gap-3 py-2 px-3 bg-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/activities/followups')}>
                    <div style={{ color: overdue ? '#d97706' : today ? '#2563eb' : '#64748b' }}>
                      {overdue ? <AlertCircle size={18} strokeWidth={2} /> : <CalendarCheck size={18} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="fw-6 text-truncate fs-14">{fuName(f)}</div>
                      <div className="fs-12 text-muted-c text-truncate">{fuAction(f)}</div>
                    </div>
                    <div className="text-end">
                      <div className={`fs-12 fw-6 ${overdue ? 'text-danger' : today ? 'text-primary' : 'text-secondary-c'}`}>
                        {overdue ? 'Overdue' : today ? 'Due Today' : fuDay(f)}
                      </div>
                      {fuTime(f) && <div className="fs-11 text-muted-c">{fuTime(f)}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Performance / Revenue */}
      <div className="grid grid-2 mb-4">
        {/* Revenue forecast */}
        <div className="surface p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <div className="fw-7 fs-18">Sales Performance</div>
              <div className="fs-12 text-muted-c">Actual vs forecast (₹ Lakhs)</div>
            </div>
            <div className="d-flex gap-3">
              <span className="fs-12 d-flex align-items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: 3, background: '#2563eb' }} /> Actual</span>
              <span className="fs-12 d-flex align-items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: 3, background: '#c7d7fe' }} /> Forecast</span>
            </div>
          </div>
          {loading ? <Skeleton h={260} /> : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={REVENUE_DATA} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `₹${v}L`} />
                <Area type="monotone" dataKey="forecast" stroke="#94b3f9" strokeWidth={2} strokeDasharray="5 4" fill="none" />
                <Area type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2.5} fill="url(#gA)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Lead Source donut */}
        <div className="surface p-4">
          <div className="mb-2">
            <div className="fw-7 fs-18">Lead Sources</div>
            <div className="fs-12 text-muted-c">Distribution of lead origins</div>
          </div>
          {loading ? <Skeleton h={260} /> : (
            <div className="d-flex align-items-center flex-wrap h-100 pb-4">
              <div style={{ width: 220, height: 220 }}>
                <PieChart width={220} height={220}>
                  <Pie data={sourceData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2} stroke="none">
                    {sourceData.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                {sourceData.map((s) => (
                  <div key={s.name} className="d-flex align-items-center gap-2 mb-2">
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                    <span className="fs-13 text-secondary-c" style={{ flex: 1 }}>{s.name}</span>
                    <span className="fs-13 fw-7">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const tooltipStyle = { borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(23,32,51,0.12)', fontSize: 12 };
const axisTick = { fill: '#94a3b8', fontSize: 12 };
