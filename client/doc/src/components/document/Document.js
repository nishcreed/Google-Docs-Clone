import useWebSocket from 'react-use-websocket';
import { DefaultEditor } from 'react-simple-wysiwyg';
import './document.css';

export default function Document() {
  const WS_URL = 'ws://127.0.0.1:3400';
  const isDocumentEvent = (message) => {
    let evt = JSON.parse(message.data);
    return evt.type === 'contentchange';
  }
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(WS_URL, {
    share: true,
    filter: isDocumentEvent
  });

    let html = lastJsonMessage?.data.editorContent || '';
    
    const handleHtmlChange = (e) => {
      sendJsonMessage({
        type: 'contentchange',
        content: e.target.value
      });
    }

    return (
      <DefaultEditor value={html} onChange={handleHtmlChange} />
    );
}