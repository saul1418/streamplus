# StreamPlus - Guía de Instalación y Uso

Sistema completo de multistreaming para transmitir videos pregrabados en múltiples plataformas simultáneas.

## 📋 Requisitos Previos

### Para el Backend:
- Node.js (v14 o superior)
- FFmpeg instalado y disponible en PATH
- Windows, Linux o macOS
- Conexión a internet estable con buen ancho de banda

### Para el Frontend:
- Flutter SDK (3.0 o superior)
- Android Studio / VS Code
- Emulador o dispositivo físico

## 🚀 Instalación

### 1. Instalar FFmpeg

#### Windows:
1. Descarga FFmpeg desde https://ffmpeg.org/download.html
2. Extrae el archivo en una carpeta (ej: `C:\ffmpeg`)
3. Agrega la carpeta `bin` al PATH del sistema:
   - Busca "Variables de entorno" en Windows
   - Edita "Path" en variables del sistema
   - Agrega `C:\ffmpeg\bin`
4. Verifica instalación: Abre CMD y ejecuta `ffmpeg -version`

#### Linux:
```bash
sudo apt update
sudo apt install ffmpeg
```

#### macOS:
```bash
brew install ffmpeg
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

### 3. Configurar Variables de Entorno

```bash
cd backend
cp .env.example .env
```

Edita el archivo `.env` con tus stream keys:

```env
PORT=3000

# Stream Keys de las Plataformas
YOUTUBE_STREAM_KEY=tu_youtube_stream_key_aqui
FACEBOOK_STREAM_KEY=tu_facebook_stream_key_aqui
TWITCH_STREAM_KEY=tu_twitch_stream_key_aqui
INSTAGRAM_STREAM_KEY=tu_instagram_stream_key_aqui
TIKTOK_STREAM_KEY=tu_tiktok_stream_key_aqui
TWITTER_STREAM_KEY=tu_twitter_stream_key_aqui
```

### 4. Obtener Stream Keys

#### YouTube:
1. Ve a [YouTube Studio](https://studio.youtube.com)
2. Crea → Nueva transmisión
3. Copia la "Stream Key"

#### Facebook:
1. Ve a [Facebook Live Producer](https://facebook.com/live/producer)
2. Crea un nuevo stream
3. Copia la "Stream Key"

#### Twitch:
1. Ve a [Twitch Dashboard](https://twitch.tv/dashboard)
2. En "Stream Key", copia tu key

#### Instagram:
- Requiere cuenta de negocio
- Usa herramientas como Streamlabs o Restream

#### TikTok:
- Solo disponible para cuentas verificadas
- Usa servicios de terceros para obtener el RTMP

### 5. Iniciar el Backend

```bash
cd backend
npm start
```

El servidor iniciará en `http://localhost:3000`

### 6. Configurar el Frontend Flutter

```bash
# Instalar dependencias
flutter pub get

# Ejecutar en emulador o dispositivo
flutter run
```

## 📱 Uso de la Aplicación

### 1. Autenticación
- Usuario: `Streampluss`
- Contraseña: `12345678`

### 2. Subir Videos
1. Haz clic en "Subir Video"
2. Selecciona un video de tu dispositivo
3. Espera a que se complete la carga
4. El video aparecerá en la lista

### 3. Seleccionar Video
1. Elige un video de la lista
2. El video seleccionado se marcará con un check verde

### 4. Configurar Plataformas
1. Selecciona las plataformas donde quieres transmitir
2. Asegúrate de tener las stream keys configuradas en el backend

### 5. Iniciar Transmisión
1. Configura título y descripción
2. Haz clic en "Iniciar Transmisión"
3. El video se transmitirá simultáneamente a todas las plataformas seleccionadas

### 6. Monitorear Stream
- Ver el tiempo de transmisión en vivo
- Ver espectadores simulados
- Chat unificado de todas las plataformas

### 7. Detener Transmisión
- Haz clic en "Detener Transmisión" para finalizar

## 🔧 API Endpoints

### POST /api/upload
Sube un video para streaming
- Body: multipart/form-data con campo 'video'
- Max size: 2GB

### GET /api/videos
Obtiene lista de videos disponibles

### POST /api/stream/start
Inicia transmisión inmediata
- Body: JSON con { videoId, platforms, title, description }

### POST /api/stream/stop/:streamId
Detiene una transmisión activa

### GET /api/streams/status
Obtiene estado de todas las transmisiones

### POST /api/platforms/config
Actualiza stream keys de plataformas
- Body: JSON con { platform, streamKey }

## ⚠️ Consideraciones Importantes

### Ancho de Banda:
- Cada stream requiere ~4-5 Mbps de upload
- Para 3 plataformas: necesitas ~15 Mbps de upload
- Para 6 plataformas: necesitas ~30 Mbps de upload

### Servidor de Producción:
- Para uso intensivo, considera un VPS con:
  - Mínimo 4 CPU cores
  - 8GB RAM
  - 50GB SSD
  - Ancho de banda dedicado

### Limitaciones:
- El video se reproduce en loop infinito
- No hay edición en tiempo real del video
- El chat es simulado (no conectado a plataformas reales)

## 🐛 Solución de Problemas

### FFmpeg no encontrado:
- Verifica que FFmpeg esté instalado
- Verifica que esté en el PATH del sistema
- Reinicia la terminal después de instalar

### Error al conectar con backend:
- Verifica que el backend esté corriendo
- Verifica que el puerto 3000 esté disponible
- Verifica la URL en el código Flutter

### Error al subir video:
- Verifica que el formato sea soportado (mp4, avi, mov, mkv, flv)
- Verifica que el tamaño no exceda 2GB
- Verifica permisos de escritura en la carpeta

### Stream no inicia:
- Verifica que las stream keys sean correctas
- Verifica que tengas conexión a internet
- Revisa los logs del backend para errores

## 📞 Soporte

Para problemas o preguntas:
1. Revisa los logs del backend
2. Verifica la configuración de FFmpeg
3. Revisa las stream keys de las plataformas

## 🔄 Actualizaciones Futuras

- [ ] Interfaz para programar transmisiones
- [ ] Chat real conectado a plataformas
- [ ] Edición de videos en tiempo real
- [ ] Estadísticas detalladas de viewers
- [ ] Soporte para más plataformas
