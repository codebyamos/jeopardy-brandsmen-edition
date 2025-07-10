import { supabase } from '@/integrations/supabase/client';
import { Player, Question, CategoryDescription } from '@/types/game';

// Enhanced connection test with more detailed logging
const testConnection = async () => {
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

export const createOrFindGame = async (gameDate: string, currentGameId: string | null) => {
  // Test connection first with retry logic
  let connectionAttempts = 0;
  const maxAttempts = 3;
  
  while (connectionAttempts < maxAttempts) {
    try {
      await testConnection();
      break;
    } catch (error) {
      connectionAttempts++;
      console.log(`Connection attempt ${connectionAttempts}/${maxAttempts} failed`);
      
      if (connectionAttempts >= maxAttempts) {
        throw new Error(`Failed to connect to database after ${maxAttempts} attempts: ${error.message}`);
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, connectionAttempts) * 1000;
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  let gameId = currentGameId;

  // If currentGameId is set, check if it still exists in the database
  if (gameId) {
    try {
      const { data: existingGame, error: checkError } = await supabase
        .from('games')
        .select('id')
        .eq('id', gameId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing game:', checkError);
        gameId = null;
      } else if (!existingGame) {
        gameId = null;
      }
    } catch (error) {
      console.error('Network error checking existing game:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Check if there's already a game for today (if we don't have a valid gameId)
  if (!gameId) {
    try {
      const { data: existingGame, error: findError } = await supabase
        .from('games')
        .select('id')
        .eq('game_date', gameDate)
        .maybeSingle();

      if (findError) {
        console.error('Error finding existing game:', findError);
        throw new Error(`Failed to find existing game: ${findError.message}`);
      } else if (existingGame) {
        gameId = existingGame.id;
        console.log('Found existing game for today:', gameId);
      }
    } catch (error) {
      console.error('Network error finding existing game:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Create a new game if none exists for today
  if (!gameId) {
    try {
      console.log('Creating new game for today');
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert([{ game_date: gameDate }])
        .select()
        .single();

      if (gameError) {
        console.error('Error creating game:', gameError);
        throw new Error(`Failed to create game: ${gameError.message}`);
      }
      
      gameId = gameData.id;
      console.log('Created new game:', gameId);
    } catch (error) {
      console.error('Network error creating game:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  }

  return gameId;
};

export const saveGamePlayers = async (gameId: string, players: Player[]) => {
  console.log('Saving players for game:', gameId, players);
  
  try {
    // Delete existing players for this game
    const { error: deletePlayersError } = await supabase
      .from('game_players')
      .delete()
      .eq('game_id', gameId);

    if (deletePlayersError) {
      console.error('Error deleting existing players:', deletePlayersError);
      throw new Error(`Failed to delete existing players: ${deletePlayersError.message}`);
    }

    // Save all players for this game
    if (players && players.length > 0) {
      const gamePlayersData = players.map(player => ({
        game_id: gameId,
        player_name: player.name,
        player_score: player.score,
        avatar_url: player.avatar || null
      }));

      console.log('Inserting players data:', gamePlayersData);

      const { error: playersError } = await supabase
        .from('game_players')
        .insert(gamePlayersData);

      if (playersError) {
        console.error('Error saving players:', playersError);
        throw new Error(`Failed to save players: ${playersError.message}`);
      }
      
      console.log('Players saved successfully');
    }
  } catch (error) {
    console.error('saveGamePlayers failed:', error);
    throw error;
  }
};

export const saveGameQuestions = async (gameId: string, questions: Question[], answeredQuestions?: number[]) => {
  console.log('Saving questions for game:', gameId, 'Questions count:', questions.length);
  
  try {
    // Delete existing questions for this game
    const { error: deleteQuestionsError } = await supabase
      .from('game_questions')
      .delete()
      .eq('game_id', gameId);

    if (deleteQuestionsError) {
      console.error('Error deleting existing questions:', deleteQuestionsError);
      throw new Error(`Failed to delete existing questions: ${deleteQuestionsError.message}`);
    }

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

    console.log('Inserting questions data:', gameQuestionsData.slice(0, 2)); // Log first 2 for brevity

    const { error: questionsError } = await supabase
      .from('game_questions')
      .insert(gameQuestionsData);

    if (questionsError) {
      console.error('Error saving questions:', questionsError);
      throw new Error(`Failed to save questions: ${questionsError.message}`);
    }
    
    console.log('Questions saved successfully');
  } catch (error) {
    console.error('saveGameQuestions failed:', error);
    throw error;
  }
};

export const saveGameCategories = async (gameId: string, categoryDescriptions: CategoryDescription[]) => {
  console.log('Saving categories for game:', gameId, categoryDescriptions);
  
  try {
    // Delete existing category descriptions for this game
    const { error: deleteCategoriesError } = await supabase
      .from('game_categories')
      .delete()
      .eq('game_id', gameId);

    if (deleteCategoriesError) {
      console.error('Error deleting existing categories:', deleteCategoriesError);
      throw new Error(`Failed to delete existing categories: ${deleteCategoriesError.message}`);
    }

    // Save all category descriptions for this game
    if (categoryDescriptions && categoryDescriptions.length > 0) {
      const gameCategoriesData = categoryDescriptions.map(desc => ({
        game_id: gameId,
        category_name: desc.category,
        description: desc.description
      }));

      console.log('Inserting categories data:', gameCategoriesData);

      const { error: categoriesError } = await supabase
        .from('game_categories')
        .insert(gameCategoriesData);

      if (categoriesError) {
        console.error('Error saving categories:', categoriesError);
        throw new Error(`Failed to save categories: ${categoriesError.message}`);
      }
      
      console.log('Categories saved successfully');
    }
  } catch (error) {
    console.error('saveGameCategories failed:', error);
    throw error;
  }
};

export const deleteGameData = async (gameId: string) => {
  // Get all questions for this game to clean up their media
  const { data: questions } = await supabase
    .from('game_questions')
    .select('image_url, video_url')
    .eq('game_id', gameId);

  // Delete game questions first
  const { error: deleteQuestionsError } = await supabase
    .from('game_questions')
    .delete()
    .eq('game_id', gameId);

  if (deleteQuestionsError) {
    console.error('Error deleting questions:', deleteQuestionsError);
    throw deleteQuestionsError;
  }

  // Delete game players
  const { error: playersError } = await supabase
    .from('game_players')
    .delete()
    .eq('game_id', gameId);

  if (playersError) {
    console.error('Error deleting players:', playersError);
    throw playersError;
  }

  // Delete game categories
  const { error: categoriesError } = await supabase
    .from('game_categories')
    .delete()
    .eq('game_id', gameId);

  if (categoriesError) {
    console.error('Error deleting categories:', categoriesError);
    throw categoriesError;
  }

  // Delete the game
  const { error: gameError } = await supabase
    .from('games')
    .delete()
    .eq('id', gameId);

  if (gameError) {
    console.error('Error deleting game:', gameError);
    throw gameError;
  }

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
};

export const loadRecentGamesData = async (limit = 10) => {
  console.log('=== LOADING RECENT GAMES ===');
  console.log('Environment:', window.location.origin);
  console.log('Limit:', limit);
  console.log('Online status:', navigator.onLine);
  
  try {
    // Check if we're online first
    if (!navigator.onLine) {
      throw new Error('Device appears to be offline. Please check your internet connection.');
    }
    
    console.log('Making Supabase query...');
    
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

    console.log('Supabase query completed');
    console.log('Error:', error);
    console.log('Games returned:', games?.length || 0);

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Check if this is a network-related error
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        throw new Error('Network connection error. Please check your internet connection and try again.');
      }
      
      throw error;
    }

    if (games && games.length > 0) {
      console.log('First game sample:', {
        id: games[0].id,
        date: games[0].game_date,
        playersCount: games[0].game_players?.length || 0,
        questionsCount: games[0].game_questions?.length || 0,
        categoriesCount: games[0].game_categories?.length || 0
      });
    }

    console.log('=== LOAD COMPLETE ===');
    return games || [];
  } catch (error) {
    console.error('=== LOAD FAILED ===');
    console.error('Detailed error in loadRecentGamesData:', error);
    
    // Log additional context for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error detected - this appears to be a connectivity issue');
      throw new Error('Unable to connect to the database. Please check your internet connection and try again.');
    }
    
    throw error;
  }
};
