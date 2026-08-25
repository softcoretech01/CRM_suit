import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import DateRangeBar, { inRange } from '../../components/common/DateRangeBar';
import { Badge, EmptyState, Field, Section } from '../../components/common/Ui';
import { Drawer, ConfirmDialog } from '../../components/common/Overlay';
import ActionIconButton from '../../components/common/ActionIconButton';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';

const truncate = (s, n = 46) => (s && s.length > n ? s.slice(0, n) + '…' : s || '—');

export default function ProductsList() {
  const crm = useCrm();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({});
  const [confirm, setConfirm] = useState(null);
  const [range, setRange] = useState({ from: '', to: '' });
  const filteredProducts = useMemo(() => (crm.products || []).filter((p) => inRange(p.created_at, range)), [crm.products, range]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const openAdd = () => {
    setForm({ category_id: crm.productCategories?.[0]?.id, status: 'Active' });
    setDrawer(true);
  };
  
  const openEdit = (r) => {
    setForm({ ...r });
    setDrawer(true);
  };

  const save = async () => {
    if (!form.name?.trim()) {
      toast.error('Name required', 'Please enter a product name.');
      return;
    }
    try {
      if (form.id) {
        await crm.updateProduct(form.id, form);
        toast.success('Product updated', `${form.name} was saved.`);
      } else {
        await crm.addProduct(form);
        toast.success('Product added', `${form.name} was created.`);
      }
      setDrawer(false);
      setForm({});
    } catch (e) {
      toast.error('Save failed', 'Could not save the record.');
    }
  };

  const doDelete = async (row) => {
    try {
      await crm.deleteProduct(row.id);
      toast.success('Product deleted', `${row.name} was removed.`);
      setConfirm(null);
    } catch (e) {
      toast.error('Delete failed', 'Could not delete the record.');
    }
  };

  const columns = [
    { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
    { key: 'name', label: 'Product Name', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
    { key: 'category', label: 'Category', sortable: true, render: (r) => {
      const cat = crm.productCategories?.find(c => c.id === r.category_id);
      return <Badge tone="tone-indigo">{cat ? cat.name : '—'}</Badge>;
    } },
    { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge tone={r.is_active !== false ? 'tone-green' : 'tone-gray'} dot>{r.is_active !== false ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions', label: 'Action', width: '96px',
      render: (r) => (
        <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <ActionIconButton type="edit" onClick={() => openEdit(r)} />
          <ActionIconButton type="delete" onClick={() => setConfirm(r)} />
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Products"
        subtitle="Manage product catalog"
        icon="bi-box-seam"
        actions={
          <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg" /> Add Product</button>
        }
      />

      <DateRangeBar onApply={setRange} />
      <DataTable
        columns={columns}
        rows={filteredProducts}
        keyField="id"
        loading={loading}
        searchPlaceholder="Search products..."
        searchKeys={['code', 'name', 'category']}
        empty={
          <EmptyState
            icon="bi-box-seam"
            title="No products found"
            message="Add a new product to your catalog."
            action={<button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg" /> Add Product</button>}
          />
        }
      />

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={form.id ? 'Edit Product' : 'Add Product'}
        subtitle={form.id ? `Editing ${form.name}` : 'Create a new product record'}
        icon="bi-box-seam"
        width={520}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setDrawer(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}><i className="bi bi-check-lg" /> Save Product</button>
          </>
        }
      >
        <Section title="Details" icon="bi-pencil-square">
          <div className="row">
            <Field label="Product Name" required col={12}>
              <input className="form-control" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Category" col={6}>
              <select className="form-select" value={form.category_id || ''} onChange={e => setForm({ ...form, category_id: parseInt(e.target.value) })}>
                <option value="">Select Category...</option>
                {crm.productCategories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Status" col={6}>
              <select className="form-select" value={form.is_active !== false ? 'Active' : 'Inactive'} onChange={e => setForm({ ...form, is_active: e.target.value === 'Active' })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Field>
            <Field label="Description" col={12}>
              <textarea className="form-control" rows={3} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>
        </Section>
      </Drawer>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && doDelete(confirm)}
        title="Delete Product?"
        message={confirm ? `This will permanently remove "${confirm.name}" from your catalog.` : ''}
        confirmLabel="Delete"
        tone="danger"
      />
    </div>
  );
}
