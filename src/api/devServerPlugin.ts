import type { Plugin, ViteDevServer } from 'vite';
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

interface JournalRecord {
  id: number;
  user_id: number;
  content: string;
  mood: string;
  intensity: number;
  confidence: number;
  ai_response: string;
  sentiment: string;
  is_distress: boolean;
  created_at: string;
  updated_at: string;
}

// In-memory persistent database for dev preview
let users: UserRecord[] = [
  {
    id: 1,
    name: 'Alex Rivera',
    email: 'alex@moodlog.example',
    password: 'Password123!',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

let entries: JournalRecord[] = [
  {
    id: 1,
    user_id: 1,
    content:
      'Started the morning with a crisp walk outside and fresh coffee. Felt remarkably at peace and ready for the week ahead.',
    mood: 'happy',
    intensity: 8,
    confidence: 0.92,
    ai_response:
      'It is wonderful how a brisk morning walk and quiet moments can set such a grounded tone. What part of that calm would you most like to carry with you today?',
    sentiment: 'positive',
    is_distress: false,
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: 2,
    user_id: 1,
    content:
      'Deadline approaching at work. Juggling three different client deliverables and my heart rate felt elevated all afternoon.',
    mood: 'stressed',
    intensity: 7,
    confidence: 0.88,
    ai_response:
      'Balancing multiple high-stakes demands is genuinely taxing on both body and mind. If you could pause for five minutes right now, what is one pressure you could temporarily set down?',
    sentiment: 'negative',
    is_distress: false,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 3,
    user_id: 1,
    content:
      'Wrapped up the big presentation! The team seemed receptive and gave enthusiastic feedback. Relieved and energized.',
    mood: 'excited',
    intensity: 9,
    confidence: 0.95,
    ai_response:
      'Congratulations on delivering the presentation after all that preparation! Give yourself full credit for that effort—how does it feel to step back now and see it accomplished?',
    sentiment: 'positive',
    is_distress: false,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 4,
    user_id: 1,
    content:
      'A quiet Sunday afternoon. Read a book by the window while rain fell against the glass. No big plans, just calm breathing.',
    mood: 'neutral',
    intensity: 5,
    confidence: 0.89,
    ai_response:
      'Unstructured afternoons with a good book and gentle rain offer rare space for replenishment. What did your mind find most comforting during those quiet hours?',
    sentiment: 'neutral',
    is_distress: false,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 5,
    user_id: 1,
    content:
      'Woke up with a sense of nervousness about the upcoming quarter planning. Feeling a bit scattered and anxious.',
    mood: 'anxious',
    intensity: 6,
    confidence: 0.84,
    ai_response:
      'Anticipating quarterly shifts can stir up scattered energy. What is one concrete grounding step you can take today to regain your footing?',
    sentiment: 'negative',
    is_distress: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 6,
    user_id: 1,
    content:
      'Had dinner with good friends. We laughed until our stomachs hurt talking about college memories. Feeling so grateful for connection.',
    mood: 'happy',
    intensity: 9,
    confidence: 0.96,
    ai_response:
      'Unfiltered laughter with dear friends is a powerful anchor for the heart. What shared memory from tonight brought you the deepest warmth?',
    sentiment: 'positive',
    is_distress: false,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

let nextUserId = 2;
let nextEntryId = 7;

// Helper to parse JSON body
function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  });
  res.end(JSON.stringify(data));
}

// Crisis safety keywords matching backend SafetyService
const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'end my life',
  'want to die',
  'better off dead',
  'self harm',
  'cutting myself',
  'slit my wrist',
  'hang myself',
  'take all my pills',
  'no reason to live',
];

function checkDistress(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((k) => lower.includes(k));
}

function analyzeEmotion(text: string): {
  mood: string;
  intensity: number;
  confidence: number;
  ai_response: string;
  sentiment: string;
  is_distress: boolean;
} {
  const lower = text.toLowerCase();
  const isDistress = checkDistress(text);

  if (isDistress) {
    return {
      mood: 'sad',
      intensity: 10,
      confidence: 0.98,
      sentiment: 'negative',
      is_distress: true,
      ai_response:
        'It sounds like you are carrying a tremendously heavy burden right now. Please know you do not have to hold this alone—free, caring support is available anytime.',
    };
  }

  let mood = 'neutral';
  let intensity = 5;
  let sentiment = 'neutral';
  let confidence = 0.85;

  if (/happy|joy|grateful|delight|wonderful|blessed|love|peace|smile|content/.test(lower)) {
    mood = 'happy';
    intensity = 8;
    sentiment = 'positive';
    confidence = 0.93;
  } else if (/excited|thrilled|can't wait|pumped|energized|ecstatic|celebrat/.test(lower)) {
    mood = 'excited';
    intensity = 9;
    sentiment = 'positive';
    confidence = 0.95;
  } else if (/anxious|worried|nervous|dread|panic|overwhelmed|uneasy|racing/.test(lower)) {
    mood = 'anxious';
    intensity = 7;
    sentiment = 'negative';
    confidence = 0.89;
  } else if (/stress|deadline|pressure|exhausted|burnout|too much|hectic/.test(lower)) {
    mood = 'stressed';
    intensity = 8;
    sentiment = 'negative';
    confidence = 0.9;
  } else if (/sad|depressed|lonely|heartbroken|grief|crying|down|hopeless/.test(lower)) {
    mood = 'sad';
    intensity = 7;
    sentiment = 'negative';
    confidence = 0.91;
  } else if (/angry|furious|mad|irritat|annoy|rage|pissed/.test(lower)) {
    mood = 'angry';
    intensity = 8;
    sentiment = 'negative';
    confidence = 0.88;
  }

  const reflections: Record<string, string> = {
    happy:
      'Grounded joy often blooms from simple, mindful awareness. What specific element of today would you love to recall when things feel busier?',
    excited:
      'That surge of momentum and anticipation is wonderful to experience. How can you best honor that energy while staying centered?',
    neutral:
      'Even steady, uneventful days hold subtle space for stillness. What quiet observation or small moment brought you comfort today?',
    anxious:
      'Noticing when worry takes the wheel is already the first step toward finding calm. If you take one slow, deep breath, what is one tangible thing within your control right now?',
    stressed:
      'When demands pile up, both the body and mind ask for relief. If you could give yourself permission to step away for ten minutes, what would replenish you most?',
    sad:
      'Sadness deserves gentle patience, not urgency or critique. What small comfort could you offer yourself this evening without any expectations?',
    angry:
      'Frustration often highlights boundaries or values that felt compromised. What is the core truth beneath that heat that wants to be expressed clearly?',
  };

  return {
    mood,
    intensity,
    confidence,
    ai_response: reflections[mood] || reflections.neutral,
    sentiment,
    is_distress: false,
  };
}

export function devApiPlugin(): Plugin {
  return {
    name: 'moodlog-dev-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname || '';
        const method = req.method?.toUpperCase() || 'GET';

        // OPTIONS preflight
        if (method === 'OPTIONS') {
          return sendJson(res, 204, {});
        }

        // Auth extraction
        const authHeader = req.headers['authorization'];
        let currentUser: UserRecord | null = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          // In dev mode, decode token format "moodlog-user-<id>" or find by id
          const userId = token.startsWith('moodlog-user-')
            ? parseInt(token.replace('moodlog-user-', ''), 10)
            : 1; // Default to demo user
          currentUser = users.find((u) => u.id === userId) || users[0];
        }

        // 1. POST /api/auth/register
        if (pathname === '/api/auth/register' && method === 'POST') {
          const body = await parseBody(req);
          if (!body.name || !body.email || !body.password) {
            return sendJson(res, 400, { detail: 'Name, email, and password are required.' });
          }
          if (body.password !== body.password_confirm) {
            return sendJson(res, 400, { detail: 'Passwords do not match.' });
          }
          if (users.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) {
            return sendJson(res, 400, { detail: 'An account with this email already exists.' });
          }
          const newUser: UserRecord = {
            id: nextUserId++,
            name: body.name.trim(),
            email: body.email.toLowerCase().trim(),
            password: body.password,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          users.push(newUser);
          return sendJson(res, 201, {
            access_token: `moodlog-user-${newUser.id}`,
            token_type: 'bearer',
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              created_at: newUser.created_at,
              updated_at: newUser.updated_at,
            },
          });
        }

        // 2. POST /api/auth/login
        if (pathname === '/api/auth/login' && method === 'POST') {
          const body = await parseBody(req);
          const found = users.find(
            (u) => u.email.toLowerCase() === (body.email || '').toLowerCase() && u.password === body.password
          );
          if (!found) {
            return sendJson(res, 401, { detail: 'Incorrect email or password.' });
          }
          return sendJson(res, 200, {
            access_token: `moodlog-user-${found.id}`,
            token_type: 'bearer',
            user: {
              id: found.id,
              name: found.name,
              email: found.email,
              created_at: found.created_at,
              updated_at: found.updated_at,
            },
          });
        }

        // Protected routes require currentUser
        if (!currentUser && (pathname.startsWith('/api/entries') || pathname.startsWith('/api/analytics') || pathname === '/api/auth/me')) {
          return sendJson(res, 401, { detail: 'Unauthorized: Valid authentication token required.' });
        }

        // 3. GET /api/auth/me
        if (pathname === '/api/auth/me' && method === 'GET') {
          return sendJson(res, 200, {
            id: currentUser!.id,
            name: currentUser!.name,
            email: currentUser!.email,
            created_at: currentUser!.created_at,
            updated_at: currentUser!.updated_at,
          });
        }

        // 4. PUT /api/auth/profile
        if (pathname === '/api/auth/profile' && method === 'PUT') {
          const body = await parseBody(req);
          if (body.name) {
            currentUser!.name = body.name.trim();
            currentUser!.updated_at = new Date().toISOString();
          }
          return sendJson(res, 200, {
            id: currentUser!.id,
            name: currentUser!.name,
            email: currentUser!.email,
            created_at: currentUser!.created_at,
            updated_at: currentUser!.updated_at,
          });
        }

        // 5. PUT /api/auth/password
        if (pathname === '/api/auth/password' && method === 'PUT') {
          const body = await parseBody(req);
          if (currentUser!.password !== body.current_password) {
            return sendJson(res, 400, { detail: 'Current password does not match.' });
          }
          if (body.new_password !== body.new_password_confirm) {
            return sendJson(res, 400, { detail: 'New passwords do not match.' });
          }
          currentUser!.password = body.new_password;
          return sendJson(res, 200, { message: 'Password updated successfully.' });
        }

        // 6. GET /api/entries
        if (pathname === '/api/entries' && method === 'GET') {
          const query = parsedUrl.query;
          let userEntries = entries.filter((e) => e.user_id === currentUser!.id);

          if (query.mood) {
            userEntries = userEntries.filter(
              (e) => e.mood.toLowerCase() === String(query.mood).toLowerCase()
            );
          }
          if (query.search) {
            const s = String(query.search).toLowerCase();
            userEntries = userEntries.filter(
              (e) =>
                e.content.toLowerCase().includes(s) ||
                e.ai_response.toLowerCase().includes(s) ||
                e.mood.toLowerCase().includes(s)
            );
          }
          if (query.sort_order === 'oldest') {
            userEntries.sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          } else {
            userEntries.sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          }

          const limit = query.limit ? parseInt(String(query.limit), 10) : 50;
          return sendJson(res, 200, userEntries.slice(0, limit));
        }

        // 7. POST /api/entries
        if (pathname === '/api/entries' && method === 'POST') {
          const body = await parseBody(req);
          const clean = (body.content || '').trim();
          if (clean.length < 3) {
            return sendJson(res, 400, { detail: 'Content must be at least 3 characters.' });
          }

          const analysis = analyzeEmotion(clean);
          const newEntry: JournalRecord = {
            id: nextEntryId++,
            user_id: currentUser!.id,
            content: clean,
            ...analysis,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          entries.push(newEntry);
          return sendJson(res, 201, newEntry);
        }

        // 8. PUT /api/entries/:id
        const entryMatch = pathname.match(/^\/api\/entries\/(\d+)$/);
        if (entryMatch) {
          const entryId = parseInt(entryMatch[1], 10);
          const existing = entries.find((e) => e.id === entryId && e.user_id === currentUser!.id);

          if (!existing) {
            return sendJson(res, 404, { detail: 'Journal entry not found or belongs to another user.' });
          }

          if (method === 'GET') {
            return sendJson(res, 200, existing);
          }

          if (method === 'PUT') {
            const body = await parseBody(req);
            const clean = (body.content || '').trim();
            if (clean.length < 3) {
              return sendJson(res, 400, { detail: 'Content must be at least 3 characters.' });
            }
            const analysis = analyzeEmotion(clean);
            existing.content = clean;
            existing.mood = analysis.mood;
            existing.intensity = analysis.intensity;
            existing.confidence = analysis.confidence;
            existing.ai_response = analysis.ai_response;
            existing.sentiment = analysis.sentiment;
            existing.is_distress = analysis.is_distress;
            existing.updated_at = new Date().toISOString();
            return sendJson(res, 200, existing);
          }

          if (method === 'DELETE') {
            entries = entries.filter((e) => e.id !== entryId);
            return sendJson(res, 200, { message: 'Entry deleted successfully', id: entryId });
          }
        }

        // 9. GET /api/analytics/trends
        if (pathname === '/api/analytics/trends' && method === 'GET') {
          const userEntries = entries
            .filter((e) => e.user_id === currentUser!.id)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

          const total = userEntries.length;
          const avgIntensity = total
            ? parseFloat((userEntries.reduce((sum, e) => sum + e.intensity, 0) / total).toFixed(1))
            : 0;

          // Mood counts
          const counts: Record<string, number> = {};
          const colors: Record<string, string> = {
            happy: '#10b981',
            excited: '#f59e0b',
            neutral: '#94a3b8',
            anxious: '#a855f7',
            stressed: '#f43f5e',
            sad: '#38bdf8',
            angry: '#ef4444',
          };

          for (const e of userEntries) {
            counts[e.mood] = (counts[e.mood] || 0) + 1;
          }

          let dominantMood: string | null = null;
          let maxCount = 0;
          for (const [mood, c] of Object.entries(counts)) {
            if (c > maxCount) {
              maxCount = c;
              dominantMood = mood;
            }
          }

          const distribution = Object.entries(counts).map(([mood, count]) => ({
            mood,
            count,
            percentage: total ? Math.round((count / total) * 100) : 0,
            color: colors[mood] || '#94a3b8',
          }));

          const trend_points = userEntries.map((e) => ({
            date: e.created_at.split('T')[0],
            timestamp: e.created_at,
            mood: e.mood,
            intensity: e.intensity,
            sentiment: e.sentiment,
            entry_id: e.id,
          }));

          // Entries this week
          const oneWeekAgo = Date.now() - 7 * 86400000;
          const entriesThisWeek = userEntries.filter(
            (e) => new Date(e.created_at).getTime() >= oneWeekAgo
          ).length;

          // Entries this month
          const oneMonthAgo = Date.now() - 30 * 86400000;
          const entriesThisMonth = userEntries.filter(
            (e) => new Date(e.created_at).getTime() >= oneMonthAgo
          ).length;

          // Insights
          const insights: string[] = [];
          if (dominantMood) {
            insights.push(
              `Your most recurring emotional baseline has been ${dominantMood}, accounting for ${
                distribution.find((d) => d.mood === dominantMood)?.percentage || 0
              }% of your recorded logs.`
            );
          }
          if (avgIntensity > 7) {
            insights.push(
              'Your average intensity indicates high emotional activation. Consider taking short breathing pauses throughout your afternoon.'
            );
          } else {
            insights.push(
              'Your emotional intensity displays a calm, steady rhythm over the tracked period.'
            );
          }
          if (entriesThisWeek >= 3) {
            insights.push(
              'You have maintained a strong journaling cadence this week. Consistent reflection strengthens emotional clarity.'
            );
          }

          return sendJson(res, 200, {
            summary: {
              total_entries: total,
              average_intensity: avgIntensity,
              dominant_mood: dominantMood,
              recent_mood: userEntries[userEntries.length - 1]?.mood || null,
              entries_this_week: entriesThisWeek,
              entries_this_month: entriesThisMonth,
              current_streak_days: Math.min(total, 4),
              insights,
            },
            distribution,
            trend_points,
            daily_history: [],
          });
        }

        // 10. GET /api/analytics/summary
        if (pathname === '/api/analytics/summary' && method === 'GET') {
          const userEntries = entries.filter((e) => e.user_id === currentUser!.id);
          const total = userEntries.length;
          const avg = total
            ? parseFloat((userEntries.reduce((s, e) => s + e.intensity, 0) / total).toFixed(1))
            : 0;
          return sendJson(res, 200, {
            total_entries: total,
            average_intensity: avg,
            dominant_mood: 'happy',
            recent_mood: 'happy',
            entries_this_week: Math.min(total, 3),
            entries_this_month: total,
            current_streak_days: 4,
            insights: ['Consistent journaling strengthens mindfulness and resilience.'],
          });
        }

        // Default API 404
        return sendJson(res, 404, { detail: `Endpoint ${pathname} not found.` });
      });
    },
  };
}
