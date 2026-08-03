const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const cron = require('node-cron');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitchStrategy = require('passport-twitch').Strategy;
require('dotenv').config();

// Configurar ruta de FFmpeg (usar FFMPEG_PATH en entorno cuando sea posible)
const ffmpegPath = process.env.FFMPEG_PATH || 'C:\\Users\\sauls\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.2-full_build\\bin\\ffmpeg.exe';
if (fs.existsSync(ffmpegPath)) {
  ffmpeg.setFfmpegPath(ffmpegPath);
  if (process.env.NODE_ENV !== 'production') {
    console.log('FFmpeg configurado con ruta:', ffmpegPath);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'streamplus-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambiar a true en producción con HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Almacenamiento de tokens OAuth (en producción usar base de datos)
const oauthTokens = {
  youtube: null,
  facebook: null,
  twitch: null
};

// Passport Serializers
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// YouTube OAuth Strategy (Google)
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  oauthTokens.youtube = {
    accessToken,
    refreshToken,
    profile
  };
  return done(null, { platform: 'youtube', profile });
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'displayName', 'photos', 'email']
}, (accessToken, refreshToken, profile, done) => {
  oauthTokens.facebook = {
    accessToken,
    refreshToken,
    profile
  };
  return done(null, { platform: 'facebook', profile });
}));

// Twitch OAuth Strategy
passport.use(new TwitchStrategy({
  clientID: process.env.TWITCH_CLIENT_ID,
  clientSecret: process.env.TWITCH_CLIENT_SECRET,
  callbackURL: process.env.TWITCH_CALLBACK_URL,
  scope: 'user:read:email'
}, (accessToken, refreshToken, profile, done) => {
  oauthTokens.twitch = {
    accessToken,
    refreshToken,
    profile
  };
  return done(null, { platform: 'twitch', profile });
}));

// Asegurar que existan los directorios necesarios
const uploadsDir = path.join(__dirname, 'uploads');
const videosDir = path.join(__dirname, 'videos');
const streamsDir = path.join(__dirname, 'streams');

[uploadsDir, videosDir, streamsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Servir videos estáticos (para previsualización desde la web)
app.use('/videos', express.static(videosDir));

// Configuración de Multer para subir videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.mp4', '.avi', '.mov', '.mkv', '.flv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de video no soportado'));
    }
  }
});

// Almacenamiento en memoria de transmisiones programadas
let scheduledStreams = [];
let activeStreams = {};

// Configuración de plataformas (RTMP URLs)
const platforms = {
  youtube: {
    rtmp: process.env.YOUTUBE_RTMP_URL || 'rtmp://a.rtmp.youtube.com/live2',
    key: process.env.YOUTUBE_STREAM_KEY || ''
  },
  facebook: {
    rtmp: process.env.FACEBOOK_RTMP_URL || 'rtmps://live-api-s.facebook.com:443/rtmp',
    key: process.env.FACEBOOK_STREAM_KEY || ''
  },
  twitch: {
    rtmp: process.env.TWITCH_RTMP_URL || 'rtmp://live.twitch.tv/app',
    key: process.env.TWITCH_STREAM_KEY || ''
  },
  instagram: {
    rtmp: process.env.INSTAGRAM_RTMP_URL || 'rtmps://live-upload.instagram.com:443/rtmp',
    key: process.env.INSTAGRAM_STREAM_KEY || ''
  },
  tiktok: {
    rtmp: process.env.TIKTOK_RTMP_URL || 'rtmp://tiktok.com/live',
    key: process.env.TIKTOK_STREAM_KEY || ''
  },
  twitter: {
    rtmp: process.env.TWITTER_RTMP_URL || 'rtmps://live.twitter.com/rtmp',
    key: process.env.TWITTER_STREAM_KEY || ''
  }
};

// OAuth Routes
// YouTube
app.get('/auth/youtube', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/youtube'] }));

app.get('/auth/youtube/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('http://localhost:5173?platform=youtube&connected=true');
  }
);

// Facebook
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'pages_manage_posts', 'pages_read_engagement'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('http://localhost:5173?platform=facebook&connected=true');
  }
);

// Twitch
app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user:read:email channel:read:subscriptions' }));

app.get('/auth/twitch/callback',
  passport.authenticate('twitch', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('http://localhost:5173?platform=twitch&connected=true');
  }
);

// Endpoint para verificar estado de conexión OAuth
app.get('/api/oauth/status', (req, res) => {
  res.json({
    youtube: !!oauthTokens.youtube,
    facebook: !!oauthTokens.facebook,
    twitch: !!oauthTokens.twitch,
    profiles: {
      youtube: oauthTokens.youtube?.profile?.displayName || null,
      facebook: oauthTokens.facebook?.profile?.displayName || null,
      twitch: oauthTokens.twitch?.profile?.displayName || null
    }
  });
});

// Endpoint para desconectar OAuth
app.post('/api/oauth/disconnect/:platform',passport.authenticate('session'), (req, res) => {
  const platform = req.params.platform;
  if (oauthTokens[platform]) {
    oauthTokens[platform] = null;
    res.json({ success: true, message: `${platform} desconectado` });
  } else {
    res.status(404).json({ error: 'Plataforma no conectada' });
  }
});

// API Endpoints

// 1. Subir video
app.post('/api/upload', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún video' });
    }

    const videoInfo = {
      id: uuidv4(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    };

    // Mover a carpeta videos
    const finalPath = path.join(videosDir, req.file.filename);
    fs.renameSync(req.file.path, finalPath);
    videoInfo.path = finalPath;

    res.json({ 
      success: true, 
      video: videoInfo 
    });
  } catch (error) {
    console.error('Error al subir video:', error);
    res.status(500).json({ error: 'Error al subir el video' });
  }
});

// 2. Obtener lista de videos
app.get('/api/videos', (req, res) => {
  try {
    const videos = [];
    const files = fs.readdirSync(videosDir);
    
    files.forEach(file => {
      const filePath = path.join(videosDir, file);
      const stats = fs.statSync(filePath);
      videos.push({
        id: file.split('.')[0],
        filename: file,
        size: stats.size,
        uploadedAt: stats.mtime.toISOString()
      });
    });

    res.json({ videos });
  } catch (error) {
    console.error('Error al obtener videos:', error);
    res.status(500).json({ error: 'Error al obtener videos' });
  }
});

// 3. Programar transmisión
app.post('/api/schedule', (req, res) => {
  try {
    const { videoId, platforms: selectedPlatforms, scheduledTime, title, description } = req.body;

    if (!videoId || !selectedPlatforms || selectedPlatforms.length === 0) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    const streamId = uuidv4();
    const scheduledStream = {
      id: streamId,
      videoId,
      platforms: selectedPlatforms,
      scheduledTime: new Date(scheduledTime),
      title,
      description,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    scheduledStreams.push(scheduledStream);

    // Programar el stream
    scheduleStream(scheduledStream);

    res.json({ 
      success: true, 
      stream: scheduledStream 
    });
  } catch (error) {
    console.error('Error al programar transmisión:', error);
    res.status(500).json({ error: 'Error al programar transmisión' });
  }
});

// 4. Iniciar transmisión inmediata
app.post('/api/stream/start', (req, res) => {
  try {
    const { videoId, platforms: selectedPlatforms, title, description } = req.body;

    if (!videoId || !selectedPlatforms || selectedPlatforms.length === 0) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    const streamId = uuidv4();
    const videoPath = path.join(videosDir, fs.readdirSync(videosDir).find(f => f.startsWith(videoId)));

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    // Iniciar streaming
    startStream(streamId, videoPath, selectedPlatforms);

    res.json({ 
      success: true, 
      streamId,
      status: 'streaming'
    });
  } catch (error) {
    console.error('Error al iniciar transmisión:', error);
    res.status(500).json({ error: 'Error al iniciar transmisión' });
  }
});

// 5. Detener transmisión
app.post('/api/stream/stop/:streamId', (req, res) => {
  try {
    const { streamId } = req.params;
    
    if (activeStreams[streamId]) {
      activeStreams[streamId].ffmpegCommand.kill();
      // limpiar timer de viewers si existe
      try { clearInterval(activeStreams[streamId].viewersTimer); } catch (e) {}
      delete activeStreams[streamId];
      
      res.json({ success: true, message: 'Transmisión detenida' });
    } else {
      res.status(404).json({ error: 'Transmisión no encontrada' });
    }
  } catch (error) {
    console.error('Error al detener transmisión:', error);
    res.status(500).json({ error: 'Error al detener transmisión' });
  }
});

// 6. Obtener estado de transmisiones
app.get('/api/streams/status', (req, res) => {
  try {
    const active = Object.keys(activeStreams).map(id => ({
      id,
      status: 'streaming',
      startTime: activeStreams[id].startTime,
      viewers: activeStreams[id].viewers || 0,
      platforms: activeStreams[id].platforms || []
    }));

    const scheduled = scheduledStreams.filter(s => s.status === 'scheduled');

    const totalViewers = active.reduce((acc, a) => acc + (a.viewers || 0), 0);

    res.json({ 
      active, 
      scheduled,
      total: active.length + scheduled.length,
      totalViewers
    });
  } catch (error) {
    console.error('Error al obtener estado:', error);
    res.status(500).json({ error: 'Error al obtener estado' });
  }
});

// 7. Actualizar configuración de plataformas
app.post('/api/platforms/config', (req, res) => {
  try {
    const { platform, streamKey } = req.body;
    
    if (platforms[platform]) {
      platforms[platform].key = streamKey;
      res.json({ success: true, message: `Stream key de ${platform} actualizada` });
    } else {
      res.status(400).json({ error: 'Plataforma no soportada' });
    }
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

// Función para iniciar streaming con FFmpeg
function startStream(streamId, videoPath, selectedPlatforms) {
  // Read desired streaming parameters from env with safe defaults
  const targetBitrate = process.env.STREAM_BITRATE || '2500k';
  const preset = process.env.STREAM_PRESET || 'superfast';
  const bufSize = (() => {
    try {
      const n = parseInt(targetBitrate.replace(/k$/,''), 10);
      return (n * 2) + 'k';
    } catch (e) { return '5000k'; }
  })();

  const ffmpegCommand = ffmpeg(videoPath)
    .inputOptions([
      '-re', // Leer video a velocidad nativa
      '-stream_loop', '-1' // Loop infinito
    ])
    .videoCodec('libx264')
    .videoBitrate(targetBitrate)
    .size('?x720')
    .outputOptions([
      '-preset', preset,
      '-tune', 'fastdecode',
      '-f', 'flv',
      '-movflags', 'faststart',
      '-g', '60', // Keyframe interval (2s for 30fps)
      '-keyint_min', '60',
      '-sc_threshold', '0',
      '-b:v', targetBitrate,
      '-maxrate', targetBitrate,
      '-bufsize', bufSize,
      '-pix_fmt', 'yuv420p',
      '-r', '30',
      '-c:a', 'aac',
      '-b:a', '128k'
    ]);

  // Agregar outputs para cada plataforma seleccionada
  selectedPlatforms.forEach(platform => {
    const config = platforms[platform];
    if (config && config.key) {
      const rtmpUrl = `${config.rtmp}/${config.key}`;
      ffmpegCommand.output(rtmpUrl);
    }
  });

  activeStreams[streamId] = {
    ffmpegCommand,
    startTime: new Date().toISOString(),
    platforms: selectedPlatforms
  };

  // Inicializar contador de viewers y simular cambios pequeños en segundo plano
  activeStreams[streamId].viewers = 1;
  activeStreams[streamId].viewersTimer = setInterval(() => {
    // small random fluctuation: -1, 0 or +1
    const delta = Math.floor(Math.random() * 3) - 1;
    activeStreams[streamId].viewers = Math.max(1, (activeStreams[streamId].viewers || 1) + delta);
  }, 3000);

  ffmpegCommand
    .on('start', (commandLine) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('FFmpeg command:', commandLine);
        console.log(`Stream ${streamId} iniciado`);
      }
    })
    .on('error', (err) => {
      console.error('Error en streaming:', err);
      delete activeStreams[streamId];
    })
    .on('stderr', (stderrLine) => {
      if (process.env.NODE_ENV !== 'production') console.log('FFmpeg stderr:', stderrLine);
    })
    .on('progress', (progress) => {
      if (process.env.NODE_ENV !== 'production') console.log('FFmpeg progress:', progress);
    })
    .on('end', () => {
      if (process.env.NODE_ENV !== 'production') console.log(`Stream ${streamId} finalizado`);
      // limpiar timer de viewers
      try { clearInterval(activeStreams[streamId].viewersTimer); } catch (e) {}
      delete activeStreams[streamId];
    })
    .run();
}

// Función para programar stream
function scheduleStream(scheduledStream) {
  const now = new Date();
  const scheduledTime = new Date(scheduledStream.scheduledTime);
  const delay = scheduledTime - now;

  if (delay > 0) {
    setTimeout(() => {
      const videoPath = path.join(videosDir, fs.readdirSync(videosDir).find(f => f.startsWith(scheduledStream.videoId)));
      if (fs.existsSync(videoPath)) {
        startStream(scheduledStream.id, videoPath, scheduledStream.platforms);
        scheduledStream.status = 'streaming';
      }
    }, delay);
  }
}

// Servidor
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Servidor StreamPlus corriendo en puerto ${PORT}`);
    console.log(`FFmpeg disponible: ${ffmpegAvailable()}`);
  }
});

// Verificar disponibilidad de FFmpeg
function ffmpegAvailable() {
  try {
    ffmpeg.getAvailableFormats((err, formats) => {
      if (err) {
        console.error('FFmpeg no está instalado o no está disponible en PATH');
        return false;
      }
      return true;
    });
    return true;
  } catch (error) {
    console.error('Error al verificar FFmpeg:', error);
    return false;
  }
}
