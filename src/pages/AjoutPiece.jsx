// AddPlayForm.js
import React, { useState } from 'react';
import useFirestoreCRUD from '../ComposablesFirebase';
import { useNavigate } from 'react-router-dom';

function AjoutPiece() {
  const navigate = useNavigate()
  
  const { addDocument } = useFirestoreCRUD('pieces');
  const [playName, setPlayName] = useState('');
  const [playId, setPlayId] = useState('');
  const [characters, setCharacters] = useState('');


  const handleSubmit = (e) => {
    e.preventDefault();
    const characterList = characters.split(',').map((character) => character.trim());
    addDocument({ name: playName, passId: Date.now(), characters: characterList });
    setPlayName('');
    setPlayId('');
    setCharacters('');
    navigate('/')
    
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="playName">Nom de la pièce :</label>
      <input
        type="text"
        id="playName"
        value={playName}
        onChange={(e) => setPlayName(e.target.value)}
      />

      <label htmlFor="characters">Personnages :</label>
      <input
        type="text"
        id="characters"
        value={characters}
        onChange={(e) => setCharacters(e.target.value)}
        placeholder="Séparez les noms par des virgules"
      />

      <button type="submit">Ajouter la pièce</button>
    </form>
  );
}

export default AjoutPiece;
