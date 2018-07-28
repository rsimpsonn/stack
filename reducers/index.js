import { combineReducers } from "redux";
import interestsReducer from "./interests";
import userReducer from "./user";
import interestNavReducer from "./interestNav";
import subInterestNavReducer from "./subinterestNav";
import groupNavReducer from "./groupNav";
import groupsReducer from "./groups";
import todoReducer from "./todo";
import eventReducer from "./event";

const rootReducer = combineReducers({
  interests: interestsReducer,
  interestNav: interestNavReducer,
  user: userReducer,
  subInterestNav: subInterestNavReducer,
  groupNav: groupNavReducer,
  groups: groupsReducer,
  todos: todoReducer,
  events: eventReducer
});

export default rootReducer;
