import React, { useEffect, useState } from 'react';
// import {
//   Navbar,
//   NavbarBrand,
//   NavLink
// } from 'reactstrap';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import './App.css';
import Editor from './components/editor/Editor';
import Login from './components/login/Login';
import Register from './components/register/Register';
import Navbar from './components/navbar/Navbar';
import { WS_URL } from './const';
import Home from './components/home/Home';


function App() {
  // const WS_URL = 'ws://127.0.0.1:3400';
  const [username, setUsername] = useState(null);
  const [msg,setMsg] = useState('');
  useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true
  });

  // useEffect(() => {
  //   if(creds && readyState === ReadyState.OPEN) {
  //     sendJsonMessage({
  //       username:creds.username,
  //       password:creds.password,
  //       type: 'userevent'
  //     });
  //   }
  // }, [creds, sendJsonMessage, readyState]);

  

  return (
    <>
      <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home msg={msg} username={username} />} />
        <Route path="/login" element={<Login setMsg={setMsg} msg={msg} setUname={setUsername} />} />
        <Route path="/register" element={<Register />} /> 
      </Routes>
      </Router>
    </>
  );
}


export default App;