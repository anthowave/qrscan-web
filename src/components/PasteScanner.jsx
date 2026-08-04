import { Html5Qrcode } from 'html5-qrcode';
import { useCallback, useEffect, useRef, useState } from 'react';
import './PasteScanner.css';
import ResultBox from './ResultBox';

export default function PasteScanner({ pasteEvent, onPasteConsumed }) {
  const [pastedImage, setPastedImage] = useState(null);
  const [result, setResult] = useState({ visible: false, success: false, content: '', loading: false });
  const pasteZoneRef = useRef(null);

  const decodeImage = useCallback((file) => {
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
  }, []);

  const processClipboardItem = useCallback((item) => {
    if (item.type.startsWith('image/')) {
      const blob = item.getAsFile();
      if (!blob) {
        setResult({ visible: true, success: false, content: 'Could not read image from clipboard.', loading: false });
        return true;
      }
      const ext = item.type.split('/')[1] || 'png';
      const file = new File([blob], `screenshot.${ext}`, { type: item.type });
      decodeImage(file);
      return true;
    }
    return false;
  }, [decodeImage]);

  // Handle global paste events forwarded from App
  useEffect(() => {
    if (!pasteEvent) return;
    const items = pasteEvent.clipboardData?.items;
    if (!items) return;

    let handled = false;
    for (const item of items) {
      if (processClipboardItem(item)) {
        handled = true;
        break;
      }
    }
    if (!handled) {
      setResult({ visible: true, success: false, content: 'No image found in clipboard. Use Win+Shift+S / Cmd+Shift+4 to screenshot a QR code first.', loading: false });
    }
    onPasteConsumed?.();
  }, [pasteEvent, processClipboardItem, onPasteConsumed]);

  // Local paste handler (for the paste zone)
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (processClipboardItem(item)) {
        e.preventDefault();
        return;
      }
    }
    e.preventDefault();
    setResult({ visible: true, success: false, content: 'No image found in clipboard. Use Win+Shift+S / Cmd+Shift+4 to screenshot a QR code first.', loading: false });
  };

  // Auto-detect clipboard image on page visibility change (user returned to the PWA)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) return;
      try {
        const permission = await navigator.permissions.query({ name: 'clipboard-read' });
        if (permission.state !== 'granted') return;

        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
          for (const type of clipboardItem.types) {
            if (type.startsWith('image/')) {
              const blob = await clipboardItem.getType(type);
              const ext = type.split('/')[1] || 'png';
              const file = new File([blob], `screenshot.${ext}`, { type });
              decodeImage(file);
              return;
            }
          }
        }
      } catch {
        // Clipboard API not available or permission denied — user can still Ctrl+V
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [decodeImage]);

  // Trigger clipboard read on click (provides user activation for clipboard-read permission prompt)
  const handleClick = () => {
    pasteZoneRef.current.focus();
    // If clipboard-read is already granted, try reading immediately
    navigator.permissions.query({ name: 'clipboard-read' }).then(permission => {
      if (permission.state === 'granted') {
        navigator.clipboard.read().then(clipboardItems => {
          for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
              if (type.startsWith('image/')) {
                clipboardItem.getType(type).then(blob => {
                  const ext = type.split('/')[1] || 'png';
                  const file = new File([blob], `screenshot.${ext}`, { type });
                  decodeImage(file);
                });
                return;
              }
            }
          }
        }).catch(() => {});
      }
    }).catch(() => {});
  };

  return (
    <div>
      <div
        className="paste-zone"
        ref={pasteZoneRef}
        tabIndex={0}
        onPaste={handlePaste}
        onClick={handleClick}
      >
        <div className="upload-icon">📋</div>
        <div className="upload-text">Paste anywhere or click here</div>
        <div className="paste-hint">
          Screenshot a QR code: <kbd>Win+Shift+S</kbd> (Windows) / <kbd>Cmd+Shift+4</kbd> (Mac), then <kbd>Ctrl+V</kbd>
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