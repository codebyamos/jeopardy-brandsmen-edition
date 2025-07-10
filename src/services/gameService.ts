
import { supabase } from '@/integrations/supabase/client';
import { Player, Question, CategoryDescription } from '@/types/game';

export const createOrFindGame = async (gameDate: string, currentGameId: string | null) => {
  let gameId = currentGameId;

  // If currentGameId is set, check if it still exists in the database
  if (gameId) {
    const { data: existingGame, error: checkError } = await supabase
      .from('games')
      .select('id')
      .eq('id', gameId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing game:', checkError);
      gameId = null;
    } else if (!existingGame) {
      // If the game doesn't exist, reset the currentGameId
      gameId = null;
    }
  }

  // Check if there's already a game for today (if we don't have a valid gameId)
  if (!gameId) {
    const { data: existingGame, error: findError } = await supabase
      .from('games')
      .select('id')
      .eq('game_date', gameDate)
      .maybeSingle();

    if (findError) {
      console.error('Error finding existing game:', findError);
    } else if (existingGame) {
      gameId = existingGame.id;
      console.log('Found existing game for today:', gameId);
    }
  }

  // Create a new game if none exists for today
  if (!gameId) {
    console.log('Creating new game for today');
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert([{ game_date: gameDate }])
      .select()
      .single();

    if (gameError) {
      console.error('Error creating game:', gameError);
      throw gameError;
    }
    
    gameId = gameData.id;
    console.log('Created new game:', gameId);
  }

  return gameId;
};

export const saveGamePlayers = async (gameId: string, players: Player[]) => {
  // Delete existing players for this game
  const { error: deletePlayersError } = await supabase
    .from('game_players')
    .delete()
    .eq('game_id', gameId);

  if (deletePlayersError) {
    console.error('Error deleting existing players:', deletePlayersError);
    throw deletePlayersError;
  }

  // Save all players for this game
  if (players && players.length > 0) {
    const gamePlayersData = players.map(player => ({
      game_id: gameId,
      player_name: player.name,
      player_score: player.score,
      avatar_url: player.avatar || null
    }));

    const { error: playersError } = await supabase
      .from('game_players')
      .insert(gamePlayersData);

    if (playersError) {
      console.error('Error saving players:', playersError);
      throw playersError;
    }
  }
};

export const saveGameQuestions = async (gameId: string, questions: Question[], answeredQuestions?: number[]) => {
  // Delete existing questions for this game
  const { error: deleteQuestionsError } = await supabase
    .from('game_questions')
    .delete()
    .eq('game_id', gameId);

  if (deleteQuestionsError) {
    console.error('Error deleting existing questions:', deleteQuestionsError);
    throw deleteQuestionsError;
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

  const { error: questionsError } = await supabase
    .from('game_questions')
    .insert(gameQuestionsData);

  if (questionsError) {
    console.error('Error saving questions:', questionsError);
    throw questionsError;
  }
};

export const saveGameCategories = async (gameId: string, categoryDescriptions: CategoryDescription[]) => {
  // Delete existing category descriptions for this game
  const { error: deleteCategoriesError } = await supabase
    .from('game_categories')
    .delete()
    .eq('game_id', gameId);

  if (deleteCategoriesError) {
    console.error('Error deleting existing categories:', deleteCategoriesError);
    throw deleteCategoriesError;
  }

  // Save all category descriptions for this game
  const gameCategoriesData = categoryDescriptions.map(desc => ({
    game_id: gameId,
    category_name: desc.category,
    description: desc.description
  }));

  const { error: categoriesError } = await supabase
    .from('game_categories')
    .insert(gameCategoriesData);

  if (categoriesError) {
    console.error('Error saving categories:', categoriesError);
    throw categoriesError;
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
};
