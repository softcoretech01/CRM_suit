import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Badge, EmptyState } from '../../components/common/Ui';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { PORTALS } from '../../config/portals';

const clone = (o) => JSON.parse(JSON.stringify(o));

export default function Permissions() {
  const { roles, updateRole } = useCrm();
  const toast = useToast();

  const [selectedId, setSelectedId] = useState(roles[0]?.id || null);
  const [matrix, setMatrix] = useState(() => clone(roles[0]?.matrix || {}));
  const [dirty, setDirty] = useState(false);

  const selected = roles.find((r) => r.id === selectedId);

  useEffect(() => {
    if (selected) {
      setMatrix(clone(selected.matrix));
      setDirty(false);
    }
  }, [selectedId, selected]);

  const toggleScreen = (portalId, screenName) => {
    setMatrix((m) => {
      const nm = { ...m };
      nm[portalId] = { ...(nm[portalId] || {}) };
      nm[portalId][screenName] = !nm[portalId][screenName];
      return nm;
    });
    setDirty(true);
  };

  const togglePortal = (portalId, val) => {
    setMatrix((m) => {
      const nm = { ...m };
      if (!nm[portalId]) nm[portalId] = {};
      const portalConfig = PORTALS[portalId];
      portalConfig.nav.forEach(g => {
        g.items.forEach(i => {
          nm[portalId][i.label] = val;
        });
      });
      return nm;
    });
    setDirty(true);
  };

  const setAll = (val) => {
    setMatrix((m) => {
      const nm = { ...m };
      Object.values(PORTALS).forEach(p => {
        if (!nm[p.id]) nm[p.id] = {};
        p.nav.forEach(g => {
          g.items.forEach(i => {
            nm[p.id][i.label] = val;
          });
        });
      });
      return nm;
    });
    setDirty(true);
  };

  const savePermissions = () => {
    if (!selected) return;
    updateRole(selectedId, { matrix });
    setDirty(false);
    toast.success('Permissions saved', `Access matrix for ${selected.name} was updated.`);
  };

  return (
    <div className="page">
      <PageHeader
        title="Permissions"
        icon="bi-ui-checks-grid"
      />

      <div className="row g-3">
        {/* Roles list */}
        <div className="col-12 col-lg-3">
          <div className="surface p-3">
            <div className="fw-7 fs-14 mb-3 px-1">Select Role</div>
            <div className="d-flex flex-column gap-2">
              {roles.map((r) => {
                const active = r.id === selectedId;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className="text-start"
                    style={{
                      border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                      background: active ? 'var(--primary-soft)' : '#fff',
                      borderRadius: 12, padding: '12px 14px', cursor: 'pointer', width: '100%',
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: r.color, flexShrink: 0 }} />
                      <span className="fw-7" style={{ fontSize: 14 }}>{r.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Permission matrix */}
        <div className="col-12 col-lg-9">
          {!selected ? (
            <div className="surface"><EmptyState icon="bi-shield-lock" title="No role selected" message="Select a role to configure its permissions." /></div>
          ) : (
            <div className="surface">
              <div className="d-flex align-items-center flex-wrap gap-3 p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: 12, height: 12, borderRadius: 4, background: selected.color }} />
                <div>
                  <div className="fw-7 fs-16">{selected.name}</div>
                  <div className="fs-12 text-muted-c">{selected.description}</div>
                </div>
                <div className="ms-auto d-flex align-items-center gap-2">
                  <button className="btn btn-light btn-sm" onClick={() => setAll(true)}><i className="bi bi-check2-all" /> Allow All</button>
                  <button className="btn btn-light btn-sm" onClick={() => setAll(false)}><i className="bi bi-x-lg" /> Deny All</button>
                  <button className="btn btn-primary btn-sm" onClick={savePermissions} disabled={!dirty}>
                    <i className="bi bi-save" /> Save Changes
                  </button>
                </div>
              </div>

              <div className="p-4" style={{ overflow: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
                {Object.values(PORTALS).map(portal => {
                  // Check if all items in this portal are checked
                  let allChecked = true;
                  portal.nav.forEach(g => {
                    g.items.forEach(i => {
                      if (!matrix[portal.id]?.[i.label]) allChecked = false;
                    });
                  });

                  return (
                    <div key={portal.id} className="mb-4">
                      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className={`bi ${portal.icon} fs-5`} style={{ color: portal.color }} />
                          <h6 className="m-0 fw-7">{portal.name}</h6>
                        </div>
                        <div className="form-check form-switch m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={allChecked}
                            onChange={(e) => togglePortal(portal.id, e.target.checked)}
                          />
                          <label className="form-check-label fs-13 ms-1 text-muted-c">Select Entire Portal</label>
                        </div>
                      </div>
                      
                      <div className="row g-3">
                        {portal.nav.map((group, idx) => (
                          <div key={idx} className="col-12 col-md-6 col-xl-4">
                            <div className="p-3 border rounded h-100 bg-light">
                              {group.group && <div className="fs-12 fw-7 text-muted-c text-uppercase mb-2">{group.group}</div>}
                              {!group.group && <div className="fs-12 fw-7 text-muted-c text-uppercase mb-2">General</div>}
                              <div className="d-flex flex-column gap-2">
                                {group.items.map(item => (
                                  <div 
                                    key={item.label} 
                                    className="d-flex align-items-center justify-content-between py-1" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toggleScreen(portal.id, item.label);
                                    }}
                                  >
                                    <div className="d-flex align-items-center gap-2">
                                      <i className={`bi ${item.icon} text-secondary-c fs-14`} />
                                      <span className="fs-14 mb-0">{item.label}</span>
                                    </div>
                                    <div className="form-check form-switch m-0" style={{ pointerEvents: 'none' }}>
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={!!matrix[portal.id]?.[item.label]}
                                        readOnly
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
