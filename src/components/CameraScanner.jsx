import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import './CameraScanner.css';
import ResultBox from './ResultBox';

export default function CameraScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState({ visible: false, success: false, content: '' });
  const scannerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        instanceRef.current.stop().catch(() => {});
        instanceRef.current.clear();
      }
    };
  }, []);

  const startScanner = () => {
    setResult({ visible: false, success: false, content: '' });

    const html5QrCode = new Html5Qrcode('reader');
    instanceRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        setResult({ visible: true, success: true, content: decodedText });
        if (navigator.vibrate) navigator.vibrate(50);
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
        setScanning(false);
      },
      () => {} // ignore streaming errors
    ).then(() => {
      setScanning(true);
    }).catch(err => {
      setResult({ visible: true, success: false, content: `Camera error: ${err.message || err}` });
    });
  };

  const stopScanner = () => {
    if (instanceRef.current) {
      instanceRef.current.stop().then(() => {
        instanceRef.current.clear();
        setScanning(false);
      }).catch(() => {
        setScanning(false);
      });
    }
  };

  return (
    <div>
      <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }} />
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={startScanner} disabled={scanning}>
          ▶ Start Scanner
        </button>
        <button className="btn btn-outline" onClick={stopScanner} disabled={!scanning}>
          ⏹ Stop
        </button>
      </div>
      <ResultBox visible={result.visible} success={result.success} content={result.content} />
    </div>
  );
}