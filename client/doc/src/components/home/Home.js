import './home.css'
export default function Home({msg}) {
    const newHandler = () => {
        
    }
    return (
        <div className="home">
            <ul>

            </ul>
            <br></br>
            <br></br>
            <form>
                <input type='text' style={{pointerEvents:msg==''?'none':'auto'}} placeholder='Enter document name' id='newDoc'/>
                <button onClick={newHandler} className="btn btn-primary" style={{pointerEvents:msg==''?'none':'auto'}}>New document</button>
            </form> 
            
            <br></br>
            {msg=='' && <span style={{fontSize:'0.8rem',color:'green'}}>Log in to create a new document</span>}
        </div>
    )
}