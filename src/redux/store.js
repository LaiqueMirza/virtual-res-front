import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

// Import reducers
import resumeReducer from './reducers/resumeReducer';

// Configure persist options
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['resume'] // only resume will be persisted
};

// Combine reducers
const rootReducer = combineReducers({
  resume: resumeReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store

 /* eslint-disable no-underscore-dangle */
 export const store = createStore(
    persistedReducer, /* preloadedState, */
   window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );
 /* eslint-enable */
// export const store = createStore(persistedReducer);
export const persistor = persistStore(store);