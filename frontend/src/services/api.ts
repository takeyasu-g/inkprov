const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const getProfile = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/profile/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch profile data");
  }

  return response.json();
};
