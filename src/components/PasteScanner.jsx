import { Html5Qrcode } from 'html5-qrcode';
import { useRef, useState } from 'react';
import './PasteScanner.css';
import ResultBox from './ResultBox';

export default function PasteScanner() {
  const [pastedImage, setPastedImage] = useState(null);
  const [result, setResult] = useState({ visible: false, success: false, content: '', loading: false });
  const pasteZoneRef = useRef(null);

  const decodeImage = (file) => {
    const url = URL.createObjectURL(file);
    setPastedImage(url);

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

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (!blob) {
          setResult({ visible: true, success: false, content: 'Could not read image from clipboard.', loading: false });
          return;
        }
        const ext = item.type.split('/')[1] || 'png';
        const file = new File([blob], `screenshot.${ext}`, { type: item.type });
        decodeImage(file);
        return;
      }
    }
    e.preventDefault();
    setResult({ visible: true, success: false, content: 'No image found in clipboard. Copy a screenshot and try again.', loading: false });
  };

  return (
    <div>
      <div
        className="paste-zone"
        ref={pasteZoneRef}
        tabIndex={0}
        onPaste={handlePaste}
      >
        <div className="upload-icon">📋</div>
        <div className="upload-text">Paste a screenshot here</div>
        <div className="paste-hint">
          Click here and press <kbd>Ctrl + V</kbd> (or <kbd>⌘ + V</kbd> on Mac)
        </div>
      </div>
      {pastedImage && (
        <div className="pasted-image-wrapper">
          <img src={pastedImage} className="pasted-image" alt="QR code preview" />
        </div>
      )}
      <ResultBox
        visible={result.visible}
        success={result.success}
        content={result.content}
        isLoading={result.loading}
      />
    </div>
  );
}