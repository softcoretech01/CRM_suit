import { useState } from 'react';
import { Card } from '../common/Ui';

export function ProposalEditor({ sections = [], onUpdate, activeSection, setActiveSection }) {
  const current = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <div className="d-flex" style={{ minHeight: 600, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ width: 220, borderRight: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div className="p-3 fs-12 fw-7 text-muted-c text-uppercase">Sections</div>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className="w-100 text-start px-3 py-2 border-0"
            style={{
              background: activeSection === s.id ? 'var(--card-bg)' : 'transparent',
              color: activeSection === s.id ? 'var(--primary)' : 'inherit',
              borderLeft: activeSection === s.id ? '3px solid var(--primary)' : '3px solid transparent',
              fontSize: 13,
            }}
          >
            {s.title}
          </button>
        ))}
      </div>
      <div className="flex-grow-1 bg-white p-4">
        {current ? (
          <div>
            <h4 className="mb-4">{current.title}</h4>
            <textarea
              className="form-control"
              style={{ minHeight: 400, fontSize: 14, lineHeight: 1.6 }}
              value={current.content}
              onChange={(e) => onUpdate(current.id, e.target.value)}
              placeholder={`Enter content for ${current.title}...`}
            />
          </div>
        ) : (
          <div className="text-muted-c">Select a section to edit</div>
        )}
      </div>
    </div>
  );
}

export function ProposalPreview({ proposal, sections = [] }) {
  return (
    <div
      style={{
        maxWidth: 800,
        margin: '0 auto',
        background: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        minHeight: 1122, // A4 aspect approx
        padding: '60px 80px',
        color: '#333',
      }}
    >
      <div className="border-bottom pb-4 mb-5 text-center">
        <h2 className="fw-7 text-primary-c mb-2">{proposal.name}</h2>
        <div className="fs-18 text-secondary-c mb-4">Prepared for {proposal.company}</div>
        <div className="d-flex justify-content-between text-muted-c fs-13">
          <span>Proposal No: <strong>{proposal.number}</strong></span>
          <span>Date: <strong>{proposal.date}</strong></span>
        </div>
      </div>

      {sections.map((s) => (
        <div key={s.id} className="mb-5" id={`section-${s.id}`}>
          <h4 className="border-bottom pb-2 mb-3 text-secondary-c">{s.title}</h4>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 14 }}>
            {s.content || <span className="text-muted">No content provided for this section.</span>}
          </div>
        </div>
      ))}

      <div className="mt-5 pt-5 border-top">
        <div className="row">
          <div className="col-6">
            <div className="fs-12 text-muted-c mb-4">Prepared By:</div>
            <div className="fw-6">{proposal.createdBy}</div>
            <div className="fs-13 text-muted-c">Techspire Solutions</div>
          </div>
          <div className="col-6 text-end">
            <div className="fs-12 text-muted-c mb-4">Accepted By:</div>
            <div className="fw-6">_____________________</div>
            <div className="fs-13 text-muted-c mt-1">{proposal.company}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
