import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/PageParts';
import {
  products, industries, leadSources, campaigns, activityTypes,
  leadStatuses, leadTemperatures, nextActions, priorities,
  countries, states, cities
} from '../../data/mockData';

export default function MastersDashboard() {
  const navigate = useNavigate();
  const masterCards = [
    { label: 'Products', count: products?.length || 0, icon: 'bi-box-seam-fill', color: '#3b82f6', link: '/masters/products', trend: '12%', up: true },
    { label: 'Industries', count: industries?.length || 0, icon: 'bi-diagram-3-fill', color: '#10b981', link: '/masters/industries', trend: '4%', up: true },
    { label: 'Lead Sources', count: leadSources?.length || 0, icon: 'bi-signpost-split-fill', color: '#f59e0b', link: '/masters/lead-sources', trend: '2%', up: false },
    { label: 'Campaigns', count: campaigns?.length || 0, icon: 'bi-megaphone-fill', color: '#ef4444', link: '/masters/campaigns', trend: '18%', up: true },
    { label: 'Activity Types', count: activityTypes?.length || 0, icon: 'bi-list-check', color: '#0ea5e9', link: '/masters/activity-types', trend: '0%', up: true },
    { label: 'Lead Statuses', count: leadStatuses?.length || 0, icon: 'bi-flag-fill', color: '#8b5cf6', link: '/masters/lead-status', trend: '1%', up: false },
    { label: 'Lead Temp.', count: leadTemperatures?.length || 0, icon: 'bi-thermometer-half', color: '#f43f5e', link: '/masters/lead-temperature', trend: '5%', up: true },
    { label: 'Next Actions', count: nextActions?.length || 0, icon: 'bi-arrow-right-circle-fill', color: '#14b8a6', link: '/masters/next-actions', trend: '3%', up: true },
    { label: 'Priorities', count: priorities?.length || 0, icon: 'bi-exclamation-diamond-fill', color: '#d946ef', link: '/masters/priorities', trend: '0%', up: true },
    { label: 'Countries', count: countries?.length || 0, icon: 'bi-globe-americas', color: '#6366f1', link: '/masters/countries', trend: '8%', up: true },
    { label: 'States', count: states?.length || 0, icon: 'bi-map', color: '#06b6d4', link: '/masters/states', trend: '2%', up: false },
    { label: 'Cities', count: cities?.length || 0, icon: 'bi-geo-alt-fill', color: '#ec4899', link: '/masters/cities', trend: '14%', up: true },
  ];

  const regionData = [
    { name: 'Countries', value: countries?.length || 0, color: '#6366f1' },
    { name: 'States', value: states?.length || 0, color: '#06b6d4' },
    { name: 'Cities', value: cities?.length || 0, color: '#ec4899' }
  ];

  const tooltipStyle = { borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(23,32,51,0.12)', fontSize: 12 };
  const axisTick = { fill: '#94a3b8', fontSize: 12 };

  return (
    <div className="page">
      <PageHeader
        title="Masters Dashboard"
        icon="bi-grid-1x2-fill"
      />
      
      <div className="grid grid-kpi mt-4 mb-4">
        {masterCards.map((stat, idx) => (
          <StatCard
            key={idx}
            icon={stat.icon}
            iconBg={`${stat.color}15`}
            iconColor={stat.color}
            value={stat.count}
            label={stat.label}
            trend={stat.trend !== '0%' ? stat.trend : null}
            trendUp={stat.up}
            onClick={() => navigate(stat.link)}
          />
        ))}
      </div>

      <div className="grid grid-2 mb-4">
        {/* Master Configuration Volume */}
        <div className="surface p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <div className="fw-7 fs-18">Master Configuration Volume</div>
              <div className="fs-12 text-muted-c">Number of records per master</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={masterCards} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => v.split(' ')[0]} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {masterCards.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Regional Data Distribution */}
        <div className="surface p-4">
          <div className="mb-2">
            <div className="fw-7 fs-18">Regional Master Distribution</div>
            <div className="fs-12 text-muted-c">Breakdown of geographic records</div>
          </div>
          <div className="d-flex align-items-center h-100 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={regionData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2} stroke="none">
                  {regionData.map((e, index) => <Cell key={index} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
