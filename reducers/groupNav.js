const initialState = {
  groupChosen: false,
  groupId: ""
};

export default function groupNavReducer(state = initialState, action) {
  switch (action.type) {
    case "GROUP_CHOSEN":
      return {
        ...state,
        groupChosen: true,
        groupId: action.groupId.groupId
      };
    default:
      return state;
  }
}
