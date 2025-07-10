
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types/game';

export const cleanupUnusedMedia = async (questions: Question[]) => {
  try {
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
    files?.forEach(file => {
      const fileUrl = supabase.storage
        .from('player-avatars')
        .getPublicUrl(file.name).data.publicUrl;
      
      if (!usedUrls.has(fileUrl)) {
        filesToDelete.push(file.name);
      }
    });

    // Delete unused files
    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from('player-avatars')
        .remove(filesToDelete);

      if (deleteError) {
        console.error('Error deleting unused files:', deleteError);
      } else {
        console.log(`Cleaned up ${filesToDelete.length} unused media files`);
      }
    }
  } catch (error) {
    console.error('Error during media cleanup:', error);
  }
};
