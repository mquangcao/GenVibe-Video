import { authAction } from "../actions/authAction";
export const authInitState = {
  user: null,
  isAuthenticated: false,
  error : null,
};

export const authReducer = (state , action) => {
    switch (action.type) {
        case authAction.LOGIN:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                error: null
            };
        case authAction.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                error: null
            };
        default:
            return state;
    }


}