import "./AdminSidebar.css";
import { NavLink } from "react-router-dom";

const AdminSidebar = ({ sidebar }) => {
  return (
    <div className={`admin sidebar ${sidebar ? "active" : ""}`}>
      <div className="sidebar_navigation">
        <NavLink to="/admin/add-work" activeClassName="active">
          <p>
            <i className="fas fa-plus-circle"></i>
            Add Work
          </p>
        </NavLink>

        <NavLink to="/admin/writers" activeClassName="active">
          <p>
            <i className="fas fa-users"></i>
            Writers
          </p>
        </NavLink>
        <NavLink to="/admin/work-order" activeClassName="active">
          <p>
            <i className="fas fa-tasks"></i>
            Work Orders
          </p>
        </NavLink>
        <NavLink to="/admin/assigned-orders" activeClassName="active">
          <p>
            <i className="fas fa-edit"></i>
            Update Order
          </p>
        </NavLink>
        <NavLink to="/admin/submitted-work" activeClassName="active">
          <p>
            <i className="fas fa-tasks"></i>
            Submitted Orders
          </p>
        </NavLink>
        <NavLink to="/admin/withdrawals" activeClassName="active">
          <p>
            <i className="fas fa-tasks"></i>
            Withdrawals
          </p>
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;
