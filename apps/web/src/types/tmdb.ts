export interface TMDBDiscoverResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids: number[];
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
}

export interface TMDBDiscoverResponse {
  page: number;
  results: TMDBDiscoverResult[];
  total_pages: number;
  total_results: number;
}

export interface TMDBProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface TMDBProviderResponse {
  results: TMDBProvider[];
}

export interface TMDBCredits {
  cast: Array<{ name: string; order: number }>;
  crew: Array<{ name: string; job: string }>;
}

export interface TMDBVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBExternalIds {
  imdb_id: string | null;
}
