import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Assuming you create this or Tailwind injects it, but standard Vite needs an import. Wait, usually we import a CSS file with @tailwind directives.

// Since I didn't create a style.css, let's just use the App directly. 
// Ideally, create an index.css with @tailwind directives.
// I'll add the index.css content below in a separate change.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);