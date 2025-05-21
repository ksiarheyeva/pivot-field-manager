import './index.css';
import './utils/i18n/index.ts';

import { createRoot } from 'react-dom/client';

import App from './App.tsx';

// import { StrictMode } from 'react';
createRoot(document.getElementById('root')!).render(<App />);
