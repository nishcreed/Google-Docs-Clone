import useWebSocket from 'react-use-websocket';
import { DefaultEditor } from 'react-simple-wysiwyg';
import './document.css';
import { WS_URL } from '../../const';
import { useEffect, useState } from 'react';
import { diff_match_patch  } from 'diff-match-patch';

export default function Document({id,username}) {
  const [document,setDocument] = useState(null);
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
      setDocument(lastJsonMessage.data.doc);
    }
    else {
      sendJsonMessage({
        type:'docevent',
        id
      })
    }
  },[lastJsonMessage])

  // let content = lastJsonMessage?.data.doc || '';

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
    const newOps = generateOps(document?.content || '', e.target.value);
    sendJsonMessage({
      type: 'contentchange',
      content: e.target.value,
      ops: newOps,
      id
    });
  }
  

  return (
    <>
      {document && <h2>{document.owner}'s {document.docName}</h2>}
      {document && <DefaultEditor style={{pointerEvents:username?'auto':'none'}} value={document.content} onChange={handleHtmlChange} /> }
      {!username && <span style={{fontSize:'0.8rem',color:'green'}}>Log in to edit</span>}
    </>
    
  );
}