import { useState, useMemo, useEffect, useCallback } from 'react';
import { EmptyState, TableSkeleton } from './Ui';

/**
 * Reusable enterprise DataTable
 * columns: [{ key, label, render?(row), sortable?, width?, className?, accessor?(row) }]
 */
export default function DataTable({
  columns,
  rows,
  loading = false,
  keyField = 'id',
  onRowClick,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys,
  toolbarActions,
  filters,
  pageSize: initialPageSize = 10,
  selectable = false,
  bulkActions,
  empty,
  onRefresh,
  compact = false,
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selected, setSelected] = useState(new Set());

  const filtered = useMemo(() => {
    let out = rows;
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((r) => {
        let matched = false;
        if (searchKeys && searchKeys.length > 0) {
          matched = searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q));
        }
        if (!matched) {
          matched = columns.some((c) => {
            if (c.key === '_act') return false; // skip actions column
            const val = c.accessor ? c.accessor(r) : r[c.key];
            return String(val ?? '').toLowerCase().includes(q);
          });
        }
        return matched;
      });
    }
    if (sort.key) {
      const col = columns.find((c) => c.key === sort.key);
      out = [...out].sort((a, b) => {
        const av = col?.accessor ? col.accessor(a) : a[sort.key];
        const bv = col?.accessor ? col.accessor(b) : b[sort.key];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sort.dir === 'asc' ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, query, sort, columns, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  };

  const allChecked = paged.length > 0 && paged.every((r) => selected.has(r[keyField]));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) paged.forEach((r) => next.delete(r[keyField]));
    else paged.forEach((r) => next.add(r[keyField]));
    setSelected(next);
  };
  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const exportCsv = useCallback(() => {
    const header = columns.map((c) => c.label).join(',');
    const body = filtered
      .map((r) => columns.map((c) => `"${String(c.accessor ? c.accessor(r) : r[c.key] ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [columns, filtered]);

  useEffect(() => {
    const handleExport = () => exportCsv();
    document.addEventListener('export-csv', handleExport);
    return () => document.removeEventListener('export-csv', handleExport);
  }, [exportCsv]);

  return (
    <div className="surface">
      {/* Toolbar */}
      <div className="toolbar" style={{ margin: 0, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        {searchable && (
          <div className="search-input">
            <i className="bi bi-search" />
            <input 
              type="search"
              name="dt-search"
              autoComplete="off"
              value={query} 
              onChange={(e) => { setQuery(e.target.value); setPage(1); }} 
              placeholder={searchPlaceholder} 
            />
          </div>
        )}
        {filters}
        <div className="d-flex align-items-center gap-2 ms-auto">
          {selectable && selected.size > 0 && bulkActions && (
            <div className="d-flex align-items-center gap-2 me-2">
              <span className="fs-12 text-secondary-c fw-6">{selected.size} selected</span>
              {bulkActions(Array.from(selected), () => setSelected(new Set()))}
            </div>
          )}
          {toolbarActions}
          <button className="btn btn-outline-success btn-sm d-flex align-items-center gap-2" onClick={exportCsv} title="Export to CSV">
            <i className="bi bi-upload" /> Export
          </button>
          {onRefresh && (
            <button className="btn btn-light btn-sm" onClick={onRefresh} title="Refresh"><i className="bi bi-arrow-clockwise" /></button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="dt-wrap">
        {loading ? (
          <TableSkeleton cols={columns.length} />
        ) : filtered.length === 0 ? (
          empty || <EmptyState icon="bi-inbox" title="No records found" message="Try adjusting your search or filters." />
        ) : (
          <table className="dt">
            <thead>
              <tr>
                {selectable && (
                  <th style={{ width: 44 }}>
                    <input type="checkbox" className="form-check-input" checked={allChecked} onChange={toggleAll} aria-label="Select all" />
                  </th>
                )}
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={c.sortable ? 'sortable' : ''}
                    style={{ width: c.width, textAlign: c.key === 'actions' ? 'center' : undefined }}
                    onClick={c.sortable ? () => toggleSort(c.key) : undefined}
                  >
                    <span className={`d-inline-flex align-items-center gap-1 ${c.key === 'actions' ? 'w-100 justify-content-center' : ''}`}>
                      {c.label}
                      {c.sortable && (
                        <i className={`bi ${sort.key === c.key ? (sort.dir === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down') : 'bi-arrow-down-up'}`}
                          style={{ fontSize: 11, opacity: sort.key === c.key ? 1 : 0.4 }} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((r, rowIndex) => {
                const globalIndex = (safePage - 1) * pageSize + rowIndex + 1;
                return (
                <tr
                  key={r[keyField]}
                  className={onRowClick ? 'dt-linkrow' : ''}
                  onClick={onRowClick ? (e) => { if (e.target.type !== 'checkbox') onRowClick(r); } : undefined}
                >
                  {selectable && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="form-check-input" checked={selected.has(r[keyField])} onChange={() => toggleOne(r[keyField])} aria-label="Select row" />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={c.className} style={{ padding: compact ? '9px 16px' : undefined }}>
                      {c.render ? c.render(r, globalIndex) : r[c.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>

      {/* Pager */}
      {!loading && filtered.length > 0 && (
        <div className="pager" style={{ borderTop: '1px solid var(--border)', justifyContent: 'space-between' }}>
          <div className="d-flex align-items-center gap-2 fs-13 text-secondary-c">
            <span>Rows</span>
            <select className="form-select form-select-sm" style={{ width: 72 }} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="d-none d-sm-inline">
              {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
            </span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <button className="pg-btn" disabled={safePage === 1} onClick={() => setPage(1)}><i className="bi bi-chevron-double-left" /></button>
            <button className="pg-btn" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}><i className="bi bi-chevron-left" /></button>
            {Array.from({ length: totalPages }).slice(Math.max(0, safePage - 3), safePage + 2).map((_, i, arr) => {
              const p = Math.max(0, safePage - 3) + i + 1;
              if (p > totalPages) return null;
              return (
                <button key={p} className={`pg-btn ${p === safePage ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              );
            })}
            <button className="pg-btn" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}><i className="bi bi-chevron-right" /></button>
            <button className="pg-btn" disabled={safePage === totalPages} onClick={() => setPage(totalPages)}><i className="bi bi-chevron-double-right" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
