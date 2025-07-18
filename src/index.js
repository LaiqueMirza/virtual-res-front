import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';

// Import axios configuration
import './utils/axiosConfig';

const root = ReactDOM.createRoot(document.getElementById('root'));
// React.StrictMode intentionally renders components twice in development mode to help
// find bugs like impure rendering, side effects in render, and so on.
// This double-rendering behavior only happens in development mode, not in production.
// If you want to prevent double API calls during development, you can temporarily remove StrictMode.
root.render(
  // <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
