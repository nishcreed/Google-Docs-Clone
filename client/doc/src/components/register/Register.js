import useWebSocket, { ReadyState } from 'react-use-websocket';
import './register.css'
import { WS_URL } from '../../const';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';

export default function Register() {
    const navigate = useNavigate();
    const [msg,setMsg] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
    
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const username = formData.get('username');
        const password = formData.get('pwd');
        
        // axios.post('/register',{email,username,password})
        axios.post('https://google-docs-clone-xn18.onrender.com/register',{email,username,password})
        .then(res => {
            console.log('Registered');
            navigate('/');
        })
        .catch(err => {
            console.error(err);
            setMsg(err.response.data.message);
        })
        
    }
    return (
        <form className="reg-form" onSubmit={handleSubmit}>
        <div class="mb-3">
            <label for="exampleInputEmail1" class="form-label">Email</label>
            <input required type="email" name='email' class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"/>
        </div>
        <div class="mb-3">
            <label for="exampleInputEmail1" class="form-label">Username</label>
            <input required type="text" name='username' class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"/>
        </div>
        <div class="mb-3">
            <label for="exampleInputPassword1" class="form-label">Password</label>
            <input required type="password" name='pwd' class="form-control" id="exampleInputPassword1"/>
        </div>

        <button type="submit" class="btn btn-primary">Register</button><br/>
        <span style={{fontSize:'0.8rem',color:'green'}}>{msg}</span>
        </form>
    )
}