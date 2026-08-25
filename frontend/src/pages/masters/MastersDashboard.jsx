import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/PageParts';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function MastersDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [distributions, setDistributions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState(null);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [summaryRes, distRes] = await Promise.all([
          apiFetch('/masters/dashboard/summary'),
          apiFetch('/masters/dashboard/distributions')
        ]);
        if (summaryRes.data) setStats(summaryRes.data);
        if (distRes.data) setDistributions(distRes.data);
      } catch (err) {
        toast.error('Dashboard Error', err.message || 'Could not load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [toast]);

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Masters Dashboard" icon="bi-grid-1x2-fill" />
        <div className="d-flex justify-content-center align-items-center mt-5">
          <span className="spinner-border spinner-border-sm text-primary" />
          <span className="ms-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const kpis = stats ? [
    { label: 'Activity Types', count: stats.total_activity_types || 0, icon: 'bi-activity', color: '#3b82f6', slug: 'activity-types' },
    { label: 'Campaigns', count: stats.total_campaigns || 0, icon: 'bi-megaphone', color: '#10b981', slug: 'campaigns' },
    { label: 'Lead Sources', count: stats.total_lead_sources || 0, icon: 'bi-signpost-split', color: '#f59e0b', slug: 'lead-sources' },
    { label: 'Industries', count: stats.total_industries || 0, icon: 'bi-diagram-3', color: '#06b6d4', slug: 'industries' },
    { label: 'Product Categories', count: stats.total_product_categories || 0, icon: 'bi-tags', color: '#8b5cf6', slug: 'product-categories' },
    { label: 'Company Types', count: stats.total_company_types || 0, icon: 'bi-building', color: '#ec4899', slug: 'company-types' },
  ] : [];

  const fetchList = async (title, slug) => {
    if (!slug) return;
    setSelectedList({ title, data: [] });
    setListLoading(true);
    try {
      const res = await apiFetch(`/masters/${slug}`);
      const data = Array.isArray(res) ? res : (res.data || []);
      setSelectedList({ title, data });
    } catch (err) {
      toast.error('Error', err.message || 'Could not load list.');
      setSelectedList(null);
    } finally {
      setListLoading(false);
    }
  };

  const handleBarClick = (data) => {
    if (!data || !data.name) return;
    const map = {
      'Lead Sources': 'lead-sources',
      'Campaigns': 'campaigns',
      'Activity Types': 'activity-types',
      'Priorities': 'priorities',
      'Lead Statuses': 'lead-statuses',
      'Next Actions': 'next-actions',
      'Product Categories': 'product-categories',
      'Company Types': 'company-types',
      'Industries': 'industries'
    };
    const slug = map[data.name];
    if (slug) {
      fetchList(data.name, slug);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Masters Dashboard"
        icon="bi-grid-1x2-fill"
      />

      <div className="grid grid-kpi mt-4 mb-4">
        {kpis.map((stat, idx) => (
          <StatCard
            key={idx}
            icon={stat.icon}
            iconBg={`${stat.color}15`}
            iconColor={stat.color}
            value={stat.count}
            label={stat.label}
            onClick={() => fetchList(stat.label, stat.slug)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>

      {distributions && (
        <div className="row g-4 mb-4">
          <div className="col-lg-12">
            <div className="card h-100 border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                {selectedList || listLoading ? (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="card-title fw-bold mb-0">
                        {selectedList ? `${selectedList.title} List` : 'Loading List...'}
                      </h5>
                      <button className="btn btn-sm btn-light" onClick={() => { setSelectedList(null); setListLoading(false); }}>
                        <i className="bi bi-arrow-left me-1"></i> Back to Chart
                      </button>
                    </div>

                    {listLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                      </div>
                    ) : (
                      <div className="table-responsive" style={{ height: '300px', overflowY: 'auto' }}>
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light sticky-top">
                            <tr>
                              <th scope="col" className="text-secondary fw-semibold">S.No</th>
                              <th scope="col" className="text-secondary fw-semibold">Name</th>
                              <th scope="col" className="text-secondary fw-semibold">Description</th>
                              <th scope="col" className="text-secondary fw-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedList?.data?.length > 0 ? (
                              selectedList.data.map((item, idx) => (
                                <tr key={item.id || idx}>
                                  <td className="text-muted">{idx + 1}</td>
                                  <td className="fw-medium">{item.name || item.title || 'N/A'}</td>
                                  <td className="text-muted">{(item.description && item.description.length > 50) ? item.description.slice(0, 50) + '...' : (item.description || '—')}</td>
                                  <td>
                                    {item.is_active !== undefined ? (
                                      <span className={`badge bg-${item.is_active ? 'success' : 'secondary'} bg-opacity-10 text-${item.is_active ? 'success' : 'secondary'}`}>
                                        {item.is_active ? 'Active' : 'Inactive'}
                                      </span>
                                    ) : '—'}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="text-center text-muted py-4">
                                  No records found for {selectedList?.title}.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <h5 className="card-title fw-bold mb-4">System Configurations Overview</h5>
                    <div style={{ height: '300px' }}>
                      {distributions.master_records && distributions.master_records.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={distributions.master_records} margin={{ bottom: 60, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6c757d', fontSize: 12, angle: -45, textAnchor: 'end'}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6c757d', fontSize: 12}} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              cursor={{ fill: '#f3f4f6' }}
                            />
                            <Bar 
                              dataKey="value" 
                              fill="#3b82f6" 
                              radius={[4, 4, 0, 0]} 
                              name="Total Records" 
                              onClick={handleBarClick}
                              style={{ cursor: 'pointer' }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                          <i className="bi bi-bar-chart text-secondary mb-2" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                          <p className="mb-0">No configuration data available</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
