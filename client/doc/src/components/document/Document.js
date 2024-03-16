import useWebSocket from 'react-use-websocket';
import './document.css';
import { WS_URL } from '../../const';
import { useEffect, useState } from 'react';
import { diff_match_patch  } from 'diff-match-patch';

export default function Document({id,username}) {
  const [doc,setDoc] = useState(null);
  const [cursorPosition,setCursorPosition] = useState(0);
  const isDocumentEvent = (message) => {
    let evt = JSON.parse(message.data);
    return (evt.type === 'contentchange' || evt.type === 'docevent');
  }
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(WS_URL, {
    share: true,
    filter: isDocumentEvent
  });

  useEffect(() => {
    if(lastJsonMessage) {
      setDoc(lastJsonMessage.data.doc);
      if(doc) {
        let elem = document.getElementById('text-editor');
        if (cursorPosition == 0) {
          document.getElementById('text-editor').value = doc?.content;
          elem?.focus();
          elem?.setSelectionRange(doc?.content.length, doc?.content.length);
        } else {
          elem?.focus();
          elem?.setSelectionRange(cursorPosition, cursorPosition);
        }
      }
    }
    else {
      sendJsonMessage({
        type:'docevent',
        id
      })
    }
  },[lastJsonMessage])


  const generateOps = (oldContent, newContent) => {
    const dmp = new diff_match_patch();
    const diffs = dmp.diff_main(oldContent, newContent);
    dmp.diff_cleanupSemantic(diffs);
    try{
    let ops = [];
    let position = 0;
    for (const [op, text] of diffs) {
      if (op === 0) { // EQUAL
        position += text.length;
      } else if (op === -1) { // DELETE
        ops.push({ type: 'delete', position, length: text.length });
      } else if (op === 1) { // INSERT
        ops.push({ type: 'insert', position, text });
        position += text.length;
      }
    }
    return ops;
    } catch(err){
      console.log(err);
    }
  }
  
  const handleHtmlChange = (e) => {
    const newOps = generateOps(doc?.content || '', e.target.value);
    sendJsonMessage({
      type: 'contentchange',
      content: e.target.value,
      ops: newOps,
      id
    });
    setCursorPosition(document.getElementById('text-editor').selectionStart);
  }
  

  return (
    <>
      {doc && <h2>{doc.owner}'s {doc.docName}</h2>}
      {doc && <textarea onChange={handleHtmlChange} id='text-editor' style={{pointerEvents:username?'auto':'none',width:'70%'}}></textarea>}<br/>
      {!username && <span style={{fontSize:'0.8rem',color:'green'}}>Log in to edit</span>}
    </>
    
  );
}