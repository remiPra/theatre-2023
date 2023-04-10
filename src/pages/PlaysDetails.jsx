// PlayDetails.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useFirestoreCRUD from '../ComposablesFirebase';
import AddSceneForm from './AddSceneForm';

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

    const { updateDocument } = useFirestoreCRUD('pieces');

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



            <div>

                {play.scenes && Array.isArray(play.scenes) && play.scenes.map((el) => (
                    <div key={el.position}>
                        <h3 >Scène {el.position}  : {el.title}  </h3>
                        <button
                            onClick={() =>
                                navigate(`/piece/${play.id}/scene/${el.position}`)
                            }
                        >Changer le contenu </button>
                        <button
                            onClick={() =>
                                navigate(`/piece/${play.id}/sceneTheatre/${el.position}`)
                            }
                        >Voir le contenu </button>
                    </div>
                ))}
                <p></p>
            </div>
            <AddSceneForm playId={play.id} currentScenes={play.scenes || []} />
        </div>
    );
}

export default PlayDetails;
