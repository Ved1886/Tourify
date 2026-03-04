const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase (must be before routes)
require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/wildlife', require('./routes/wildlifeRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/sanctuaries', require('./routes/sanctuaryRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/seed', require('./routes/seedRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tourify API is running on Firebase' });
});

app.listen(PORT, () => {
  console.log(`\n🌿 Tourify Backend running on port ${PORT}`);
  console.log(`🔥 Database: Firebase Firestore\n`);
});
