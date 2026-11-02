import { createApp } from './app.js';
import { config } from './config.js';
import { connectDb } from './db.js';

await connectDb(config.mongodbUri);
createApp().listen(config.port, () => {
    console.log(`API escuchando en http://localhost:${config.port}`);
});
