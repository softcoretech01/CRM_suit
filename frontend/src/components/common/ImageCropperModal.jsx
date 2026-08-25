import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropImage';

export function ImageCropperModal({ 
  isOpen, 
  onClose, 
  imageSrc, 
  onCropCompleteAction, 
  aspectRatio = 1,
  title = "Crop Image"
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedImageFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        'cropped_image.jpeg'
      );
      await onCropCompleteAction(croppedImageFile);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to crop image.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={backdropStyle}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 600, width: '100%', margin: '0 auto', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <div className="modal-content border-0">
          <div className="modal-header">
            <h5 className="modal-title fw-6">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={isProcessing}></button>
          </div>
          <div className="modal-body p-0" style={{ position: 'relative', height: 400, backgroundColor: '#333' }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="modal-footer bg-light">
            <div className="d-flex align-items-center me-auto" style={{ width: 200 }}>
              <span className="me-2 text-muted small">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className="form-range"
              />
            </div>
            <button type="button" className="btn btn-light border" onClick={onClose} disabled={isProcessing}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isProcessing}>
              {isProcessing ? 'Saving...' : 'Apply Crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const backdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 16,
  // Above the Drawer (1060) and its backdrop (1055) so the whole cropper stays visible.
  zIndex: 1090,
};
