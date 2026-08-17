import { formatINR } from '../../utils/format';
import { Card } from '../common/Ui';

export function QuotationStatusBadge({ status }) {
  let color = 'tone-gray';
  switch (status) {
    case 'Draft': color = 'tone-gray'; break;
    case 'Pending Approval': color = 'tone-amber'; break;
    case 'Approved': color = 'tone-green'; break;
    case 'Rejected': color = 'tone-red'; break;
    case 'Sent': color = 'tone-blue'; break;
    case 'Accepted': color = 'tone-teal'; break;
    case 'Declined': color = 'tone-red'; break;
    case 'Expired': color = 'tone-gray text-muted-c'; break;
  }
  return <span className={`badge-pill ${color}`}>{status}</span>;
}

export function QuotationTable({ items = [], onAdd, onRemove, onUpdate, readOnly = false }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>Product & Description</th>
            <th style={{ width: 80 }}>Qty</th>
            <th style={{ width: 120 }}>Unit Price</th>
            <th style={{ width: 100 }}>Disc (%)</th>
            <th style={{ width: 100 }}>Tax (%)</th>
            <th style={{ width: 130, textAlign: 'right' }}>Total</th>
            {!readOnly && <th style={{ width: 50 }}></th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>
                <div className="fw-6">{item.name}</div>
                <div className="fs-12 text-muted-c">{item.description}</div>
              </td>
              <td>{readOnly ? item.qty : <input type="number" className="form-control form-control-sm" value={item.qty} onChange={(e) => onUpdate(idx, 'qty', e.target.value)} />}</td>
              <td>{readOnly ? formatINR(item.price) : <input type="number" className="form-control form-control-sm" value={item.price} onChange={(e) => onUpdate(idx, 'price', e.target.value)} />}</td>
              <td>{readOnly ? item.discountPercent : <input type="number" className="form-control form-control-sm" value={item.discountPercent} onChange={(e) => onUpdate(idx, 'discountPercent', e.target.value)} />}</td>
              <td>{readOnly ? item.taxPercent : <input type="number" className="form-control form-control-sm" value={item.taxPercent} onChange={(e) => onUpdate(idx, 'taxPercent', e.target.value)} />}</td>
              <td className="text-end fw-6">{formatINR(item.total)}</td>
              {!readOnly && (
                <td>
                  <button className="icon-btn text-danger-c" onClick={() => onRemove(idx)}><i className="bi bi-trash" /></button>
                </td>
              )}
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={readOnly ? 7 : 8} className="text-center text-muted-c py-4">No items added to this quotation.</td>
            </tr>
          )}
        </tbody>
      </table>
      {!readOnly && (
        <div className="p-3 border-top bg-light">
          <button className="btn btn-sm btn-outline-primary" onClick={onAdd}><i className="bi bi-plus-lg" /> Add Line Item</button>
        </div>
      )}
    </div>
  );
}

export function QuotationSummary({ amount, discount, tax, total, remarks, terms, delivery }) {
  return (
    <div className="row g-4 mt-2">
      <div className="col-lg-7">
        <div className="mb-3">
          <label className="form-label fs-12 text-muted-c">Remarks / Note to Customer</label>
          <div className="p-2 bg-light rounded text-secondary-c fs-13">{remarks || '—'}</div>
        </div>
        <div className="mb-3">
          <label className="form-label fs-12 text-muted-c">Payment Terms</label>
          <div className="p-2 bg-light rounded text-secondary-c fs-13">{terms || '—'}</div>
        </div>
        <div>
          <label className="form-label fs-12 text-muted-c">Delivery Timeline</label>
          <div className="p-2 bg-light rounded text-secondary-c fs-13">{delivery || '—'}</div>
        </div>
      </div>
      <div className="col-lg-5">
        <Card className="bg-light border-0 shadow-none">
          <div className="d-flex justify-content-between mb-2 fs-14">
            <span className="text-muted-c">Gross Amount</span>
            <span className="fw-6">{formatINR(amount)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2 fs-14 text-danger-c">
            <span>Discount</span>
            <span>- {formatINR(discount)}</span>
          </div>
          <div className="d-flex justify-content-between mb-3 fs-14">
            <span className="text-muted-c">Tax Amount</span>
            <span className="fw-6">{formatINR(tax)}</span>
          </div>
          <div className="pt-3 border-top d-flex justify-content-between align-items-center">
            <span className="fw-7">Grand Total</span>
            <span className="fs-18 fw-7 text-primary-c">{formatINR(total)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function RevisionTimeline({ timeline = [] }) {
  if (!timeline.length) return <div className="text-muted-c fs-13 p-3">No history available.</div>;
  return (
    <div className="timeline-container px-3 pt-3">
      {timeline.map((item, i) => (
        <div className="d-flex mb-3" key={i}>
          <div className="me-3 text-end" style={{ width: 120 }}>
            <div className="fs-12 text-muted-c">{item.date.split(' ')[0]}</div>
            <div className="fs-11 text-secondary-c">{item.date.split(' ')[1] || ''}</div>
          </div>
          <div className="position-relative">
            <div className="rounded-circle bg-primary-c" style={{ width: 10, height: 10, marginTop: 4 }}></div>
            {i < timeline.length - 1 && <div className="position-absolute bg-border" style={{ top: 14, bottom: -16, left: 4, width: 2 }}></div>}
          </div>
          <div className="ms-3 fs-13" style={{ flex: 1 }}>{item.text}</div>
        </div>
      ))}
    </div>
  );
}
