export interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
    };
    pageCount?: number;
    publishedDate?: string;
  };
}

export interface GoogleBooksSearchResult {
  items?: GoogleBookVolume[];
  totalItems: number;
}

const API_BASE = 'https://www.googleapis.com/books/v1/volumes';

export async function searchBooks(
  query: string,
  apiKey?: string
): Promise<GoogleBookVolume[]> {
  if (!query.trim()) return [];
  const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
  const params = new URLSearchParams({
    q: `intitle:${encodeURIComponent(query.trim())}`,
    maxResults: '10',
    printType: 'books',
  });
  if (key) params.set('key', key);
  const res = await fetch(`${API_BASE}?${params}`);
  if (!res.ok) throw new Error('Failed to search books');
  const data: GoogleBooksSearchResult = await res.json();
  return data.items || [];
}

export async function getBookById(
  volumeId: string,
  apiKey?: string
): Promise<GoogleBookVolume | null> {
  const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
  const params = key ? `?key=${key}` : '';
  const res = await fetch(`${API_BASE}/${volumeId}${params}`);
  if (!res.ok) return null;
  return res.json();
}

export function getBookCoverUrl(volume: GoogleBookVolume, size: 'small' | 'medium' | 'large' = 'medium'): string | null {
  const links = volume.volumeInfo?.imageLinks;
  if (!links) return null;
  const url = size === 'large' ? (links.large || links.medium || links.small || links.thumbnail) :
              size === 'medium' ? (links.medium || links.small || links.thumbnail) :
              (links.small || links.thumbnail);
  if (!url) return null;
  // Replace http with https and optionally resize
  return url.replace('http://', 'https://');
}

export function getAuthors(volume: GoogleBookVolume): string {
  const authors = volume.volumeInfo?.authors;
  return authors?.join(', ') || 'Unknown Author';
}
