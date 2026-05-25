import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';

interface ProfilePictureProps {
  currentPicture?: string;
  onPictureChange: (file: File) => void;
  size?: 'small' | 'medium' | 'large';
  editable?: boolean;
}

// Resolve a potentially relative storage path to a full URL pointing at the backend
function resolveUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('data:') || url.startsWith('http')) return url;
  const base = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '';
  return `${base}/${url.replace(/^\//, '')}`;
}

export default function ProfilePicture({ 
  currentPicture, 
  onPictureChange, 
  size = 'medium',
  editable = false 
}: ProfilePictureProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-14 h-14',
    large: 'w-24 h-24'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onPictureChange(file);
    }
  };

  const resolvedPicture = resolveUrl(currentPicture);

  return (
    <div 
      className={`${sizeClasses[size]} relative ${editable ? 'cursor-pointer' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => editable && fileInputRef.current?.click()}
    >
      <div className={`${sizeClasses[size]} bg-white border-2 border-[#9DA4A6] rounded-full flex items-center justify-center overflow-hidden`}>
        {resolvedPicture ? (
          <img 
            src={resolvedPicture} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="white"/>
            <circle cx="20" cy="15" r="7" fill="#4B4C58"/>
            <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="#4B4C58"/>
          </svg>
        )}
      </div>
      
      {editable && isHovered && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
          <Camera className="w-4 h-4 text-white" />
        </div>
      )}
      
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}
    </div>
  );
}
