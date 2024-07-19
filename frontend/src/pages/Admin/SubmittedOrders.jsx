import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import Config from "../../Config";
import axios from "axios";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./submittedOrders.css";
import { showLoading, hideLoading } from "../../Redux/features/AlertSlice";
import Preloader from "../../Preloader/Preloader";
import RequestRevisionModal from "../../components/Admin/RequestRevisionModal";
import JSZip from "jszip";
const SubmittedOrders = () => {
  const [sidebar, showSidebar] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [workingOrder, setWorkingOrder] = useState([]);

  const [requestRevisionModal, setInRequestRevisionModal] = useState(false);

  const cancelInRevision = async (answerId, email, orderId) => {
    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/answers/${answerId}/cancel/revision`
      );

      if (!response.data.success) {
        toast.error(response.data.message);
      } else {
        toast.success(response.data.message);
        fetchData();
      }
    } catch (error) {
      toast.error("There was an error updating the revision status.");
      console.error(`There was an error: ${error}`);
    }
  };

  const deleteAnswer = async (answerId) => {
    try {
      const response = await axios.delete(
        `${Config.baseUrl}/api/answers/${answerId}/delete/answer`
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("There was an error deleting the answer.");
      console.error(`There was an error: ${error}`);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${Config.baseUrl}/api/answers/get`);
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error(`There was an error: ${error}`);
    }
  };

  const downloadZip = async (files, subject) => {
    try {
      const zip = new JSZip();
      const promises = files.map(async (file) => {
        const url = file.downloadURL;
        const response = await axios.get(url, { responseType: "arraybuffer" });
        zip.file(file, response.data);
      });

      await Promise.all(promises);
      zip.generateAsync({ type: "blob" }).then((content) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.setAttribute("download", `${subject}_assignment_files.zip`);

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
      });
    } catch (error) {
      console.error("Error downloading files:", error);
    }
  };

  const completeOrderButton = async (assignmentId, userId, amount) => {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/writers/complete/assignment/${userId}`,
        { assignmentId, amount },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred while completing the order.")
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };
  const handleInRevisionModal = () => {
    setInRequestRevisionModal(!requestRevisionModal);
  };

  const handleWorkingOrder = (order) => {
    setWorkingOrder(order);
  };

  return (
    <div className="admin submitted">
      <AdminNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="SUBMITTED ORDERS"
      />
      <AdminSidebar sidebar={sidebar} />
      <div className="container">
        <p className="empty"></p>
        <ToastContainer
          position="top-right"
        />
        <div className="table_wrapper">
          <table>
            <thead>
              <tr>
                <td>Order</td>
                <td>Writer</td>
                <td>Message</td>
                <td>Subject</td>
                <td>Created At</td>
                <td>State</td>
                <td>Delete</td>
                <td>View</td>
                <td>Revision/Cancel</td>
                <td>Completed?</td>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <p className="description">
                      There are no submitted orders!
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      {order.assignmentId ? order.assignmentId._id : "N/A"}
                    </td>
                    <td>
                      {order.writerId
                        ? `${order.writerId.firstName} ${order.writerId.lastName}`
                        : "N/A"}
                    </td>
                    <td style={{ maxWidth: "250px" }}>
                      {order?.description || "N/A"}
                    </td>
                    <td style={{ maxWidth: "250px" }}>
                      {order.assignmentId?.subject || "N/A"}
                    </td>
                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "N/A"}
                    </td>
                    <td>{order.category || "N/A"}</td>
                    <td>
                      <button
                        className="table-btn"
                        onClick={() => deleteAnswer(order._id)}
                      >
                        DELETE
                      </button>
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        onClick={() =>
                          downloadZip(order.files, order.assignmentId.subject)
                        }
                      >
                        VIEW
                      </button>
                    </td>
                    <td>
                      {order.inRevision ? (
                        <button
                          className="table-btn"
                          onClick={() => cancelInRevision(order._id)}
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          className="table-btn setInRevision"
                          onClick={() => {
                            handleWorkingOrder({
                              answerId: order._id,
                              email: order.writerId?.email || "",
                              orderId: order.assignmentId?._id || "",
                              subject: order.assignmentId?.subject || "",
                            });
                            handleInRevisionModal();
                          }}
                          style={{ border: "2px solid var(--success-color)" }}
                        >
                          Revision
                        </button>
                      )}
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        disabled={order.assignmentId?.completed}
                        style={
                          order.assignmentId?.completed
                            ? {
                                background: "var(--success-color)",
                                border: "2px solid var(--success-color)",
                              }
                            : null
                        }
                        onClick={() =>
                          completeOrderButton(
                            order.assignmentId?._id || "",
                            order.writerId?._id || "",
                            parseFloat(order.assignmentId?.charges) || 0
                          )
                        }
                      >
                        {order.assignmentId?.completed
                          ? "COMPLETED"
                          : "CONFIRM"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          className={`modal request-revision ${
            requestRevisionModal ? "active" : null
          }`}
        >
          <RequestRevisionModal
            handleInRevisionModal={handleInRevisionModal}
            workingOrder={workingOrder}
            fetchData={fetchData}
          />
        </div>
      </div>
    </div>
  );
};

export default SubmittedOrders;