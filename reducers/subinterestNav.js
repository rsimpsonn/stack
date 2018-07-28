const initialState = {
  subInterestChosen: false,
  subInterestId: ""
};

export default function subInterestNavReducer(state = initialState, action) {
  switch (action.type) {
    case "SUBINTEREST_CHOSEN":
      return {
        ...state,
        subInterestChosen: true,
        childId: action.childId.childId
      };
    default:
      return state;
  }
}
