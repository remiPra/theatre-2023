// src/components/SceneDetails.js
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFirestoreCRUD from '../ComposablesFirebase';
import { IoIosEye } from 'react-icons/io';
import { MdPlayCircleFilled } from 'react-icons/md';



function SceneVoirDetails() {
    const [currentAudio, setCurrentAudio] = useState(null);


    //mise en place du modal de exclure 
    const [showModal, setShowModal] = useState(false);
    const openModal = () => {
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
    };
    const excludeAndPlay = (excludedCharacter) => {
        playAllAudios(excludedCharacter);
        closeModal();
    };

    //mise en place du second modal pour lecture seul des audios
    const [showModal2, setShowModal2] = useState(false);
    const openModalAndPlayAudios = (characterName) => {
        playCharacterAudios(characterName);
        setShowModal2(true);
    };










    //texte en rouge
    const [textInRedIndex, setTextInRedIndex] = useState(null);
    const handleEyeClick = (index) => {
        if (textInRedIndex === index) {
            setTextInRedIndex(null);
        } else {
            setTextInRedIndex(index);
        }
    };

    const { playId, scenePosition } = useParams();
    const { getDocument } = useFirestoreCRUD('pieces');
    const [scene, setScene] = useState(null);
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [characterVisibility, setCharacterVisibility] = useState({});

    const commentListRef = useRef(null)
    const handleScrollToBottom = () => {
        commentListRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        async function fetchScene() {
            try {
                const playData = await getDocument(playId);
                const foundScene = playData.scenes.find(
                    (scene) => scene.position == scenePosition
                );

                if (foundScene) {
                    foundScene.content = foundScene.content || [];
                    foundScene.content = foundScene.content.map((item) => ({
                        ...item,
                        audio: new Audio(item.audioUrl),
                    }));
                    setScene(foundScene);

                    // Créer un Set pour stocker les noms de personnages uniques présents dans la scène
                    const characterNamesInScene = new Set(
                        foundScene.content.map((item) => item.character)
                    );

                    // Créez des objets de character uniquement pour les personnages présents dans la scène
                    setCharacters(
                        playData.characters
                            .filter((ch) => characterNamesInScene.has(ch))
                            .map((ch) => ({ name: ch, visible: "visible" }))
                    );

                    const initialVisibility = {};
                    playData.characters.forEach((char) => {
                        initialVisibility[char] = "visible";
                    });
                    setCharacterVisibility(initialVisibility);
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

    // Fonctions pour lire les audios
    const [playingAudioIndex, setPlayingAudioIndex] = useState(null);
    //fonction qui attende
    const wait = (ms) => new Promise((resolve) => setTimeout(console.log(resolve), ms));


    const playSilence = (audioDuration) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
                console.log(audioDuration);
            }, audioDuration);
        });
    };



    const [characterPlayingAudio, setCharacterPlayingAudio] = useState({});
    const playCharacterAudios = async (characterName) => {
        console.log(`Lecture des audios pour le personnage ${characterName}`);
          setShowModal2(false)
        const characterAudios = scene.content.filter((item) => item.character === characterName);
        const character = characters.find((ch) => ch.name === characterName);

        for (let i = 0; i < characterAudios.length; i++) {
            const item = characterAudios[i];
            const { audioUrl } = item;
            if (!audioUrl) {
                console.log(`Aucun fichier audio pour l'élément ${item.id}`);
                continue;
            }

            try {
                console.log(`Lecture du fichier audio pour l'élément ${item.audioDuration}`);
                const audio = new Audio(audioUrl);
                setCharacterPlayingAudio((prevCharacterPlayingAudio) => ({
                    ...prevCharacterPlayingAudio,
                    [characterName]: i,
                }));

                if (character.visible === "visible") {
                    await playAudio(audio);
                } else {
                    // Attendre pendant la durée de l'audio sans le jouer
                    // await wait(item.audioDuration);
                }
            } catch (error) {
                console.error(`Erreur lors de la lecture du fichier audio pour l'élément ${item.id}`, error);
            }
        }

        setCharacterPlayingAudio((prevCharacterPlayingAudio) => ({
            ...prevCharacterPlayingAudio,
            [characterName]: null,
        }));
      
    };




    const playAllAudios = async (excludedCharacter = null) => {
        console.log("Lecture de tous les fichiers audio");

        for (let i = 0; i < scene.content.length; i++) {
            const item = scene.content[i];
            const { audioUrl, character } = item;

            try {
                console.log(`Lecture du fichier audio pour l'élément ${item.id}`);
                const audio = new Audio(audioUrl);

                await new Promise((resolve) => {
                    audio.addEventListener("loadedmetadata", resolve);
                });
                if (character === excludedCharacter) {
                    console.log(`Audio exclu pour l'élément ${item?.audioDuration}`);
                    console.log(item.audioDuration * 1000);
                    if (item.audioDuration) {
                        await playSilence(item.audioDuration);
                    }
                } else {
                    setPlayingAudioIndex(i); // Mettre à jour l'index du commentaire en cours de lecture
                    await playAudio(audio);
                }
            } catch (error) {
                console.error(
                    `Erreur lors de la lecture du fichier audio pour l'élément ${item.id}`,
                    error
                );
            }
        }
        setPlayingAudioIndex(null); // Reset l'index à la fin de la lecture
    };


    useEffect(() => {
        // Fonction de nettoyage
        return () => {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
        };
    }, [currentAudio]);




    const playAudio = (audio) => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        // Mettre à jour l'audio en cours de lecture
        setCurrentAudio(audio);

        return new Promise((resolve) => {
            audio.onended = () => {
                setCurrentAudio(null);
                resolve();
            };
            audio.play();
        });


    };


    if (loading) {
        return <div>Chargement...</div>;
    }

    if (!scene) {
        return <div>Scène non trouvée {scenePosition}</div>;
    }

    const toggleVisibility = (characterName) => {
        setCharacterVisibility((prevVisibility) => {
            const updatedVisibility = { ...prevVisibility };
            if (updatedVisibility[characterName] === "visible") {
                updatedVisibility[characterName] = "invisible";
            } else if (updatedVisibility[characterName] === "invisible") {
                updatedVisibility[characterName] = "disparu";
            } else {
                updatedVisibility[characterName] = "visible";
            }
            return updatedVisibility;
        });


        setCharacters((prevCharacters) => {
            return prevCharacters.map((char) => {
                if (char.name === characterName) {
                    let newVisibility;
                    if (char.visible === "visible") {
                        newVisibility = "invisible";
                    } else if (char.visible === "invisible") {
                        newVisibility = "disparu";
                    } else {
                        newVisibility = "visible";
                    }

                    return {
                        ...char,
                        visible: newVisibility,
                    };
                }
                return char;
            });
        });

        setScene((prevScene) => {
            return {
                ...prevScene,
                content: prevScene.content.map((item) => {
                    if (item.character === characterName) {
                        const character = characters.find((c) => c.name === characterName);
                        return {
                            ...item,
                            visible: character.visible,
                        };
                    }
                    return item;
                }),
            };
        });





    };







    if (loading) {
        return <div>Chargement...</div>;
    }

    if (!scene) {
        return <div>Scène non trouvée {scenePosition}</div>;
    }






    return (
        <div>
            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex justify-center">
                        <div
                            className="fixed inset-0 bg-red-100  bg-opacity-75 transition-opacity"
                            onClick={closeModal}
                        ></div>
                        <div className="bg-white z-50 rounded p-6 m-4">
                            <h3 className="text-lg font-white">Exclure un personnage</h3>
                            <div>
                                {characters.map((ch) => (
                                    <button
                                        key={ch.name}
                                        onClick={() => excludeAndPlay(ch.name)}
                                        className="m-2"
                                    >
                                        {ch.name}
                                    </button>
                                ))}
                            </div>
                            <button onClick={closeModal} className="mt-4">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className='flex items-baseline'>
                <h1 className='text-[20px] md:text-[35px]'>Scène {scene.position} : {scene.title}</h1> <button onClick={handleScrollToBottom}>scroll</button>
            </div>
            <div className='flex'>
                <button onClick={openModal}>Exclure un personnage</button>

                <button onClick={playAllAudios}>
                    <MdPlayCircleFilled size={24} />

                </button>
                <button onClick={openModalAndPlayAudios}>
                    Lire les audios d"un personnnage
                </button>
                {showModal2 && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white p-8 rounded">
                            {/* Ici, ajoutez le contenu du modal */}
                            <div>
                                {characters.map((ch) => (
                                    <div key={ch.name}>
                                        <button onClick={() => playCharacterAudios(ch.name)}>
                                            Lire les audios de {ch.name}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {/* Ajoutez un bouton pour fermer le modal */}
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
                                onClick={() => setShowModal2(false)}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                )}


                {/* {characters.map((ch) => (
                <button
                    onClick={() => playAllAudios(ch.name)} // Exclure les audios de ce personnage

                >
                    exclure  {ch.name}
                </button>
            ))} */}
                <div>
                    {characters.map((ch) => (
                        <div key={ch.name}>
                            {/* <button
                            onClick={() => toggleVisibility(ch.name)}
                            style={{
                                backgroundColor:
                                    ch.visible === "invisible"
                                        ? "yellow"
                                        : ch.visible === "disparu"
                                            ? "red"
                                            : "initial",
                            }}
                        >
                            {ch.name}
                        </button> */}
                        
                        </div>
                    ))}
                </div>
            </div>


            <div>
                {characters.map((ch) => (
                    <button
                        onClick={() => toggleVisibility(ch.name)}
                        style={{
                            backgroundColor:
                                ch.visible === "invisible"
                                    ? "yellow"
                                    : ch.visible === "disparu"
                                        ? "red"
                                        : "initial",
                        }}
                    >
                        {ch.name}
                    </button>
                ))}
            </div>


            <div className='max-h-[400px] overflow-y-scroll '>
                {scene.content
                    .sort((a, b) => a.position - b.position)
                    .map((item, index) => {
                        const visible = characterVisibility[item.character];

                        if (visible !== "disparu") {
                            return (
                                <div className="flex p  -2" key={item.id}
                                    style={{
                                        backgroundColor: playingAudioIndex === index ? "green" : "initial",
                                    }}
                                >
                                    {/* {visible === "visible" && <p className="p-5">{visible}</p>}
                                {visible === "invisible" && (
                                    <p className="text-white p-5">{visible}</p>
                                )} */}

                                    <p className="p-5 border min-w-[100px] max-w-[100px]">{item.character}</p>
                                    {visible === "visible" && <p ref={commentListRef} className="border w-[600px] max-w-[600px] p-5">{item.text}</p>}
                                    {visible === "invisible" && (
                                        <div className=" flex justify-between p-5 max-w-[600px]">
                                            <button className='block' onClick={() => handleEyeClick(index)}>

                                                <IoIosEye size={24} />
                                            </button>
                                            <p className={textInRedIndex === index ? "text-red-600 block" : "text-white block"}>{item.text}</p>
                                        </div>
                                    )}


                                    <p>{item.audioUrl && (
                                        <button
                                            className="bg-green-500 p-1 rounded text-white ml-2"
                                            onClick={() => playAudio(item.audio)}
                                        >
                                            Lire l'audio
                                        </button>
                                    )}
                                    </p>
                                </div>
                            );
                        } else {
                            return null;
                        }
                    })}
            </div>
        </div>


    );
}

export default SceneVoirDetails;
