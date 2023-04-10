import React from 'react'
import { useNavigate } from "react-router-dom";
import useFirestoreCRUD from '../ComposablesFirebase';
export default function Main() {

    const {documents , error } = useFirestoreCRUD('pieces')

    const navigate = useNavigate()
    return (
        <>
            <div>Création pièce de théatre</div>
            <div>
                {/* <button onClick={()=> navigate('/ajoutpiece') }>ajout pièce</button> */}
            </div>
            <div>
                {documents.map(el=>(<>
                        <h2>{el.name}</h2>
                        <button onClick={()=>navigate(`/piece/${el.id}`)}>Voir</button>
                </>))}
            </div>
        </>
    )
}
