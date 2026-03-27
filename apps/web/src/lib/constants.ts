export const GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export const TV_GENRES: Record<number, string> = {
  10759: 'Action & Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648: 'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
};

export const COMMON_PROVIDERS: Record<number, string> = {
  8: 'Netflix',
  119: 'Amazon Prime Video',
  337: 'Disney+',
  384: 'HBO Max',
  350: 'Apple TV+',
  15: 'Hulu',
  531: 'Paramount+',
  386: 'Peacock',
  283: 'Crunchyroll',
  43: 'Starz',
  37: 'Showtime',
  11: 'MUBI',
  190: 'Curiosity Stream',
  151: 'BritBox',
  223: 'Hayu',
};

export const NAME_ADJECTIVES = [
  'Popcorn', 'Reel', 'Plot', 'Spoiler', 'Silver Screen',
  'Box Office', 'Oscar', 'Blockbuster', 'Indie', 'Cult Classic',
  'Binge', 'Streaming', 'Sequel', 'Premiere', 'Matinee',
];

export const NAME_NOUNS = [
  'Bandit', 'Twister', 'Alert', 'Deal', 'Guru',
  'Ninja', 'Wizard', 'Legend', 'Champion', 'Explorer',
  'Hunter', 'Critic', 'Buff', 'Addict', 'Whisperer',
];

export const CONTENT_RATINGS = ['G', 'PG', 'PG-13', 'R'];

export const TIMER_OPTIONS = [
  { label: 'Off', value: null },
  { label: '10s', value: 10 },
  { label: '15s', value: 15 },
  { label: '20s', value: 20 },
  { label: '30s', value: 30 },
];

export const SORT_OPTIONS = [
  { label: 'Most popular', value: 'popularity.desc' as const },
  { label: 'Top rated', value: 'vote_average.desc' as const },
  { label: 'Release Date', value: 'primary_release_date.desc' as const },
];

export const DEFAULT_SETTINGS = {
  providers: [],
  mediaTypes: ['movie', 'tv'] as ('movie' | 'tv')[],
  genres: [],
  poolSize: 30 as number | 'all',
  minRating: 5.0,
  region: 'US',
  language: 'en',
  yearRange: [2000, new Date().getFullYear()] as [number, number],
  contentRatings: ['G', 'PG', 'PG-13', 'R'],
  sortBy: 'popularity.desc' as const,
  firstMatchMode: false,
  timerSeconds: null as number | null,
};
