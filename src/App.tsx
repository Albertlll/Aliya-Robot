import React, { useState } from 'react';
import Face from './components/Face';
import ChatDemo from './components/ChatDemo';
import './App.css';

const App: React.FC = () => {
  const [showDemo, setShowDemo] = useState<boolean>(false);

  const handleToggleDemo = () => {
    setShowDemo(!showDemo);
  };

  return (
    <div className="App">
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleToggleDemo}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
          aria-label="Переключить демо API"
        >
          {showDemo ? 'Скрыть API Demo' : 'Показать API Demo'}
        </button>
      </div>
      
      {showDemo ? <ChatDemo /> : <Face />}
    </div>
  );
};

export default App;
