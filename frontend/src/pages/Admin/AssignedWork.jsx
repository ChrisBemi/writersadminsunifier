import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import "./AssignedWork.css";
import axios from "axios";
import Config from "../../Config";
import { useEffect, useState } from "react";
import UpdateModal from "../../components/Admin/UpdateModal";
import UpdateOrderDateline from "../../components/Admin/Updatework/UpdateOrderDateline";

const AssignedWork = () => {
  const [sidebar, showSidebar] = useState(false);
  const [orders, setOrders] = useState([]);
  const [updateModal, showUpdateModal] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleOrderToUpdate = (order) => {
    setOrderToUpdate(order);
  };

  const handleUpdateModal = () => {
    showUpdateModal(!updateModal);
  };

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const fetchAssignedAssignments = async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/assignments/get?page=${page}&limit=8`
      );
      setOrders(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(`Error fetching the data: ${error.message}`);
      alert("Failed to fetch assignments. Please try again later.");
    }
  };

  useEffect(() => {
    fetchAssignedAssignments();
  }, [page]);

  const downloadFiles = async (orderId) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/assignments/${orderId}/download`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `assignment_${orderId}_files.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Error downloading files: ${error.message}`);
      alert("Failed to download files. Please try again later.");
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      const buttonClass =
        i === page ? "navigation-btns current-page" : "navigation-btns";
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={buttonClass}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  const handlePrevPage = () => {
    window.scrollTo(0, 0);
    setPage((prevPage) => prevPage - 1);
  };

  const handleNextPage = () => {
    window.scrollTo(0, 0);
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <div className="admin assign">
      <AdminNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="ASSIGNED WORK"
      />
      <AdminSidebar sidebar={sidebar} />
      <p className="empty"></p>
      <div className="container">
        {orders.length > 0 ? (
          <div className="table_wrapper">
            <table>
              <thead>
                <tr>
                  <td className="description">ORDER ID</td>
                  <td className="description">SUBJECT</td>

                  <td className="description">DATELINE</td>
                  <td className="description">TIME</td>
                  <td className="description">CATEGORY</td>
                  <td className="description">PAGES</td>
                  <td className="description">WORDS</td>
                  <td className="description">CHARGES</td>
                  <td className="description">DOWNLOAD</td>
                  <td className="description">UPDATE</td>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <p className="description">{order._id}</p>
                    </td>
                    <td>
                      <p className="description">{order.subject}</p>
                    </td>

                    <td>
                      <p className="description">
                        {new Date(order.dateline).toLocaleDateString()}
                      </p>
                    </td>
                    <td>
                      <p className="description">{order.time}</p>
                    </td>
                    <td>
                      <p className="description">{order.category}</p>
                    </td>
                    <td>
                      <p className="description">{order.page}</p>
                    </td>
                    <td>
                      <p className="description">{order.words}</p>
                    </td>
                    <td>
                      <p className="description">{order.charges}</p>
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        onClick={() => downloadFiles(order._id)}
                      >
                        GET FILES
                      </button>
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        onClick={() => {
                          handleUpdateModal();
                          handleOrderToUpdate(order);
                        }}
                      >
                        UPDATE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No work found</p>
        )}
        <div className="pagination" style={{ marginTop: "10px" }}>
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className="navigation-btns"
          >
            Prev
          </button>
          {renderPageNumbers()}
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="navigation-btns"
          >
            Next
          </button>
        </div>
      </div>

      <div className={`modal update ${updateModal ? "active" : ""}`}>
        <UpdateModal
          orderToUpdate={orderToUpdate}
          handleUpdateModal={handleUpdateModal}
        />
      </div>
    </div>
  );
};

export default AssignedWork;
