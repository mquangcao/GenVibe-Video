export const authAction = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
};

export const login = (user) => {
  return {
    type: authAction.LOGIN,
    payload: user,
  };
}

export const logout = () => {
  return {
    type: authAction.LOGOUT,
  };
};