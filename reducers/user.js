const initialState = {
  loggedIn: false,
  token: false,
  name: "",
  id: "",
  email: "",
  profilePic: false
};

const endpoint = "https://stormy-lowlands-99865.herokuapp.com";

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loggedIn: true,
        token: action.data.token,
        name: action.data.name,
        id: action.data.id,
        email: action.data.email,
        profilePic: action.data.profilePic
          ? endpoint + action.data.profilePic
          : false
      };
    case "LOGGED_OUT":
      return {
        ...state,
        loggedIn: false,
        token: false,
        name: "",
        id: "",
        email: "",
        profilePic: false
      };
    case "PROFILE_PICTURE_ADDED":
      return {
        ...state,
        profilePic: endpoint + action.link
      };
    default:
      return state;
  }
}
