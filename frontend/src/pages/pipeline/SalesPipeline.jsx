import { useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { MiniStat } from '../../components/common/PageParts';
import { Badge, EmptyState } from '../../components/common/Ui';
import { useCrm } from '../../context/CrmContext';
import { formatINR } from '../../utils/format';

// Vol2 pipeline stages with mock counts that taper down.
// probability = stage win-likelihood; value = total open value in stage.
const STAGES = [
  { key: 'LEAD',          count: 42, value: 21000000, prob: 10, color: '#2563eb' },
  { key: 'QUALIFIED',     count: 31, value: 18600000, prob: 20, color: '#4f46e5' },
  { key: 'FIRST CONTACT', count: 26, value: 15400000, prob: 30, color: '#6366f1' },
  { key: 'REQUIREMENT',   count: 24, value: 14200000, prob: 40, color: '#7e22ce' },
  { key: 'MEETING',       count: 20, value: 12800000, prob: 50, color: '#9333ea' },
  { key: 'DEMO',          count: 18, value: 11200000, prob: 60, color: '#0891b2' },
  { key: 'PROPOSAL',      count: 12, value: 9400000,  prob: 70, color: '#d97706' },
  { key: 'NEGOTIATION',   count: 8,  value: 6800000,  prob: 85, color: '#db2777' },
  { key: 'PO EXPECTED',   count: 5,  value: 4200000,  prob: 95, color: '#0e7490' },
  { key: 'WON',           count: 5,  value: 3800000,  prob: 100, color: '#16a34a' },
];
const LOST = { key: 'LOST', count: 6, value: 3200000, color: '#dc2626' };

const LOSS_REASONS = ['Price', 'Competitor', 'Budget', 'Postponed', 'No Response'];

export default function SalesPipeline() {
  const crm = useCrm();

  const maxCount = Math.max(...STAGES.map((s) => s.count));

  const kpis = useMemo(() => {
    const open = crm.opportunities.filter((o) => o.stage !== 'Lost');
    const totalValue = open.reduce((a, o) => a + (o.value || 0), 0);
    const weighted = open.reduce((a, o) => a + ((o.value || 0) * (o.probability || 0)) / 100, 0);
    const won = crm.opportunities.filter((o) => o.stage === 'Won').length;
    const conversion = crm.opportunities.length ? Math.round((won / crm.opportunities.length) * 100) : 0;
    const avg = open.length ? Math.round(totalValue / open.length) : 0;
    return { totalValue, weighted, conversion, avg };
  }, [crm.opportunities]);

  // Lost opportunities: any Lost-stage opp or any opp carrying a lossReason.
  const lostOpps = useMemo(() => {
    let list = crm.opportunities.filter((o) => o.stage === 'Lost' || o.lossReason);
    if (list.length === 0) {
      // representative fallback so the panel is never empty in the prototype
      list = [
        { id: 'LOST-1', company: 'Kovai Engineering Works', value: 1500000, lossReason: 'Price' },
        { id: 'LOST-2', company: 'Windward Power Systems', value: 2100000, lossReason: 'Competitor' },
        { id: 'LOST-3', company: 'Nova Rentals & Equipment', value: 900000, lossReason: 'Postponed' },
        { id: 'LOST-4', company: 'Malabar Spices Exports', value: 1200000, lossReason: 'No Response' },
      ];
    }
    return list.map((o) => ({
      ...o,
      lossReason: o.lossReason && LOSS_REASONS.includes(o.lossReason) ? o.lossReason : 'Budget',
    }));
  }, [crm.opportunities]);

  return (
    <div className="page">
      <PageHeader
        title="Sales Pipeline"
        subtitle="Conversion funnel across every deal stage"
        icon="bi-funnel-fill"
      />

      {/* KPI strip */}
      <div className="grid grid-kpi mb-4">
        <MiniStat value={formatINR(kpis.totalValue)} label="Total Pipeline Value" tone="var(--primary)" />
        <MiniStat value={formatINR(kpis.weighted)} label="Weighted Value" tone="var(--success)" />
        <MiniStat value={`${kpis.conversion}%`} label="Overall Conversion" tone="#7e22ce" />
        <MiniStat value={formatINR(kpis.avg)} label="Avg Deal Size" tone="var(--warning)" />
      </div>

      {/* Funnel */}
      <div className="surface p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <div className="fw-7" style={{ fontSize: 18 }}>Conversion Funnel</div>
            <div className="fs-12 text-muted-c">Opportunities, value & stage conversion</div>
          </div>
          <Badge tone="tone-green">Won {STAGES[STAGES.length - 1].count}</Badge>
        </div>

        <div className="d-flex flex-column gap-2">
          {STAGES.map((s, i) => {
            const next = STAGES[i + 1];
            const conv = next ? Math.round((next.count / s.count) * 100) : null;
            const widthPct = (s.count / maxCount) * 100;
            return (
              <div key={s.key} className="d-flex align-items-center gap-3" style={{ flexWrap: 'nowrap' }}>
                {/* stage label */}
                <div style={{ width: 128, flexShrink: 0 }} className="fs-12 fw-7 text-secondary-c text-truncate" title={s.key}>{s.key}</div>

                {/* bar */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      style={{
                        width: `${widthPct}%`, minWidth: 120, height: 34, borderRadius: 8,
                        background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0 12px', color: '#fff', transition: 'width 0.5s', boxShadow: 'var(--shadow-xs)',
                      }}
                    >
                      <span className="fw-8" style={{ fontSize: 14 }}>{s.count}</span>
                      <span className="fw-7" style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>{formatINR(s.value)}</span>
                    </div>
                  </div>
                </div>

                {/* probability + conversion */}
                <div style={{ width: 150, flexShrink: 0 }} className="d-flex align-items-center gap-2 justify-content-end">
                  <Badge tone="tone-gray">{s.prob}% win</Badge>
                  {conv != null
                    ? <span className="fs-12 text-muted-c" title="Conversion to next stage"><i className="bi bi-arrow-down-short" />{conv}%</span>
                    : <span className="fs-12" style={{ color: 'var(--success)' }}><i className="bi bi-trophy" /></span>}
                </div>
              </div>
            );
          })}

          {/* Lost row */}
          <div className="d-flex align-items-center gap-3 mt-2 pt-3" style={{ borderTop: '1px dashed var(--border)' }}>
            <div style={{ width: 128, flexShrink: 0, color: LOST.color }} className="fs-12 fw-7 text-truncate" title="LOST">
              {LOST.key}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  width: `${(LOST.count / maxCount) * 100}%`, minWidth: 120, height: 34, borderRadius: 8,
                  background: `repeating-linear-gradient(45deg, ${LOST.color}22, ${LOST.color}22 8px, ${LOST.color}33 8px, ${LOST.color}33 16px)`,
                  border: `1px solid ${LOST.color}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0 12px', color: LOST.color,
                }}
              >
                <span className="fw-8" style={{ fontSize: 14 }}>{LOST.count}</span>
                <span className="fw-7" style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>{formatINR(LOST.value)}</span>
              </div>
            </div>
            <div style={{ width: 150, flexShrink: 0 }} className="d-flex justify-content-end">
              <Badge tone="tone-red">Closed lost</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Lost opportunities */}
      <div className="surface p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <div className="fw-7" style={{ fontSize: 18 }}>Lost Opportunities</div>
            <div className="fs-12 text-muted-c">Deals that did not convert — with loss reasons</div>
          </div>
          <Badge tone="tone-red">{lostOpps.length}</Badge>
        </div>

        {lostOpps.length === 0 ? (
          <EmptyState icon="bi-emoji-smile" title="No lost deals" message="Every opportunity is still in play." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dt" style={{ minWidth: 520 }}>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Opportunity</th>
                  <th>Value</th>
                  <th>Loss Reason</th>
                </tr>
              </thead>
              <tbody>
                {lostOpps.map((o) => (
                  <tr key={o.id}>
                    <td className="fw-6">{o.company}</td>
                    <td className="text-secondary-c">{o.name || '—'}</td>
                    <td className="mono fw-6">{formatINR(o.value)}</td>
                    <td><Badge tone="tone-red">{o.lossReason}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
