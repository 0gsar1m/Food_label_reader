import express from 'express';
import path from 'node:path';

// Local acceptance preview serves the exact exported application, without development reloads.
const app = express();
app.use(express.static(path.resolve('dist')));
app.listen(8082, '127.0.0.1', () => console.info('Exported app preview: http://localhost:8082'));
