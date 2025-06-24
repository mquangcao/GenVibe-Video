import { authAction } from '../actions/authAction';
export const authInitState = {
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: true,
};

export const authReducer = (state, action) => {
  switch (action.type) {
    case authAction.LOGIN:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        error: null,
        isLoading: false,
      };
    case authAction.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      };
    default:
      return state;
  }
};
