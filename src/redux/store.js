import { createStore, combineReducers, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import hardSet from "redux-persist/es/stateReconciler/hardSet";
import storage from 'redux-persist/lib/storage';
// import thunk from 'redux-thunk';
import logger from "redux-logger";

import { userAuthTokenReducer } from './reducers';

const rootReducers = combineReducers({
    socialAffilAdmin: userAuthTokenReducer
});

const persistConfig = {
    key: 'root',
    storage,
    keyPrefix: '',
    blacklist: [],
    stateReconciler: hardSet
}

const pReducer = persistReducer(persistConfig, rootReducers);

const middleware = applyMiddleware(logger);

export const store = createStore(
    pReducer,
    undefined,
    middleware
);

export const persistor = persistStore(store);