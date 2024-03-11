import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useState } from 'react';
import './login.css';
import { WS_URL } from '../../const';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login({ setUname }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message,setMessage] = useState();
    const navigate = useNavigate();

    const logInUser = () => {
      if(!username.trim() || !password.trim()) {
        return;
      }
      // axios.post('/login',{username,password})
      axios.post('https://google-docs-clone-xn18.onrender.com/login',{username,password})
      .then(res => {
        localStorage.setItem('token',res.data.token);
        setUname(username);
        setMessage('');
        navigate('/');
      })
      .catch(error => {
        console.error('Error:', error.message);
        // Handle error
        if (error.response.status === 401) {
          setMessage(error.response.data.message);
        } else {
          console.error('Response error:', error.response.status);
        }
      });
    }

    return (
      <div className="account">
        <div className="account__wrapper">
          <div className="account__card">
            <div className="account__profile">
              <p className="account__name">Hello, user!</p>
              <p className="account__sub">Log in to create a new document or collaborate</p>
            </div>
            <input required placeholder='Username' name="username" onInput={(e) => setUsername(e.target.value)} className="form-control" />
            <input required placeholder='Password' type='password' name="password" onInput={(e) => setPassword(e.target.value)} className="form-control" />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                logInUser();
              }} 
              className="btn btn-primary account__btn">Log in</button><br/><br/>
              <span style={{fontSize:'0.8rem',color:'green'}}>{message}</span>
          </div>
        </div>
      </div>
    );
}