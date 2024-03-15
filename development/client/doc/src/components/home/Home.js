import { useEffect, useState } from 'react';
import './home.css'
import useWebSocket from 'react-use-websocket';
import { WS_URL } from '../../const';
import { Link } from 'react-router-dom';
export default function Home({username}) {
    const isHomeGetEvent = (message) => {
        let evt = JSON.parse(message.data);
        return evt.type === 'homeevent';
    }
    const [docs,setDocs] = useState(null);
    const {sendJsonMessage, lastJsonMessage,readyState} = useWebSocket(WS_URL, {
        share: true,
        filter: isHomeGetEvent
    });
    useEffect(()=>{
        if(lastJsonMessage){
            setDocs(lastJsonMessage.data.docs);
        }
        else{
            sendJsonMessage({
                type:'homeevent'
            })
        }
    },[lastJsonMessage])
    const newHandler = (e) => {
        var docName = document.getElementById('newDoc');
        sendJsonMessage({
            docName:docName.value,
            username,
            type:'newdocevent'
        });
        docName.value = '';
    }
    return (
        <div className="home">
            <h2 style={{textAlign:'center'}}>Documents</h2>
            <ul className='docs'>
                {docs?.map((doc) => <li><Link to={`editor/${doc._id}`}>{doc.owner}'s {doc.docName}</Link></li>)}
            </ul>
            <br></br>
            <br></br>
            <div style={{pointerEvents:!username?'none':'auto'}} class="input-group mb-3">
            <input type="text" class="form-control"  placeholder='Enter document name' aria-label="Recipient's username" id='newDoc' aria-describedby="button-addon2"/>
            <button onClick={newHandler} class="btn btn-primary" type="button" id="button-addon2">Create</button>
            </div>
            
            <br></br>
            {!username && <span style={{fontSize:'0.8rem',color:'green'}}>Log in to create a new document</span>}
        </div>
    )
}