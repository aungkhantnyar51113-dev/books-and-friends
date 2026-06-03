export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReadingSession {
  id: string;
  title: string;
  author: string;
  chapters: number;
  created_by: string;
  created_at: string;
  book_cover_url: string | null;
  google_books_id: string | null;
  description: string | null;
  participants?: Participant[];
  progress?: Progress[];
  participant_count?: number;
}

export interface Participant {
  id: string;
  user_id: string;
  session_id: string;
  joined_at: string;
  profiles?: Profile;
}

export interface Progress {
  id: string;
  user_id: string;
  session_id: string;
  chapter: number;
  updated_at: string;
  profiles?: Profile;
}

export interface Comment {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  reactions?: Reaction[];
}

export interface Reaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  comment_id: string;
  session_id: string;
  read_at: string | null;
  created_at: string;
  comments?: Comment;
  reading_sessions?: ReadingSession;
}

export const REACTION_TYPES = ['👍', '❤️', '😂', '😮', '💡'] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];
