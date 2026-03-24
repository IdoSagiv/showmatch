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
  endYear?: number;           // TV only — last season year
  seriesStatus?: 'running' | 'ended'; // TV only
  seasons?: number;           // TV only — number of seasons
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
}

export interface GameStatAward {
  title: string;
  playerName: string;
  value: string;
  emoji: string;
}

export interface GameHistoryEntry {
  id: string;
  date: string;
  players: string[];
  winner: { title: string; posterPath: string } | null;
  stats: GameStatAward[];
}
