import 'dart:async';
import 'dart:io';
import 'dart:math';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:file_picker/file_picker.dart';

void main() {
  runApp(const StreamPlusApp());
}

class StreamPlusApp extends StatelessWidget {
  const StreamPlusApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'StreamPlus Studio',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        cardColor: const Color(0xFF020617),
        primaryColor: const Color(0xFF4F46E5),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF4F46E5),
          secondary: Color(0xFF10B981),
          error: Color(0xFFE11D48),
        ),
        fontFamily: 'Roboto',
      ),
      home: const StreamPlusMain(),
    );
  }
}

class StreamPlusMain extends StatefulWidget {
  const StreamPlusMain({Key? key}) : super(key: key);

  @override
  State<StreamPlusMain> createState() => _StreamPlusMainState();
}

class _StreamPlusMainState extends State<StreamPlusMain> {
  // Autenticación
  bool isAuthenticated = false;
  bool isLoginMode = true;
  bool isVerificationMode = false;
  
  final TextEditingController loginUserCtrl = TextEditingController(text: 'Streampluss');
  final TextEditingController loginPassCtrl = TextEditingController(text: '12345678');
  
  final TextEditingController regNameCtrl = TextEditingController();
  final TextEditingController regEmailCtrl = TextEditingController();
  final TextEditingController regPhoneCtrl = TextEditingController();
  final TextEditingController regPassCtrl = TextEditingController();
  
  final TextEditingController verifCodeCtrl = TextEditingController();

  // Estados del Studio
  bool isStreaming = false;
  int streamDuration = 0;
  bool isCameraActive = true;
  String mediaType = 'camera'; 
  
  final TextEditingController titleCtrl = TextEditingController(text: 'Mi Transmisión en Vivo');
  final TextEditingController descCtrl = TextEditingController(text: '¡Acompáñame en esta nueva transmisión!');
  
  bool isScheduled = false;
  final TextEditingController watermarkCtrl = TextEditingController(text: '@StreamPlus');

  // Video backend / uploads
  bool isLoadingVideos = false;
  bool isUploading = false;
  List<Map<String, dynamic>> availableVideos = [];
  String? selectedVideoId;
  String? selectedVideoName;
  String? currentStreamId;
  String _baseUrl = 'http://localhost:3000';

  // Chat y Vistas
  int viewers = 0;
  List<Map<String, dynamic>> chatMessages = [];
  List<Map<String, dynamic>> clips = [];

  Map<String, bool> platforms = {
    'youtube': false, 'facebook': false, 'twitch': false, 
    'twitter': false, 'instagram': false, 'tiktok': false
  };

  Timer? streamTimer;
  Timer? viewersTimer;
  Timer? chatTimer;

  @override
  void dispose() {
    loginUserCtrl.dispose();
    loginPassCtrl.dispose();
    regNameCtrl.dispose();
    regEmailCtrl.dispose();
    regPhoneCtrl.dispose();
    regPassCtrl.dispose();
    verifCodeCtrl.dispose();
    titleCtrl.dispose();
    descCtrl.dispose();
    watermarkCtrl.dispose();
    _cancelTimers();
    super.dispose();
  }

  void _cancelTimers() {
    streamTimer?.cancel();
    viewersTimer?.cancel();
    chatTimer?.cancel();
  }

  // Utilidad para mostrar notificaciones (reemplaza a los "alert")
  void _showMsg(String text, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(text),
        backgroundColor: isError ? Colors.redAccent : Colors.green,
        behavior: SnackBarBehavior.floating,
      )
    );
  }

  // Métodos del Backend
  Future<void> _loadVideos() async {
    setState(() => isLoadingVideos = true);
    try {
      final response = await http.get(Uri.parse('$_baseUrl/videos'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          availableVideos = List<Map<String, dynamic>>.from(data['videos']);
          isLoadingVideos = false;
        });
      }
    } catch (e) {
      print('Error al cargar videos: $e');
      setState(() => isLoadingVideos = false);
    }
  }

  Future<void> _uploadVideo() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.video,
        allowMultiple: false,
      );

      if (result != null && result.files.single.path != null) {
        setState(() => isUploading = true);
        
        File file = File(result.files.single.path!);
        var request = http.MultipartRequest('POST', Uri.parse('$_baseUrl/upload'));
        request.files.add(await http.MultipartFile.fromPath('video', file.path));
        
        var response = await request.send();
        
        if (response.statusCode == 200) {
          _showMsg('Video subido exitosamente');
          await _loadVideos();
        } else {
          _showMsg('Error al subir video', isError: true);
        }
        
        setState(() => isUploading = false);
      }
    } catch (e) {
      print('Error al subir video: $e');
      _showMsg('Error al subir video', isError: true);
      setState(() => isUploading = false);
    }
  }

  Future<void> _startStream() async {
    if (selectedVideoId == null) {
      _showMsg('Selecciona un video primero', isError: true);
      return;
    }

    bool hasPlatform = platforms.values.any((v) => v == true);
    if (!hasPlatform) {
      _showMsg('Selecciona al menos una red social.', isError: true);
      return;
    }

    try {
      final activePlatforms = platforms.entries
          .where((e) => e.value)
          .map((e) => e.key)
          .toList();

      final response = await http.post(
        Uri.parse('$_baseUrl/stream/start'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'videoId': selectedVideoId,
          'platforms': activePlatforms,
          'title': titleCtrl.text,
          'description': descCtrl.text,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          isStreaming = true;
          currentStreamId = data['streamId'];
          streamDuration = 0;
          viewers = 1;
          chatMessages.clear();
        });
        _startTimers();
        _showMsg('Transmisión iniciada');
      } else {
        _showMsg('Error al iniciar transmisión', isError: true);
      }
    } catch (e) {
      print('Error al iniciar stream: $e');
      _showMsg('Error al iniciar transmisión', isError: true);
    }
  }

  Future<void> _stopStream() async {
    if (currentStreamId == null) return;

    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/stream/stop/$currentStreamId'),
      );

      if (response.statusCode == 200) {
        setState(() {
          isStreaming = false;
          currentStreamId = null;
        });
        _cancelTimers();
        _showMsg('Transmisión detenida');
      }
    } catch (e) {
      print('Error al detener stream: $e');
      _showMsg('Error al detener transmisión', isError: true);
    }
  }

  void _handleLogin() {
    if (loginUserCtrl.text.trim().isEmpty || loginPassCtrl.text.trim().isEmpty) {
      _showMsg('Por favor, ingresa tu usuario y contraseña.', isError: true);
      return;
    }
    
    bool isTestAccount = loginUserCtrl.text == 'Streampluss' && loginPassCtrl.text == '12345678';
    bool isRegistered = regNameCtrl.text.isNotEmpty && 
                        loginUserCtrl.text == regNameCtrl.text && 
                        loginPassCtrl.text == regPassCtrl.text;

    if (isTestAccount || isRegistered) {
      setState(() => isAuthenticated = true);
    } else {
      _showMsg('Credenciales incorrectas.', isError: true);
    }
  }

  void _handleRegister() {
    if (regNameCtrl.text.isEmpty || regEmailCtrl.text.isEmpty || regPhoneCtrl.text.isEmpty || regPassCtrl.text.isEmpty) {
      _showMsg('Todos los campos son obligatorios.', isError: true);
      return;
    }
    _showMsg('¡Código enviado a WhatsApp y Correo!');
    setState(() => isVerificationMode = true);
  }

  void _handleVerify() {
    if (verifCodeCtrl.text.length < 4) {
      _showMsg('Ingresa un código válido.', isError: true);
      return;
    }
    _showMsg('¡Verificado con éxito!');
    loginUserCtrl.text = regNameCtrl.text;
    loginPassCtrl.text = regPassCtrl.text;
    setState(() {
      isVerificationMode = false;
      isAuthenticated = true;
    });
  }

  void _handleLogout() {
    _stopStream();
    setState(() {
      isAuthenticated = false;
      isVerificationMode = false;
      isLoginMode = true;
    });
  }

  void _handleStartStream() {
    _startStream();
  }

  void _handleStopStream() {
    _stopStream();
  }

  void _startTimers() {
    streamTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() => streamDuration++);
    });

    viewersTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      // small realistic fluctuations: mostly 0 or +1
      final inc = Random().nextInt(3) == 0 ? 0 : Random().nextInt(2);
      setState(() => viewers = max(0, viewers + inc));
    });

    chatTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      List<String> activePlats = platforms.entries.where((e) => e.value).map((e) => e.key).toList();
      if (activePlats.isNotEmpty) {
        List<String> names = ['Ana', 'Carlos', 'Miguel', 'Laura', 'Pedro'];
        List<String> msgs = ['¡Qué buen stream! 🔥', 'Saludos 🇩🇴', '¿Va a quedar guardado?', 'Excelente', 'Compartido'];
        
        setState(() {
          chatMessages.insert(0, {
            'id': DateTime.now().millisecondsSinceEpoch,
            'platform': activePlats[Random().nextInt(activePlats.length)],
            'user': names[Random().nextInt(names.length)],
            'text': msgs[Random().nextInt(msgs.length)]
          });
          if (chatMessages.length > 30) chatMessages.removeLast();
        });
      }
    });
  }

  String _formatTime(int seconds) {
    int h = seconds ~/ 3600;
    int m = (seconds % 3600) ~/ 60;
    int s = seconds % 60;
    return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  String _formatFileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return 'Fecha desconocida';
    }
  }

  void _createClip() {
    setState(() {
      clips.insert(0, {
        'id': DateTime.now().millisecondsSinceEpoch,
        'timestamp': _formatTime(streamDuration),
        'cta': '¡Haz clic en el enlace!',
        'uploaded': false
      });
    });
    _showMsg('¡Corte de 30s generado!');
  }

  void _uploadClip(int id) {
    setState(() {
      int idx = clips.indexWhere((c) => c['id'] == id);
      if (idx != -1) clips[idx]['uploaded'] = true;
    });
    _showMsg('¡Subido a TikTok/Reels con éxito!');
  }

  @override
  Widget build(BuildContext context) {
    if (!isAuthenticated) {
      return Scaffold(
        body: Center(
          child: SingleChildScrollView(
            child: _buildAuthScreen(),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: _buildAppBar(),
      body: LayoutBuilder(
        builder: (context, constraints) {
          bool isDesktop = constraints.maxWidth > 900;
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                if (isDesktop)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(flex: 7, child: _buildLeftColumn()),
                      const SizedBox(width: 16),
                      Expanded(flex: 3, child: _buildRightColumn()),
                    ],
                  )
                else
                  Column(
                    children: [
                      _buildLeftColumn(),
                      const SizedBox(height: 16),
                      _buildRightColumn(),
                    ],
                  ),
                const SizedBox(height: 24),
                _buildClipsPanel(),
              ],
            ),
          );
        }
      ),
    );
  }

  Widget _buildAuthScreen() {
    return Container(
      width: 400,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor.withOpacity(0.9),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.bolt, size: 48, color: Colors.indigoAccent),
          const SizedBox(height: 16),
          const Text('StreamPlus', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(
            isVerificationMode ? 'Verifica tu identidad' : (isLoginMode ? 'Inicia sesión' : 'Crea tu cuenta'),
            style: const TextStyle(color: Colors.white54)
          ),
          const SizedBox(height: 32),

          if (isVerificationMode) ...[
            const Icon(Icons.security, size: 64, color: Colors.greenAccent),
            const SizedBox(height: 16),
            TextField(
              controller: verifCodeCtrl,
              textAlign: TextAlign.center,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(hintText: '000000', border: OutlineInputBorder()),
              style: const TextStyle(fontSize: 24, letterSpacing: 10),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: Colors.green,
              ),
              onPressed: _handleVerify,
              child: const Text('Verificar y Entrar', style: TextStyle(color: Colors.white)),
            ),
            TextButton(
              onPressed: () => setState(() => isVerificationMode = false), 
              child: const Text('Volver atrás')
            )
          ] else if (isLoginMode) ...[
            TextField(
              controller: loginUserCtrl,
              decoration: const InputDecoration(labelText: 'Usuario', prefixIcon: Icon(Icons.person), border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: loginPassCtrl,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Contraseña', prefixIcon: Icon(Icons.lock), border: OutlineInputBorder()),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: Colors.indigo,
              ),
              onPressed: _handleLogin,
              child: const Text('Ingresar al Estudio', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => setState(() => isLoginMode = false),
              child: const Text('¿Aún no tienes cuenta? Regístrate aquí'),
            )
          ] else ...[
            TextField(controller: regNameCtrl, decoration: const InputDecoration(labelText: 'Usuario', border: OutlineInputBorder())),
            const SizedBox(height: 12),
            TextField(controller: regEmailCtrl, decoration: const InputDecoration(labelText: 'Correo', border: OutlineInputBorder())),
            const SizedBox(height: 12),
            TextField(controller: regPhoneCtrl, decoration: const InputDecoration(labelText: 'WhatsApp', border: OutlineInputBorder())),
            const SizedBox(height: 12),
            TextField(controller: regPassCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'Contraseña', border: OutlineInputBorder())),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: Colors.indigo,
              ),
              onPressed: _handleRegister,
              child: const Text('Crear Cuenta', style: TextStyle(color: Colors.white)),
            ),
            TextButton(
              onPressed: () => setState(() => isLoginMode = true),
              child: const Text('¿Ya tienes cuenta? Inicia sesión'),
            )
          ]
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Theme.of(context).cardColor,
      elevation: 2,
      title: Row(
        children: const [
          Icon(Icons.bolt, color: Colors.indigoAccent),
          SizedBox(width: 8),
          Text('StreamPlus', style: TextStyle(fontWeight: FontWeight.bold)),
          Text(' Studio', style: TextStyle(fontSize: 14, color: Colors.white54)),
        ],
      ),
      actions: [
        if (isStreaming) ...[
          Chip(
            avatar: const Icon(Icons.people, size: 16, color: Colors.greenAccent),
            label: Text(viewers.toString(), style: const TextStyle(color: Colors.greenAccent)),
            backgroundColor: Colors.green.withOpacity(0.1),
            side: BorderSide.none,
          ),
          const SizedBox(width: 8),
          Chip(
            avatar: const Icon(Icons.circle, size: 12, color: Colors.redAccent),
            label: Text(_formatTime(streamDuration), style: const TextStyle(color: Colors.redAccent)),
            backgroundColor: Colors.red.withOpacity(0.1),
            side: BorderSide.none,
          ),
          const SizedBox(width: 16),
        ],
        Center(child: Text('Hola, ${loginUserCtrl.text}', style: const TextStyle(color: Colors.white70))),
        IconButton(icon: const Icon(Icons.logout, color: Colors.redAccent), onPressed: _handleLogout),
      ],
    );
  }

  Widget _buildLeftColumn() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Reproductor de Video Simulado
        AspectRatio(
          aspectRatio: 16 / 9,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white10),
            ),
          child: Stack(
            children: [
              // Placeholder de video apagado
              if (!isCameraActive && mediaType == 'camera')
                const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.videocam_off, size: 64, color: Colors.white24),
                      SizedBox(height: 8),
                      Text('Cámara Apagada', style: TextStyle(color: Colors.white54)),
                    ],
                  ),
                ),
              
              // Status Badge
              Positioned(
                top: 16, left: 16,
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isStreaming ? Colors.red : Colors.grey[800],
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(isStreaming ? 'EN VIVO' : 'OFFLINE', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(4)),
                      child: Text(mediaType == 'camera' ? 'Cámara Web' : 'Video', style: const TextStyle(fontSize: 12)),
                    ),
                  ],
                ),
              ),

              // Botón apagar cámara
              if (mediaType == 'camera')
                Positioned(
                  bottom: 16, left: 16,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isCameraActive ? Colors.white12 : Colors.red,
                    ),
                    icon: Icon(isCameraActive ? Icons.videocam : Icons.videocam_off, color: Colors.white),
                    label: Text(isCameraActive ? 'Apagar Cámara' : 'Cámara OFF'),
                    onPressed: () => setState(() => isCameraActive = !isCameraActive),
                  ),
                ),

              // Botón Sacar Corte
              if (isStreaming)
                Positioned(
                  bottom: 16, right: 16,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12)),
                    icon: const Icon(Icons.content_cut, color: Colors.white),
                    label: const Text('Sacar Corte (30s)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    onPressed: _createClip,
                  ),
                ),
            ],
          ),
          ),
        ),
        const SizedBox(height: 16),
        
        // Info del Stream
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Información del Stream', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                TextField(
                  controller: titleCtrl,
                  enabled: !isStreaming,
                  decoration: const InputDecoration(labelText: 'Título', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: descCtrl,
                  enabled: !isStreaming,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Descripción', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 16),
                SwitchListTile(
                  title: const Text('Programar Transmisión'),
                  value: isScheduled,
                  activeColor: Colors.indigoAccent,
                  onChanged: isStreaming ? null : (v) => setState(() => isScheduled = v),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRightColumn() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Origen del video
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Seleccionar Video', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                
                // Botón para subir nuevo video
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isUploading ? Colors.grey : Colors.indigo,
                  ),
                  icon: isUploading 
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.upload_file),
                  label: Text(isUploading ? 'Subiendo...' : 'Subir Video'),
                  onPressed: isUploading || isStreaming ? null : _uploadVideo,
                ),
                
                const SizedBox(height: 12),
                
                // Lista de videos disponibles
                if (isLoadingVideos)
                  const Center(child: CircularProgressIndicator())
                else if (availableVideos.isEmpty)
                  const Text('No hay videos disponibles', style: TextStyle(color: Colors.white54))
                else
                  Container(
                    constraints: const BoxConstraints(maxHeight: 200),
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: availableVideos.length,
                      itemBuilder: (context, index) {
                        final video = availableVideos[index];
                        return ListTile(
                          leading: const Icon(Icons.video_file, color: Colors.indigo),
                          title: Text(video['filename'] ?? 'Video sin nombre'),
                          subtitle: Text('${_formatFileSize(video['size'])} • ${_formatDate(video['uploadedAt'])}'),
                          trailing: selectedVideoId == video['id']
                              ? const Icon(Icons.check_circle, color: Colors.green)
                              : const Icon(Icons.radio_button_unchecked, color: Colors.white54),
                          onTap: isStreaming 
                              ? null 
                              : () {
                                  setState(() {
                                    selectedVideoId = video['id'];
                                    selectedVideoName = video['filename'];
                                  });
                                },
                        );
                      },
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Destinos
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Redes Sociales', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8, runSpacing: 8,
                  children: platforms.keys.map((p) => ChoiceChip(
                    label: Text(p.toUpperCase()),
                    selected: platforms[p]!,
                    selectedColor: Colors.indigo.withOpacity(0.5),
                    onSelected: isStreaming ? null : (bool selected) {
                      setState(() => platforms[p] = selected);
                    },
                  )).toList(),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Chat
        Card(
          child: Container(
            height: 250,
            padding: const EdgeInsets.all(8),
            child: Column(
              children: [
                const Padding(
                  padding: EdgeInsets.all(8.0),
                  child: Row(children: [Icon(Icons.chat, size: 16), SizedBox(width: 8), Text('Chat Unificado')]),
                ),
                const Divider(),
                Expanded(
                  child: !isStreaming 
                    ? const Center(child: Text('Inicia transmisión...', style: TextStyle(color: Colors.white54)))
                    : ListView.builder(
                        reverse: true,
                        itemCount: chatMessages.length,
                        itemBuilder: (context, i) {
                          final msg = chatMessages[i];
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(8)),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('${msg['platform'].toUpperCase()} • ${msg['user']}', style: const TextStyle(fontSize: 10, color: Colors.indigoAccent)),
                                  const SizedBox(height: 2),
                                  Text(msg['text'], style: const TextStyle(fontSize: 13)),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Botón Principal
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.all(20),
            backgroundColor: isStreaming ? Colors.red : (isScheduled ? Colors.green : Colors.indigo),
          ),
          icon: Icon(isStreaming ? Icons.stop : Icons.cell_tower, color: Colors.white),
          label: Text(
            isStreaming ? 'Detener Transmisión' : (isScheduled ? 'Programar Transmisión' : 'Iniciar Transmisión'),
            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)
          ),
          onPressed: isStreaming ? _handleStopStream : _handleStartStream,
        ),
      ],
    );
  }

  Widget _buildClipsPanel() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.movie, color: Colors.indigoAccent),
                const SizedBox(width: 8),
                const Text('Gestor de Cortes Rápidos', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                if (clips.isNotEmpty) ...[
                  const SizedBox(width: 12),
                  CircleAvatar(radius: 12, backgroundColor: Colors.indigo, child: Text(clips.length.toString(), style: const TextStyle(fontSize: 12))),
                ]
              ],
            ),
            const SizedBox(height: 4),
            Text('Extrae y publica clips con tu marca de agua (${watermarkCtrl.text})', style: const TextStyle(color: Colors.white54)),
            const SizedBox(height: 24),

            if (clips.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(border: Border.all(color: Colors.white10, style: BorderStyle.solid), borderRadius: BorderRadius.circular(16)),
                child: const Column(
                  children: [
                    Icon(Icons.video_library, size: 48, color: Colors.white24),
                    SizedBox(height: 16),
                    Text('Aún no tienes cortes generados', style: TextStyle(fontSize: 16)),
                    Text('Inicia transmisión y usa "Sacar Corte"', style: TextStyle(color: Colors.white54)),
                  ],
                ),
              )
            else
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 300,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 0.8,
                ),
                itemCount: clips.length,
                itemBuilder: (context, i) {
                  final clip = clips[i];
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white10)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (clip['uploaded'])
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: Colors.green, borderRadius: BorderRadius.circular(4)),
                            child: const Text('PUBLICADO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('⏱ ${clip['timestamp']}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                            const Text('00:30s', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                          ],
                        ),
                        const Spacer(),
                        const Text('CTA del Video', style: TextStyle(fontSize: 12, color: Colors.white54)),
                        const SizedBox(height: 4),
                        TextField(
                          enabled: !clip['uploaded'],
                          controller: TextEditingController(text: clip['cta'])..selection = TextSelection.collapsed(offset: clip['cta'].length),
                          onChanged: (val) {
                            setState(() => clip['cta'] = val);
                          },
                          decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true),
                          style: const TextStyle(fontSize: 14),
                        ),
                        const SizedBox(height: 12),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            minimumSize: const Size.fromHeight(40),
                            backgroundColor: clip['uploaded'] ? Colors.grey[800] : Colors.indigo,
                          ),
                          icon: Icon(clip['uploaded'] ? Icons.check : Icons.add, size: 16),
                          label: Text(clip['uploaded'] ? 'Publicado' : 'Subir a Redes'),
                          onPressed: clip['uploaded'] ? null : () => _uploadClip(clip['id']),
                        )
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}