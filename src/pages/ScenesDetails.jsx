// src/components/SceneDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFirestoreCRUD from '../ComposablesFirebase';
import SceneContent from './SceneContent';

function SceneDetails() {
  const { playId, scenePosition } = useParams();
  const { getDocument } = useFirestoreCRUD('pieces');
  const [scene, setScene] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScene() {
      try {
        const playData = await getDocument(playId);
        const foundScene = playData.scenes.find(
          (scene) => scene.position == scenePosition
        );

        if (foundScene) {
          foundScene.content = foundScene.content || [];
          setScene(foundScene);
          setCharacters(playData.characters || []);
        } else {
          setScene(null);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la scène:", error);
      }
      setLoading(false);
    }

    fetchScene();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!scene) {
    return <div>Scène non trouvée {scenePosition}</div>;
  }

  return (
    <div>
      <h1 className='text-[28px] lg:text-[45px]'>Scène {scene.position} : {scene.title}</h1>
    
      {/* Vous pouvez ajouter un composant pour créer le contenu ici */}
      <SceneContent playId={playId} scene={scene} characters={characters} />
    </div>
  );
}

export default SceneDetails;
