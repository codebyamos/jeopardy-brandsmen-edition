import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player, Question, CategoryDescription } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

export const useGameData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const { toast } = useToast();

  const cleanupUnusedMedia = async (questions: Question[]) => {
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

  const saveGame = async (
    players: Player[], 
    questions?: Question[], 
    answeredQuestions?: number[], 
    categoryDescriptions?: CategoryDescription[],
    gameDate?: string, 
    isManual: boolean = false
  ) => {
    setIsLoading(true);
    try {
      const today = gameDate || new Date().toISOString().split('T')[0];
      let gameId = currentGameId;

      console.log('Saving game with players:', players);
      console.log('Saving questions:', questions?.length || 0);
      console.log('Saving category descriptions:', categoryDescriptions?.length || 0);
      console.log('Current game ID:', gameId);
      console.log('Game date:', today);

      // If currentGameId is set, check if it still exists in the database
      if (gameId) {
        const { data: existingGame } = await supabase
          .from('games')
          .select('id')
          .eq('id', gameId)
          .single();

        // If the game doesn't exist, reset the currentGameId
        if (!existingGame) {
          gameId = null;
          setCurrentGameId(null);
        }
      }

      // Check if there's already a game for today (if we don't have a valid gameId)
      if (!gameId) {
        const { data: existingGame } = await supabase
          .from('games')
          .select('id')
          .eq('game_date', today)
          .maybeSingle();

        if (existingGame) {
          gameId = existingGame.id;
          setCurrentGameId(gameId);
          console.log('Found existing game for today:', gameId);
        }
      }

      // Create a new game if none exists for today
      if (!gameId) {
        console.log('Creating new game for today');
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .insert([{ game_date: today }])
          .select()
          .single();

        if (gameError) throw gameError;
        gameId = gameData.id;
        setCurrentGameId(gameId);
        console.log('Created new game:', gameId);

        // Clean up unused media files when starting a new game
        if (questions && questions.length > 0) {
          await cleanupUnusedMedia(questions);
        }
      }

      // Delete existing players for this game
      await supabase
        .from('game_players')
        .delete()
        .eq('game_id', gameId);

      // Save all players for this game
      const gamePlayersData = players.map(player => ({
        game_id: gameId,
        player_name: player.name,
        player_score: player.score,
        avatar_url: player.avatar || null
      }));

      const { error: playersError } = await supabase
        .from('game_players')
        .insert(gamePlayersData);

      if (playersError) throw playersError;

      // Save questions and answered questions if provided
      if (questions && questions.length > 0) {
        // Delete existing questions for this game
        await supabase
          .from('game_questions')
          .delete()
          .eq('game_id', gameId);

        // Save all questions for this game
        const gameQuestionsData = questions.map(question => ({
          game_id: gameId,
          question_id: question.id,
          category: question.category,
          points: question.points,
          question: question.question,
          answer: question.answer,
          bonus_points: question.bonusPoints || 0,
          image_url: question.imageUrl || null,
          video_url: question.videoUrl || null,
          is_answered: answeredQuestions?.includes(question.id) || false
        }));

        const { error: questionsError } = await supabase
          .from('game_questions')
          .insert(gameQuestionsData);

        if (questionsError) throw questionsError;
      }

      // Save category descriptions if provided
      if (categoryDescriptions && categoryDescriptions.length > 0) {
        // Delete existing category descriptions for this game
        await supabase
          .from('game_categories')
          .delete()
          .eq('game_id', gameId);

        // Save all category descriptions for this game
        const gameCategoriesData = categoryDescriptions.map(desc => ({
          game_id: gameId,
          category_name: desc.category,
          description: desc.description
        }));

        const { error: categoriesError } = await supabase
          .from('game_categories')
          .insert(gameCategoriesData);

        if (categoriesError) throw categoriesError;
      }

      console.log('Game saved successfully to database');
      
      // Only show toast for manual saves
      if (isManual) {
        toast({
          title: "Game Saved!",
          description: "Your game has been successfully saved to the database.",
        });
      }

      return gameId;
    } catch (error) {
      console.error('Error saving game:', error);
      if (isManual) {
        toast({
          title: "Error",
          description: "Failed to save the game. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGame = async (gameId: string) => {
    setIsLoading(true);
    try {
      // Get all questions for this game to clean up their media
      const { data: questions } = await supabase
        .from('game_questions')
        .select('image_url, video_url')
        .eq('game_id', gameId);

      // Delete game questions first
      await supabase
        .from('game_questions')
        .delete()
        .eq('game_id', gameId);

      // Delete game players
      const { error: playersError } = await supabase
        .from('game_players')
        .delete()
        .eq('game_id', gameId);

      if (playersError) throw playersError;

      // Delete game categories
      await supabase
        .from('game_categories')
        .delete()
        .eq('game_id', gameId);

      // Delete the game
      const { error: gameError } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      if (gameError) throw gameError;

      // Clean up media files for this game
      if (questions && questions.length > 0) {
        const filesToDelete: string[] = [];
        questions.forEach(q => {
          if (q.image_url && q.image_url.includes('player-avatars')) {
            const fileName = q.image_url.split('/').pop();
            if (fileName) filesToDelete.push(fileName);
          }
        });

        if (filesToDelete.length > 0) {
          await supabase.storage
            .from('player-avatars')
            .remove(filesToDelete);
        }
      }

      // Reset current game ID if it was the deleted game
      if (currentGameId === gameId) {
        setCurrentGameId(null);
      }

      toast({
        title: "Game Deleted!",
        description: "The game has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting game:', error);
      toast({
        title: "Error",
        description: "Failed to delete the game. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentGames = async (limit = 10) => {
    setIsLoading(true);
    try {
      console.log('Attempting to load recent games from database...');
      
      const { data: games, error } = await supabase
        .from('games')
        .select(`
          id,
          game_date,
          created_at,
          game_players (
            id,
            player_name,
            player_score,
            avatar_url
          ),
          game_questions (
            question_id,
            category,
            points,
            question,
            answer,
            bonus_points,
            image_url,
            video_url,
            is_answered
          ),
          game_categories (
            category_name,
            description
          )
        `)
        .order('game_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully loaded games:', games?.length || 0);
      return games || [];
    } catch (error) {
      console.error('Error loading games:', error);
      
      // More specific error handling
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Network connection error - unable to reach database');
        toast({
          title: "Connection Error",
          description: "Unable to connect to the database. Please check your internet connection.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load games. Please try again.",
          variant: "destructive",
        });
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const resetCurrentGame = () => {
    setCurrentGameId(null);
  };

  return {
    saveGame,
    deleteGame,
    loadRecentGames,
    resetCurrentGame,
    currentGameId,
    isLoading,
    cleanupUnusedMedia
  };
};
