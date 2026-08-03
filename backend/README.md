# StreamPlus Backend

Backend para multistreaming de videos pregrabados a múltiples plataformas simultáneas.

## Requisitos Previos

- Node.js (v14 o superior)
- FFmpeg instalado y disponible en PATH
- Stream keys de las plataformas deseadas

## Instalación de FFmpeg

### Windows
1. Descarga FFmpeg desde https://ffmpeg.org/download.html
2. Extrae el archivo
3. Agrega la carpeta `bin` al PATH del sistema
4. Verifica instalación: `ffmpeg -version`

### Linux
```bash
sudo apt update
sudo apt install ffmpeg
```

### macOS
```bash
brew install ffmpeg
```

## Instalación del Backend

1. Instala dependencias:
```bash
npm install
```

2. Configura las variables de entorno:
```bash
cp .env.example .env
```

3. Edita `.env` y agrega tus stream keys de cada plataforma

## Obtener Stream Keys

### YouTube
- Ve a YouTube Studio
- Crear → Ir a WebCam
- Copia la "Stream Key"

### Facebook
- Ve a facebook.com/live/producer
- Crea un stream
- Copia la "Stream Key"

### Twitch
- Ve a twitch.tv/dashboard
- En "Stream Key", copia tu key

### Instagram
- Necesitas una cuenta de negocio
- Usa herramientas como Streamlabs o Restream para obtener el RTMP
- Asegúrate de tener `INSTAGRAM_STREAM_KEY` en tu `.env`

### TikTok
- Solo disponible para cuentas verificadas
- Usa servicios de terceros para obtener el RTMP
- Asegúrate de tener `TIKTOK_STREAM_KEY` en tu `.env`

### Twitter
- Usa la clave RTMP que te provea la plataforma
- Asegúrate de tener `TWITTER_STREAM_KEY` en tu `.env`

## Uso

### Iniciar servidor
```bash
npm start
```

### Modo desarrollo
```bash
npm run dev
```

## API Endpoints

### POST /api/upload
Sube un video para streaming
- Body: multipart/form-data con campo 'video'
- Max size: 2GB
- Formatos: mp4, avi, mov, mkv, flv

### GET /api/videos
Obtiene lista de videos disponibles

### POST /api/schedule
Programa una transmisión
- Body: JSON con { videoId, platforms, scheduledTime, title, description }

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

## Características

- Streaming simultáneo a múltiples plataformas
- Programación de transmisiones
- Loop infinito de videos
- Soporte para formatos populares
- API REST completa
- Control de transmisiones activas

## Notas

- El servidor debe tener buen ancho de banda para streaming múltiple
- Cada stream adicional requiere ~4-5 Mbps de upload
- Considera usar un VPS con buen ancho de banda para producción
