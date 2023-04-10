// src/components/SceneDetails.js
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFirestoreCRUD from '../ComposablesFirebase';

function SceneVoirDetails() {
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
            <div className='flex items-baseline'>
            <h1 className='text-[20px] md:text-[35px]'>Scène {scene.position} : {scene.title}</h1> <button onClick={handleScrollToBottom}>scroll</button>
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


                            <div  className='max-h-[400px] overflow-y-scroll '>
            {scene.content
                .sort((a, b) => a.position - b.position)
                .map((item) => {
                    const visible = characterVisibility[item.character];

                    if (visible !== "disparu") {
                        return (
                            <div className="flex p  -2" key={item.id}>
                                {/* {visible === "visible" && <p className="p-5">{visible}</p>}
                                {visible === "invisible" && (
                                    <p className="text-white p-5">{visible}</p>
                                )} */}

                                <p className="p-5 border min-w-[100px] max-w-[100px]">{item.character}</p>
                                {visible === "visible" && <p ref={commentListRef} className="border w-[600px] max-w-[600px] p-5">{item.text}</p>}
                                {visible === "invisible" && (
                                    <p  className="text-white p-5">{item.text}</p>
                                )}
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
