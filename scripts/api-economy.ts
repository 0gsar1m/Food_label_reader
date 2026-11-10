import 'dotenv/config';
// Explicit economy launch; never silently downgrade the configured demo models.
process.env.GEMINI_MODEL = 'gemini-3.1-flash-lite';
process.env.PERSONAL_MODEL = 'gemini-3.1-flash-lite';
void import('../server/index');
