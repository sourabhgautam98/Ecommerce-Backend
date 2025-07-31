require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { supabase } = require('./config/supabase');


const app = express();
const PORT = 3000;


// Middlewares
app.use(cors());
app.use(express.json()); 


// Routes
app.use('/api/users', userRoutes);
console.log("11111111111111111111111111111111")
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);

// Basic route to test server
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  res.status(500).json({ error: error.message });
});

// DB connection and server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));


async function initializeStorage() {
  try {
    console.log('🔍 Checking Supabase Storage connection...');
    
    // Just test the connection by listing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error connecting to Supabase Storage:', listError);
      throw new Error('Cannot connect to Supabase Storage. Check your credentials.');
    }

    console.log('✅ Connected to Supabase Storage');
    console.log('📦 Available buckets:', buckets.map(b => b.name));

    // Check if media bucket exists (but don't create it)
    const bucketExists = buckets.some(bucket => bucket.name === 'media');
    
    if (!bucketExists) {
      console.log('⚠️  Bucket "media" not found. Please create it manually in the Supabase dashboard:');
      console.log('   1. Go to Storage → Storage');
      console.log('   2. Click "New bucket"');
      console.log('   3. Name: "media"');
      console.log('   4. Toggle "Public bucket" ON');
      console.log('   5. Click "Save"');
      console.log('');
      console.log('🚀 Server will start anyway - create the bucket when ready to upload files.');
    } else {
      console.log('✅ Bucket "media" exists and ready for uploads');
    }

  } catch (error) {
    console.error('❌ Storage initialization failed:', error.message);
    console.log('🚀 Server will start anyway - check your Supabase configuration');
  }
}

initializeStorage()