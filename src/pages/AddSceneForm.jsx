// AddSceneForm.js
import React, { useState } from 'react';
import useFirestoreCRUD from '../ComposablesFirebase';
import firebase from 'firebase/compat/app';


function AddSceneForm({ playId, currentScenes }) {
  const { updateDocument } = useFirestoreCRUD('pieces');
  const [title, setTitle] = useState('');
  const [position, setPosition] = useState('');
  const [passId, setPassId] = useState('');
  const [error, setError] = useState(null);
  const isPositionTaken = (position) => {
    const scenes = Object.values(currentScenes);
    return scenes.some((scene) => scene.position === position);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPosition = parseInt(position, 10);

    if (isPositionTaken(newPosition)) {
      setError('La position choisie est déjà utilisée.');
      return;
    }

    const newScene = { title, position: newPosition, passId };

    try {
      await updateDocument(playId, {
        scenes: firebase.firestore.FieldValue.arrayUnion(newScene),
      });
      setTitle('');
      setPosition('');
      setPassId('');
      setError(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la scène:', error);
    }
  };

 


  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="title">Titre de la scène :</label>
      <input
        type="text"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label htmlFor="position">Position de la scène :</label>
      <input
        type="number"
        id="position"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
      />

      <label htmlFor="passId">Pass ID :</label>
      <input
        type="text"
        id="passId"
        value={passId}
        onChange={(e) => setPassId(e.target.value)}
      />

      <button type="submit">Ajouter une scène</button>
    </form>
  );
}

export default AddSceneForm;

