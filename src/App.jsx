import React from 'react';
import './App.css';
import Auth from './components/Auth';
import FileStorage from './components/FileStorage';

function App() {
  return (
    <div className="app">
      <Auth>
        <FileStorage />
      </Auth>
    </div>
  );
}

export default App;