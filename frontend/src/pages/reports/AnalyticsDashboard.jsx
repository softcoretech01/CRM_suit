import PageHeader from '../../components/common/PageHeader';
import { ReportCard } from '../../components/crm/Workflow';
import { formatINR } from '../../utils/format';

export default function AnalyticsDashboard() {
  return (
    <div className="page">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Insights across sales, marketing, and operations"
        icon="bi-pie-chart"
        actions={
          <div className="d-flex gap-2">
            <select className="form-select bg-white">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
            <button className="btn btn-primary"><i className="bi bi-download" /> Export Report</button>
          </div>
        }
      />

      <div className="mb-4">
        <h6 className="fw-6 mb-3 text-secondary-c text-uppercase fs-13" style={{ letterSpacing: '0.05em' }}>Sales Performance</h6>
        <div className="row g-4">
          <div className="col-md-6 col-lg-3">
            <ReportCard title="Total Revenue" value={formatINR(4250000)} trend={12} icon="bi-currency-rupee" tone="tone-green" />
          </div>
          <div className="col-md-6 col-lg-3">
            <ReportCard title="Win Rate" value="34%" trend={5} icon="bi-trophy" tone="tone-amber" />
          </div>
          <div className="col-md-6 col-lg-3">
            <ReportCard title="New Deals" value="128" trend={-2} icon="bi-briefcase" tone="tone-blue" />
          </div>
          <div className="col-md-6 col-lg-3">
            <ReportCard title="Avg Deal Size" value={formatINR(340000)} trend={8} icon="bi-graph-up-arrow" tone="tone-indigo" />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h6 className="fw-6 mb-3 text-secondary-c text-uppercase fs-13" style={{ letterSpacing: '0.05em' }}>Marketing ROI</h6>
        <div className="row g-4">
          <div className="col-md-6 col-lg-3">
            <ReportCard title="Campaigns Sent" value="45" trend={15} icon="bi-megaphone" tone="tone-purple" />
          </div>
          <div className="col-md-6 col-lg-3">
            <ReportCard title="Avg Open Rate" value="28.4%" trend={3} icon="bi-envelope-open" tone="tone-blue" />
          </div>
          <div className="col-md-6 col-lg-3">
            <ReportCard title="Leads Generated" value="842" trend={24} icon="bi-magnet" tone="tone-amber" />
          </div>
          <div className="col-md-6 col-lg-3">
            <ReportCard title="Cost per Lead" value={formatINR(450)} trend={-12} trendLabel="improvement" icon="bi-cash-coin" tone="tone-green" />
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="bg-white border rounded p-4 h-100">
            <h6 className="fw-6 mb-4">Pipeline by Stage</h6>
            {/* Mock Chart Area */}
            <div className="d-flex flex-column gap-3">
              {[
                { stage: 'Qualification', value: 45, color: 'bg-primary-c' },
                { stage: 'Proposal', value: 30, color: 'bg-info-c' },
                { stage: 'Negotiation', value: 15, color: 'bg-warning-c' },
                { stage: 'Closed Won', value: 10, color: 'bg-success-c' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="d-flex justify-content-between fs-13 mb-1">
                    <span>{item.stage}</span>
                    <span className="fw-6">{item.value}%</span>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div className={`progress-bar ${item.color}`} style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="bg-white border rounded p-4 h-100">
            <h6 className="fw-6 mb-4">Top Performing Products</h6>
            <div className="table-responsive">
              <table className="table table-borderless table-sm align-middle fs-14">
                <tbody>
                  {[
                    { name: 'Manufacturing ERP', revenue: 2450000, share: 45 },
                    { name: 'Hospital Management', revenue: 1800000, share: 30 },
                    { name: 'HRMS Suite', revenue: 850000, share: 15 },
                    { name: 'Custom Dev', revenue: 450000, share: 10 },
                  ].map((item, i) => (
                    <tr key={i} className="border-bottom">
                      <td className="py-2"><div className="fw-6 text-dark">{item.name}</div></td>
                      <td className="py-2 text-end">{formatINR(item.revenue)}</td>
                      <td className="py-2 text-end text-muted-c" style={{ width: 80 }}>{item.share}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
