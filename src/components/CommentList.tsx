'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { REACTION_TYPES } from '@/lib/types';
import Image from 'next/image';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: { display_name: string | null; avatar_url?: string | null } | null;
  reactions: Array<{ id: string; user_id: string; reaction_type: string }>;
}

interface CommentListProps {
  sessionId: string;
  comments: Comment[];
  currentUserId: string | null;
}

export function CommentList({ sessionId, comments: initialComments, currentUserId }: CommentListProps) {
  const [comments, setComments] = useState(initialComments);
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    if (!sessionId) return;
    
    const channel = supabase
      .channel(`comments:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `session_id=eq.${sessionId}`,
        },
        async (payload) => {
          // Avoid duplicates (e.g. if router.refresh() also updated the list)
          setComments((prev) => {
            if (prev.some(c => c.id === payload.new.id)) return prev;

            // Immediately add the comment with a loading state for the name
            const newComment = {
              ...payload.new,
              profiles: { display_name: '...' }, // Temporary loading state
              reactions: [],
            } as unknown as Comment;
            
            // Fetch the actual profile in the background
            supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('id', payload.new.user_id)
              .single()
              .then(({ data: profile, error }) => {
                if (error) {
                  // Update name to Anonymous if fetch fails
                  setComments(current => 
                    current.map(c => c.id === payload.new.id ? { ...c, profiles: { display_name: 'Anonymous', avatar_url: null } } : c)
                  );
                } else if (profile) {
                  // Update name to the actual sender's name
                  setComments(current => 
                    current.map(c => c.id === payload.new.id ? { ...c, profiles: profile } : c)
                  );
                }
              });

            return [...prev, newComment];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setComments((prev) =>
            prev.map((c) => (c.id === payload.new.id ? { ...c, ...payload.new } : c))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          // Note: session_id filter removed for DELETE because payload.old usually only contains the ID
        },
        (payload) => {
          setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId || !newContent.trim()) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('comments').insert({
        session_id: sessionId,
        user_id: currentUserId,
        content: newContent.trim(),
      }).select();
      
      if (error) {
        console.error('Supabase error posting comment:', error);
        alert(`Failed to add comment: ${error.message} (Code: ${error.code})`);
      } else if (data && data[0]) {
        // Trigger notifications for other participants
        try {
          await fetch('/api/notifications/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              commentId: data[0].id,
              sessionId: sessionId,
            }),
          });
        } catch (notificationError) {
          console.error('Failed to trigger notifications:', notificationError);
        }
        
        setNewContent('');
        router.refresh();
      }
    } catch (err) {
      console.error('Unexpected catch error posting comment:', err);
      alert('An unexpected error occurred while adding the comment.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(id: string) {
    if (!editContent.trim()) return;
    await supabase
      .from('comments')
      .update({ content: editContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', id);
    setEditingId(null);
    setEditContent('');
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this comment?')) return;
    await supabase.from('comments').delete().eq('id', id);
    router.refresh();
  }

  async function toggleReaction(commentId: string, type: string) {
    if (!currentUserId) return;
    const existing = comments
      .find((c) => c.id === commentId)
      ?.reactions?.find((r) => r.user_id === currentUserId && r.reaction_type === type);
    if (existing) {
      await supabase.from('reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('reactions').insert({ comment_id: commentId, user_id: currentUserId, reaction_type: type });
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="flex-1 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-amber-500 resize-none"
        />
        <button
          type="submit"
          disabled={submitting || !newContent.trim()}
          className="self-end px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
        >
          Post
        </button>
      </form>

      {comments.length === 0 && (
        <p className="text-center py-8 text-stone-500 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
          No comments yet. Be the first to start the discussion!
        </p>
      )}
      <div className="space-y-4">
        {comments.map((comment) => {
          const initials = comment.profiles?.display_name ? comment.profiles.display_name[0].toUpperCase() : '?';
          return (
            <div key={comment.id} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center border border-amber-200 dark:border-amber-800 shrink-0 shadow-sm">
                {comment.profiles?.avatar_url ? (
                  <Image
                    src={comment.profiles.avatar_url}
                    alt=""
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{initials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-stone-700 dark:text-stone-300">
                      {comment.profiles?.display_name || 'Anonymous'}
                      {currentUserId === comment.user_id && (
                        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400 font-normal">(You)</span>
                      )}
                    </p>
                    <span className="text-xs text-stone-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-stone-800 dark:text-stone-200 text-sm leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
