import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';

interface ProfilePictureProps {
  currentPicture?: string;
  onPictureChange: (file: File) => void;
  size?: 'small' | 'medium' | 'large';
  editable?: boolean;
}

// Resolve a profile picture path to a full URL.
// Backend stores paths like '/storage/profile-pictures/filename.jpg' — prepend the backend origin.
function resolveImageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) return path;
  const backendBase = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://127.0.0.1:8000';
  return `${backendBase}${path}`;
}

export default function ProfilePicture({ 
  currentPicture, 
  onPictureChange, 
  size = 'medium',
  editable = false 
}: ProfilePictureProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-14 h-14',
    large: 'w-24 h-24'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Show a local preview immediately while the upload happens
      setPreviewUrl(URL.createObjectURL(file));
      onPictureChange(file);
    }
  };

  const handleClick = () => {
    if (editable) fileInputRef.current?.click();
  };

  // Use local preview first (just selected), then resolved backend URL
  const displaySrc = previewUrl ?? resolveImageUrl(currentPicture);

  return (
    <div 
      className={`${sizeClasses[size]} relative ${editable ? 'cursor-pointer' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className={`${sizeClasses[size]} bg-white border-2 border-[#9DA4A6] rounded-full flex items-center justify-center overflow-hidden`}>
        {displaySrc ? (
          <img 
            src={displaySrc}
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={() => setPreviewUrl(undefined)} // fallback to default avatar on broken URL
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
