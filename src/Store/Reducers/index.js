import { combineReducers } from "redux";
import tokenReducer from "./token";

const appReducer = combineReducers({
  token: tokenReducer
});

export default appReducer;
