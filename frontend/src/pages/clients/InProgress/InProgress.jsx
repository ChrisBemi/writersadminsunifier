import React, { useEffect, useState } from "react";
import axios from "axios";
import AccountNavbar from "../../../components/account/AccountNavbar/AccountNavbar";
import AccountSidebar from "../../../components/account/AccountSidebar/AccountSidebar";
import Config from "../../../Config";
import ".././Clients.css";
import "./InProgress.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SubmitOrders from "../SubmitOrders/SubmitOrders";
import JobDescription from "../../../components/Admin/JobDescription";
import JSZip from "jszip";
const InProgress = () => {
  const [orders, setOrders] = useState([]);
  const [sidebar, showSidebar] = useState(false);
  const [countdowns, setCountdowns] = useState({});
  const [loading, setLoading] = useState(true);
  const [workingOrder, setWorkingOrder] = useState(null);
  const [submitModal, displaySubmitModal] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [descriptionModal, showDescriptionModal] = useState(false);
  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const fetchUserWork = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/writers/assignments/${userId}`
      );
      setOrders(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error(`Error accessing data from the backend: ${error.message}`);
    }
  };

  const handleDownloadAllFiles = async (files, subject, name) => {
    const zip = new JSZip();
  
    try {
      const promises = files.map(async (file) => {
        const url = `${file.downloadURL}`;
        try {
          const response = await axios.get(url, { responseType: "arraybuffer" });
          if (response.data) {
            zip.file(file.fileName, response.data);
          } else {
            console.error(`Empty response for file ${file.fileName}`);
          }
        } catch (error) {
          console.error(`Error fetching file ${file.fileName}:`, error);
          // Handle error or notify the user
        }
      });
  
      await Promise.all(promises);
  
      zip.generateAsync({ type: "blob" }).then((content) => {
        // Create a temporary anchor element
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.setAttribute("download", `${subject}_${name}_assignment_files.zip`);
  
        // Append the anchor element to the body and trigger the download
        document.body.appendChild(link);
        link.click();
  
        // Clean up: remove the temporary anchor element
        document.body.removeChild(link);
      });
    } catch (error) {
      console.error("Error creating zip file:", error);
      // Handle zip generation error or notify the user
    }
  };
  
  
  const calculateRemainingTime = (dueDate, time, orderId) => {
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

    return {
      timeString,
      overdue,
      minutes: Math.floor(absDistance / (1000 * 60)),
    };
  };

  const updatePenalty = async (assignmentId, delayMinutes) => {
    try {
      const penaltyAmount = delayMinutes * 5; // Assuming 5 bob per minute
      const response = await axios.put(
        `${Config.baseUrl}/api/assignments/${assignmentId}/update/penalty`,
        { penalty: penaltyAmount }
      );
      if (response.data.success) {
        fetchUserWork(); // Refresh the order list after updating penalty
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred while updating penalty");
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("userId")) {
      fetchUserWork();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns((prevCountdowns) => {
        const updatedCountdowns = orders.reduce((acc, order) => {
          const { timeString, overdue, minutes } = calculateRemainingTime(
            order.dateline,
            order.time,
            order._id
          );

          acc[order._id] = {
            timeString,
            overdue,
            minutes,
            penalty: order.penalty,
          };

          return acc;
        }, {});
        return updatedCountdowns;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  useEffect(() => {
    const interval = setInterval(() => {
      orders.forEach((order) => {
        const { overdue, minutes } = calculateRemainingTime(
          order.dateline,
          order.time,
          order._id
        );

        if (overdue && !order.penaltyUpdated) {
          updatePenalty(order._id, minutes);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [orders]);

  const handleWorkingWork = (order) => {
    setWorkingOrder(order);
  };

  const handleSubmitModal = () => {
    displaySubmitModal(!submitModal);
  };

  useEffect(() => {
    const filtered = orders.filter((order) => {
      const orderIdMatch = order._id
        .toLowerCase()
        .includes(filterText.toLowerCase());
      const subjectMatch = order.subject
        .toLowerCase()
        .includes(filterText.toLowerCase());
      return orderIdMatch || subjectMatch;
    });
    setFilteredOrders(filtered);
  }, [filterText, orders]);

  const handleDescriptionModal = () => {
    showDescriptionModal(!descriptionModal);
  };

  return (
    <div className="progress account">
      <AccountNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="IN PROGRESS"
      />
      <p className="empty"></p>
      <AccountSidebar sidebar={sidebar} />
      <div className="container">
        <p>
          Once you've submitted the work! If it coincides with the client's
          specification, it will be completed then If there is penalty, it will
          be deducted from the the cost of the work!
          <br />
          If the work is not upto standards the client will require you to carry
          out revision! Meanwhile total charges - any penalties will only be
          after the client has presided over the work with the utmost degree of
          satisfaction!
        </p>
        <div className="search_container">
          <div className="input-group">
            <input
              type="text"
              name="search"
              id=""
              placeholder="Filter by orderId or subject"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <button>
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
        <ToastContainer />
        <div className="table_wrapper">
          <table>
            <thead>
              <tr>
                <td>Order Id</td>
                <td>Paper Details</td>
                <td className="due-time">Due Date</td>
                <td>Time Assigned</td>
                <td className="penalties">Penalty</td>
                <td>Get files</td>
                <td>Submit order</td>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) =>
                  order.assigned ? (
                    <tr key={order._id}>
                      <td>
                        <p className="description">Order Id: {order._id}</p>
                      </td>
                      <td>
                        <p className="description">{order.category}</p>
                        <p className="description">{order.subject}</p>
                      </td>
                      <td className="due-time">
                        <div className="time-container">
                          <p className="description">
                            Submit by: {order.dateline.split("T")[0]} at{" "}
                            {order.time}
                          </p>
                          <p className="description">
                            {countdowns[order._id]?.timeString}
                          </p>
                        </div>
                      </td>
                      <td>
                        <p className="description">{order.assignedAt}</p>
                      </td>
                      <td className="penalties">
                        <p className="description">Sh. {order.penalty}</p>
                      </td>
                      <td>
                        {order.files.length < 1 ? (
                          <button
                            className="table-btn"
                            style={{
                              background: "var(--success-color)",
                              border: "2px solid var(--success-color)",
                            }}
                            onClick={() => {
                              handleWorkingWork(order);
                              handleDescriptionModal();
                            }}
                          >
                            DESCRIPTION
                          </button>
                        ) : (
                          <button
                            className="table-btn"
                            onClick={() => {
                              handleDownloadAllFiles(
                                order.files,
                                order.subject,
                                "assignments"
                              );
                            }}
                          >
                            Download
                          </button>
                        )}
                      </td>
                      <td>
                        <button
                          className="table-btn"
                          onClick={() => {
                            handleWorkingWork(order);
                            handleSubmitModal();
                          }}
                        >
                          Submit
                        </button>
                      </td>
                    </tr>
                  ) : null
                )
              ) : (
                <tr>
                  <td colSpan="6">
                    <p>There is no order in progress!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          className={`submit-orders account modal ${
            submitModal ? "active" : null
          } `}
        >
          <SubmitOrders
            workingOrder={workingOrder}
            handleSubmitModal={handleSubmitModal}
            fetchUserWork={fetchUserWork}
          />
        </div>
        <div
          className={`modal see-work-description ${
            descriptionModal ? "active" : null
          }`}
        >
          <JobDescription
            workingOrder={workingOrder}
            handleDescriptionModal={handleDescriptionModal}
          />
        </div>
      </div>
    </div>
  );
};

export default InProgress;
