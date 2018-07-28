const initialState = {
  loggedIn: false,
  token: false,
  name: "",
  id: "",
  email: "",
  profilePic: false
};

const ngrokRoute = "https://1baef6f5.ngrok.io";

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
          ? ngrokRoute + action.data.profilePic
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
        profilePic: ngrokRoute + action.link
      };
    default:
      return state;
  }
}
