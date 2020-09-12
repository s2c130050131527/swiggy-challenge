import { combineReducers } from "redux";
import favourites from "./favourites";

const appReducer = combineReducers({
  favourites
});

export default appReducer;
