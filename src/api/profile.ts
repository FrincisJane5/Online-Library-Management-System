import api from './axios';

// Compress and resize image to max 200x200 JPEG before uploading
function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 200;
      const scale = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        resolve(new File([blob!], 'profile.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.85);
    };
    img.src = url;
  });
}

export const profileService = {
  uploadProfilePicture: async (file: File): Promise<{ profile_picture: string }> => {
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append('profile_picture', compressed);
    const response = await api.post('/profile/picture', formData);
    return response.data;
  },
};
