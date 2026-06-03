import Image from 'next/image';

interface UserProgressBarProps {
  userName: string;
  currentChapter: number;
  totalChapters: number;
  avatarUrl?: string | null;
  status?: string;
}

export function UserProgressBar({ 
  userName, 
  currentChapter, 
  totalChapters, 
  avatarUrl,
  status = "Reading" 
}: UserProgressBarProps) {
  const progressPercentage = Math.min((currentChapter / totalChapters) * 100, 100);

  // Determine status based on progress
  const getStatusColor = () => {
    if (currentChapter === 0) return "text-stone-500";
    if (currentChapter >= totalChapters) return "text-emerald-600";
    if (progressPercentage >= 75) return "text-blue-600";
    if (progressPercentage >= 50) return "text-amber-600";
    return "text-stone-600";
  };

  const getStatusText = () => {
    if (currentChapter === 0) return "Just Started";
    if (currentChapter >= totalChapters) return "Completed";
    if (progressPercentage >= 75) return "Almost Done";
    if (progressPercentage >= 50) return "Halfway";
    return "Focused";
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
      {/* User Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={avatarUrl}
                alt={`${userName}'s avatar`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-sm font-medium text-stone-600 flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[#1A1A1A] text-sm truncate">{userName}</p>
            <p className={`text-xs font-medium ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
        </div>
        <div className="text-sm text-stone-600 font-medium">
          Ch {currentChapter}/{totalChapters}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#1A1A1A] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="mt-2 text-xs text-stone-500 text-right">
        {Math.round(progressPercentage)}%
      </div>
    </div>
  );
}
