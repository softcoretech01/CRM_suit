import { useState } from 'react';
import { Card } from '../common/Ui';

export function DocumentUploader({ onUpload, onCancel }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const simulateUpload = () => {
    if (!file) return;
    setUploading(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onUpload(file);
        }, 500);
      }
    }, 200);
  };

  return (
    <div className="p-4 border rounded bg-light text-center" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      {!file ? (
        <div className="py-5">
          <i className="bi bi-cloud-arrow-up text-primary-c mb-3 d-block" style={{ fontSize: 40 }} />
          <h5 className="fw-6">Drag & Drop files here</h5>
          <p className="text-muted-c fs-13 mb-4">or click to browse files from your computer</p>
          <label className="btn btn-outline-primary">
            Browse Files
            <input type="file" className="d-none" onChange={(e) => setFile(e.target.files[0])} />
          </label>
        </div>
      ) : (
        <div className="py-4 text-start">
          <div className="d-flex align-items-center mb-4">
            <div className="bg-white p-3 rounded shadow-sm border me-3">
              <i className="bi bi-file-earmark-text text-primary-c fs-3" />
            </div>
            <div>
              <div className="fw-6 text-truncate" style={{ maxWidth: 300 }}>{file.name}</div>
              <div className="fs-12 text-muted-c">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
            <button className="icon-btn ms-auto text-danger-c" onClick={() => setFile(null)} disabled={uploading}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          {uploading ? (
            <div>
              <div className="d-flex justify-content-between fs-12 mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="progress" style={{ height: 6 }}>
                <div className="progress-bar bg-primary-c transition-all" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ) : (
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-light" onClick={onCancel}>Cancel</button>
              <button className="btn btn-primary" onClick={simulateUpload}>Upload Document</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DocumentPreview({ document, onClose }) {
  if (!document) return null;
  return (
    <div className="bg-white h-100 d-flex flex-column border-start shadow-sm" style={{ width: 400, position: 'absolute', right: 0, top: 0, zIndex: 100 }}>
      <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
        <h6 className="m-0 fw-6 text-truncate pe-3">{document.name}</h6>
        <button className="icon-btn" onClick={onClose}><i className="bi bi-x-lg" /></button>
      </div>
      <div className="p-4 bg-light flex-grow-1 d-flex flex-column align-items-center justify-content-center border-bottom text-center">
        <i className="bi bi-file-earmark-pdf text-danger-c mb-3" style={{ fontSize: 64 }} />
        <div className="fw-6 fs-15">{document.name}</div>
        <div className="fs-12 text-muted-c mt-1">{document.size} • Uploaded on {document.uploadDate}</div>
        <button className="btn btn-primary btn-sm mt-4 px-4"><i className="bi bi-download me-2" /> Download</button>
      </div>
      <div className="p-4" style={{ overflowY: 'auto' }}>
        <h6 className="fw-6 mb-3 fs-13 text-muted-c text-uppercase">Document Details</h6>
        <div className="row g-3 fs-13">
          <div className="col-6 text-muted-c">Document No:</div>
          <div className="col-6 fw-5">{document.number}</div>
          
          <div className="col-6 text-muted-c">Type:</div>
          <div className="col-6 fw-5">{document.type}</div>
          
          <div className="col-6 text-muted-c">Category:</div>
          <div className="col-6 fw-5"><span className="badge-pill tone-blue">{document.category}</span></div>
          
          <div className="col-6 text-muted-c">Company:</div>
          <div className="col-6 fw-5 text-primary-c">{document.company}</div>
          
          <div className="col-6 text-muted-c">Uploaded By:</div>
          <div className="col-6 fw-5">{document.uploadedBy}</div>
          
          <div className="col-6 text-muted-c">Version:</div>
          <div className="col-6 fw-5"><span className="badge-pill tone-gray">{document.version}</span></div>
        </div>
      </div>
    </div>
  );
}

export function VersionHistory({ versions = [] }) {
  return (
    <div className="timeline-container px-3">
      {versions.map((v, i) => (
        <div className="d-flex mb-3" key={i}>
          <div className="position-relative">
            <div className="rounded-circle bg-primary-c" style={{ width: 10, height: 10, marginTop: 4 }}></div>
            {i < versions.length - 1 && <div className="position-absolute bg-border" style={{ top: 14, bottom: -16, left: 4, width: 2 }}></div>}
          </div>
          <div className="ms-3 fs-13" style={{ flex: 1 }}>
            <div className="fw-6 d-flex align-items-center gap-2">
              Version {v.version}
              {i === 0 && <span className="badge bg-success-c text-white" style={{ fontSize: 10 }}>Current</span>}
            </div>
            <div className="text-muted-c mt-1">{v.date} by {v.user}</div>
            <div className="text-secondary-c mt-1">{v.description}</div>
            {i !== 0 && (
              <div className="mt-2">
                <button className="btn btn-sm btn-link p-0 text-decoration-none fs-12"><i className="bi bi-clock-history" /> Restore this version</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
