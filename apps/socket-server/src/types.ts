export interface GameSettings {
  providers: number[];
  mediaTypes: ('movie' | 'tv')[];
  genres: number[];
  poolSize: number | 'all';
  minRating: number;
  region: string;
  language: string;
  yearRange: [number, number];
  contentRatings: string[];
  sortBy: 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc';
  firstMatchMode: boolean;
  timerSeconds: number | null;
}

export interface TitleCard {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  year: number;
  posterPath: string;
  overview: string;
  voteAverage: number;
  rottenTomatoesScore: number | null;
  metacriticScore: number | null;
  runtime: number | null;
  genres: string[];
  contentRating: string;
  trailerKey: string | null;
  cast: string[];
  director: string | null;
  providers: StreamingProvider[];
}

export interface StreamingProvider {
  id: number;
  name: string;
  logoPath: string;
}

export interface Player {
  id: string;
  displayName: string;
  isCreator: boolean;
  connected: boolean;
  progress: number;
  finished: boolean;
  superLikeUsed: boolean;
}

export interface SwipeDecision {
  tmdbId: number;
  decision: 'like' | 'pass' | 'superlike';
  timestamp: number;
}

export interface Room {
  code: string;
  status: 'lobby' | 'swiping' | 'ranking' | 'finished';
  settings: GameSettings;
  players: Player[];
  titlePool: TitleCard[];
  matchedTitles: TitleCard[];
  winner: TitleCard | null;
  createdAt: number;
  swipes: Map<string, SwipeDecision[]>;
  rankings: Map<string, Array<{ tmdbId: number; rank: number }>>;
}

export interface GameStatAward {
  title: string;
  playerName: string;
  value: string;
  emoji: string;
}
