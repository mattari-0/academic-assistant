import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

const String supabaseUrl = 'https://hdheotqkjxnvplgphnms.supabase.co';
const String supabaseAnonKey = 'sb_publishable_i9PuToqD7zJ2e8uJD0q3mw_U2FUdr1K';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  );
  runApp(const EncgAssistantApp());
}

class EncgAssistantApp extends StatelessWidget {
  const EncgAssistantApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ENCG Student Assistant',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF064E3B),
          primary: const Color(0xFF064E3B),
        ),
      ),
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  User? _user;
  Map<String, dynamic>? _profile;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final session = Supabase.instance.client.auth.currentSession;
    if (session?.user != null) {
      final user = session!.user;
      final res = await Supabase.instance.client
          .from('profiles')
          .select()
          .eq('id', user.id)
          .maybeSingle();
      setState(() {
        _user = user;
        _profile = res;
        _loading = false;
      });
    } else {
      setState(() {
        _user = null;
        _profile = null;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: Color(0xFF064E3B))),
      );
    }
    if (_user == null) {
      return LoginScreen(onSuccess: _checkAuth);
    }
    return StudentHomeScreen(user: _user!, profile: _profile, onLogout: () async {
      await Supabase.instance.client.auth.signOut();
      _checkAuth();
    });
  }
}

class LoginScreen extends StatefulWidget {
  final VoidCallback onSuccess;
  const LoginScreen({super.key, required this.onSuccess});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _isSignUp = false;
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  String _selectedSection = 'S1';
  bool _loading = false;
  String? _error;

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      if (_isSignUp) {
        final res = await Supabase.instance.client.auth.signUp(
          email: _emailCtrl.text.trim(),
          password: _passCtrl.text,
          data: {
            'role': 'student',
            'section': _selectedSection,
            'full_name': _nameCtrl.text.trim(),
          },
        );
        if (res.user != null) {
          await Supabase.instance.client.from('profiles').upsert({
            'id': res.user!.id,
            'email': _emailCtrl.text.trim(),
            'full_name': _nameCtrl.text.trim(),
            'role': 'student',
            'section': _selectedSection,
          });
        }
      } else {
        String loginEmail = _emailCtrl.text.trim();
        if (!loginEmail.contains('@')) {
          final prof = await Supabase.instance.client
              .from('profiles')
              .select('email')
              .ilike('full_name', loginEmail)
              .maybeSingle();
          if (prof == null || prof['email'] == null) {
            throw Exception('Nom introuvable. Utilisez votre email.');
          }
          loginEmail = prof['email'];
        }

        await Supabase.instance.client.auth.signInWithPassword(
          email: loginEmail,
          password: _passCtrl.text,
        );
      }
      widget.onSuccess();
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception:', '');
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: const Color(0xFF064E3B),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.school, color: Colors.white, size: 28),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _isSignUp ? 'Inscription Étudiant' : 'Portail Étudiant ENCG',
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    if (_error != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFFECACA)),
                        ),
                        child: Text(_error!, style: const TextStyle(color: Color(0xFFB91C1C), fontSize: 12)),
                      ),
                    if (_isSignUp) ...[
                      TextField(
                        controller: _nameCtrl,
                        decoration: const InputDecoration(labelText: 'Nom & Prénom', prefixIcon: Icon(Icons.person_outline)),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: ['S1', 'S2', 'S3'].map((s) {
                          final sel = _selectedSection == s;
                          return Expanded(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              child: ChoiceChip(
                                label: Text(s),
                                selected: sel,
                                selectedColor: const Color(0xFF064E3B),
                                labelStyle: TextStyle(color: sel ? Colors.white : Colors.black87),
                                onSelected: (_) => setState(() => _selectedSection = s),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 12),
                    ],
                    TextField(
                      controller: _emailCtrl,
                      decoration: InputDecoration(
                        labelText: _isSignUp ? 'Email (@encg.ma)' : 'Email ou Nom complet',
                        prefixIcon: const Icon(Icons.email_outlined),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _passCtrl,
                      obscureText: true,
                      decoration: const InputDecoration(labelText: 'Mot de passe', prefixIcon: Icon(Icons.lock_outline)),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF064E3B),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: _loading ? null : _submit,
                        child: _loading
                            ? const CircularProgressIndicator(color: Colors.white)
                            : Text(_isSignUp ? 'Créer mon compte' : 'Se connecter', style: const TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () => setState(() => _isSignUp = !_isSignUp),
                      child: Text(
                        _isSignUp ? 'Déjà un compte ? Se connecter' : 'Nouveau ? Créer un compte',
                        style: const TextStyle(color: Color(0xFF064E3B), fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class StudentHomeScreen extends StatefulWidget {
  final User user;
  final Map<String, dynamic>? profile;
  final VoidCallback onLogout;

  const StudentHomeScreen({super.key, required this.user, required this.profile, required this.onLogout});

  @override
  State<StudentHomeScreen> createState() => _StudentHomeScreenState();
}

class _StudentHomeScreenState extends State<StudentHomeScreen> {
  int _tab = 0;
  List<dynamic> _sessions = [];
  List<dynamic> _announcements = [];
  List<dynamic> _exams = [];
  bool _loading = true;

  String get section => widget.profile?['section'] ?? 'S1';

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  Future<void> _loadAll() async {
    setState(() => _loading = true);
    final prefs = await SharedPreferences.getInstance();

    // 1. Load cached sessions if available
    final cached = prefs.getString('cached_sessions_$section');
    if (cached != null) {
      _sessions = jsonDecode(cached);
    }

    try {
      final sRes = await Supabase.instance.client
          .from('v_student_effective_schedule')
          .select()
          .eq('section', section)
          .order('day_of_week')
          .order('scheduled_start_time');
      _sessions = sRes;
      await prefs.setString('cached_sessions_$section', jsonEncode(sRes));

      final aRes = await Supabase.instance.client
          .from('announcements')
          .select()
          .or('target_section.eq.$section,target_section.eq.ALL')
          .order('created_at', ascending: false);
      _announcements = aRes;

      final eRes = await Supabase.instance.client
          .from('exams')
          .select('*, modules(title), rooms(room_number)')
          .or('target_section.eq.$section,target_section.eq.ALL')
          .order('exam_date');
      _exams = eRes;
    } catch (_) {}

    setState(() => _loading = false);
  }

  static const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
        title: Text('ENCG • Section $section', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadAll),
          IconButton(icon: const Icon(Icons.logout), onPressed: widget.onLogout),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF064E3B)))
          : IndexedStack(
              index: _tab,
              children: [
                _buildScheduleTab(),
                _buildAnnouncementsTab(),
                _buildExamsTab(),
              ],
            ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (idx) => setState(() => _tab = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.access_time), label: 'Emploi'),
          NavigationDestination(icon: Icon(Icons.campaign_outlined), label: 'Annonces'),
          NavigationDestination(icon: Icon(Icons.event_note), label: 'Examens'),
        ],
      ),
    );
  }

  Widget _buildScheduleTab() {
    if (_sessions.isEmpty) {
      return const Center(child: Text('Aucun cours programmé.'));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _sessions.length,
      itemBuilder: (ctx, i) {
        final s = _sessions[i];
        final day = (s['day_of_week'] is int && s['day_of_week'] <= 6) ? days[s['day_of_week'] - 1] : 'Séance';
        final isCancelled = s['is_cancelled'] == true;
        final hasOverride = s['has_active_override'] == true;

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(8)),
                      child: Text(day, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF064E3B), fontSize: 12)),
                    ),
                    Text('${s['scheduled_start_time'].toString().substring(0, 5)} - ${s['scheduled_end_time'].toString().substring(0, 5)}',
                        style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 8),
                Text(s['module_title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text(s['professor_name'] ?? 'Professeur non spécifié', style: const TextStyle(color: Colors.black54, fontSize: 13)),
                const Divider(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.place_outlined, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        hasOverride
                            ? Text('${s['original_room']} → ${s['effective_room']}', style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold))
                            : Text('${s['effective_room']}', style: const TextStyle(fontWeight: FontWeight.w600)),
                      ],
                    ),
                    if (isCancelled)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(6)),
                        child: const Text('ANNULÉ', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 11)),
                      ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildAnnouncementsTab() {
    if (_announcements.isEmpty) return const Center(child: Text('Aucune annonce disponible.'));
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _announcements.length,
      itemBuilder: (ctx, i) {
        final a = _announcements[i];
        final isUrgent = a['priority'] == 'urgent';
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isUrgent ? const Color(0xFFFEE2E2) : const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        isUrgent ? 'URGENT' : 'INFO',
                        style: TextStyle(color: isUrgent ? Colors.red : const Color(0xFF064E3B), fontWeight: FontWeight.bold, fontSize: 11),
                      ),
                    ),
                    Text(a['target_section'] == 'ALL' ? 'Toutes Sections' : 'Section ${a['target_section']}',
                        style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 8),
                Text(a['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 4),
                Text(a['content'] ?? '', style: const TextStyle(color: Colors.black87, fontSize: 14)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildExamsTab() {
    if (_exams.isEmpty) return const Center(child: Text('Aucun examen programmé.'));
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _exams.length,
      itemBuilder: (ctx, i) {
        final ex = _exams[i];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            title: Text(ex['modules']?['title'] ?? 'Examen', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('Date: ${ex['exam_date']} • Salle: ${ex['rooms']?['room_number'] ?? 'TBD'}'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 14),
          ),
        );
      },
    );
  }
}
