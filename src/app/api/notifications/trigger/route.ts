import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId, sessionId } = await request.json();

    if (!commentId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the comment details
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select(`
        user_id,
        content,
        reading_sessions (
          title,
          participants (user_id)
        )
      `)
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Get all participants except the comment author
    const participants = (comment.reading_sessions as any)?.participants || [];
    const participantIds = participants
      .filter((p: any) => p.user_id !== comment.user_id)
      .map((p: any) => p.user_id);

    // Create notifications for all other participants
    if (participantIds.length > 0) {
      const notifications = participantIds.map((userId: string) => ({
        user_id: userId,
        comment_id: commentId,
        session_id: sessionId,
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating notifications:', notificationError);
        return NextResponse.json({ error: 'Failed to create notifications' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, notificationsCreated: participantIds.length });
  } catch (error) {
    console.error('Error in notification trigger:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
