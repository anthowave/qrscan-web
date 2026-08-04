import { useState } from 'react';
import './App.css';
import CameraScanner from './components/CameraScanner';
import PasteScanner from './components/PasteScanner';
import UploadScanner from './components/UploadScanner';

const TABS = [
  { id: 'camera', label: '📸 Camera', Component: CameraScanner },
  { id: 'upload', label: '🖼️ Upload', Component: UploadScanner },
  { id: 'paste',  label: '📋 Paste',  Component: PasteScanner },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('camera');

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
            <Component />
          </div>
        ))}
      </div>
    </div>
  );
}