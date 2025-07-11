import { supabase } from '@/integrations/supabase/client';

// Enhanced connection test with more detailed logging
export const testConnection = async () => {
  try {
    console.log('=== TESTING DATABASE CONNECTION ===');
    console.log('Supabase URL:', 'https://gzflmkzdxalzgjhjwzwf.supabase.co');
    console.log('Environment:', window.location.origin);
    console.log('User Agent:', navigator.userAgent);
    console.log('Online status:', navigator.onLine);
    
    // Test basic connectivity first
    if (!navigator.onLine) {
      throw new Error('Device appears to be offline');
    }
    
    // Test the actual Supabase connection
    const { data, error } = await supabase.from('games').select('id').limit(1);
    
    if (error) {
      console.error('Database connection test failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Database connection failed: ${error.message}`);
    }
    
    console.log('Database connection test passed');
    console.log('=== CONNECTION TEST COMPLETE ===');
    return true;
  } catch (error) {
    console.error('=== CONNECTION TEST FAILED ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('This appears to be a network connectivity issue');
      console.error('Possible causes:');
      console.error('- Internet connection problems');
      console.error('- Firewall blocking the request');
      console.error('- DNS resolution issues');
      console.error('- Supabase service temporarily unavailable');
    }
    
    throw error;
  }
};