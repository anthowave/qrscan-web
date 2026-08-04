# QR Code Scanner

A privacy-first QR code scanner for the web. Decode QR codes from your camera, image files, or clipboard — with blurred results that require a click to reveal.

Built with **React + Vite** and the [html5-qrcode](https://github.com/mebjas/html5-qrcode) library.

## Features

- **📸 Camera** — Live QR scanning using your device camera
- **🖼️ Upload** — Drag & drop or click to upload an image file
- **📋 Paste** — Paste a screenshot directly from your clipboard (Ctrl+V)
- **🔒 Privacy-first** — Scanned content is blurred by default; click to reveal
- **📋 Copy** — One-click copy decoded content to clipboard
- **🎨 Minimal design** — Clean, dark theme built for developers

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

The dev server runs at `http://localhost:5173`.

## Tech Stack

- [React](https://react.dev) (Vite)
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) — QR code scanning library

## Project Structure

```
src/
├── App.jsx              # Tab layout (Camera / Upload / Paste)
├── App.css
├── index.css            # Global styles + CSS variables
├── main.jsx             # React entry point
└── components/
    ├── CameraScanner.jsx/css   # Live camera scanning
    ├── UploadScanner.jsx/css   # File upload & drag-drop
    ├── PasteScanner.jsx/css    # Clipboard paste scanning
    └── ResultBox.jsx/css       # Privacy-blurred result display
```

## License

MIT