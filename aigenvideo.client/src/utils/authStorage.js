export const saveAuthTokens = ({ token, refreshToken }) => {
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
};

export const clearAuthTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

export const getAccessToken = () => localStorage.getItem("token");
export const getRefreshToken = () => localStorage.getItem("refreshToken");
