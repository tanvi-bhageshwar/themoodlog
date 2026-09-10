-- ==============================================================================
-- MoodLog Optional Development Seed Data
-- For testing and demo purposes only. Note: Demo user password is 'DemoPassword123!'
-- Password hash generated with bcrypt for 'DemoPassword123!'
-- ==============================================================================

-- Demo User
INSERT OR IGNORE INTO users (id, name, email, password_hash, created_at, updated_at)
VALUES (
    1,
    'Alex Rivers (Demo)',
    'demo@moodlog.dev',
    '$2b$12$e8kP25hI3lJ6o1371oE1nupqjGqT0b5zPzM81g6hUfqO5q2O6Wq8m', -- bcrypt hash for DemoPassword123!
    DATETIME('now', '-14 days'),
    DATETIME('now', '-14 days')
);

-- Demo Journal Entries spanning the past 10 days to populate analytics
INSERT OR IGNORE INTO journal_entries (id, user_id, content, mood, intensity, confidence, ai_response, sentiment, is_distress, created_at, updated_at)
VALUES
(
    1,
    1,
    'Started the morning with a crisp walk outside and fresh coffee. Felt remarkably at peace and ready for the week ahead.',
    'happy',
    8,
    0.92,
    'It is wonderful how a brisk morning walk and quiet moments can set such a grounded tone. What part of that calm would you most like to carry with you today?',
    'positive',
    0,
    DATETIME('now', '-9 days', '+8 hours'),
    DATETIME('now', '-9 days', '+8 hours')
),
(
    2,
    1,
    'Deadline approaching at work. Juggling three different client deliverables and my heart rate felt elevated all afternoon.',
    'stressed',
    7,
    0.88,
    'Balancing multiple high-stakes demands is genuinely taxing on both body and mind. If you could pause for five minutes right now, what is one pressure you could temporarily set down?',
    'negative',
    0,
    DATETIME('now', '-7 days', '+17 hours'),
    DATETIME('now', '-7 days', '+17 hours')
),
(
    3,
    1,
    'Wrapped up the big presentation! The team seemed receptive and gave enthusiastic feedback. Relieved and energized.',
    'excited',
    9,
    0.95,
    'Congratulations on delivering the presentation after all that preparation! Give yourself full credit for that effort—how does it feel to step back now and see it accomplished?',
    'positive',
    0,
    DATETIME('now', '-6 days', '+15 hours'),
    DATETIME('now', '-6 days', '+15 hours')
),
(
    4,
    1,
    'Rainy afternoon. Spent a couple hours reading and doing routine laundry. Nothing particularly eventful.',
    'neutral',
    5,
    0.84,
    'Gentle, quiet days offer a rare kind of reset that is just as meaningful as high-energy moments. How did this slower pace feel for your mind today?',
    'neutral',
    0,
    DATETIME('now', '-4 days', '+16 hours'),
    DATETIME('now', '-4 days', '+16 hours')
),
(
    5,
    1,
    'Felt a wave of worry about upcoming family plans and travel logistics. Hard to quiet my mind before sleeping.',
    'anxious',
    6,
    0.89,
    'Anticipatory worry can feel so heavy, especially when trying to wind down for rest. Remember that taking one small step at a time is always enough. What is one reassuring thought you can hold tonight?',
    'negative',
    0,
    DATETIME('now', '-2 days', '+22 hours'),
    DATETIME('now', '-2 days', '+22 hours')
),
(
    6,
    1,
    'Cooked a nutritious dinner and had an honest, uplifting conversation with an old college friend. Feeling grateful.',
    'happy',
    8,
    0.91,
    'Reconnecting with dear friends and nourishing yourself creates such a warm sense of belonging. What was the most meaningful thought you shared during that call?',
    'positive',
    0,
    DATETIME('now', '-1 days', '+20 hours'),
    DATETIME('now', '-1 days', '+20 hours')
);
