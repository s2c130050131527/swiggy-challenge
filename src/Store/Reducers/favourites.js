import { ADD_FAVOURITE, REMOVE_FAVORITE } from "../Constants";

export const addFavourite = id => ({
  type: ADD_FAVOURITE,
  payload: id
});

export const deleteFavourite = id => ({
  type: REMOVE_FAVORITE,
  payload: id
});

const favourites = (state = [], action) => {
  switch (action.type) {
    case ADD_FAVOURITE: {
      const newState = state.concat(action.payload);
      return newState;
    }
    case REMOVE_FAVORITE: {
      const newState = [...state];
      const index = newState.findIndex(el => el === action.payload);
      if (index > -1) {
        newState.splice(index, 1);
      }
      return newState;
    }
    default:
      return state;
  }
};

export default favourites;
