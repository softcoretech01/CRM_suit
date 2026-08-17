import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import { formatINR } from '../../utils/format';

export default function GlobalSearch() {
  const { leads, companies, contacts, opportunities, quotations, proposals, documents, emailCampaigns } = useCrm();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); setOpen(true); }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, []);

  const query = q.toLowerCase().trim();
  const match = (s) => String(s || '').toLowerCase().includes(query);

  const results = query
    ? {
        Leads: leads.filter((l) => match(l.company) || match(l.number) || match(l.contact)).slice(0, 4),
        Companies: companies.filter((c) => match(c.name) || match(c.code)).slice(0, 4),
        Contacts: contacts.filter((c) => match(c.name) || match(c.email)).slice(0, 4),
        Opportunities: opportunities.filter((o) => match(o.name) || match(o.company)).slice(0, 4),
        Quotations: quotations.filter((q) => match(q.number) || match(q.company)).slice(0, 4),
        Proposals: proposals.filter((p) => match(p.name) || match(p.number)).slice(0, 4),
        Documents: documents.filter((d) => match(d.name) || match(d.number)).slice(0, 4),
        Campaigns: emailCampaigns.filter((c) => match(c.name) || match(c.code)).slice(0, 4),
      }
    : null;

  const total = results ? Object.values(results).reduce((a, r) => a + r.length, 0) : 0;

  const go = (path) => { setOpen(false); setQ(''); navigate(path); };

  return (
    <div className="global-search" ref={ref}>
      <i className="bi bi-search si" />
      <input
        ref={inputRef}
        type="search"
        name="global-search"
        autoComplete="off"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search CRM..."
        aria-label="Global search"
      />
      <kbd>Ctrl K</kbd>
      {open && query && (
        <div className="pop" style={{ left: 0, right: 0, width: 380, maxHeight: 420, overflowY: 'auto' }}>
          {total === 0 ? (
            <div className="p-4 text-center text-muted-c fs-13">
              <i className="bi bi-search d-block mb-2" style={{ fontSize: 22 }} />
              No results for “{q}”
            </div>
          ) : (
            <>
              <ResultGroup label="LEADS" icon="bi-lightning-charge" tone="tone-amber" items={results.Leads}
                render={(l) => ({ title: l.company, sub: `${l.number} · ${formatINR(l.value)}`, path: `/leads/${l.id}` })} onGo={go} />
              <ResultGroup label="COMPANIES" icon="bi-building" tone="tone-blue" items={results.Companies}
                render={(c) => ({ title: c.name, sub: `${c.industry} · ${c.city}`, path: `/companies/${c.id}` })} onGo={go} />
              <ResultGroup label="CONTACTS" icon="bi-person" tone="tone-teal" items={results.Contacts}
                render={(c) => ({ title: c.name, sub: `${c.designation} · ${c.company}`, path: `/contacts/${c.id}` })} onGo={go} />
              <ResultGroup label="OPPORTUNITIES" icon="bi-graph-up-arrow" tone="tone-green" items={results.Opportunities}
                render={(o) => ({ title: o.name, sub: `${o.company} · ${formatINR(o.value)}`, path: `/opportunities/${o.id}` })} onGo={go} />
              <ResultGroup label="QUOTATIONS" icon="bi-receipt" tone="tone-blue" items={results.Quotations}
                render={(q) => ({ title: q.number, sub: `${q.company} · ${formatINR(q.total)}`, path: `/quotations/${q.id}` })} onGo={go} />
              <ResultGroup label="PROPOSALS" icon="bi-file-earmark-check" tone="tone-indigo" items={results.Proposals}
                render={(p) => ({ title: p.name, sub: p.number, path: `/proposals/${p.id}` })} onGo={go} />
              <ResultGroup label="DOCUMENTS" icon="bi-file-text" tone="tone-gray" items={results.Documents}
                render={(d) => ({ title: d.name, sub: `${d.type} · ${d.company}`, path: `/documents` })} onGo={go} />
              <ResultGroup label="CAMPAIGNS" icon="bi-megaphone" tone="tone-amber" items={results.Campaigns}
                render={(c) => ({ title: c.name, sub: c.code, path: `/email-campaigns/${c.id}` })} onGo={go} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({ label, icon, tone, items, render, onGo }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="fs-11 fw-7 text-muted-c" style={{ padding: '10px 16px 4px', letterSpacing: '0.08em' }}>{label}</div>
      {items.map((it) => {
        const r = render(it);
        return (
          <button key={it.id} className="pop-item" onClick={() => onGo(r.path)}>
            <span className={`badge-pill ${tone}`} style={{ padding: 6 }}><i className={`bi ${icon}`} /></span>
            <span style={{ minWidth: 0 }}>
              <div className="fw-6 text-truncate">{r.title}</div>
              <div className="fs-12 text-muted-c text-truncate">{r.sub}</div>
            </span>
          </button>
        );
      })}
    </div>
  );
}
