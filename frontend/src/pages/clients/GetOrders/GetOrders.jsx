import React, { useState, useEffect } from "react";
import axios from "axios";
import Config from "../../../Config";
import AccountNavbar from "../../../components/account/AccountNavbar/AccountNavbar";
import AccountSidebar from "../../../components/account/AccountSidebar/AccountSidebar";
import BindingModal from "./BindingModal";
import ".././Clients.css";
import "./GetOrders.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GetOrders = () => {
  const [bindModal, showBindModal] = useState(false);
  const [work, setWork] = useState([]);
  const [sidebar, showSidebar] = useState(false);
  const [job, setJob] = useState(null);
  const [countdowns, setCountdowns] = useState({});

  const handleShowBindModal = () => {
    showBindModal(!bindModal);
  };

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const handleOrderToBind = (job) => {
    setJob(job);
  };

  const fetchWriters = async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/assignments/get/unassigned`
      );

      if (response.data.success) {
        setWork(response.data.data || []);
      } else {
        toast.error("There was a problem fetching data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("There was a problem accessing the server");
    }
  };

  const calculateRemainingTime = (dueDate, time) => {
    const now = new Date().getTime();

    // Combine dueDate and time properly
    const dueDateTimeString = `${dueDate.split("T")[0]}T${time}`;

    // Parse dueDateTimeString into a Date object
    const dueDateTime = new Date(dueDateTimeString).getTime();

    if (isNaN(dueDateTime)) {
      return { timeString: "Invalid date/time", overdue: false, penalty: 0 };
    }

    const distance = dueDateTime - now;
    const overdue = distance < 0;
    const absDistance = Math.abs(distance);

    const days = Math.floor(absDistance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (absDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((absDistance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absDistance % (1000 * 60)) / 1000);

    const timeString = overdue
      ? `Expired ${days}d ${hours}h ${minutes}m ${seconds}s ago`
      : `${days}d ${hours}h ${minutes}m ${seconds}s`;

    return { timeString, overdue };
  };

  useEffect(() => {
    fetchWriters();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedCountdowns = work.reduce((acc, order) => {
        acc[order._id] = calculateRemainingTime(order.dateline, order.time);
        return acc;
      }, {});
      setCountdowns(updatedCountdowns);
    }, 1000); // Update countdowns every second

    return () => clearInterval(interval);
  }, [work]);

  const checkIfUserHasBid = (order) => {
    if (!sessionStorage.getItem("userId") || !order.writers) {
      return false;
    }
    return order.writers.some(
      (writer) => writer._id === sessionStorage.getItem("userId")
    );
  };

  return (
    <>
      <div className="orders account">
        <AccountNavbar
          sidebar={sidebar}
          handleShowSidebar={handleShowSidebar}
          title="GET ORDERS"
        />
        <AccountSidebar sidebar={sidebar} />
        <div className="container">
          <p className="empty"></p>
          <p className="medium-header" style={{ color: "var(--blue)" }}>
            Once you have placed a bid and the company has assigned you the
            work,
            <br />
            The work will reflect In progress page!
            <br />
            Kindly submit the work on time! Any delay will cost you 1shilling
            per minute
          </p>
          {work.length > 0 && (
            <div className="table_wrapper">
              <table>
                <thead>
                  <tr>
                    <td>Topic, Order ID</td>
                    <td>Paper Details</td>
                    <td>Description</td>
                    <td>Due Date</td>
                    <td>Pages</td>
                    <td>Words</td>
                    <td>Bids</td>
                    <td>Charge</td>
                  </tr>
                </thead>
                <tbody>
                  {work.map(
                    (order) =>
                      !checkIfUserHasBid(order) && (
                        <tr key={order._id}>
                          <td>
                            <p className="description">{order.subject}</p>
                            <p className="description">{`Order ID: ${order._id}`}</p>
                            <button className="table-btn">Stem</button>
                          </td>
                          <td>
                            <p className="description">{order.category}</p>
                            <p className="description">
                              <button
                                className="table-btn"
                                style={
                                  checkIfUserHasBid(order)
                                    ? {
                                        background: "transparent",
                                        color: "var(--pinkRed)",
                                      }
                                    : null
                                }
                                onClick={() => {
                                  handleShowBindModal();
                                  handleOrderToBind(order);
                                }}
                              >
                                {checkIfUserHasBid(order) ? "cancel" : "BID"}
                              </button>
                            </p>
                          </td>
                          <td>
                            <p className="description">{order?.description}</p>
                          </td>
                          <td>
                            <div className="time-container">
                              <p className="description">
                                Submit by: {order.dateline.split("T")[0]} at{" "}
                                {order.time}
                              </p>
                              {countdowns[order._id]?.overdue ? (
                                <p className="description">Expired</p>
                              ) : (
                                <p className="description">
                                  {countdowns[order._id]?.timeString}
                                </p>
                              )}
                              <p className="description">Time: {order.time}</p>
                            </div>
                          </td>
                          <td>
                            <p className="description descriptive-text">
                              {order.page}
                            </p>
                          </td>
                          <td>
                            <p className="description descriptive-text">
                              {order.words}
                            </p>
                          </td>
                          <td>
                            <p className="description descriptive-text">
                              {order.bid}
                            </p>
                          </td>
                          <td>
                            <p className="description descriptive-text">{`Sh.${order.charges}`}</p>
                          </td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <BindingModal
          handleShowBindModal={handleShowBindModal}
          bindModal={bindModal}
          job={job}
          fetchWriters={fetchWriters}
        />
      </div>
      <ToastContainer />
    </>
  );
};

export default GetOrders;
