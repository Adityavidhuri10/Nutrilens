import app from './app.js';
import env from './config/env.js';
import connectDB from './config/db.js';

connectDB();

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 NutriLens AI Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});