import React, { useState, useRef, useEffect } from 'react';
import useFirestoreCRUD from '../ComposablesFirebase';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../firebase';
import getBlobDuration from 'get-blob-duration'



function SceneContent({ playId, scene, characters }) {
    const commentListRef = useRef(null);
    const handleScrollToBottom = () => {
        commentListRef.current.scrollIntoView({ behavior: 'smooth' });
    };
    const { updateDocument, updateSceneContent, getDocument, updateSceneContentDelete, updateSceneContentUpdate } = useFirestoreCRUD('pieces');
    //recuperation des commentaires d'une sc
    const fetchSceneData = async () => {
        try {
            const playDoc = await getDocument(playId);

            const sceneData = playDoc.scenes.find(
                (scene) => scene.position == scenePosition
            );



            // const sceneData = playDoc.scenes[scene.position];




            setSceneContent(sceneData.content || []);
            console.log(sceneContent);
        } catch (error) {
            console.error('Error fetching scene data:', error);
        }
    };

    const [recording, setRecording] = useState(null);

    const mediaRecorderRef = useRef(null);
    const [audioIda, setAudioId] = useState(null)
    const [audioNamea, setAudioName] = useState(null)

    const uploadAudioToFirebase = async (audioBlob) => {
        const audioId = Date.now()
        setAudioId(audioId); // Générer un identifiant unique pour le fichier audio
        const audioName = `audio_${audioId}.webm`;
        setAudioName(`audio_${audioId}.webm`);
        const audioRef = storage.ref().child(`audio/${audioName}`);

        try {
            const snapshot = await audioRef.put(audioBlob);
            const audioURL = await snapshot.ref.getDownloadURL();

            return { audioName, audioURL, audioId };
        } catch (error) {
            console.error('Error uploading audio:', error);
        }

        return null;
    };
    const [recordingButtonBg, setRecordingButtonBg] = useState('bg-blue-500');
    const [audioDurationBlob,setAudioDurationBlob] = useState(null)
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const audioChunks = [];
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                setRecording(audioBlob);
                console.log(audioBlob);
                const audioBlobUrl = URL.createObjectURL(audioBlob);
                const audioObj = new Audio(audioBlobUrl);
                let audioDuration = null
                audioObj.addEventListener("loadedmetadata", async () => {
                    const duration = await getBlobDuration(audioBlob)
                    audioDuration = audioObj.duration;
                    console.log("Audio duration:", duration * 1000);
                    setAudioDurationBlob(duration)


                    // Vous pouvez stocker la durée dans un état ou une variable ici

                });

            };

            setRecording(null); // Réinitialiser l'enregistrement précédent
            mediaRecorder.start();
            setRecordingButtonBg('bg-green-500'); // Change background color to green
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecordingButtonBg('bg-blue-500'); // Reset background color to blue
        }
    };





    const openModal = (commentId, commentText, CommentCharacter) => {
        setActiveCommentId(commentId);
        setActiveCommentText(commentText);
        setActiveCommentCharacter(CommentCharacter);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setActiveCommentId(null);
        setActiveCommentText(null);
        setActiveCommentCharacter(null)
        setIsModalOpen(false);
    };

    //mon modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [activeCommentText, setActiveCommentText] = useState(null);
    const [activeCommentCharacter, setActiveCommentCharacter] = useState(null);



    useEffect(() => {
        fetchSceneData();
    }, []);



    const [inputValue, setInputValue] = useState('');
    const [selectedCharacter, setSelectedCharacter] = useState('');
    const [editingCharacter, setEditingCharacter] = useState('');
    const handleEditingCharacterChange = (event) => {
        setEditingCharacter(event.target.value);
    };

    const [listItems, setListItems] = useState([]);


    const [sceneContent, setSceneContent] = useState(scene.content || []);


    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };



    const handleCharacterChange = (event) => {
        setSelectedCharacter(event.target.value);
    };

    const handleAddButtonClick = () => {
        const newItem = {
            id: uuidv4(),
            text: inputValue,
            position: sceneContent.length + 1,
            character: selectedCharacter,
            isEditing: false,
            visible: "visible"
        };
        const updatedScene = newItem;
        updateSceneContent(playId, scene.position, updatedScene);
        setSceneContent((prevSceneContent) => [...prevSceneContent, newItem]);
        //scroll

        setInputValue('');
        setTimeout(() => { handleScrollToBottom() }, 500)
        // Mettre à jour la scène dans Firestore

    };


    const handleListItemClick = (itemId) => {
        setSceneContent((prevListItems) =>
            prevListItems.map((item) => {
                if (item.id === itemId) {
                    setEditingCharacter(item.character)
                    return {
                        ...item,
                        isEditing: true,
                    };
                }
                return item;
            }),
        );
    };
    const handleClickListItemView = (itemId) => {
        setSceneContent((prevListItems) =>
            prevListItems.map((item) => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        isEditing: false,
                    };
                }
                return item;
            }),
        );
    }

    const playAudio = (audioId) => {
        const audioElement = document.getElementById(audioId);
        if (audioElement) {
            audioElement.play();
        }
    };




    const handleListItemBlur = (itemId, newText) => {
        setSceneContent((prevListItems) =>
            prevListItems.map((item) => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        text: newText,
                        isEditing: true,
                    };
                }
                return item;
            }),
        );
    };


    const handleListItemDelete = async (itemId) => {
        const newSceneContent = sceneContent.filter((item) => item.id !== itemId);
        console.log(newSceneContent)
        // Réaffecter les positions des éléments restants
        newSceneContent.forEach((item, index) => {
            item.position = index + 1;
        });

        // Mettre à jour la scène dans Firestore
        const updatedScenes = await updateSceneContentDelete(playId, scene.position, newSceneContent, 'delete');

        // Trouver la scène mise à jour avec la position donnée
        const updatedScene = updatedScenes.find(updatedScene => updatedScene.position === scene.position);

        // Mettre à jour l'état local sceneContent
        if (updatedScene) {
            setSceneContent(updatedScene.content);
        } else {
            console.error("La scène spécifiée est introuvable dans les scènes mises à jour.");
        }
    };



    // const handleListItemDelete = async (itemId) => {
    //     setSceneContent((prevSceneContent) => {
    //         const newSceneContent = prevSceneContent.filter((item) => item.id !== itemId);

    //         // Réaffecter les positions des éléments restants
    //         newSceneContent.forEach((item, index) => {
    //             item.position = index + 1;
    //         });

    //         // Mettre à jour la scène dans Firestore
    //         updateSceneContentDelete(playId, scene.position, newSceneContent, 'delete');

    //         return newSceneContent;
    //     });
    // };








    // const handleListItemUpdate = async (itemId, newText, newCharacter) => {
    //     console.log(itemId, newText)

    //     let audioName = null;
    //     let audioId = null;
    //     let audioUrl = null


    //     if (recording) {
    //         const audioData = await uploadAudioToFirebase(recording);
    //         if (audioData) {
    //             console.log('Audio uploaded:', audioData.audioName, audioData.audioURL, audioData.audioId);
    //             audioName = audioData.audioName;
    //             audioId = audioData.audioId;
    //             audioUrl = audioData.audioURL


    //         }
    //     }

    //     const updatedSceneContent = sceneContent.map((item) =>
    //         item.id === itemId ?
    //             {
    //                 ...item,
    //                 text: newText,
    //                 isEditing: false,
    //                 character: newCharacter,
    //                 ...(audioName ? { audioName: audioName } : {}),
    //                 ...(audioId ? { audioId: audioId } : {}),
    //                 ...(audioUrl ? { audioUrl: audioUrl } : {}),
    //             } : item
    //     );
    //     setSceneContent(updatedSceneContent);

    //     // Mettre à jour la scène dans Firestore
    //     updateSceneContentUpdate(playId, scene.position, updatedSceneContent, 'update');
    // };
    const handleListItemUpdate = async (itemId, newText, newCharacter) => {
        console.log(itemId, newText);

        let audioName = null;
        let audioId = null;
        let audioUrl = null;
        let audioDuration = null;

        if (recording) {
            const audioData = await uploadAudioToFirebase(recording);
            if (audioData) {
                console.log('Audio uploaded:', audioData.audioName, audioData.audioURL, audioData.audioId);
                audioName = audioData.audioName;
                audioId = audioData.audioId;
                audioUrl = audioData.audioURL;

                // Get the audio duration from the Blob
                const blobUrl = URL.createObjectURL(recording);
                const audio = new Audio(blobUrl);
                
                
                audioDuration = audioDurationBlob;

                // Release the Blob URL
                URL.revokeObjectURL(blobUrl);
            }
        }

        const updatedSceneContent = sceneContent.map((item) =>
            item.id === itemId
                ? {
                    ...item,
                    text: newText,
                    isEditing: false,
                    character: newCharacter,
                    ...(audioName ? { audioName: audioName } : {}),
                    ...(audioId ? { audioId: audioId } : {}),
                    ...(audioUrl ? { audioUrl: audioUrl } : {}),
                    ...(audioDuration ? { audioDuration: audioDuration * 1000 } : {}),
                }
                : item
        );
        setSceneContent(updatedSceneContent);

        // Mettre à jour la scène dans Firestore
        updateSceneContentUpdate(playId, scene.position, updatedSceneContent, 'update');
    };





    const handleDragEnd = (result) => {

        if (!result.destination || result.destination.droppableId !== 'droppable-sceneContent') {

            return;
        }

        const reorderedSceneContent = Array.from(sceneContent);
        const [removed] = reorderedSceneContent.splice(result.source.index, 1);
        reorderedSceneContent.splice(result.destination.index, 0, removed);

        const updatedSceneContent = reorderedSceneContent.map((item, index) => ({
            ...item,
            position: index + 1,
        }));

        setSceneContent(updatedSceneContent);

        // Mettre à jour la scène dans Firestore
        updateSceneContentUpdate(playId, scene.position, updatedSceneContent, 'update');
    };

    //modal de delete
    const [showModal, setShowModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const openDeleteModal = (item) => {
        console.log(item.text, item.id, item.position)
        setItemToDelete(item);
        setShowModal(true);
    };

    const closeDeleteModal = () => {
        setItemToDelete(null);
        setShowModal(false);
    };
    const deleteItem = async (id) => {
        console.log(id)
        await handleListItemDelete(id);
        // fetchSceneData();
        closeDeleteModal();
    };










    return (
        <div className=' mt-2'>
            <div className="input-container flex items-baseline ">

                <h3>Choix du personnage : </h3>
                <div>


                    <select className='block' value={selectedCharacter} onChange={handleCharacterChange}>
                        <option value="">Sélectionnez un personnage </option>
                        {characters.map((character) => (
                            <option key={character} value={character}>
                                {character}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='flex items-baseline'>
                    <h3 className='mt-4'>Ecris Le texte : </h3>
                    <textarea className='block border-2 border-red-100' type="text" value={inputValue} data-max-length="20" onChange={(e) => handleInputChange(e)}
                    />
                    <button className='mt-4' onClick={handleAddButtonClick} disabled={!selectedCharacter}>Add</button>
                    <button onClick={handleScrollToBottom}>Scroller en bas</button>

                </div>
            </div>
            <div className='max-h-[350px] overflow-y-scroll' >
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="droppable-sceneContent">

                        {(provided) => (
                            <ul {...provided.droppableProps} ref={provided.innerRef}>
                                {sceneContent
                                    .sort((a, b) => a.position - b.position)
                                    .map((item, index) => (
                                        <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                                            {(provided) => (
                                                <li>
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <div>
                                                            {item.isEditing ? (
                                                                <div className='flex justify-between'>

                                                                    <select className='block'
                                                                        value={editingCharacter}
                                                                        onChange={handleEditingCharacterChange}
                                                                    >
                                                                        <option value="">
                                                                            Sélectionnez un personnage
                                                                        </option>
                                                                        {characters.map((character) => (
                                                                            <option key={character} value={character}>
                                                                                {character}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <textarea
                                                                        className='w-[300px]'
                                                                        type="text"
                                                                        value={item.text}
                                                                        onChange={(event) => {
                                                                            handleListItemBlur(item.id, event.target.value);
                                                                        }}
                                                                        autoFocus
                                                                    />
                                                                    <div>
                                                                        <button onClick={() => handleListItemUpdate(item.id, item.text, editingCharacter)}>
                                                                            Modifier
                                                                        </button>


                                                                        <button onClick={() => openModal(item.id, item.text, item.character)}></button>
                                                                    </div>
                                                                    {isModalOpen && (
                                                                        <div className="modal">
                                                                            <div className="modal-content">
                                                                                <h2>le texte  : {item.text} </h2>
                                                                                {/* Ajoutez ici les boutons d'enregistrement audio et l'élément audio */}
                                                                                {recordingButtonBg == "bg-blue-500" && <button className={`${recordingButtonBg} text-white px-2 py-1 rounded mr-2`} onClick={startRecording}>Start Recording</button>}
                                                                                {recordingButtonBg !== "bg-blue-500" && <>
                                                                                    <button className={`${recordingButtonBg} text-white px-2 py-1 rounded mr-2`} onClick={startRecording}>en Cours</button>
                                                                                    <button onClick={stopRecording}>Stop Recording</button>
                                                                                </>
                                                                                }
                                                                                {recording && <audio src={URL.createObjectURL(recording)} controls />}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        handleListItemUpdate(activeCommentId, activeCommentText, activeCommentCharacter);
                                                                                        closeModal();
                                                                                    }}
                                                                                >
                                                                                    Save and Close
                                                                                </button>
                                                                                <button onClick={closeModal}>Close without Saving</button>
                                                                            </div>
                                                                        </div>)}

                                                                </div>
                                                            ) : (
                                                                <div className="border-2 border-red-300 m-2 p-2"    >
                                                                    <span
                                                                        className="flex items-center justify-between "

                                                                    >
                                                                        <div className="flex">
                                                                            <span className="min-w-[100px] w-[300px]">{item.character}</span>
                                                                            <span
                                                                                onClick={() => handleListItemClick(item.id)}
                                                                                ref={commentListRef}
                                                                                className="min-w-[200px] max-w-[700px]"
                                                                            >
                                                                                {item.text}
                                                                            </span>
                                                                        </div>



                                                                    </span>
                                                                    <div className='flex justify-between w-full'>
                                                                        {(!item.audioId) && <div className="bg-red-800 text-white px-2 py-1 rounded mr-2"
                                                                        >pas d'audio</div>}
                                                                        {(item.audioId) && (
                                                                            <div className='flex'>
                                                                                <audio
                                                                                    id={`audio_${item.audioId}`}
                                                                                    src={item.audioUrl}
                                                                                    type="audio/webm"
                                                                                    controls={false}
                                                                                />
                                                                                <button
                                                                                    className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                                                                    onClick={() => playAudio(`audio_${item.audioId}`)}
                                                                                // onClick={() => playAudio(item.audioURL)}
                                                                                >
                                                                                    Lire l'audio
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                        {/* <button onClick={() => handleListItemDelete(item.id)}>
                                                                            Delete
                                                                        </button> */}
                                                                        <button
                                                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                                                            onClick={() => openDeleteModal(item)}
                                                                        >
                                                                            Supprimer
                                                                        </button>
                                                                        {showModal && (
                                                                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                                                                <div className="bg-white p-8 rounded">
                                                                                    <h2 className="text-xl mb-4">Supprimer l'élément</h2>
                                                                                    <p>Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.</p>
                                                                                    <div className="flex justify-end mt-4">
                                                                                        <button className="bg-red-500 text-white px-4 py-2 rounded mr-2" onClick={() => deleteItem(itemToDelete.id)}>
                                                                                            Supprimer {item.id} {itemToDelete.id}
                                                                                        </button>
                                                                                        <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={closeDeleteModal}>
                                                                                            Annuler
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <span>




                                                                    </span>

                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                {provided.placeholder}
                            </ul>

                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    );
}

export default SceneContent;
