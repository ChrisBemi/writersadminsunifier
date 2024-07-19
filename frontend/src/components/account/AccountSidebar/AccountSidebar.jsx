import React from "react";
import { NavLink } from "react-router-dom";
import useUser from "../../../userUser";
import "./AccountSidebar.css";

const AccountSidebar = ({ sidebar }) => {
  const user = useUser();

  return (
    <div className={`account sidebar ${sidebar ? "active" : ""}`}>
      <div className="sidebar_navigation">
        <NavLink
          to="/client/get-orders"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <p>
            <i className="fas fa-box"></i>
            Get Orders
          </p>
        </NavLink>
        <NavLink
          to="/writer/my-bids"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <p>
            <i className="fas fa-gavel"></i>
            My Bids <sup>{user.bidsCount}</sup>
          </p>
        </NavLink>
        <NavLink
          to="/client/in-progress"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <p>
            <i className="fas fa-tasks"></i>
            In Progress <sup>{user.inProgressCount}</sup>
          </p>
        </NavLink>
        <NavLink
          to="/writer/in-review"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <p>
            <i className="fas fa-tasks"></i>
            In Review <sup>{user.inReviewCount}</sup>
          </p>
        </NavLink>
        <NavLink
          to="/client/complete-orders"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <p>
            <i className="fas fa-check"></i>
            Completed <sup>{user.completedCount}</sup>
          </p>
        </NavLink>
        <NavLink
          to="/client/in-revision"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <p>
            <i className="fas fa-sync"></i>
            In Revision <sup>{user.revisionCount}</sup>
          </p>
        </NavLink>
        <NavLink
          to="/writer/withdrawals"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <p>
            <i className="fas fa-money-bill-wave"></i>
            Make Withdrawals
          </p>
        </NavLink>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <p>
            <i className="fas fa-home"></i>
            Home
          </p>
        </NavLink>
        <NavLink
          to="/logout"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <p>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </p>
        </NavLink>
      </div>
    </div>
  );
};

export default AccountSidebar;
