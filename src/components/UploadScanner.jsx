import { Html5Qrcode } from 'html5-qrcode';
import { useRef, useState } from 'react';
import ResultBox from './ResultBox';
import './UploadScanner.css';

export default function UploadScanner() {
  const [dragover, setDragover] = useState(false);
  const [result, setResult] = useState({ visible: false, success: false, content: '', loading: false });
  const fileInputRef = useRef(null);

  const scanFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setResult({ visible: true, success: false, content: 'Please select a valid image file.', loading: false });
      return;
    }

    setResult({ visible: true, success: true, content: 'Analyzing image…', loading: true });

    const scanner = new Html5Qrcode('file-scanner-helper');
    scanner.scanFile(file, true)
      .then(decodedText => {
        setResult({ visible: true, success: true, content: decodedText, loading: false });
      })
      .catch(err => {
        setResult({ visible: true, success: false, content: `No QR code found: ${err.message || err}`, loading: false });
      })
      .finally(() => scanner.clear());
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    if (e.dataTransfer.files.length) scanFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length) scanFile(e.target.files[0]);
  };

  return (
    <div>
      <div
        className={`upload-zone ${dragover ? 'dragover' : ''}`}
        onClick={() => fileInputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
        onDragLeave={() => setDragover(false)}
        onDrop={handleDrop}
      >
        <div className="upload-icon">📁</div>
        <div className="upload-text">Click to upload or drag & drop</div>
        <div className="upload-hint">PNG, JPG, GIF, BMP, screenshots</div>
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      <ResultBox
        visible={result.visible}
        success={result.success}
        content={result.content}
        isLoading={result.loading}
      />
    </div>
  );
}