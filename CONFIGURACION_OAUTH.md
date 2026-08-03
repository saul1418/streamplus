# Guía de Configuración OAuth para StreamPlus

Esta guía te explica cómo obtener las credenciales OAuth necesarias para que StreamPlus pueda conectarse directamente a tus cuentas de YouTube, Facebook y Twitch.

## 📋 Requisitos Previos

- Cuentas activas en las plataformas donde quieres transmitir
- Acceso a las consolas de desarrolladores de cada plataforma
- Tiempo para crear y configurar las aplicaciones OAuth

## 🔐 YouTube (Google Cloud Console)

### Paso 1: Crear Proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el ID del proyecto

### Paso 2: Habilitar YouTube Data API v3
1. En el menú, ve a "APIs & Services" > "Library"
2. Busca "YouTube Data API v3"
3. Haz clic en "Enable"

### Paso 3: Configurar OAuth Consent Screen
1. Ve a "APIs & Services" > "OAuth consent screen"
2. Elige "External" (para uso público)
3. Completa la información requerida:
   - App name: "StreamPlus Studio"
   - User support email: tu email
   - Developer contact: tu email
4. Agrega los permisos necesarios:
   - `https://www.googleapis.com/auth/youtube`
5. Guarda y continúa

### Paso 4: Crear Credenciales OAuth
1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "OAuth client ID"
3. Tipo de aplicación: "Web application"
4. Nombre: "StreamPlus YouTube"
5. Authorized redirect URIs: Agrega `http://localhost:3000/auth/youtube/callback`
6. Haz clic en "Create"

### Paso 5: Obtener Credenciales
1. Copia el "Client ID"
2. Copia el "Client Secret"
3. Configúralos en `backend/.env`:
```env
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/youtube/callback
```

## 📘 Facebook (Meta for Developers)

### Paso 1: Crear Aplicación en Meta for Developers
1. Ve a [Meta for Developers](https://developers.facebook.com)
2. Haz clic en "Create App"
3. Tipo de aplicación: "Business"
4. Nombre: "StreamPlus Studio"
5. Completa la información requerida

### Paso 2: Configurar Facebook Login
1. En el dashboard de tu app, ve a "Add Product" > "Facebook Login"
2. Haz clic en "Set Up"
3. Configura los redirect URIs:
   - Agrega `http://localhost:3000/auth/facebook/callback`
4. Habilita los permisos necesarios:
   - `email`
   - `pages_manage_posts`
   - `pages_read_engagement`

### Paso 3: Configurar Validación OAuth
1. Ve a "App Review" > "Permissions and Features"
2. Solicita los permisos necesarios
3. Para desarrollo, puedes usar "Test Mode"

### Paso 4: Obtener Credenciales
1. Ve a "Settings" > "Basic"
2. Copia el "App ID"
3. Copia el "App Secret"
4. Configúralos en `backend/.env`:
```env
FACEBOOK_APP_ID=tu_app_id_aqui
FACEBOOK_APP_SECRET=tu_app_secret_aqui
FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback
```

## 🎮 Twitch (Twitch Developers)

### Paso 1: Crear Aplicación en Twitch Developers
1. Ve a [Twitch Developers](https://dev.twitch.tv/console)
2. Inicia sesión con tu cuenta de Twitch
3. Haz clic en "Register Your Application"
4. Nombre: "StreamPlus Studio"
5. OAuth Redirect URLs: `http://localhost:3000/auth/twitch/callback`
6. Category: "Streaming Tool"

### Paso 2: Configurar Permisos
1. En la configuración de tu aplicación
2. Agrega los siguientes scopes:
   - `user:read:email`
   - `channel:read:subscriptions`

### Paso 3: Obtener Credenciales
1. Copia el "Client ID"
2. Copia el "Client Secret"
3. Configúralos en `backend/.env`:
```env
TWITCH_CLIENT_ID=tu_client_id_aqui
TWITCH_CLIENT_SECRET=tu_client_secret_aqui
TWITCH_CALLBACK_URL=http://localhost:3000/auth/twitch/callback
```

## ⚙️ Configuración Final

### 1. Actualizar archivo .env
Edita `backend/.env` con todas las credenciales obtenidas:

```env
# Configuración del Servidor
PORT=3000
SESSION_SECRET=genera_un_secreto_aleatorio_largo_aqui

# YouTube (Google Cloud Console)
GOOGLE_CLIENT_ID=tu_google_client_id_real
GOOGLE_CLIENT_SECRET=tu_google_client_secret_real
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/youtube/callback

# Facebook (Meta for Developers)
FACEBOOK_APP_ID=tu_facebook_app_id_real
FACEBOOK_APP_SECRET=tu_facebook_app_secret_real
FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback

# Twitch (Twitch Developers)
TWITCH_CLIENT_ID=tu_twitch_client_id_real
TWITCH_CLIENT_SECRET=tu_twitch_client_secret_real
TWITCH_CALLBACK_URL=http://localhost:3000/auth/twitch/callback
```

### 2. Reiniciar el Backend
```bash
cd backend
npm start
```

### 3. Probar la Conexión
1. Ve a http://localhost:5173
2. Inicia sesión (Streampluss / 12345678)
3. En la sección "Conectar Redes Sociales", haz clic en "Conectar" en la plataforma deseada
4. Serás redirigido a la plataforma para autorizar
5. Después de autorizar, volverás a la app con la cuenta conectada

## 🔍 Solución de Problemas

### Error: "redirect_uri_mismatch"
- Verifica que el callback URL en la configuración de la plataforma coincida exactamente con el del archivo .env
- Asegúrate de que no haya barras adicionales o diferencias de mayúsculas/minúsculas

### Error: "invalid_client"
- Verifica que el Client ID y Client Secret sean correctos
- Asegúrate de que no hay espacios adicionales

### Error: "access_denied"
- Verifica que los permisos solicitados estén aprobados
- Asegúrate de que la aplicación esté en modo de prueba si no está aprobada

### Error: "Unauthorized"
- Verifica que los scopes solicitados estén configurados correctamente
- Asegúrate de que la aplicación tenga los permisos necesarios

## 🚀 Siguientes Pasos

Una vez configuradas las credenciales OAuth:

1. **Conecta tus cuentas** desde la interfaz de StreamPlus
2. **Sube tu video** pregrabado
3. **Selecciona las plataformas** conectadas
4. **Inicia la transmisión** - StreamPlus usará OAuth para transmitir directamente

## 📞 Soporte

Si tienes problemas con la configuración OAuth:
- Revisa la documentación oficial de cada plataforma
- Verifica que los redirect URIs sean correctos
- Asegúrate de que los permisos solicitados estén aprobados

## ⚠️ Notas de Seguridad

- **Nunca compartas** tus Client Secrets
- **No commits** el archivo .env con credenciales reales
- **Usa variables de entorno** en producción
- **Rota las credenciales** periódicamente
- **Monitorea** el uso de tus aplicaciones OAuth
