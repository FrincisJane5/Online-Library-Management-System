import api from './axios';

export const profileService = {
  uploadProfilePicture: async (file: File): Promise<{ profile_picture: string }> => {
    const formData = new FormData();
    formData.append('profile_picture', file);

    // Do NOT set Content-Type manually — axios must set it automatically
    // so it includes the correct multipart boundary (e.g. multipart/form-data; boundary=----xyz)
    const response = await api.post('/profile/picture', formData);

    return response.data;
  },
};
