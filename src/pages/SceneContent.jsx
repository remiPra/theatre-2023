import React, { useState, useRef, useEffect } from 'react';
import useFirestoreCRUD from '../ComposablesFirebase';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';




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
            const sceneData = playDoc.scenes[scene.position - 1];
            setSceneContent(sceneData.content || []);
            console.log(sceneContent);
        } catch (error) {
            console.error('Error fetching scene data:', error);
        }
    };

    const [audioName, setAudioName] = useState(null);
    const [audioId, setAudioId] = useState(null);
    const [recording, setRecording] = useState(null);

    const mediaRecorderRef = useRef(null);


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
            };

            mediaRecorder.start();
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
    };




    const openModal = (commentId) => {
        setActiveCommentId(commentId);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setActiveCommentId(null);
        setIsModalOpen(false);
    };

    //mon modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCommentId, setActiveCommentId] = useState(null);



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

        setInputValue('');

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



    const handleListItemDelete = (itemId) => {
        const newSceneContent = sceneContent.filter((item) => item.id !== itemId);
        setSceneContent(newSceneContent);

        // Mettre à jour la scène dans Firestore
        updateSceneContentDelete(playId, scene.position, newSceneContent, 'delete');
    };
    const handleListItemUpdate = (itemId, newText, newCharacter, audioName, audioId) => {
        console.log(itemId, newText)
        const updatedSceneContent = sceneContent.map((item) =>
            item.id === itemId ?
                {
                    ...item,
                    text: newText,
                    isEditing: false,
                    character: newCharacter,
                    ...(audioName ? { audioName } : {}),
                    ...(audioId ? { audioId } : {}),
                } : item
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
    // const getTextMaxLength = (event) => {
    //      if (event.target.tagName !== 'INPUT') {
    //     return 0; // ou une autre valeur par défaut
    //   }
    //   return event?.target?.value?.length || 0;
    // };







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


                                                                        <button onClick={() => openModal(item.id)}>Record Audio</button>
                                                                    </div>
                                                                    {isModalOpen && (
                                                                        <div className="modal">
                                                                            <div className="modal-content">
                                                                                <h2>Recording Audio for Comment ID: {activeCommentId}</h2>
                                                                                {/* Ajoutez ici les boutons d'enregistrement audio et l'élément audio */}
                                                                                <button onClick={startRecording}>Start Recording</button>
                                                                                <button onClick={stopRecording}>Stop Recording</button>
                                                                                {recording && <audio src={URL.createObjectURL(recording)} controls />}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        handleListItemUpdate(activeCommentId, activeCommentText, activeCommentCharacter, audioName, audioId);
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
                                                                <>
                                                                    <span className='flex items-center justify-between' onClick={() => handleListItemClick(item.id)}>
                                                                        <div className='flex'>
                                                                            <span className='min-w-[100px]'>
                                                                                {item.character}
                                                                            </span>
                                                                            <span ref={commentListRef} className='min-w-[200px] max-w-[700px]'>
                                                                                {item.text}
                                                                            </span>
                                                                        </div>
                                                                        <span>

                                                                            (position: {item.position})
                                                                            <button onClick={() => handleListItemDelete(item.id)}>
                                                                                Delete
                                                                            </button>
                                                                        </span>
                                                                    </span>
                                                                </>
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
