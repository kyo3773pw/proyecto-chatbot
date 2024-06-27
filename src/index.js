//import 'dotenv/config';
//console.log('HUGGING_FACE_API_KEY:', process.env.HUGGING_FACE_API_KEY);  // Add this line for debugging

import app from './app.js'
import {connectDB} from './db.js'

connectDB();
app.listen(3000)
console.log('Server on port', 3000)
