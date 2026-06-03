import Image from 'next/image';
import { JoinButton } from './JoinButton';
import { ProgressTracker } from './ProgressTracker';
import { CommentList } from './CommentList';
import { BackButton } from './BackButton';
import { UserProgressBar } from './UserProgressBar';

interface SessionDetailProps {
  session: {
    id: string;
    title: string;
    author: string;
    chapters: number;
    book_cover_url: string | null;
    description: string | null;
  };
  progress: any[];
  comments: any[];
  participants: any[];
  isParticipant: boolean;
  currentUserId: string | null;
}

export function SessionDetail({ session, progress, comments, participants, isParticipant, currentUserId }: SessionDetailProps) {
  const myProgress = progress.find((p) => p.user_id === currentUserId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton />
      </div>
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-48 h-72 flex-shrink-0 mx-auto md:mx-0 bg-stone-200 dark:bg-stone-800 rounded-2xl overflow-hidden shadow-xl shadow-stone-200 dark:shadow-black/50">
          {session.book_cover_url ? (
            <Image
              src={session.book_cover_url}
              alt=""
              width={192}
              height={288}
              priority
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400 text-6xl">
              📖
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-2">
            {session.title}
          </h1>
          <p className="text-xl text-stone-600 dark:text-stone-400 mb-6">{session.author}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
            <div className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium">
              {session.chapters} chapters
            </div>
            <div className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
              {progress.length} participants
            </div>
          </div>

          {!isParticipant ? (
            <JoinButton sessionId={session.id} userId={currentUserId} />
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
              Joined ✓
            </div>
          )}
        </div>
      </div>

      {session.description && (
        <section className="mb-12">
          <h2 className="font-serif text-xl font-bold mb-4">About this book</h2>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
            {session.description}
          </p>
        </section>
      )}

      {isParticipant && (
        <ProgressTracker 
          sessionId={session.id} 
          userId={currentUserId} 
          totalChapters={session.chapters} 
          myProgress={myProgress} 
          allProgress={progress} 
        />
      )}

      {/* Participants Progress Section */}
      {participants && participants.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-xl font-bold mb-6 text-stone-900 dark:text-white">Participants Progress</h2>
          <div className="space-y-3">
            {participants.map((participant) => {
              const userName = participant.profiles.display_name || 'Anonymous';
              const currentChapter = participant.progress?.chapter || 0;
              const avatarUrl = participant.profiles.avatar_url;
              
              return (
                <UserProgressBar
                  key={participant.id}
                  userName={userName}
                  currentChapter={currentChapter}
                  totalChapters={session.chapters}
                  avatarUrl={avatarUrl}
                />
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-serif text-lg font-semibold mb-3">Discussion</h2>
        <CommentList
          sessionId={session.id}
          comments={comments}
          currentUserId={currentUserId}
        />
      </section>
    </div>
  );
}
