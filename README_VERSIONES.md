# StreamPlus - Guía de Versiones

StreamPlus está disponible en dos versiones: **Web** y **Descargable**. Ambas usan el mismo backend.

## 🌐 Versión Web (React)

### Características:
- Acceso desde cualquier navegador
- No requiere instalación
- Ideal para uso rápido
- Actualizaciones automáticas

### Instalación:

1. **Instalar dependencias:**
```bash
cd web
npm install
```

2. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

3. **Abrir en navegador:**
- La aplicación estará disponible en `http://localhost:5173`

### Construir para producción:
```bash
npm run build
npm run preview
```

### Requisitos:
- Node.js (v14 o superior)
- Navegador moderno (Chrome, Firefox, Edge, Safari)

## 📱 Versión Descargable (Flutter)

### Características:
- Aplicación nativa para Android, iOS, Windows, macOS, Linux
- Mejor rendimiento
- Acceso offline (para algunas funciones)
- Experiencia de usuario nativa

### Instalación:

1. **Instalar Flutter SDK:**
- Descarga desde https://flutter.dev/docs/get-started/install
- Agrega Flutter al PATH del sistema
- Verifica instalación: `flutter doctor`

2. **Instalar dependencias:**
```bash
flutter pub get
```

3. **Ejecutar en emulador/dispositivo:**
```bash
flutter run
```

### Compilar para diferentes plataformas:

#### Android:
```bash
flutter build apk
# El APK estará en build/app/outputs/flutter-apk/
```

#### iOS:
```bash
flutter build ios
# Requiere Mac con Xcode
```

#### Windows:
```bash
flutter build windows
# El ejecutable estará en build/windows/runner/Release/
```

#### macOS:
```bash
flutter build macos
# La app estará en build/macos/Build/Products/Release/
```

#### Linux:
```bash
flutter build linux
# El ejecutable estará en build/linux/x64/release/
```

### Requisitos:
- Flutter SDK (3.0 o superior)
- Android Studio / Xcode (según plataforma)
- Emulador o dispositivo físico

## 🔧 Backend (Común para ambas versiones)

Ambas versiones usan el mismo backend Node.js.

### Instalación:

1. **Instalar FFmpeg** (requisito obligatorio)
   - Windows: Descarga desde https://ffmpeg.org/download.html
   - Linux: `sudo apt install ffmpeg`
   - macOS: `brew install ffmpeg`

2. **Configurar backend:**
```bash
cd backend
npm install
cp .env.example .env
```

3. **Configurar stream keys en `.env`:**
```env
YOUTUBE_STREAM_KEY=tu_key
FACEBOOK_STREAM_KEY=tu_key
TWITCH_STREAM_KEY=tu_key
# etc...
```

4. **Iniciar backend:**
```bash
npm start
```

## 📊 Comparación de Versiones

| Característica | Web | Descargable |
|---------------|-----|-------------|
| Instalación | No requiere | Requiere Flutter |
| Acceso | Navegador | App nativa |
| Performance | Buena | Excelente |
| Offline | Limitado | Parcial |
| Actualizaciones | Automáticas | Manual |
| Distribución | Link | APK/EXE/DMG |

## 🚀 Flujo de Trabajo Recomendado

### Para desarrollo:
1. Inicia el backend: `cd backend && npm start`
2. Para web: `cd web && npm run dev`
3. Para Flutter: `flutter run`

### Para producción:
1. **Web:** Despliega el build de `web/` en Vercel, Netlify, o tu servidor
2. **Móvil:** Sube el APK a Google Play Store
3. **Desktop:** Distribuye el ejecutable compilado

## 🔗 URLs Importantes

- **Backend:** `http://localhost:3000`
- **Web Dev:** `http://localhost:5173`
- **Flutter Web:** `http://localhost:3000` (si compilas para web)

## ⚠️ Notas Importantes

1. **El backend debe estar corriendo** para que ambas versiones funcionen
2. **FFmpeg es obligatorio** para el streaming
3. **Stream keys deben configurarse** antes de transmitir
4. **Ancho de banda:** Cada stream requiere ~4-5 Mbps de upload

## 🐛 Solución de Problemas

### Versión Web:
- Si no carga: Verifica que el backend esté corriendo en puerto 3000
- Error de CORS: El proxy en vite.config.js debería manejarlo

### Versión Flutter:
- Error de dependencias: Ejecuta `flutter clean` luego `flutter pub get`
- Error de Android: Verifica `flutter doctor`
- Error de iOS: Requiere Mac con Xcode instalado

### Backend:
- FFmpeg no encontrado: Verifica instalación y PATH
- Puerto ocupado: Cambia PORT en `.env`
- Error de streaming: Verifica stream keys y conexión

## 📞 Soporte

Para problemas específicos:
- **Web:** Revisa consola del navegador (F12)
- **Flutter:** Revisa logs de `flutter run`
- **Backend:** Revisa terminal donde corre `npm start`
