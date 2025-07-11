
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types/game';

export const cleanupUnusedMedia = async (questions: Question[]) => {
  try {
    console.log('🧹 Starting media cleanup...');
    
    // Extract all image and video URLs from current questions
    const usedUrls = new Set<string>();
    questions.forEach(question => {
      if (question.imageUrl) usedUrls.add(question.imageUrl);
      if (question.videoUrl) usedUrls.add(question.videoUrl);
    });

    // Get all uploaded files from storage
    const { data: files, error } = await supabase.storage
      .from('player-avatars')
      .list();

    if (error) {
      console.error('Error listing files:', error);
      return;
    }

    // Find files that are not being used
    const filesToDelete: string[] = [];
    const existingFiles = new Set<string>();
    
    files?.forEach(file => {
      const fileUrl = supabase.storage
        .from('player-avatars')
        .getPublicUrl(file.name).data.publicUrl;
      
      existingFiles.add(fileUrl);
      
      if (!usedUrls.has(fileUrl)) {
        filesToDelete.push(file.name);
      }
    });

    // Delete unused files from storage
    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from('player-avatars')
        .remove(filesToDelete);

      if (deleteError) {
        console.error('Error deleting unused files:', deleteError);
      } else {
        console.log(`🗑️ Cleaned up ${filesToDelete.length} unused media files from storage`);
      }
    }

    // Check for broken references in database (URLs that don't exist in storage)
    const brokenRefs: string[] = [];
    usedUrls.forEach(url => {
      if (url.includes('player-avatars') && !existingFiles.has(url)) {
        brokenRefs.push(url);
      }
    });

    if (brokenRefs.length > 0) {
      console.log(`🔗 Found ${brokenRefs.length} broken image references in database:`, brokenRefs);
      // Note: The calling code should handle updating the database to remove these broken references
    }

  } catch (error) {
    console.error('Error during media cleanup:', error);
  }
};
