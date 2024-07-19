import "./AccountNavbar.css";
import { Link } from "react-router-dom";
import UserLogo from "../../../assets/icons/user.png";
import MenuIcon from "../../../assets/icons/menu_bar.png";
import { useState, useEffect } from "react";
import axios from "axios";
import Config from "../../../Config";

const AccountNavbar = ({ sidebar, handleShowSidebar, title }) => {
  const [user, setUser] = useState(null);
  const [displayDropDown, setDisplayDropDown] = useState(false);
  const [loading, setLoading] = useState(true); // State to manage loading state

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/users/${sessionStorage.getItem("userId")}`
      );
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false); // Set loading to false after fetch completes
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("userId")) {
      fetchUser();
    }
  }, [sessionStorage.getItem("userId")]);

  const handleDisplayDropDown = () => {
    setDisplayDropDown(!displayDropDown);
  };

  if (loading) {
    return (
      <nav className="navbar">
        <p>Loading...</p>
      </nav>
    );
  }

  if (!user) {
    return (
      <nav className="navbar">
        <p>Error fetching user data.</p>
      </nav>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <nav className="navbar">
      <div className="container flex">
        <div className="menu-icon" onClick={handleShowSidebar}>
          <img src={MenuIcon} alt="Menu" />
        </div>

        <div className="middle-navigation">
          <p className="description">SYSTEM ID:{user.systemId}</p>
          <p className="description">{`AMOUNT:${user.amount}`}</p>
          <p className="description">{title}</p>
          <p className="description">ACCOUNT</p>
        </div>

        <div className="middle-navigation mobile">
          <p className="description" style={{ fontSize: "12px", fontWeight: "600" }}>
            USER ID:002
          </p>
          <p className="description" style={{ fontSize: "12px", fontWeight: "600" }}>
            {title}
          </p>
        </div>

        <div className="profile-section flex">
          <div className="img-wrapper">
            <Link to="/client/profile">
              <img src={UserLogo} alt="Profile" className="profile-image" />
            </Link>
          </div>
          <div className="arrow" onClick={handleDisplayDropDown}>
            <p>
              <i className="fa fa-caret-up"></i>
            </p>
          </div>
          <div className={`drop-down ${displayDropDown ? "active" : ""}`}>
            {isAdmin && (
              <Link to="/admin/add-work">
                <button className="medium-btns">ADMIN</button>
              </Link>
            )}
            <Link to="/">
              <button className="medium-btns">HOME</button>
            </Link>
            <Link to="/logout">
              <button className="medium-btns">LOGOUT</button>
            </Link>
            
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AccountNavbar;
