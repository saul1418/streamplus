import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Radio, 
  MonitorUp, 
  Settings, 
  Youtube, 
  Facebook, 
  Twitch, 
  Twitter, 
  Instagram,
  Share2, 
  Square,
  Upload,
  AlertCircle,
  Activity,
  Calendar,
  Clock,
  Scissors,
  Film,
  CheckCircle2,
  PlusCircle,
  VideoOff,
  Users,
  MessageSquare,
  Image as ImageIcon,
  Lock,
  User,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  // Estado de Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isVerificationMode, setIsVerificationMode] = useState(false);
  
  const [loginUser, setLoginUser] = useState('Streampluss');
  const [loginPass, setLoginPass] = useState('12345678');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [authMsg, setAuthMsg] = useState({ type: '', text: '' });

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamDuration, setStreamDuration] = useState(0);
  const [mediaType, setMediaType] = useState('camera'); 
  const [isCameraActive, setIsCameraActive] = useState(true); // Nuevo estado para encender/apagar cámara
  const [videoFile, setVideoFile] = useState(null);
  const [streamTitle, setStreamTitle] = useState('Mi Transmisión en Vivo');
  const [streamDescription, setStreamDescription] = useState('¡Acompáñame en esta nueva transmisión!');
  
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  
  const [clips, setClips] = useState([]); 
  const [watermark, setWatermark] = useState('@StreamPlus');

  const [viewers, setViewers] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);

  const [platforms, setPlatforms] = useState({
    youtube: false,
    facebook: false,
    twitch: false,
    twitter: false,
    instagram: false,
    tiktok: false
  });

  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef(null);
  const streamTimerRef = useRef(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUser.trim() === '' || loginPass.trim() === '') {
      setAuthMsg({ type: 'error', text: 'Por favor, ingresa tu usuario y contraseña.' });
      return;
    }
    
    // Verificamos si es la cuenta de prueba o la cuenta recién registrada
    const isTestAccount = loginUser === 'Streampluss' && loginPass === '12345678';
    const isRegisteredAccount = regName !== '' && loginUser === regName && loginPass === regPass;

    if (isTestAccount || isRegisteredAccount) {
      setAuthMsg({ type: '', text: '' });
      setIsAuthenticated(true);
    } else {
      setAuthMsg({ type: 'error', text: 'Credenciales incorrectas. Usa la cuenta de prueba (Streampluss / 12345678).' });
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (regName.trim() === '' || regEmail.trim() === '' || regPhone.trim() === '' || regPass === '') {
      setAuthMsg({ type: 'error', text: 'Todos los campos son obligatorios.' });
      return;
    }
    if (regPass !== regConfirmPass) {
      setAuthMsg({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    
    // Simulación de envío de código a correo y WhatsApp
    setAuthMsg({ type: 'success', text: '¡Código de seguridad enviado!' });
    setTimeout(() => {
      setIsVerificationMode(true);
      setAuthMsg({ type: '', text: '' });
    }, 1500);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (verificationCode.trim().length < 4) {
      setAuthMsg({ type: 'error', text: 'Ingresa un código válido de al menos 4 dígitos.' });
      return;
    }
    
    // Simulación de verificación exitosa
    setAuthMsg({ type: 'success', text: '¡Cuenta verificada exitosamente! Entrando al estudio...' });
    setTimeout(() => {
      setLoginUser(regName);
      setLoginPass(regPass);
      setIsVerificationMode(false);
      setIsAuthenticated(true);
      setAuthMsg({ type: '', text: '' });
    }, 1500);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsStreaming(false); 
    setIsLoginMode(true);
    setIsVerificationMode(false);
    setLoginUser('Streampluss');
    setLoginPass('12345678');
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPass('');
    setRegConfirmPass('');
    setVerificationCode('');
    setAuthMsg({ type: '', text: '' });
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    let mediaStream = null;
    const startCamera = async () => {
      try {
        setCameraError(false);
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          // Aplicamos el estado de encendido/apagado al track de video
          const videoTrack = mediaStream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.enabled = isCameraActive;
          }
        }
      } catch (err) {
        setCameraError(true);
      }
    };

    if (mediaType === 'camera') {
      startCamera();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
    return () => {
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    };
  }, [mediaType, isAuthenticated, isCameraActive]); // Agregamos isCameraActive a las dependencias

  useEffect(() => {
    let viewerInterval;
    let chatInterval;

    if (isStreaming) {
      streamTimerRef.current = setInterval(() => {
        setStreamDuration(prev => prev + 1);
      }, 1000);

      viewerInterval = setInterval(() => {
        setViewers(prev => prev + Math.floor(Math.random() * 12));
      }, 3000);

      chatInterval = setInterval(() => {
        const activePlatformsArray = Object.keys(platforms).filter(p => platforms[p]);
        if (activePlatformsArray.length > 0) {
          const names = ['Ana', 'Carlos', 'Miguel', 'Laura', 'Pedro', 'Sofía'];
          const messages = ['¡Qué buen stream! 🔥', 'Saludos desde Santo Domingo 🇩🇴', '¿Va a quedar guardado?', 'Excelente información', '¡Compartido!', 'Jajaja total'];
          
          const newMsg = {
            id: Date.now(),
            platform: activePlatformsArray[Math.floor(Math.random() * activePlatformsArray.length)],
            user: names[Math.floor(Math.random() * names.length)],
            text: messages[Math.floor(Math.random() * messages.length)]
          };
          
          setChatMessages(prev => [newMsg, ...prev].slice(0, 50));
        }
      }, 2500);

    } else {
      clearInterval(streamTimerRef.current);
      clearInterval(viewerInterval);
      clearInterval(chatInterval);
      setStreamDuration(0);
      setViewers(0);
      setChatMessages([]);
    }

    return () => {
      clearInterval(streamTimerRef.current);
      clearInterval(viewerInterval);
      clearInterval(chatInterval);
    };
  }, [isStreaming, platforms]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCreateClip = () => {
    const newClip = {
      id: Date.now(),
      timestamp: formatTime(streamDuration),
      cta: '¡Haz clic en el enlace de mi perfil!',
      uploaded: false
    };
    setClips(prev => [newClip, ...prev]);
  };

  const handleUpdateClipCTA = (id, newCta) => {
    setClips(prev => prev.map(clip => clip.id === id ? { ...clip, cta: newCta } : clip));
  };

  const handleUploadClip = (id) => {
    setClips(prev => prev.map(clip => clip.id === id ? { ...clip, uploaded: true } : clip));
  };

  const handleTogglePlatform = (platform) => {
    setPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const handleStartStream = () => {
    const activePlatforms = Object.values(platforms).some(Boolean);
    if (!activePlatforms) {
      alert("Por favor, selecciona al menos una red social para transmitir.");
      return;
    }
    if (mediaType === 'video' && !videoFile) {
      alert("Por favor, sube un video para transmitir.");
      return;
    }
    if (isScheduled) {
      if (!scheduledDate) return alert("Selecciona una fecha y hora.");
      if (new Date(scheduledDate) <= new Date()) return alert("La fecha debe ser en el futuro.");
      return;
    }

    setIsStreaming(true);
    if (mediaType === 'video' && videoRef.current) videoRef.current.play();
  };

  const handleStopStream = () => {
    setIsStreaming(false);
    if (mediaType === 'video' && videoRef.current) videoRef.current.pause();
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoFile(url);
      if (videoRef.current) videoRef.current.src = url;
    }
  };

  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'youtube': return <Youtube className="w-3 h-3 text-red-500" />;
      case 'facebook': return <Facebook className="w-3 h-3 text-blue-500" />;
      case 'twitch': return <Twitch className="w-3 h-3 text-purple-500" />;
      case 'twitter': return <Twitter className="w-3 h-3 text-sky-400" />;
      case 'instagram': return <Instagram className="w-3 h-3 text-pink-500" />;
      case 'tiktok': return <Activity className="w-3 h-3 text-slate-200" />;
      default: return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]"></div>

        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-slate-900 p-4 rounded-full border border-slate-800 mb-4 shadow-inner">
              <Lock className="w-10 h-10 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-8 h-8 text-indigo-500" />
              StreamPlus
            </h1>
            <p className="text-slate-400 mt-2 text-sm text-center">
              {isVerificationMode 
                ? 'Verifica tu identidad para continuar' 
                : isLoginMode 
                  ? 'Inicia sesión para acceder al estudio' 
                  : 'Crea tu cuenta para comenzar a transmitir'}
            </p>
          </div>

          {authMsg.text && (
            <div className={`mb-5 p-3 rounded-lg text-sm text-center border ${authMsg.type === 'error' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'}`}>
              {authMsg.text}
            </div>
          )}

          {isVerificationMode ? (
            <form onSubmit={handleVerify} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto mb-3 opacity-80" />
                <p className="text-slate-300 text-sm">
                  Hemos enviado un código seguro a tu correo <strong className="text-white">{regEmail}</strong> y a tu WhatsApp <strong className="text-white">{regPhone}</strong>.
                </p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1 text-center block">Código de 6 dígitos</label>
                <input
                  type="text"
                  maxLength="6"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} // Solo permite números
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 text-center text-2xl tracking-[0.5em] text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700 font-mono"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 active:scale-[0.98] mt-4"
              >
                Verificar y Entrar
              </button>
              
              <div className="text-center mt-4">
                <button type="button" onClick={() => setAuthMsg({type: 'success', text: 'Nuevo código enviado por WhatsApp.'})} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                  Reenviar código
                </button>
                <span className="text-slate-600 mx-3">|</span>
                <button type="button" onClick={() => setIsVerificationMode(false)} className="text-sm text-slate-400 hover:text-slate-300">
                  Volver atrás
                </button>
              </div>
            </form>
          ) : isLoginMode ? (
            <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1">Usuario</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="Tu nombre de usuario"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="text-xs text-slate-500 text-center bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                💡 Cuenta de prueba lista: <b>Streampluss</b> / <b>12345678</b>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 active:scale-[0.98] mt-4"
              >
                Siguiente Paso
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1">Usuario</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-500" /></div>
                  <input type="text" value={regName} onChange={e=>setRegName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Tu nombre" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-500" /></div>
                  <input type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="correo@ejemplo.com" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1">WhatsApp</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-slate-500" /></div>
                  <input type="tel" value={regPhone} onChange={e=>setRegPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+1 234 567 8900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-400 ml-1">Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-slate-500" /></div>
                    <input type="password" value={regPass} onChange={e=>setRegPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-400 ml-1">Confirmar</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-slate-500" /></div>
                    <input type="password" value={regConfirmPass} onChange={e=>setRegConfirmPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••" />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-base transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 active:scale-[0.98] mt-2">
                Crear Cuenta Gratuita
              </button>
            </form>
          )}

          {!isVerificationMode && (
            <div className="mt-6 text-center border-t border-slate-800 pt-5">
              <p className="text-slate-400 text-sm">
                {isLoginMode ? "¿Aún no tienes cuenta?" : "¿Ya tienes una cuenta?"}{" "}
                <button 
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setAuthMsg({ type: '', text: '' });
                  }}
                  className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
                >
                  {isLoginMode ? "Regístrate aquí" : "Inicia sesión"}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Activity className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight">StreamPlus <span className="text-slate-400 text-sm font-normal">Studio</span></h1>
        </div>
        <div className="flex items-center space-x-4">
          {isStreaming && (
            <>
              <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-emerald-400">{viewers.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 bg-red-900/30 text-red-400 px-3 py-1 rounded-full border border-red-800/50">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="font-mono font-medium">{formatTime(streamDuration)}</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4 ml-2">
            <span className="text-sm font-medium text-slate-400 hidden sm:block">Hola, {loginUser}</span>
            <button className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-2 hover:bg-rose-500/10 rounded-full transition-colors text-slate-400 hover:text-rose-500"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 flex flex-col p-4 gap-6 max-w-[1400px] mx-auto w-full">
        
        {/* Top Area: Studio */}
        <div className="flex flex-col lg:flex-row gap-4 w-full">
          
          {/* Left Column: Video Preview & Details */}
          <div className="flex-1 flex flex-col gap-4">
            
            {/* Video Player */}
            <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 aspect-video relative shadow-xl">
              {cameraError && mediaType === 'camera' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                  <AlertCircle className="w-12 h-12 mb-2 text-rose-500/50" />
                  <p>No se pudo acceder a la cámara.</p>
                </div>
              ) : !isCameraActive && mediaType === 'camera' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-500 z-0">
                  <VideoOff className="w-16 h-16 mb-4 text-slate-700" />
                  <p className="font-medium text-slate-400">Cámara Apagada</p>
                </div>
              ) : null}
              
              <video 
                ref={videoRef}
                className={`w-full h-full object-cover bg-black ${!isCameraActive && mediaType === 'camera' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                autoPlay={mediaType === 'camera'}
                muted={true}
                controls={mediaType === 'video' && !isStreaming}
                loop={mediaType === 'video'}
              />

              <div className="absolute top-4 left-4 flex gap-2">
                <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${isStreaming ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-800 text-slate-400'}`}>
                  {isStreaming ? 'EN VIVO' : 'OFFLINE'}
                </div>
                <div className="bg-slate-800/80 backdrop-blur px-2 py-1 rounded text-xs font-medium text-slate-300 border border-slate-700/50">
                  {mediaType === 'camera' ? 'Cámara Web' : 'Video Pregrabado'}
                </div>
              </div>

              {/* Botón rápido para apagar/encender cámara en el propio reproductor */}
              {mediaType === 'camera' && !cameraError && (
                <div className="absolute bottom-4 left-4 z-10 animate-in fade-in duration-300">
                  <button 
                    onClick={() => setIsCameraActive(!isCameraActive)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 border ${isCameraActive ? 'bg-slate-900/70 text-slate-200 border-slate-700/50 hover:bg-slate-800/80' : 'bg-rose-600 text-white border-rose-500 hover:bg-rose-500 shadow-rose-600/30'}`}
                  >
                    {isCameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    <span>{isCameraActive ? 'Apagar Cámara' : 'Encender Cámara'}</span>
                  </button>
                </div>
              )}

              {isStreaming && (
                <div className="absolute bottom-4 right-4 animate-in fade-in zoom-in duration-300">
                  <button 
                    onClick={handleCreateClip}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-indigo-400/50"
                  >
                    <Scissors className="w-4 h-4" /> Sacar Corte (30s)
                  </button>
                </div>
              )}
            </div>

            {/* Stream Info */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-sm flex-1">
              <h2 className="text-lg font-semibold mb-4 text-slate-100">Información del Stream</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Título</label>
                    <input 
                      type="text" 
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                      disabled={isStreaming}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Descripción</label>
                    <textarea 
                      value={streamDescription}
                      onChange={(e) => setStreamDescription(e.target.value)}
                      disabled={isStreaming}
                      rows="3"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 resize-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-4 border-l border-slate-800 pl-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        Programar transmisión
                      </label>
                      <button 
                        onClick={() => !isStreaming && setIsScheduled(!isScheduled)}
                        disabled={isStreaming}
                        className={`w-9 h-5 rounded-full transition-colors relative disabled:opacity-50 ${isScheduled ? 'bg-indigo-600' : 'bg-slate-700'}`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-all ${isScheduled ? 'left-5' : 'left-1'}`}></div>
                      </button>
                    </div>
                    {isScheduled && (
                      <input 
                        type="datetime-local" 
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        disabled={isStreaming}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none [color-scheme:dark]"
                      />
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                      <ImageIcon className="w-4 h-4 text-indigo-400" />
                      Marca de agua (Cortes)
                    </label>
                    <input 
                      type="text" 
                      value={watermark}
                      onChange={(e) => setWatermark(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Ej: @TuUsuario"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Controls, Networks & Chat */}
          <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 h-full max-h-[800px]">
            
            {/* Networks */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm shrink-0">
              <h2 className="text-sm font-semibold mb-3 text-slate-100 flex items-center justify-between">
                Destinos <Share2 className="w-4 h-4 text-slate-400" />
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {['youtube', 'facebook', 'twitch', 'twitter', 'instagram', 'tiktok'].map(plat => (
                  <button 
                    key={plat}
                    onClick={() => !isStreaming && handleTogglePlatform(plat)}
                    disabled={isStreaming}
                    className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-sm capitalize transition-all disabled:opacity-50 ${platforms[plat] ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                  >
                    {getPlatformIcon(plat)} {plat === 'twitter' ? 'X' : plat}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Selection (Mini) */}
             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm shrink-0">
               <h2 className="text-sm font-semibold mb-3 text-slate-100 flex items-center justify-between">
                Origen del Video
                {mediaType === 'camera' && (
                  <button 
                    onClick={() => setIsCameraActive(!isCameraActive)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${isCameraActive ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'}`}
                  >
                    {isCameraActive ? <><Video className="w-3.5 h-3.5" /> Cámara ON</> : <><VideoOff className="w-3.5 h-3.5" /> Cámara OFF</>}
                  </button>
                )}
              </h2>
              <div className="flex gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
                <button 
                  onClick={() => !isStreaming && setMediaType('camera')}
                  disabled={isStreaming}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-colors ${mediaType === 'camera' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'} disabled:opacity-50`}
                >
                  <Video className="w-4 h-4" /> Cámara
                </button>
                <button 
                  onClick={() => !isStreaming && setMediaType('video')}
                  disabled={isStreaming}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-colors ${mediaType === 'video' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'} disabled:opacity-50`}
                >
                  <MonitorUp className="w-4 h-4" /> Archivo
                </button>
              </div>
               {mediaType === 'video' && (
                  <div className="mt-3">
                    <label className="flex flex-col items-center justify-center w-full py-2 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer hover:bg-slate-800/50 hover:border-indigo-500/50 transition-colors">
                      <span className="text-xs text-slate-400 flex items-center gap-2"><Upload className="w-4 h-4" /> Subir archivo MP4</span>
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={isStreaming} />
                    </label>
                  </div>
                )}
            </div>

            {/* Unified Chat */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-sm flex-1 flex flex-col min-h-[200px] overflow-hidden">
              <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-slate-100">Chat Unificado</h2>
              </div>
              <div className="flex-1 p-3 overflow-y-auto bg-slate-950/50 space-y-3 custom-scrollbar flex flex-col-reverse">
                {!isStreaming ? (
                  <p className="text-xs text-slate-500 text-center my-auto">Inicia transmisión para ver los mensajes.</p>
                ) : chatMessages.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center my-auto">Esperando mensajes...</p>
                ) : (
                  chatMessages.map(msg => (
                    <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 text-sm bg-slate-900/80 p-2 rounded-lg border border-slate-800/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        {getPlatformIcon(msg.platform)}
                        <span className="font-semibold text-slate-300 text-xs">{msg.user}</span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="shrink-0 pt-2">
              {!isStreaming ? (
                <button 
                  onClick={handleStartStream}
                  className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-lg ${isScheduled ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'}`}
                >
                  {isScheduled ? <Calendar className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
                  {isScheduled ? 'Programar' : 'Transmitir'}
                </button>
              ) : (
                <button 
                  onClick={handleStopStream}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/20"
                >
                  <Square className="w-5 h-5 fill-current" /> Detener
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Area: Clips Manager Section */}
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-sm w-full">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="bg-indigo-500/10 p-2 rounded-lg">
              <Film className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                Gestor de Cortes Rápidos
                {clips.length > 0 && <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-full">{clips.length}</span>}
              </h2>
              <p className="text-sm text-slate-400 mt-1">Extrae y publica clips con tu marca de agua ({watermark})</p>
            </div>
          </div>
          
          {clips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
              <VideoOff className="w-16 h-16 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">Aún no tienes cortes generados</h3>
              <p className="text-slate-500 max-w-md text-sm">
                Inicia una transmisión y usa el botón <span className="text-indigo-400 font-semibold">"Sacar Corte"</span> para capturar los mejores momentos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {clips.map((clip) => (
                <div key={clip.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col gap-3 relative overflow-hidden transition-all hover:border-slate-600 hover:shadow-lg">
                  {clip.uploaded && (
                    <div className="absolute top-0 right-0 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 z-10 backdrop-blur-sm">
                      <CheckCircle2 className="w-3 h-3" /> PUBLICADO
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-xs"><Clock className="w-3 h-3" /> {clip.timestamp}</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700 font-medium">00:30s</span>
                  </div>

                  <div className="mt-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">CTA del Video</label>
                    <input 
                      type="text" 
                      value={clip.cta}
                      onChange={(e) => handleUpdateClipCTA(clip.id, e.target.value)}
                      disabled={clip.uploaded}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none disabled:opacity-50"
                    />
                  </div>

                  <button 
                    onClick={() => handleUploadClip(clip.id)}
                    disabled={clip.uploaded}
                    className={`mt-auto pt-2 w-full py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-all ${clip.uploaded ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95'}`}
                  >
                    {clip.uploaded ? <>Publicado con éxito</> : <><PlusCircle className="w-4 h-4" /> Subir a Redes</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 10px; }
      `}} />
    </div>
  );
}