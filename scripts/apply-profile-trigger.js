import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://trtoyhdwawgrfafrvygj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('You can find this in your Supabase dashboard under Settings > API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyProfileTrigger() {
  try {
    console.log('Applying profile trigger migration...');
    
    // First, let's check if the trigger already exists
    const { data: existingTriggers, error: checkError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name')
      .eq('trigger_name', 'on_auth_user_created');
    
    if (checkError) {
      console.log('Checking existing triggers...');
    }
    
    if (existingTriggers && existingTriggers.length > 0) {
      console.log('Profile trigger already exists!');
      return;
    }
    
    // Apply the migration using the SQL editor approach
    console.log('Creating profile trigger...');
    
    // We'll need to use the Supabase dashboard SQL editor for this
    // since direct SQL execution requires special permissions
    console.log('\n=== MANUAL STEP REQUIRED ===');
    console.log('Please go to your Supabase dashboard:');
    console.log('https://supabase.com/dashboard/project/trtoyhdwawgrfafrvygj/sql');
    console.log('\nThen run this SQL:');
    console.log(`
-- Create a trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `);
    
    console.log('\nAfter running this SQL, your app should work properly!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

applyProfileTrigger(); 