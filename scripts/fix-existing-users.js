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

async function fixExistingUsers() {
  try {
    console.log('Checking for existing users without profiles...');
    
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }
    
    console.log(`Found ${authUsers.users.length} auth users`);
    
    // Get all existing profiles
    const { data: existingProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id');
    
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return;
    }
    
    const existingProfileIds = new Set(existingProfiles.map(p => p.id));
    console.log(`Found ${existingProfiles.length} existing profiles`);
    
    // Find users without profiles
    const usersWithoutProfiles = authUsers.users.filter(user => !existingProfileIds.has(user.id));
    
    if (usersWithoutProfiles.length === 0) {
      console.log('All users have profiles!');
      return;
    }
    
    console.log(`Found ${usersWithoutProfiles.length} users without profiles`);
    
    // Create profiles for users who don't have them
    for (const user of usersWithoutProfiles) {
      console.log(`Creating profile for user: ${user.email}`);
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: `user_${user.id.substring(0, 8)}`,
          full_name: user.user_metadata?.full_name || 'New User',
          role: user.user_metadata?.role || 'student'
        });
      
      if (insertError) {
        console.error(`Error creating profile for ${user.email}:`, insertError);
      } else {
        console.log(`✓ Profile created for ${user.email}`);
      }
    }
    
    console.log('Finished fixing existing users!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixExistingUsers(); 