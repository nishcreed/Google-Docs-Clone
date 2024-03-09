import React, { useEffect, useState } from 'react';
import {
  Navbar,
  NavbarBrand,
} from 'reactstrap';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import './App.css';
import Editor from './components/editor/Editor';
import Login from './components/login/Login';


function App() {
  const WS_URL = 'ws://127.0.0.1:3400';
  const [username, setUsername] = useState('');
  const { sendJsonMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true
  });

  useEffect(() => {
    if(username && readyState === ReadyState.OPEN) {
      sendJsonMessage({
        username,
        type: 'userevent'
      });
    }
  }, [username, sendJsonMessage, readyState]);

  return (
    <>
      <Navbar color="light" light>
        <NavbarBrand href="/">Real-time document editor</NavbarBrand>
      </Navbar>
      <div className="container-fluid">
        {username ? <Editor/>
            : <Login onLogin={setUsername}/> }
      </div>
    </>
  );
}


export default App;