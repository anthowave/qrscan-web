import { useEffect, useState } from 'react';
import './ResultBox.css';

export default function ResultBox({ visible, success, content, isLoading }) {
  const [revealed, setRevealed] = useState(false);

  // Reset reveal state when new content arrives
  useEffect(() => {
    if (visible && success && !isLoading) {
      setRevealed(false);
    }
  }, [content, visible, success, isLoading]);

  if (!visible) return null;

  const label = isLoading
    ? 'Scanning…'
    : success
      ? 'Decoded'
      : 'Failed';

  const className = `result ${visible ? 'show' : ''} ${success && !isLoading ? 'success' : ''} ${!success && !isLoading ? 'error' : ''}`;

  return (
    <div className={className}>
      <div className="result-header">
        <span className={`result-dot ${isLoading ? 'loading' : success ? 'success' : 'error'}`} />
        <span className="result-label">{label}</span>
      </div>

      <div
        className={`result-content-wrapper ${!revealed ? 'blurred' : ''}`}
        onClick={() => { if (!revealed) setRevealed(true); }}
        title={!revealed ? 'Click to reveal' : ''}
      >
        <div className={`result-content ${!revealed ? 'blurred' : ''}`}>
          {content || '—'}
        </div>
        {!revealed && (
          <div className="reveal-overlay">
            <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </div>
        )}
      </div>

      {!isLoading && success && (
        <div className="result-actions">
          <CopyButton text={content} />
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);

  // Clear clipboard after 2 minutes
  useEffect(() => {
    if (!copied || !expiryTime) return;

    const remaining = expiryTime - Date.now();
    if (remaining <= 0) return;

    const timer = setTimeout(async () => {
      try {
        await navigator.clipboard.writeText('');
      } catch {
        // Silently fail — some browsers may not allow overwriting
      }
    }, remaining);

    return () => clearTimeout(timer);
  }, [copied, expiryTime]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setExpiryTime(Date.now() + 2 * 60 * 1000); // 2 minutes

      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write failed silently
    }
  };

  const formatExpiry = () => {
    if (!expiryTime) return '';
    const secs = Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000));
    if (secs >= 60) return `${Math.ceil(secs / 60)}m`;
    return `${secs}s`;
  };

  return (
    <button className="copy-btn" onClick={handleCopy}>
      {copied ? `Copied (expires in ${formatExpiry()})` : 'Copy'}
    </button>
  );
}