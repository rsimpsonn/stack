const initialState = {
  userGroups: [],
  isFetching: false,
  error: false
};

export default function groupsReducer(state = initialState, action) {
  switch (action.type) {
    case "FETCHING_GROUPS":
      return {
        ...state,
        isFetching: true,
        userGroups: []
      };
    case "FETCHING_GROUPS_SUCCESS":
      return {
        ...state,
        isFetching: false,
        userGroups: action.data
      };
    default:
      return state;
  }
}
