import { useCallback, useEffect, useState } from 'react';
import './App.css';
import CameraScanner from './components/CameraScanner';
import PasteScanner from './components/PasteScanner';
import UploadScanner from './components/UploadScanner';

const TABS = [
  { id: 'paste', label: '📋 From Clipboard', Component: PasteScanner },
  { id: 'upload', label: '🖼️ Upload', Component: UploadScanner },
  { id: 'camera', label: '📸 Camera', Component: CameraScanner },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('paste');
  const [pasteEvent, setPasteEvent] = useState(null);

  const handleGlobalPaste = useCallback((e) => {
    // Switch to paste tab and forward event
    setActiveTab('paste');
    setPasteEvent(e);
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, [handleGlobalPaste]);

  return (
    <div className="container">
      <h1>📷 QR Code Scanner</h1>
      <p className="subtitle">Scan or decode QR codes from any source</p>

      <div className="tabs">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="tab-content active">
        {TABS.map(({ id, Component }) => (
          <div key={id} style={{ display: activeTab === id ? 'block' : 'none' }}>
            <Component pasteEvent={id === 'paste' ? pasteEvent : null} onPasteConsumed={() => setPasteEvent(null)} />
          </div>
        ))}
      </div>
    </div>
  );
}