// src/App.js

import React from "react";
import PhotoSelector from "./components/PhotoSelector";
import 'semantic-ui-css/semantic.min.css'
import "./App.css"

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Longmon Foto</h1>
      </header>
      <PhotoSelector />
    </div>
  );
}

export default App;
