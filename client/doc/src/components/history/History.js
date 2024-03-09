import useWebSocket from 'react-use-websocket';
// import './history.css'

export default function History() {
    const WS_URL = 'ws://127.0.0.1:3400';
    const isUserEvent = (message) => {
        let evt = JSON.parse(message.data);
        return evt.type === 'userevent';
    }
    const { lastJsonMessage } = useWebSocket(WS_URL, {
      share: true,
      filter: isUserEvent
    });
    
    const activities = lastJsonMessage?.data.userActivity || [];
    return (
      <ul>
        {activities.map((activity, index) => <li key={`activity-${index}`}>{activity}</li>)}
      </ul>
    );
  }