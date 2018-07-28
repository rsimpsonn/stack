import {
  FETCHING_INTERESTS,
  FETCHING_INTERESTS_FAILURE,
  FETCHING_INTERESTS_SUCCESS
} from "../constants";

const initialState = {
  interests: [],
  isFetching: false,
  error: false
};

export default function interestsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCHING_INTERESTS:
      return {
        ...state,
        isFetching: true,
        interests: []
      };
    case FETCHING_INTERESTS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        interests: action.data
      };
    case FETCHING_INTERESTS_FAILURE:
      return {
        ...state,
        isFetching: false,
        err: true
      };
    default:
      return state;
  }
}
