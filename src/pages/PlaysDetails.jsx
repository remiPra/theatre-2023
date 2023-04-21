// PlayDetails.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useFirestoreCRUD from '../ComposablesFirebase';
import AddSceneForm from './AddSceneForm';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableScene from "../components/DraggableScene";
import { Link } from 'react-router-dom';



function PlayDetails() {
    const navigate = useNavigate()
    const { id } = useParams();
    const { getDocument } = useFirestoreCRUD('pieces');
    const [play, setPlay] = useState(null);
    const [loading, setLoading] = useState(true);

    // Les personnages 
    const [editingCharacters, setEditingCharacters] = useState(false);
    const [charactersString, setCharactersString] = useState("");

    //changement ouvert
    const handleCharacterChange = (e, index) => {
        const newCharacters = [...play.characters];
        newCharacters[index] = e.target.value;
        setPlay({ ...play, characters: newCharacters });
    };


    //modal pour creer une nouvelle scene
    const [showAddSceneModal, setShowAddSceneModal] = useState(false);
    const toggleAddSceneModal = () => {
        setShowAddSceneModal(!showAddSceneModal);
    };



    const { updateDocument } = useFirestoreCRUD('pieces');

    //fonction bougeant les scenes
    const moveScene = async (fromIndex, toIndex) => {
        const updatedScenes = [...play.scenes];
        const [removedScene] = updatedScenes.splice(fromIndex, 1);
        updatedScenes.splice(toIndex, 0, removedScene);

        // Vous pouvez mettre à jour les scènes dans Firestore ici si nécessaire
        try {
            await updateDocument(id, { scenes: updatedScenes });
            setPlay({ ...play, scenes: updatedScenes });
        } catch (error) {
            console.error("Erreur lors de la mise à jour des scènes:", error);
        }
    };

    const updateCharacters = async () => {
        try {
            const charactersArray = charactersString.split(',').map(s => s.trim());
            await updateDocument(id, { characters: charactersArray });
            setPlay({ ...play, characters: charactersArray });
            setEditingCharacters(false);
        } catch (error) {
            console.error("Erreur lors de la mise à jour des personnages :", error);
        }
    };




    useEffect(() => {
        async function fetchPlay() {
            try {
                const playData = await getDocument(id);
                setPlay(playData);

            } catch (error) {
                console.error('Erreur lors de la récupération de la pièce:', error);
            }
            setLoading(false);
        }

        fetchPlay();
    }, []);

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (!play) {
        return <div>Pièce non trouvée</div>;
    }

    return (
        <div>
            <h1>Détails de la pièce : {play.name}</h1>
            
            <p>Personnages : {play.characters.join(', ')}</p>
            <button onClick={() => setEditingCharacters(!editingCharacters)}>
                {editingCharacters ? "Annuler" : "Modifier les personnages"}
            </button>
            {editingCharacters ? (
                <input
                    value={charactersString}
                    onChange={(e) => setCharactersString(e.target.value)}
                    placeholder="Entrez les personnages, séparés par des virgules"
                />
            ) : null}
            {editingCharacters && (
                <button onClick={updateCharacters}>Enregistrer les modifications</button>
            )}

            <button onClick={toggleAddSceneModal}>Ajouter une scène</button>

            {/* <AddSceneForm playId={play.id} currentScenes={play.scenes || []} /> */}
            {showAddSceneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white p-8 rounded">
                        <h2 className="text-xl mb-4">Ajouter une nouvelle scène</h2>
                        <AddSceneForm playId={play.id} currentScenes={play.scenes || []} />
                        <button className="bg-gray-500 text-white px-4 py-2 rounded mt-4" onClick={toggleAddSceneModal}>
                            Fermer
                        </button>
                    </div>
                </div>
            )}


            <div>

                <div>
            

                    <DndProvider backend={HTML5Backend}>
                        {play.scenes &&
                            Array.isArray(play.scenes) &&
                            play.scenes.sort((a, b) => a.position - b.position)
                                .map((scene, index) =>
                                (
                                    <>
                                    
                                        <DraggableScene
                                            key={scene.position}
                                            scene={scene}
                                            playId={play.id}
                                            index={index}
                                            moveScene={moveScene}
                                        />

                                    </>

                                )

                                )}
                    </DndProvider>
                </div>
            </div>

        </div>
    );
}

export default PlayDetails;
