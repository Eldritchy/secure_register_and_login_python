import { Outlet, NavLink } from "react-router-dom"
import { Helmet } from "react-helmet-async";
import "./adminArea.css"

// TODO: Logs and Tasks

function AdminArea() {

    return (
        <div className="AdminArea">
            <Helmet>
                <title>Admin Dashboard</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <h2>Admin Area</h2>
            <nav role="navigation" aria-labelledby="secondLabel" aria-label="Secondary">
                <ul>
                    <li>
                        <NavLink to="admindashboard" >Dashboard</NavLink>
                    </li>
                    <li>
                        <NavLink to="users" >Users</NavLink>
                    </li>
                    <li>
                        <NavLink to="messages" >Messages</NavLink>
                    </li>
                </ul>
            </nav>
            <Outlet />
        </div>
    );
}

export default AdminArea;