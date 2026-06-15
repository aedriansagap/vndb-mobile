const API_BASE_URL = 'https://api.vndb.org/kana';

interface FetchOptions {
  endpoint: 'vn' | 'release' | 'producer' | 'character' | 'staff' | 'tag' | 'trait';
  filters?: any[];
  fields?: string;
  sort?: string;
  reverse?: boolean;
  results?: number;
  page?: number;
  user?: string;
  count?: boolean;
  compact_filters?: boolean;
  normalized_filters?: boolean;
}

export const fetchVndb = async <T>({
  endpoint,
  ...body
}: FetchOptions): Promise<{ results: T[]; count?: number; more?: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`VNDB API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from VNDB:', error);
    throw error;
  }
};

// --- Specific API Calls ---

export interface VN {
  id: string;
  title: string;
  alttitle: string | null;
  image: {
    id: string;
    url: string;
    dims: number[];
    sexual: number;
    violence: number;
  } | null;
  description: string | null;
  rating: number | null;
  tags?: { id: string; rating: number; spoiler: number }[];
}

export const fetchPopularVNs = async (page: number = 1) => {
  return fetchVndb<VN>({
    endpoint: 'vn',
    filters: ['id', '>=', 'v1'],
    sort: 'rating',
    reverse: true,
    results: 20,
    page,
    fields: 'id, title, alttitle, image.url, image.sexual, image.violence, description, rating, tags.id, tags.rating, tags.spoiler',
  });
};

export const searchVNs = async (query: string) => {
  return fetchVndb<VN>({
    endpoint: 'vn',
    filters: ['search', '=', query],
    results: 20,
    fields: 'id, title, alttitle, image.url, image.sexual, image.violence, description, rating, tags.id, tags.rating, tags.spoiler',
  });
};

export interface Character {
  id: string;
  name: string;
  original: string | null;
  image: {
    id: string;
    url: string;
    dims: number[];
  } | null;
  description: string | null;
}

export const fetchVNCharacters = async (vnId: string) => {
  return fetchVndb<Character>({
    endpoint: 'character',
    filters: ['vn', '=', ['id', '=', vnId]],
    results: 20,
    fields: 'id, name, original, image.url, description',
  });
};

export const fetchAuthInfo = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/authinfo`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    if (!response.ok) throw new Error('Invalid token');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchUserList = async (token: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ulist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({
        user: userId,
        results: 20,
        fields: "id, vn.id, vn.title, vn.alttitle, vn.image.url, vn.image.sexual, vn.image.violence, vn.description, vn.rating, vn.tags.id, vn.tags.rating, vn.tags.spoiler, vote",
      }),
    });
    if (!response.ok) throw new Error('Failed to fetch list');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export interface Release {
  id: string;
  title: string;
  released: string | null;
  languages: string[];
  platforms: string[];
}

export const fetchVNReleases = async (vnId: string) => {
  return fetchVndb<Release>({
    endpoint: 'release',
    filters: ['vn', '=', ['id', '=', vnId]],
    results: 20,
    sort: 'released',
    reverse: true,
    fields: 'id, title, released, languages.lang, platforms.platform',
  });
};

export interface Tag {
  id: string;
  name: string;
  category: string;
}

export const fetchTags = async (tagIds: string[]) => {
  if (tagIds.length === 0) return { results: [] };
  
  // Create an "or" filter for all the requested tag IDs
  const idFilters = tagIds.map(id => ['id', '=', id]);
  const filters: any[] = ['or', ...idFilters];

  return fetchVndb<Tag>({
    endpoint: 'tag',
    filters,
    results: 100,
    fields: 'id, name, category',
  });
};
