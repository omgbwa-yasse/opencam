# OpenCam

Webcam virtuelle open-source: utilisez votre smartphone comme webcam HD dans Zoom, Teams, OBS.

## Structure du monorepo

```
opencam/
├── mobile/    # Application React Native (Android + iOS)
├── desktop/   # Application Tauri (Windows + macOS + Linux)
└── driver/    # Drivers webcam virtuelle (DirectShow, v4l2, CoreMediaIO)
```

## Architecture

```
Smartphone (mobile/)  <--WebRTC/H.264-->  PC (desktop/)  -->  OS Webcam (driver/)
     Camera2/AVFoundation                  Tauri/Rust          v4l2/DirectShow/CoreMediaIO
```

## Demarrage rapide

### Mobile
```bash
cd mobile
npm install
npx react-native run-android
```

### Desktop
```bash
cd desktop
npm install
npm run tauri dev
```

### Driver (Linux)
```bash
cd driver
sudo bash linux/install.sh
```

## Licence MIT
