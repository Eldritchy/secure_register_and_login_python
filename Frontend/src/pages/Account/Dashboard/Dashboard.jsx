import { useSelector } from "react-redux";
import "./dashboard.css"

/**
 * Component for the User's Dashboard
 * 
 * 
 * @visibleName User Dashboard
 * @returns {React.ReactElement}
 * 
 */
function Dashboard() {
    const user = useSelector((state) => state.user);

    return (
        <div className="Dashboard">
            <h3>{user.name}'s Dashboard</h3>
            <section>
                <p>Set up the Dashboard with the content of your choice.</p>
            </section>
        </div>
    )
};
export default Dashboard;