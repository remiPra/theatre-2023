// useFirestoreCRUD.js
import { useState, useEffect } from 'react';
import { db } from './firebase';

const useFirestoreCRUD = (collection) => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  // Récupérer les documents
  useEffect(() => {
    const unsubscribe = db
      .collection(collection)
      .onSnapshot(
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDocuments(docs);
        },
        (error) => setError(error)
      );

    return () => unsubscribe(); // Nettoyage lors du démontage du composant
  }, []);

  // Ajouter un document
  const addDocument = async (data) => {
    try {
      await db.collection(collection).add(data);
    } catch (error) {
      setError(error);
    }
  };

  // Mettre à jour un document
  const updateDocument = async (id, data) => {
    try {
      await db.collection(collection).doc(id).update(data);
    } catch (error) {
      setError(error);
    }
  };

  const updateDocumentOfScene = async (playId, sceneId, data) => {
    try {
      await db
        .collection('pieces')
        .doc(playId)
        .collection('scenes')
        .doc(sceneId)
        .update(data);
    } catch (error) {
      setError(error);
    }
  };
  const updateSceneContentDelete = async (playId, scenePosition, newEntry, action) => {
    try {
        const playDoc = await getDocument(playId);
        const scenes = playDoc.scenes;

        // Trouver la scène avec la position donnée
        const scene = scenes.find(scene => scene.position === scenePosition);

        if (scene) {
            // Mettre à jour le contenu de la scène en fonction de l'action
            const updatedContent =
                action === 'delete'
                    ? newEntry
                    : firebase.firestore.FieldValue.arrayUnion(newEntry);

            // Mettre à jour la scène
            scene.content = updatedContent;

            // Mettre à jour les scènes dans le document de la pièce
            await updateDocument(playId, { scenes });
        } else {
            throw new Error('La scène spécifiée est introuvable.');
        }
    } catch (error) {
        setError(error);
    }
};

const updateSceneContentUpdate = async (playId, scenePosition, newEntry, action) => {
  try {
      const playDoc = await getDocument(playId);
      const scenes = playDoc.scenes;

      // Trouver la scène avec la position donnée
      const scene = scenes.find(scene => scene.position === scenePosition);

      if (scene) {
          let updatedContent;

          if (action === 'add') {
              updatedContent = firebase.firestore.FieldValue.arrayUnion(newEntry);
          } else if (action === 'update') {
              updatedContent = newEntry;
          } else if (action === 'delete') {
              updatedContent = newEntry;
          }

          // Mettre à jour la scène
          scene.content = updatedContent;

          // Mettre à jour les scènes dans le document de la pièce
          await updateDocument(playId, { scenes });
      } else {
          throw new Error('La scène spécifiée est introuvable.');
      }
  } catch (error) {
      setError(error);
  }
};

  
  



  const updateSceneContent = async (playId, scenePosition, newEntry) => {
    try {
        // Récupérer le document de la pièce
        const playRef = await db.collection('pieces').doc(playId).get();
        console.log(playId, scenePosition, newEntry);
        if (playRef.exists) {
            // Obtenir les données de la pièce et les scènes
            const playData = playRef.data();
            const scenes = playData.scenes;

            // Trouver la scène avec la position donnée
            const scene = scenes.find(scene => scene.position === scenePosition);

            if (scene) {
                // Vérifier si le champ "content" existe et initialiser s'il n'existe pas
                if (!scene.content) {
                    scene.content = [];
                }

                // Mettre à jour le tableau "content" de la scène spécifique
                scene.content = [
                    ...scene.content,
                    newEntry,
                ];

                // Enregistrer les modifications dans Firestore
                await db.collection('pieces').doc(playId).update({ scenes });
            } else {
                throw new Error('La scène spécifiée est introuvable.');
            }
        } else {
            throw new Error('La pièce demandée est introuvable.');
        }
    } catch (error) {
        setError(error);
    }
};


  




  

  // Supprimer un document
  const deleteDocument = async (id) => {
    try {
      await db.collection(collection).doc(id).delete();
    } catch (error) {
      setError(error);
    }
  };


  const getDocument = async (id) => {
    try {
      const docRef = await db.collection(collection).doc(id).get();
      if (docRef.exists) {
        return { ...docRef.data(), id: docRef.id };
      } else {
        throw new Error('Le document demandé est introuvable.');
      }
    } catch (error) {
      setError(error);
      throw error;
    }
  };

  return {
    documents,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    updateSceneContent,
    updateSceneContentDelete,
    updateSceneContentUpdate,
  };
};

export default useFirestoreCRUD;
