import useWebSocket, { ReadyState } from 'react-use-websocket';
import Avatar from 'react-avatar';
import { UncontrolledTooltip } from 'reactstrap';
import './users.css';

export default function Users() {
    const WS_URL = 'ws://127.0.0.1:3400';
    function isUserEvent(message) {
        let evt = JSON.parse(message.data);
        return evt.type === 'userevent';
    }
    const { lastJsonMessage } = useWebSocket(WS_URL, {
      share: true,
      filter: isUserEvent
    });
    const users = Object.values(lastJsonMessage?.data.users || {});
    return users.map(user => (
      <div key={user.username}>
        <span id={user.username} className="userInfo" key={user.username}>
          <Avatar name={user.username} size={40} round="20px"/>
        </span>
        <UncontrolledTooltip placement="top" target={user.username}>
          {user.username}
        </UncontrolledTooltip>
      </div>
    ));
}