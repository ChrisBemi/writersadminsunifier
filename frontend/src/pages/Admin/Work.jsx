import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import "./Admin.css";
import Config from "../../Config";
import axios from "axios";
import DeleteWork from "../../components/Admin/DeleteWork";
import { useEffect, useState } from "react";
import AssignWorkModal from "../../components/Admin/AssignWorkModal";
import "./write.css";

const WorkOrder = () => {
  const [deleteModal, showDeleteModal] = useState(false);
  const [work, setWork] = useState([]);
  const [workToDelete, setWorkToDelete] = useState(null);
  const [sidebar, showSidebar] = useState(false);
  const [workModal, setDisplayWorkModal] = useState(false);
  const [writerToAssign, setWriterToAssign] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Initially set to 1

  const handleWriterToAssign = (writer) => {
    setWriterToAssign(writer);
  };

  const handleDisplayWorkModal = () => {
    setDisplayWorkModal(!workModal);
  };

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const fetchWriters = async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/assignments/get?page=${page}&limit=8`
      );

      if (response.data.success) {
        setWork(response.data.data);
        // Update total pages based on returned data length and limit
        setTotalPages(response.data.totalPages);
      } else {
        console.log("There was a network problem fetching data");
      }
    } catch (error) {
      console.log("There was a problem accessing the server");
    }
  };

  useEffect(() => {
    fetchWriters();
  }, [page]);

  const handleDeleteModal = () => {
    showDeleteModal(!deleteModal);
  };

  const handleWorkToDelete = (order) => {
    setWorkToDelete(order);
  };

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const handlePrevPage = () => {
    window.scrollTo(0,0)
    setPage((prevPage) => prevPage - 1);
  };

  const handleNextPage = () => {
    window.scrollTo(0,0)
    setPage((prevPage) => prevPage + 1);
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
  return (
    <div className="admin work">
      <AdminNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="WORK ORDERS"
      />
      <AdminSidebar sidebar={sidebar} />
      <p className="empty"></p>
      <div className="container">
        {work.length > 0 ? (
          <div className="table_wrapper">
            <table>
              <thead>
                <tr>
                  <td>Order id</td>
                  <td>Subject</td>
                  <td>Uploaded at</td>
                  <td>Dateline</td>
                  <td>Time</td>
                  <td>Category</td>
                  <td>Pages</td>
                  <td>Words</td>
                  <td>Bid</td>
                  <td>Charges</td>
                  <td>Delete</td>
                  <td>Assign writer</td>
                </tr>
              </thead>
              <tbody>
                {work.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <p className="description">{order?._id}</p>
                    </td>
                    <td>
                      <p className="description">{order?.subject}</p>
                    </td>
                    <td>
                      <p className="description">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td>
                      <p className="description">
                        {new Date(order.dateline).toLocaleDateString()}
                      </p>
                    </td>
                    <td>
                      <p className="description">{order?.time}</p>
                    </td>
                    <td>
                      <p className="description">{order?.category}</p>
                    </td>
                    <td>
                      <p className="description">{order?.page}</p>
                    </td>
                    <td>
                      <p className="description">{order?.words}</p>
                    </td>
                    <td>
                      <p className="description">{`Bids: ${order.bid}`}</p>
                      {order.assigned ? (
                        <p
                          className="description"
                          style={{ color: "var(--success-color)" }}
                        >
                          Already Assigned
                        </p>
                      ) : (
                        order.writers.map((writer) => (
                          <div key={writer._id} className="individual-writer">
                            <p className="description">{`${writer.firstName} ${writer.lastName}`}</p>
                            <button
                              className="table-btn"
                              onClick={() => {
                                handleDisplayWorkModal();
                                handleWriterToAssign({
                                  ...writer,
                                  assignmentId: order._id,
                                });
                              }}
                              style={
                                order.assigned
                                  ? {
                                      color: "var(--dark-gold)",
                                      background: "transparent",
                                    }
                                  : null
                              }
                            >
                              {order.assigned ? "ASSIGNED" : "ASSIGN"}
                            </button>
                          </div>
                        ))
                      )}
                    </td>

                    <td>
                      <p className="description">{order?.charges}</p>
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        onClick={() => {
                          handleDeleteModal();
                          handleWorkToDelete(order);
                        }}
                      >
                        DELETE
                      </button>
                    </td>
                    <td>
                      <button className="table-btn">Assign</button>
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
      <div className={`modal delete ${deleteModal ? "active" : null}`}>
        <DeleteWork
          handleDeleteModal={handleDeleteModal}
          fetchWriters={fetchWriters}
          workToDelete={workToDelete}
        />
      </div>

      <div className={`modal assign ${workModal ? "active" : null}`}>
        <AssignWorkModal
          handleDisplayWorkModal={handleDisplayWorkModal}
          writerToAssign={writerToAssign}
          fetchWriters={fetchWriters}
        />
      </div>
    </div>
  );
};

export default WorkOrder;
