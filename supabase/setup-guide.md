# Supabase Migration Setup Guide

This guide walks you through setting up Supabase for your IGCSE web application.

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create an account
2. Create a new project with these details:
   - **Name**: IGCSE Mock Test Platform
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is fine for development

## 2. Run Database Migrations

Once your project is ready, navigate to the SQL Editor in Supabase dashboard:

1. Run `001_initial_schema.sql` to create all tables and indexes
2. Run `002_seed_data.sql` to populate subjects and courses

## 3. Configure Authentication

In Supabase Dashboard > Authentication > Providers:

1. Enable Email authentication
2. Configure email templates for:
   - Confirmation emails
   - Password reset emails
3. Set up OAuth providers (optional):
   - Google
   - GitHub
   - Microsoft (for school accounts)

## 4. Set Up Storage Buckets

In Supabase Dashboard > Storage:

Create these buckets:
- `avatars` - For user profile pictures
- `question-images` - For quiz question images
- `exam-papers` - For PDF exam papers (if needed)

## 5. Environment Variables

Add these to your `.env` files:

### Backend (.env)
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Remove old database configs
# MONGODB_URI=
# TURSO_URL=
# TURSO_AUTH_TOKEN=
```

### Frontend (.env)
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Update API URL
VITE_API_URL=http://localhost:3001/api
```

## 6. Install Dependencies

```bash
# Backend
cd backend
npm install @supabase/supabase-js

# Frontend  
cd frontend
npm install @supabase/supabase-js
```

## 7. Run Data Migration

If you have existing MongoDB data:

```bash
cd scripts/migration
npm install mongodb @supabase/supabase-js

node mongodb-to-supabase.js \
  --mongodb-uri "your-mongodb-connection-string" \
  --supabase-url "https://your-project.supabase.co" \
  --supabase-key "your-service-role-key"
```

## 8. Update Backend Code

The backend needs to be refactored to use Supabase client instead of Mongoose/SQLite. Key changes:

1. Replace MongoDB models with Supabase queries
2. Update authentication middleware to verify Supabase JWTs
3. Use Supabase client for all database operations

## 9. Update Frontend Code

The frontend needs updates to:

1. Use Supabase client for authentication
2. Replace axios calls with Supabase client where appropriate
3. Update auth context to use Supabase auth state

## 10. Test the Migration

1. Test user registration and login
2. Verify quiz data is accessible
3. Test quiz attempts and scoring
4. Check user statistics calculations

## Security Considerations

1. **Row Level Security (RLS)**: The schema includes basic RLS policies. Review and adjust based on your needs.
2. **API Keys**: Never expose service role key to frontend
3. **Environment Variables**: Ensure all keys are properly secured

## Next Steps

1. Set up real-time subscriptions for live quiz updates
2. Implement Supabase Edge Functions for complex business logic
3. Configure database backups
4. Set up monitoring and alerts

## Troubleshooting

- **RLS Errors**: Check if RLS policies are correctly configured
- **Auth Errors**: Verify JWT token is being passed correctly
- **Migration Issues**: Check MongoDB data format matches expected structure

For more details, refer to [Supabase Documentation](https://supabase.com/docs).