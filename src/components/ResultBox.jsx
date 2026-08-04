import { useState } from 'react';
import './ResultBox.css';

export default function ResultBox({ visible, success, content, onCopy }) {
  if (!visible && !content) return null;

  const label = success ? '✅ Decoded Successfully' : '❌ Scan Failed';
  const className = `result ${visible ? 'show' : ''} ${success ? 'success' : 'error'}`;

  return (
    <div className={className}>
      <div className="result-label">{label}</div>
      <div className="result-content">{content || 'No result'}</div>
      {content && (
        <CopyButton text={content} />
      )}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button className="copy-btn" onClick={handleCopy}>
      {copied ? '✅ Copied!' : '📋 Copy'}
    </button>
  );
}