'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface AvatarUploadProps {
  userId: string;
  avatarUrl: string | null;
  displayName: string | null;
}

export function AvatarUpload({ userId, avatarUrl, displayName }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB.');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Delete old avatar if it exists
      if (avatarUrl) {
        const oldFileName = avatarUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${oldFileName}`]);
        }
      }

      // 2. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 4. Update profiles table
      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      router.refresh();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      alert(`Error uploading avatar: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!avatarUrl) return;
    
    const confirmed = window.confirm('Are you sure you want to remove your profile photo?');
    if (!confirmed) return;

    try {
      setRemoving(true);

      // 1. Delete from storage
      const fileName = avatarUrl.split('/').pop();
      if (fileName) {
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([`avatars/${fileName}`]);

        if (deleteError) {
          console.warn('Failed to delete avatar from storage:', deleteError);
          // Continue with profile update even if storage deletion fails
        }
      }

      // 2. Update profiles table to remove avatar_url
      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) throw updateError;

      router.refresh();
    } catch (error: any) {
      console.error('Avatar removal error:', error);
      alert(`Error removing avatar: ${error.message}`);
    } finally {
      setRemoving(false);
    }
  }

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  const initials = displayName ? displayName[0].toUpperCase() : '?';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-24 h-24">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-4xl border-2 border-amber-200 dark:border-amber-800 shadow-sm">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-bold text-amber-600 dark:text-amber-400">{initials}</span>
          )}
        </div>
        
        {(uploading || removing) && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="text-white text-xs font-medium">
              {uploading ? 'Uploading...' : 'Removing...'}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap justify-center">
        {!avatarUrl ? (
          // Upload button for new users
          <button
            onClick={triggerFileInput}
            disabled={uploading}
            className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            📤 Upload Photo
          </button>
        ) : (
          // Edit and Remove buttons for users with existing avatar
          <>
            <button
              onClick={triggerFileInput}
              disabled={uploading}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ✏️ Edit Photo
            </button>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🗑️ Remove
            </button>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
      />

      {/* Status messages */}
      {uploading && (
        <p className="text-xs text-amber-600 animate-pulse">Uploading photo...</p>
      )}
      {removing && (
        <p className="text-xs text-red-600 animate-pulse">Removing photo...</p>
      )}
    </div>
  );
}
