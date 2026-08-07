import { useEffect, useMemo, useState } from 'react';
import './ResultBox.css';

function extractOtpSecret(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!/^otpauth:\/\/totp\//i.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    return url.searchParams.get('secret');
  } catch {
    // Fallback: regex extraction for malformed but parseable otpauth URLs
    const match = trimmed.match(/[?&]secret=([^&]+)/i);
    return match ? decodeURIComponent(match[1]) : null;
  }
}

function detectContentType(text) {
  if (!text || typeof text !== 'string') return null;

  const trimmed = text.trim();

  // URL
  if (/^https?:\/\//i.test(trimmed)) return 'Detected a URL';

  // OTP / TOTP
  if (/^otpauth:\/\/totp\//i.test(trimmed)) return 'Detected 2FA code (TOTP)';

  // Wi-Fi
  if (/^WIFI:/i.test(trimmed)) return 'Detected Wi-Fi credentials';

  // vCard
  if (/^BEGIN:VCARD/i.test(trimmed)) return 'Detected a contact (vCard)';

  // Email
  if (/^mailto:/i.test(trimmed) || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
    return 'Detected an email address';
  }

  // Phone number (basic: + country code or all digits with common separators)
  if (/^\+?[\d\s\-().]{7,20}$/.test(trimmed) && /\d/.test(trimmed)) return 'Detected a phone number';

  // JSON
  if (/^[\{\[]/.test(trimmed)) {
    try { JSON.parse(trimmed); return 'Detected JSON data'; } catch { /* not valid JSON */ }
  }

  // Mostly hexadecimal (at least 4 hex chars, >80% hex)
  const hexChars = trimmed.replace(/\s/g, '');
  if (hexChars.length >= 4 && /^[0-9a-fA-F]+$/.test(hexChars) && hexChars.length > 8) {
    return 'Detected a hex string';
  }

  // Base64 (alphanumeric + +/=, >60 chars, common pattern)
  if (/^[A-Za-z0-9+/=]{60,}$/.test(trimmed.replace(/\s/g, ''))) return 'Detected Base64 data';

  // All digits
  if (/^\d+$/.test(trimmed)) return 'Detected a number';

  // Mostly readable English text (>50% ASCII letters/spaces, at least 8 chars)
  const alphaCount = (trimmed.match(/[a-zA-Z ]/g) || []).length;
  if (trimmed.length >= 8 && alphaCount / trimmed.length > 0.5) {
    return 'Detected English text';
  }

  return 'Detected mixed content';
}

export default function ResultBox({ visible, success, content, isLoading }) {
  const [revealed, setRevealed] = useState(false);

  // Reset reveal state when new content arrives
  useEffect(() => {
    if (visible && success && !isLoading) {
      setRevealed(false);
    }
  }, [content, visible, success, isLoading]);

  const insight = useMemo(() => detectContentType(content), [content]);
  const otpSecret = useMemo(() => extractOtpSecret(content), [content]);

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
        {!isLoading && success && !revealed && insight && (
          <span className="insight-pill">{insight}</span>
        )}
      </div>

      <div
        className={`result-content-wrapper ${revealed ? 'revealed' : 'blurred'}`}
        onClick={() => setRevealed(prev => !prev)}
        title={!revealed ? 'Click to reveal' : 'Click to hide'}
      >
        <div className={`result-content ${!revealed ? 'blurred' : ''}`}>
          {content || '—'}
        </div>
        <div className="reveal-overlay">
          {!revealed ? (
            <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg className="eye-icon blur-hint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </div>
      </div>

      {!isLoading && success && (
        <div className="result-actions">
          <CopyButton text={otpSecret || content} />
          {otpSecret && <span className="otp-hint">Copies SECRET only</span>}
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