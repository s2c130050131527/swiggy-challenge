const { SET_TOKEN } = require("../Constants");

export const setTokenAction = payload => ({
  type: SET_TOKEN,
  payload
});

const tokenReducer = (state = "", action) => {
  if (action.type === SET_TOKEN) {
    return action.payload;
  }
  return state;
};

export default tokenReducer;
