import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import "./Admin.css";
import "./AddWrite.css";
import Config from "../../Config";
import axios from "axios";
import { useEffect, useState } from "react";
import PayWriter from "../../components/Admin/PayWriter";
import "./AdminWithdrawal.css";

const AdminWithdrawal = () => {
  const [withdrawals, setWithdrawals] = useState(null);
  const [sidebar, showSidebar] = useState(false);
  const [payModal, showPayModal] = useState(false);

  const [writerToPay, setWriterToPay] = useState(null);

  const handleWriterToPay = (writer) => {
    setWriterToPay(writer);
  };

  const handleShowPayModal = () => {
    showPayModal(!payModal);
  };

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const fetchPendingWithdrawals = async () => {
    try {
      const response = await axios.get(`${Config.baseUrl}/api/withdraw/get`);

      if (response.data.success) {
        setWithdrawals(response.data.data);
      } else {
        console.log(`There was network issues fetching data from the backend`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPendingWithdrawals();
  }, [sessionStorage.getItem("userId")]);

  return (
    <div className="admin withdrawals">
      <AdminNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="ADMIN WITHDRAWALS"
      />
      <AdminSidebar sidebar={sidebar} />
      <p className="empty"></p>
      <div className="container">
        <div className="table_wrapper">
          {withdrawals ? (
            <table>
              <thead>
                <tr>
                  <td>NAME</td>
                  <td>EMAIL</td>
                  <td>AMOUNT</td>
                  <td>PHONE NO</td>
                  <td>REQUESTED ON</td>
                  <td>CLEAR</td>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal._id}>
                    <td>
                      {withdrawal.writer.firstName} {withdrawal.writer.lastName}
                    </td>
                    <td>{withdrawal.writer.email}</td>
                    <td>{withdrawal.amount}</td>
                    <td>{withdrawal.phoneNo}</td>
                    <td>{withdrawal.amount}</td>
                    <td>
                      <button
                        className="table-btn"
                        onClick={() => {
                          handleShowPayModal();
                          handleWriterToPay(withdrawal);
                        }}
                      >
                        CLEAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>NO WITHDRAWALS REQUESTS</p>
          )}
        </div>
      </div>

      <div className={`modal pay-writer ${payModal ? "active" : null}`}>
        <PayWriter
          handleShowPayModal={handleShowPayModal}
          fetchPendingWithdrawals={fetchPendingWithdrawals}
          writerToPay={writerToPay}
        />
      </div>
    </div>
  );
};

export default AdminWithdrawal;
