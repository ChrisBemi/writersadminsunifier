import React, { useEffect, useState } from "react";
import axios from "axios";
import AccountNavbar from "../../../components/account/AccountNavbar/AccountNavbar";
import AccountSidebar from "../../../components/account/AccountSidebar/AccountSidebar";
import Config from "../../../Config";
import ".././Clients.css";
import "../InProgress/InProgress.css";
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [sidebar, showSidebar] = useState(false);

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const fetchUsers = async () => {
    if (!sessionStorage.getItem("userId")) return;
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/writers/assignments/${sessionStorage.getItem(
          "userId"
        )}/completed`
      );
      setOrders(response.data.data);
    } catch (error) {
      console.log(
        `There was an error accessing the data from the backend ${error.message}`
      );
    }
  };

  const downloadFiles = async (orderId) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/assignments/${orderId}/download`,
        {
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `assignment_${orderId}_files.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      console.log(`File downloaded successfully.`);
    } catch (error) {
      console.error(`Error downloading file: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [sessionStorage.getItem("userId")]);
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
        <div className="table_wrapper">
          <table>
            <thead>
              <tr>
                <td>Topic, Order Id, Customer Id</td>
                <td>Paper Details</td>
                <td>Time Assigned</td>
                <td>Completed at</td>
                <td>Amount</td>
                <td>Download File</td>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <p className="description">{order.category}</p>
                      <p className="description">{`Order Id: ${order._id}`}</p>
                    </td>
                    <td>
                      <p className="description">{order.subject}</p>
                    </td>
                    <td>
                      {" "}
                      <p className="description">{order.assignedAt}</p>{" "}
                    </td>
                    <td>
                      <p className="description">{order.completedAt}</p>
                    </td>
                    <td>
                      <p className="description">{order.charges}</p>
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        onClick={() => {
                          downloadFiles(order._id);
                        }}
                      >
                        GET FILES
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <p>No completed Orders</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
