-- Create RPC functions for game history operations

-- Function to get a list of database tables
CREATE OR REPLACE FUNCTION public.get_tables()
RETURNS TABLE (table_name text)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT tablename::text FROM pg_tables WHERE schemaname = 'public';
END;
$$ LANGUAGE plpgsql;

-- Function to execute arbitrary SQL (for table creation)
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql;

-- Function to insert a game history record
CREATE OR REPLACE FUNCTION public.insert_game_history(
  p_game_date date,
  p_winner_name text,
  p_winner_score integer
)
RETURNS TABLE (id uuid, game_date date)
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.game_history (game_date, winner_name, winner_score)
  VALUES (p_game_date, p_winner_name, p_winner_score)
  RETURNING game_history.id INTO v_id;
  
  RETURN QUERY SELECT v_id, p_game_date;
END;
$$ LANGUAGE plpgsql;

-- Function to insert a game history player
CREATE OR REPLACE FUNCTION public.insert_game_history_player(
  p_history_id uuid,
  p_player_name text,
  p_player_score integer,
  p_avatar_url text
)
RETURNS uuid
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.game_history_players (history_id, player_name, player_score, avatar_url)
  VALUES (p_history_id, p_player_name, p_player_score, p_avatar_url)
  RETURNING game_history_players.id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get game history with players
CREATE OR REPLACE FUNCTION public.get_game_history(p_limit integer DEFAULT 20)
RETURNS json
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(history_with_players)
  INTO result
  FROM (
    SELECT 
      h.id,
      h.game_date,
      h.created_at,
      h.winner_name,
      h.winner_score,
      COALESCE(
        (SELECT json_agg(p)
         FROM (
           SELECT 
             hp.id,
             hp.player_name,
             hp.player_score,
             hp.avatar_url
           FROM public.game_history_players hp
           WHERE hp.history_id = h.id
           ORDER BY hp.player_score DESC
         ) p
        ),
        '[]'::json
      ) AS game_history_players
    FROM public.game_history h
    ORDER BY h.game_date DESC
    LIMIT p_limit
  ) history_with_players;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Function to delete a game history record
CREATE OR REPLACE FUNCTION public.delete_game_history(p_history_id uuid)
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.game_history WHERE id = p_history_id;
END;
$$ LANGUAGE plpgsql;
