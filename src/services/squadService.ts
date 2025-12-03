import { supabase } from '@/lib/supabase'
import type { 
  RealtimeChannel,
  RealtimePostgresChangesPayload 
} from '@supabase/supabase-js'

export interface SquadMatch {
  id: string
  team_a_player1_id: string
  team_a_player2_id: string
  team_b_player1_id: string
  team_b_player2_id: string
  category_id: string | null
  total_rounds: number
  current_round: number
  team_a_score: number
  team_b_score: number
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
  winning_team: 'team_a' | 'team_b' | 'draw' | null
  created_at: string
  started_at: string | null
  completed_at: string | null
}

export interface SquadRound {
  id: string
  match_id: string
  round_number: number
  question_id: string
  team_a_player1_answer: string | null
  team_a_player1_correct: boolean | null
  team_a_player1_time: number | null
  team_a_player2_answer: string | null
  team_a_player2_correct: boolean | null
  team_a_player2_time: number | null
  team_b_player1_answer: string | null
  team_b_player1_correct: boolean | null
  team_b_player1_time: number | null
  team_b_player2_answer: string | null
  team_b_player2_correct: boolean | null
  team_b_player2_time: number | null
  team_a_round_points: number
  team_b_round_points: number
  created_at: string
}

export interface SquadQueueEntry {
  id: string
  player1_id: string
  player2_id: string | null
  category_id: string | null
  is_invited: boolean
  status: 'waiting' | 'matched' | 'cancelled'
  created_at: string
  matched_at: string | null
}

export interface SquadMatchDetails extends SquadMatch {
  team_a_player1: {
    id: string
    username: string
    avatar: string | null
    level: number
  }
  team_a_player2: {
    id: string
    username: string
    avatar: string | null
    level: number
  }
  team_b_player1: {
    id: string
    username: string
    avatar: string | null
    level: number
  }
  team_b_player2: {
    id: string
    username: string
    avatar: string | null
    level: number
  }
  category: {
    id: string
    name: string
  } | null
}

/**
 * Join squad queue (solo or with friend)
 */
export async function joinSquadQueue(
  player1Id: string,
  player2Id?: string,
  categoryId?: string
): Promise<string> {
  const { data, error } = await supabase.rpc('join_squad_queue', {
    p_player1_id: player1Id,
    p_player2_id: player2Id || null,
    p_category_id: categoryId || null,
    p_is_invited: !!player2Id
  })

  if (error) throw error
  return data
}

/**
 * Leave squad queue
 */
export async function leaveSquadQueue(playerId: string): Promise<void> {
  const { error } = await supabase.rpc('leave_squad_queue', {
    p_player_id: playerId
  })

  if (error) throw error
}

/**
 * Get current queue entry for a player
 */
export async function getQueueEntry(playerId: string): Promise<SquadQueueEntry | null> {
  const { data, error } = await supabase
    .from('squad_queue')
    .select('*')
    .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
    .eq('status', 'waiting')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return data
}

/**
 * Get squad match details with player info
 */
export async function getSquadMatchDetails(matchId: string): Promise<SquadMatchDetails> {
  const { data, error } = await supabase
    .from('squad_matches')
    .select(`
      *,
      team_a_player1:profiles!squad_matches_team_a_player1_id_fkey(id, username, avatar),
      team_a_player2:profiles!squad_matches_team_a_player2_id_fkey(id, username, avatar),
      team_b_player1:profiles!squad_matches_team_b_player1_id_fkey(id, username, avatar),
      team_b_player2:profiles!squad_matches_team_b_player2_id_fkey(id, username, avatar),
      category:categories(id, name)
    `)
    .eq('id', matchId)
    .single()

  if (error) throw error

  // Get player levels
  const playerIds = [
    data.team_a_player1_id,
    data.team_a_player2_id,
    data.team_b_player1_id,
    data.team_b_player2_id
  ]

  const { data: stats } = await supabase
    .from('user_stats')
    .select('user_id, level')
    .in('user_id', playerIds)

  const levelMap = new Map(stats?.map(s => [s.user_id, s.level]) || [])

  return {
    ...data,
    team_a_player1: {
      ...data.team_a_player1,
      level: levelMap.get(data.team_a_player1_id) || 1
    },
    team_a_player2: {
      ...data.team_a_player2,
      level: levelMap.get(data.team_a_player2_id) || 1
    },
    team_b_player1: {
      ...data.team_b_player1,
      level: levelMap.get(data.team_b_player1_id) || 1
    },
    team_b_player2: {
      ...data.team_b_player2,
      level: levelMap.get(data.team_b_player2_id) || 1
    }
  }
}

/**
 * Start squad match
 */
export async function startSquadMatch(matchId: string): Promise<void> {
  const { error } = await supabase.rpc('start_squad_match', {
    p_match_id: matchId
  })

  if (error) throw error
}

/**
 * Get squad round with question
 */
export async function getSquadRound(
  matchId: string,
  roundNumber: number
): Promise<SquadRound & { question: any }> {
  const { data, error } = await supabase
    .from('squad_rounds')
    .select(`
      *,
      question:questions(*)
    `)
    .eq('match_id', matchId)
    .eq('round_number', roundNumber)
    .single()

  if (error) throw error
  return data
}

/**
 * Get all rounds for a match
 */
export async function getSquadRounds(matchId: string): Promise<SquadRound[]> {
  const { data, error } = await supabase
    .from('squad_rounds')
    .select('*')
    .eq('match_id', matchId)
    .order('round_number', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Submit answer for squad round
 */
export async function submitSquadAnswer(
  matchId: string,
  roundNumber: number,
  playerId: string,
  answer: string,
  timeTaken: number
): Promise<void> {
  const { error } = await supabase.rpc('submit_squad_round_answer', {
    p_match_id: matchId,
    p_round_number: roundNumber,
    p_player_id: playerId,
    p_answer: answer,
    p_time_taken: timeTaken
  })

  if (error) throw error
}

/**
 * Calculate round results
 */
export async function calculateSquadRoundResults(
  matchId: string,
  roundNumber: number
): Promise<void> {
  const { error } = await supabase.rpc('calculate_squad_round_results', {
    p_match_id: matchId,
    p_round_number: roundNumber
  })

  if (error) throw error
}

/**
 * Complete squad match
 */
export async function completeSquadMatch(matchId: string): Promise<void> {
  const { error } = await supabase.rpc('complete_squad_match', {
    p_match_id: matchId
  })

  if (error) throw error
}

/**
 * Create initial rounds for match
 */
export async function createSquadRounds(
  matchId: string,
  categoryId: string | null,
  totalRounds: number = 10
): Promise<void> {
  // Get random questions
  let query = supabase
    .from('questions')
    .select('id')
    .limit(totalRounds)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data: questions, error: questionsError } = await query

  if (questionsError) throw questionsError
  if (!questions || questions.length < totalRounds) {
    throw new Error('Not enough questions available')
  }

  // Shuffle questions
  const shuffled = questions.sort(() => Math.random() - 0.5)

  // Create rounds
  const rounds = shuffled.map((q, index) => ({
    match_id: matchId,
    round_number: index + 1,
    question_id: q.id
  }))

  const { error: insertError } = await supabase
    .from('squad_rounds')
    .insert(rounds)

  if (insertError) throw insertError
}

/**
 * Subscribe to squad match updates
 */
export function subscribeToSquadMatch(
  matchId: string,
  onUpdate: (payload: RealtimePostgresChangesPayload<SquadMatch>) => void
): RealtimeChannel {
  return supabase
    .channel(`squad_match:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'squad_matches',
        filter: `id=eq.${matchId}`
      },
      onUpdate
    )
    .subscribe()
}

/**
 * Subscribe to squad round updates
 */
export function subscribeToSquadRound(
  matchId: string,
  roundNumber: number,
  onUpdate: (payload: RealtimePostgresChangesPayload<SquadRound>) => void
): RealtimeChannel {
  return supabase
    .channel(`squad_round:${matchId}:${roundNumber}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'squad_rounds',
        filter: `match_id=eq.${matchId}`
      },
      (payload) => {
        if (payload.eventType === 'UPDATE') {
          onUpdate(payload as RealtimePostgresChangesPayload<SquadRound>)
        }
      }
    )
    .subscribe()
}

/**
 * Subscribe to squad queue (for matchmaking)
 */
export function subscribeToSquadQueue(
  playerId: string,
  onMatched: (queueEntry: SquadQueueEntry) => void
): RealtimeChannel {
  return supabase
    .channel(`squad_queue:${playerId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'squad_queue'
      },
      (payload) => {
        const entry = payload.new as SquadQueueEntry
        if (
          (entry.player1_id === playerId || entry.player2_id === playerId) &&
          entry.status === 'matched'
        ) {
          onMatched(entry)
        }
      }
    )
    .subscribe()
}

/**
 * Get player's squad match history
 */
export async function getSquadMatchHistory(
  playerId: string,
  limit: number = 10
): Promise<SquadMatchDetails[]> {
  const { data, error } = await supabase
    .from('squad_matches')
    .select(`
      *,
      team_a_player1:profiles!squad_matches_team_a_player1_id_fkey(id, username, avatar),
      team_a_player2:profiles!squad_matches_team_a_player2_id_fkey(id, username, avatar),
      team_b_player1:profiles!squad_matches_team_b_player1_id_fkey(id, username, avatar),
      team_b_player2:profiles!squad_matches_team_b_player2_id_fkey(id, username, avatar),
      category:categories(id, name)
    `)
    .or(
      `team_a_player1_id.eq.${playerId},` +
      `team_a_player2_id.eq.${playerId},` +
      `team_b_player1_id.eq.${playerId},` +
      `team_b_player2_id.eq.${playerId}`
    )
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  // Get levels for all players
  const allPlayerIds = data.flatMap(match => [
    match.team_a_player1_id,
    match.team_a_player2_id,
    match.team_b_player1_id,
    match.team_b_player2_id
  ])

  const { data: stats } = await supabase
    .from('user_stats')
    .select('user_id, level')
    .in('user_id', allPlayerIds)

  const levelMap = new Map(stats?.map(s => [s.user_id, s.level]) || [])

  return data.map(match => ({
    ...match,
    team_a_player1: {
      ...match.team_a_player1,
      level: levelMap.get(match.team_a_player1_id) || 1
    },
    team_a_player2: {
      ...match.team_a_player2,
      level: levelMap.get(match.team_a_player2_id) || 1
    },
    team_b_player1: {
      ...match.team_b_player1,
      level: levelMap.get(match.team_b_player1_id) || 1
    },
    team_b_player2: {
      ...match.team_b_player2,
      level: levelMap.get(match.team_b_player2_id) || 1
    }
  }))
}
