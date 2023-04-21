import { Provider } from 'react-redux';
// import { useState } from 'react'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import store from './reducer';
import './App.css'
import React, { useState, useEffect } from 'react';

import Main from './pages/Main';
import AjoutPiece from './pages/AjoutPiece';
import PlayDetails from './pages/PlaysDetails';
import SceneDetails from './pages/ScenesDetails';
import ErrorBoundary from './ErrorBundaries';
import SceneVoirDetails from './pages/ScenesVoirDetails';
import WebFont from 'webfontloader';

WebFont.load({
  google: {
    families: ['Roboto:400,700', 'sans-serif']
  }
});



function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>

        <Router>

          <Routes>

            <Route path="*" element={<Main />} />
            <Route path="/piece/:id" element={<PlayDetails />} />
            <Route path="/piece/:playId/scene/:scenePosition" element={<SceneDetails />} />
            <Route path="/piece/:playId/sceneTheatre/:scenePosition" element={<SceneVoirDetails />} />
            <Route path="/ajoutpiece" element={<AjoutPiece />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </Provider>
  )
}


export default App
