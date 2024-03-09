import Document from "../document/Document";
import History from "../history/History";
import Users from "../users/Users";
import './editor.css';

export default function Editor() {
    return (
      <div className="main-content">
        <div className="document-holder">
          <div className="currentusers">
            <Users/>
          </div>
          <Document/>
        </div>
        <div className="history-holder">
          <History/>
        </div>
      </div>
    );
}