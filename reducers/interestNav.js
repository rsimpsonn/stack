const initialState = {
  interestChosen: false,
  interestId: ""
};

export default function interestNavReducer(state = initialState, action) {
  switch (action.type) {
    case "INTEREST_CHOSEN":
      return {
        ...state,
        interestChosen: true,
        interestId: action.interestId.interestId
      };
    default:
      return state;
  }
}
