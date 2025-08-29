
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet')

//dotenv.config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const testSuiteRoutes = require('./routes/testSuiteRoutes');
const testCaseRoutes = require('./routes/testCaseRoutes');
const testRunRoutes = require('./routes/testRunRoutes');

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"];


// Middlewares
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },

  })
);
app.use(helmet({ contentSecurityPolicy: false }));
//app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Load env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });
console.log("🔍 Loaded ENV File:", envFile);
console.log("🔍 Current MONGO_URI:", process.env.MONGO_URI);


// Connect to MongoDB
if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in env file.');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/testsuites', testSuiteRoutes);
app.use('/api/testcases', testCaseRoutes);
app.use('/api/testruns', testRunRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
