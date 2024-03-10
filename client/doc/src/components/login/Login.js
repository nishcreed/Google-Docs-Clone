import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useState } from 'react';
import './login.css';
import { WS_URL } from '../../const';
import { useNavigate } from 'react-router-dom';

export default function Login({ setMsg,msg,setUname }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const isLoginEvent = (message) => {
      let evt = JSON.parse(message.data);
      return evt.type === 'userevent';
    }
    const {sendJsonMessage, lastJsonMessage,readyState} = useWebSocket(WS_URL, {
      share: true,
      filter: isLoginEvent
    });
    const logInUser = () =>{
      if(!username.trim() || !password.trim()) {
        return;
      }
      if(readyState === ReadyState.OPEN){
        sendJsonMessage({
          username,
          password,
          type: 'userevent'
        });
        setMsg(lastJsonMessage?.data.msg);
        setUname(username);
        navigate('/');
      }
    }
    // let msg = lastJsonMessage?.data.msg || '';
    return (
      <div className="account">
        <div className="account__wrapper">
          <div className="account__card">
            <div className="account__profile">
              <p className="account__name">Hello, user!</p>
              <p className="account__sub">Log in to create a new document or collaborate</p>
            </div>
            <input required name="username" onInput={(e) => setUsername(e.target.value)} className="form-control" />
            <input required type='password' name="password" onInput={(e) => setPassword(e.target.value)} className="form-control" />
            <button
              type="button"
              onClick={logInUser}
              className="btn btn-primary account__btn">Log in</button><br/><br/>
              <span style={{fontSize:'0.8rem',color:'green'}}>{msg}</span>
          </div>
        </div>
      </div>
    );
}