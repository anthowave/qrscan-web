import { useState } from 'react';
import './ResultBox.css';

export default function ResultBox({ visible, success, content, isLoading }) {
  const [revealed, setRevealed] = useState(false);

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

      <div className={`result-content ${!revealed ? 'blurred' : ''}`}>
        {content || '—'}
      </div>

      {!isLoading && success && (
        <div className="result-actions">
          <CopyButton text={content} />
          {!revealed && (
            <button className="reveal-btn" onClick={() => setRevealed(true)}>
              Click to reveal
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CopyButton({ text, onCopied }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    onCopied?.();
  };

  return (
    <button className="copy-btn" onClick={handleCopy}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}