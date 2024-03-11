import React, { useEffect, useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import './App.css';
import Editor from './components/editor/Editor';
import Login from './components/login/Login';
import Register from './components/register/Register';
import Navbar from './components/navbar/Navbar';
import { WS_URL } from './const';
import Home from './components/home/Home';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

function App() {
  // const WS_URL = 'ws://127.0.0.1:3400';
  const [username, setUsername] = useState(null);
  useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(token) {
      axios.post('https://google-docs-clone-xn18.onrender.com/login',{token})
      .then(res => {
        const decodedToken = jwtDecode(token);
        const username = decodedToken.username;
        setUsername(username);
      }) 
      .catch(err => {
        console.error(err);
        alert('Your session has expired.');
        setUsername(null);
      })
    }
  }, []);

  
  return (
    <>
      <Router>
      <Navbar username={username} setUsername={setUsername}/>
      <Routes>
        <Route path="/" element={<Home username={username} />} />
        <Route path="/login" element={<Login setUname={setUsername} />} />
        <Route path="/register" element={<Register />} /> 
        <Route path="/editor/:id" element={<Editor username={username} />} /> 
      </Routes>
      </Router>
    </>
  );
}


export default App;