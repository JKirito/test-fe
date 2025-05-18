// Common types for search functionality
export interface SearchResult {
  id: string;
  path: string;
  title?: string;
  url?: string;
  description?: string;
  score?: number;
  file_name?: string;
  type?: string;
  size?: number;
  accessible?: boolean;
  scan_date?: string;
  highlights?: string[];
  index?: string;
}

export interface SearchBarProps {
  searchQuery: string;
  onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}

export interface NavbarSearchProps extends SearchBarProps {
  results: SearchResult[];
  isSearching: boolean;
  isVisible: boolean;
}

export interface SearchResultItemProps {
  result: SearchResult;
}

export interface SearchResultsProps {
  results: SearchResult[];
}
