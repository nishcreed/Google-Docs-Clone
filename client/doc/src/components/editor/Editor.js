import { useParams } from "react-router-dom";
import Document from "../document/Document";
import './editor.css';

export default function Editor({username}) {

  const { id } = useParams();
  return (
    <div className="main-content">
      <div className="document-holder">
        <Document id={id} username={username}/>
      </div>
    </div>
  );
}