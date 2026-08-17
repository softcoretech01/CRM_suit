import { useState } from 'react';

/**
 * Generic drag-and-drop Kanban board.
 * columns: [{ key, label, tone?, meta? }]
 * groupBy(item) -> column key
 * renderCard(item)
 * onMove(item, newColumnKey)
 */
export default function KanbanBoard({ columns, items, groupBy, renderCard, onMove, columnSummary }) {
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);

  const grouped = columns.reduce((acc, c) => {
    acc[c.key] = items.filter((i) => groupBy(i) === c.key);
    return acc;
  }, {});

  return (
    <div className="kanban">
      {columns.map((col) => {
        const colItems = grouped[col.key] || [];
        return (
          <div
            key={col.key}
            className={`kanban-col ${overCol === col.key ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setOverCol(col.key); }}
            onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              setOverCol(null);
              const item = items.find((i) => i.id === dragId);
              if (item && groupBy(item) !== col.key) onMove(item, col.key);
              setDragId(null);
            }}
          >
            <div className="kanban-col-head" style={{ borderBottomColor: col.color || 'var(--border-strong)' }}>
              <span className="d-inline-flex align-items-center gap-2">
                <span style={{ width: 8, height: 8, borderRadius: 3, background: col.color || 'var(--text-muted)' }} />
                {col.label}
              </span>
              <span className="kc-count">{colItems.length}</span>
              {columnSummary && <span className="kc-sum">{columnSummary(colItems, col)}</span>}
            </div>
            <div className="kanban-cards">
              {colItems.map((item) => (
                <div
                  key={item.id}
                  className={`kanban-card ${dragId === item.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={() => setDragId(item.id)}
                  onDragEnd={() => { setDragId(null); setOverCol(null); }}
                >
                  {renderCard(item)}
                </div>
              ))}
              {colItems.length === 0 && (
                <div className="text-center text-muted-c fs-12 py-3" style={{ border: '1px dashed var(--border-strong)', borderRadius: 8 }}>
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
