import app from './app';

// Start the server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔐 Auth: Supabase Auth enabled`);
  console.log(`🗄️  Database: Supabase PostgreSQL`);
  console.log(`🌐 CORS configured for frontend origins`);
});