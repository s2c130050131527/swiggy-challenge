/* eslint-disable comma-dangle */
import { createStore, compose, applyMiddleware } from "redux";
import reduxImmutableStateInvariant from "redux-immutable-state-invariant";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import thunk from "redux-thunk";
import createRootReducer from "./Reducers";

const persistConfig = {
  key: "root",
  storage,
  stateReconciler: hardSet
};
function configureStoreProd(initialState) {
  const middlewares = [thunk];

  const persistedReducer = persistReducer(persistConfig, createRootReducer);
  return createStore(
    persistedReducer,
    initialState,
    compose(applyMiddleware(...middlewares))
  );
}

function configureStoreDev(initialState) {
  const middlewares = [reduxImmutableStateInvariant(), thunk];

  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // add support for Redux dev tools
  const persistedReducer = persistReducer(persistConfig, createRootReducer);
  const store = createStore(
    persistedReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  );

  if (module.hot) {
    module.hot.accept("./Reducers", () => {
      const nextRootReducer = require("./Reducers").default; // eslint-disable-line global-require
      store.replaceReducer(persistReducer(nextRootReducer()));
    });
  }

  return store;
}

const configureStore =
  process.env.NODE_ENV === "production"
    ? configureStoreProd
    : configureStoreDev;

export default configureStore;
