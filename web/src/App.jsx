import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const VIDEO_URL = import.meta.env.VITE_VIDEO_URL || '/videos'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const [platforms, setPlatforms] = useState({
    youtube: false,
    facebook: false,
    twitch: false,
    instagram: false,
    tiktok: false,
    twitter: false
  })
  
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamDuration, setStreamDuration] = useState(0)
  const [viewers, setViewers] = useState(0)
  const [currentStreamId, setCurrentStreamId] = useState(null)
  
  const [title, setTitle] = useState('Mi Transmisión en Vivo')
  const [description, setDescription] = useState('¡Acompáñame en esta nueva transmisión!')
  
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadVideos()
    }
  }, [isAuthenticated])

  useEffect(() => {
    let interval
    let statusInterval
    if (isStreaming) {
      interval = setInterval(() => {
        setStreamDuration(prev => prev + 1)
      }, 1000)
      // poll backend for viewers info
      fetchStatus()
      statusInterval = setInterval(() => fetchStatus(), 3000)
    }
    return () => { clearInterval(interval); clearInterval(statusInterval) }
  }, [isStreaming])

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/streams/status`)
      if (res.data && typeof res.data.totalViewers !== 'undefined') {
        setViewers(res.data.totalViewers)
      }
    } catch (error) {
      console.error('Error fetching stream status:', error)
    }
  }

  const showNotification = (message, isError = false) => {
    setNotification({ message, isError })
    setTimeout(() => setNotification(null), 3000)
  }

  const loadVideos = async () => {
    setIsLoadingVideos(true)
    try {
      const response = await axios.get(`${API_URL}/videos`)
      setVideos(response.data.videos)
    } catch (error) {
      console.error('Error al cargar videos:', error)
    }
    setIsLoadingVideos(false)
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('video', file)

    try {
      await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      showNotification('Video subido exitosamente')
      loadVideos()
    } catch (error) {
      showNotification('Error al subir video', true)
    }
    setIsUploading(false)
  }

  const handleStartStream = async () => {
    if (!selectedVideo) {
      showNotification('Selecciona un video primero', true)
      return
    }

    const activePlatforms = Object.keys(platforms).filter(p => platforms[p])
    if (activePlatforms.length === 0) {
      showNotification('Selecciona al menos una plataforma', true)
      return
    }

    try {
      const response = await axios.post(`${API_URL}/stream/start`, {
        videoId: selectedVideo.id,
        platforms: activePlatforms,
        title,
        description
      })
      
      setIsStreaming(true)
      setCurrentStreamId(response.data.streamId)
      setStreamDuration(0)
      setViewers(0)
      showNotification('Transmisión iniciada')
    } catch (error) {
      showNotification('Error al iniciar transmisión', true)
    }
  }

  const handleStopStream = async () => {
    if (!currentStreamId) return

    try {
      await axios.post(`${API_URL}/stream/stop/${currentStreamId}`)
      setIsStreaming(false)
      setCurrentStreamId(null)
      showNotification('Transmisión detenida')
    } catch (error) {
      showNotification('Error al detener transmisión', true)
    }
  }

  const handleLogin = () => {
    if (username === 'Streampluss' && password === '12345678') {
      setIsAuthenticated(true)
    } else {
      showNotification('Credenciales incorrectas', true)
    }
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    },
    loginContainer: {
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    },
    loginBox: {
      backgroundColor: '#020617',
      padding: '32px',
      borderRadius: '16px',
      border: '1px solid #1e293b',
      width: '100%',
      maxWidth: '400px'
    },
    header: {
      backgroundColor: '#020617',
      borderBottom: '1px solid #1e293b',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px'
    },
    card: {
      backgroundColor: '#020617',
      borderRadius: '16px',
      border: '1px solid #1e293b',
      padding: '24px'
    },
    input: {
      width: '100%',
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '8px',
      padding: '12px 16px',
      color: 'white',
      fontSize: '14px',
      marginBottom: '16px'
    },
    button: {
      width: '100%',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginBottom: '16px'
    },
    buttonDanger: {
      backgroundColor: '#dc2626'
    },
    platformButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#1e293b',
      color: '#94a3b8',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 'bold',
      margin: '4px'
    },
    platformButtonActive: {
      backgroundColor: '#4f46e5',
      color: 'white'
    },
    notification: {
      position: 'fixed',
      top: '16px',
      right: '16px',
      padding: '16px 24px',
      borderRadius: '8px',
      zIndex: 1000
    },
    notificationError: {
      backgroundColor: '#dc2626'
    },
    notificationSuccess: {
      backgroundColor: '#22c55e'
    },
    videoPreview: {
      backgroundColor: 'black',
      borderRadius: '16px',
      border: '1px solid #1e293b',
      aspectRatio: '16/9',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        {notification && (
          <div style={{
            ...styles.notification,
            backgroundColor: notification.isError ? '#dc2626' : '#22c55e'
          }}>
            {notification.message}
          </div>
        )}
        <div style={styles.loginBox}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>StreamPlus</h1>
            <p style={{ color: '#94a3b8' }}>
              {isLoginMode ? 'Inicia sesión' : 'Crea tu cuenta'}
            </p>
          </div>

          {isLoginMode ? (
            <>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario"
                style={styles.input}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                style={styles.input}
              />
              <button onClick={handleLogin} style={styles.button}>
                Ingresar al Estudio
              </button>
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                ¿Aún no tienes cuenta?{' '}
                <button
                  onClick={() => setIsLoginMode(false)}
                  style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer' }}
                >
                  Regístrate aquí
                </button>
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', marginBottom: '16px' }}>Registro deshabilitado en demo</p>
              <button
                onClick={() => setIsLoginMode(true)}
                style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer' }}
              >
                Volver al login
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {notification && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.isError ? '#dc2626' : '#22c55e'
        }}>
          {notification.message}
        </div>
      )}

      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>StreamPlus</span>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>Studio</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isStreaming && (
            <>
              <div style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                padding: '4px 12px', 
                borderRadius: '20px',
                color: '#22c55e',
                fontSize: '14px'
              }}>
                👥 {viewers}
              </div>
              <div style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                padding: '4px 12px', 
                borderRadius: '20px',
                color: '#ef4444',
                fontSize: '14px'
              }}>
                ⏱ {formatTime(streamDuration)}
              </div>
            </>
          )}
          <span style={{ color: '#94a3b8' }}>Hola, {username}</span>
          <button
            onClick={() => {
              handleStopStream()
              setIsAuthenticated(false)
            }}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '20px' }}
          >
            🚪
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.grid}>
          <div style={{ flex: 2 }}>
            <div style={styles.videoPreview}>
              <div style={{ textAlign: 'center' }}>
                {selectedVideo ? (
                  <div>
                    <video
                      src={`${VIDEO_URL}/${selectedVideo.filename}`}
                      controls
                      muted
                      autoPlay
                      style={{ width: '100%', maxHeight: '480px', borderRadius: '12px' }}
                    />
                    <p style={{ color: '#94a3b8', marginTop: '8px' }}>{selectedVideo.filename}</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
                    <p style={{ color: '#64748b' }}>Selecciona un video</p>
                  </div>
                )}
              </div>
              
              <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: isStreaming ? '#dc2626' : '#334155'
                }}>
                  {isStreaming ? 'EN VIVO' : 'OFFLINE'}
                </span>
              </div>
            </div>

            <div style={{ ...styles.card, marginTop: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Información del Stream</h2>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isStreaming}
                placeholder="Título"
                style={{ ...styles.input, opacity: isStreaming ? 0.5 : 1 }}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isStreaming}
                rows={3}
                placeholder="Descripción"
                style={{ ...styles.input, opacity: isStreaming ? 0.5 : 1, resize: 'none' }}
              />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={styles.card}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Seleccionar Video</h2>
              
              <label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleUpload}
                  disabled={isUploading || isStreaming}
                  style={{ display: 'none' }}
                  id="video-upload"
                />
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: isUploading || isStreaming ? 'not-allowed' : 'pointer',
                  backgroundColor: isUploading || isStreaming ? '#1e293b' : '#4f46e5',
                  color: 'white',
                  opacity: isUploading || isStreaming ? 0.5 : 1
                }}>
                  {isUploading ? 'Subiendo...' : '📤 Subir Video'}
                </span>
              </label>

              <div style={{ marginTop: '16px', maxHeight: '200px', overflowY: 'auto' }}>
                {isLoadingVideos ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8' }}>Cargando...</p>
                ) : videos.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b' }}>No hay videos</p>
                ) : (
                  videos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => !isStreaming && setSelectedVideo(video)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: isStreaming ? 'not-allowed' : 'pointer',
                        backgroundColor: selectedVideo?.id === video.id ? 'rgba(79, 70, 229, 0.2)' : '#1e293b',
                        border: selectedVideo?.id === video.id ? '1px solid #4f46e5' : 'none',
                        marginBottom: '8px'
                      }}
                    >
                      <span>🎬</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {video.filename}
                        </p>
                        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {formatFileSize(video.size)}
                        </p>
                      </div>
                      {selectedVideo?.id === video.id && <span>✓</span>}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ ...styles.card, marginTop: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Redes Sociales</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.keys(platforms).map((platform) => (
                  <button
                    key={platform}
                    onClick={() => !isStreaming && setPlatforms(prev => ({
                      ...prev,
                      [platform]: !prev[platform]
                    }))}
                    disabled={isStreaming}
                    style={{
                      ...styles.platformButton,
                      backgroundColor: platforms[platform] ? '#4f46e5' : '#1e293b',
                      color: platforms[platform] ? 'white' : '#94a3b8',
                      opacity: isStreaming ? 0.5 : 1
                    }}
                  >
                    {platform.toUpperCase()}
                  </button>
                ))}
              </div>
              
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                  💡 Selecciona las plataformas donde quieres transmitir. Los stream keys están configurados en el backend.
                </p>
              </div>
            </div>

            <button
              onClick={isStreaming ? handleStopStream : handleStartStream}
              style={{
                ...styles.button,
                backgroundColor: isStreaming ? '#dc2626' : '#4f46e5',
                marginTop: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isStreaming ? '⏹ Detener Transmisión' : '▶ Iniciar Transmisión'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
