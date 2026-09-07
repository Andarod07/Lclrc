import { useState } from 'react';
import { PLC_ENDPOINT } from './config';
import './PlcForm.css';

const emptyTag = { address: '', equipment: '', metric: '', unit: '' };

export default function PlcForm() {
  const [form, setForm] = useState({
    id: '',
    plant: '',
    area: '',
    line: '',
    ip: '',
    slot: 0,
    pollIntervalMs: 2000,
    enabled: true,
  });

  const [tags, setTags] = useState([{ ...emptyTag }]);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateTag = (index, field, value) => {
    setTags(prev =>
      prev.map((tag, i) => (i === index ? { ...tag, [field]: value } : tag))
    );
  };

  const addTag = () => setTags(prev => [...prev, { ...emptyTag }]);
  const removeTag = (index) => setTags(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);

    const payload = {
      id: form.id,
      plant: form.plant,
      area: form.area,
      line: form.line,
      connection: { ip: form.ip, slot: Number(form.slot) },
      pollIntervalMs: Number(form.pollIntervalMs),
      tags: tags.map(t => ({ ...t, unit: t.unit || null })),
      enabled: form.enabled,
    };

    try {
      const res = await fetch(PLC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      setStatus({ type: 'success', message: 'PLC saved successfully' });
      setForm({ id: '', plant: '', area: '', line: '', ip: '', slot: 0, pollIntervalMs: 2000, enabled: true });
      setTags([{ ...emptyTag }]);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-inner">
        <header className="page-header">
          <div className="brand">
            <div className="brand-icon">⚙</div>
            <div>
              <h1 className="brand-title">PLC Registry</h1>
              <p className="brand-subtitle">Configure devices for the ingestion pipeline</p>
            </div>
          </div>
        </header>

        <form className="plc-form" onSubmit={handleSubmit}>
          <div className="section">
            <div className="section-heading">
              <span className="section-number">1</span>
              <h2 className="section-title">Identification</h2>
            </div>
            <div className="grid grid-2">
              <div className="field">
                <label>PLC ID</label>
                <input placeholder="PLC_001" value={form.id} onChange={e => updateField('id', e.target.value)} required />
              </div>
              <div className="field">
                <label>Plant</label>
                <input placeholder="Plant_01" value={form.plant} onChange={e => updateField('plant', e.target.value)} required />
              </div>
              <div className="field">
                <label>Area</label>
                <input placeholder="Area_A" value={form.area} onChange={e => updateField('area', e.target.value)} required />
              </div>
              <div className="field">
                <label>Line</label>
                <input placeholder="Line_01" value={form.line} onChange={e => updateField('line', e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-heading">
              <span className="section-number">2</span>
              <h2 className="section-title">Connection</h2>
            </div>
            <div className="grid grid-3">
              <div className="field">
                <label>IP address</label>
                <input placeholder="192.168.1.10" value={form.ip} onChange={e => updateField('ip', e.target.value)} required />
              </div>
              <div className="field">
                <label>Slot</label>
                <input type="number" value={form.slot} onChange={e => updateField('slot', e.target.value)} />
              </div>
              <div className="field">
                <label>Poll interval (ms)</label>
                <input type="number" value={form.pollIntervalMs} onChange={e => updateField('pollIntervalMs', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-heading section-heading-row">
              <div className="section-heading">
                <span className="section-number">3</span>
                <h2 className="section-title">Tags</h2>
                <span className="tag-count">{tags.length}</span>
              </div>
              <button type="button" className="btn btn-secondary" onClick={addTag}>
                <span className="btn-icon">+</span> Add Tag
              </button>
            </div>

            <div className="tags-list">
              {tags.map((tag, index) => (
                <div key={index} className="tag-card">
                  <div className="tag-card-index">{index + 1}</div>
                  <div className="grid grid-4">
                    <div className="field">
                      <label>Address</label>
                      <input placeholder="Motor1_Temp" value={tag.address} onChange={e => updateTag(index, 'address', e.target.value)} required />
                    </div>
                    <div className="field">
                      <label>Equipment</label>
                      <input placeholder="Motor_01" value={tag.equipment} onChange={e => updateTag(index, 'equipment', e.target.value)} required />
                    </div>
                    <div className="field">
                      <label>Metric</label>
                      <input placeholder="temperature" value={tag.metric} onChange={e => updateTag(index, 'metric', e.target.value)} required />
                    </div>
                    <div className="field">
                      <label>Unit</label>
                      <input placeholder="°C" value={tag.unit} onChange={e => updateTag(index, 'unit', e.target.value)} />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeTag(index)}
                    disabled={tags.length === 1}
                    title={tags.length === 1 ? "At least one tag is required" : "Remove tag"}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="section section-last">
            <label className={`toggle-row ${form.enabled ? 'is-on' : ''}`}>
              <span className="toggle-switch">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={e => updateField('enabled', e.target.checked)}
                />
                <span className="toggle-track"><span className="toggle-thumb" /></span>
              </span>
              <span className="toggle-label">
                {form.enabled ? 'Enabled — will be polled' : 'Disabled — will be skipped'}
              </span>
            </label>
          </div>

          <div className="form-footer">
            {status && (
              <div className={`status-banner ${status.type}`}>
                {status.type === 'success' ? '✓ ' : '⚠ '}{status.message}
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save PLC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}