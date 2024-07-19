import React, { useState, useEffect } from "react";
import axios from "axios";
import AccountNavbar from "../../../components/account/AccountNavbar/AccountNavbar";
import AccountSidebar from "../../../components/account/AccountSidebar/AccountSidebar";
import User from "../../../assets/icons/user.png";
import ".././Clients.css";
import "./Profile.css";
import UploadIcon from "../../../assets/icons/upload (1).png";
import UpdateDescription from "./UpdateDescription";
import UpdateName from "./UpdateName";
import UpdateEmail from "./UpdateEmail";
import UpdatePhone from "./UpdatePhone";
import UpdatePassword from "./UpdatePassword";
import Config from "../../../Config";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [sidebar, showSidebar] = useState(false);

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  useEffect(() => {
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
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="account profile">
      <AccountNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="PROFILE"
      />
      <AccountSidebar sidebar={sidebar} />
      <p className="empty"></p>

      <div className="container">
        <p>
          ONCE YOU HAVE MADE CHANGES KINDLY REFRESH THE BROWSER FOR EFFECTS TO
          TAKE PLACE
        </p>
        <div className="profile-container">
          <div className="col">
            <div className="image-wrapper">
              <img src={User} alt="User" />
            </div>
            <div className="upload">
              <img src={UploadIcon} alt="Upload Icon" className="uploadIcon" />
              <input type="submit" value="SAVE" className="submit-btn" />
            </div>
            <div className="profile-details">
              <div className="row">
                <p>Name</p>
                <p>{`${user.firstName} ${user.lastName}`}</p>
              </div>
              <div className="row">
                <p>Email</p>
                <p>{user.email}</p>
              </div>
              <div className="row">
                <p>Phone</p>
                <p>{user.phoneNo}</p>
              </div>
              <div className="row">
                <p>Course</p>
                <p>{user.qualifications}</p>
              </div>
              <div className="description">{user.description}</div>
            </div>
          </div>
          <div className="col">
            <UpdateDescription user={user} />
            <UpdateName />
            <UpdateEmail />
            <UpdatePhone user={user} />
            <UpdatePassword />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;