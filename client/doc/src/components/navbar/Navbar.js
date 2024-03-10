import { Link } from "react-router-dom";

export default function Navbar(){
    return (
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
                {/* <a class="navbar-brand" href="#">Navbar</a> */}
                <Link className="navbar-brand" to={'/'}>Real-time document editor</Link>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                    <Link className="nav-link" to={'/register'}>Register</Link>
                    </li>
                    <li class="nav-item">
                    <Link className="nav-link" to={'/login'}>Login</Link>
                    </li>
                </ul>
                </div>
            </div>
        </nav>
    )
}
