import { createStore, applyMiddleware } from "redux";
import app from "./reducers";
import thunk from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage: storage,
  whitelist: ["user"]
};

const persistedReducer = persistReducer(persistConfig, app);

export default function configureStore() {
  let store = createStore(persistedReducer, applyMiddleware(thunk));
  let persistor = persistStore(store);
  return { store, persistor };
}
