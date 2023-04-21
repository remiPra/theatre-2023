import React, { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useNavigate } from "react-router-dom";

const DraggableScene = ({ playId, scene, moveScene, index }) => {
  const navigate = useNavigate()

  const [{ isDragging }, drag] = useDrag({
    type: "scene",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "scene",
    hover(item) {
      if (item.index === index) {
        return;
      }
      moveScene(item.index, index);
      item.index = index;
    },
  });
  //utiliser pour voir les personnages
  const getUniqueCharacterNames = (sceneContent) => {
    console.log("Contenu de la scène:", sceneContent);
    const characterNamesInScene = new Set(sceneContent.map((item) => item.character));
    console.log("Noms de personnages uniques:", Array.from(characterNamesInScene));
    return Array.from(characterNamesInScene);
  };

  const [personnage, setPersonnage] = useState("")
  
  useEffect(() => {
    async function fetchData() {
        console.log(scene.content);
        const data = await getUniqueCharacterNames(scene.content);
        const string = data.join(" , ");
        setPersonnage(string);
    }
    fetchData();
}, []);


  const handleContentChangeClick = () => {
    navigate(`/piece/${playId}/scene/${scene.position}`);
  };
  
  const handleContentDisplayClick = () => {
    navigate(`/piece/${playId}/sceneTheatre/${scene.position}`);
  };

  return (
    <div
      className="cursor-pointer bg-white p-4 rounded shadow-xl"
      ref={(node) => drag(drop(node))}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <h3>
        Scène {scene.position} : {scene.title}
      </h3>
      <p>Personnage Présent : {personnage}</p>
      <div key={scene.position}>

        <button onClick={handleContentChangeClick}
          
        >Changer le contenu {scene.position} </button>
        <button onClick={handleContentDisplayClick}
         
        >Voir le contenu {scene.position} </button>
      </div>
    </div>
  );
};

export default DraggableScene;
