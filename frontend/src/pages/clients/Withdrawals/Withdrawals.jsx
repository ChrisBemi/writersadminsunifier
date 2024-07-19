import React, { useState, useEffect } from "react";
import AccountNavbar from "../../../components/account/AccountNavbar/AccountNavbar";
import AccountSidebar from "../../../components/account/AccountSidebar/AccountSidebar";
import Config from "../../../Config";
import axios from "axios";
import WithDrawalForm from "./WithDrawalForm";
import ".././Clients.css";
import "./Withdrawals.css";

const Withdrawals = () => {
  const [sidebar, showSidebar] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const fetchPendingWithdrawals = async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/withdraw/get/${sessionStorage.getItem("userId")}`
      );
      if (response.data.success) {
        setWithdrawals(response.data.data);
      }
    } catch (error) {
      console.log(`There was an error fetching withdrawals from the backend`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingWithdrawals();
  }, [sessionStorage.getItem("userId")]);

  return (
    <div className="account withdrawal">
      <AccountNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="WITHDRAWALS"
      />
      <AccountSidebar sidebar={sidebar} />
      <p className="empty"></p>

      <div className="container">
        <p className="large-headers">WITHDRAWAL MONEY</p>
        <p className="medium-header">
          Note all money will be sent via M-PESA,
          <br /> So only provide SAFARICOM NUMBER!
          <br /> MINIMUM WITHDRAWABLE IS 2000SHILLINGS
        </p>
        <div className="grid">
          <div className="pending table_wrapper">
            <p className="large-headers">YOUR PENDING WITHDRAWALS</p>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table-container">
                <thead>
                  <tr>
                    <td>AMOUNT</td>
                    <td>REQUESTED ON</td>
                    <td>NO</td>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.length > 0 ? (
                    withdrawals.map((withdrawal) => (
                      <tr key={withdrawal._id}>
                        <td className="description">{withdrawal.amount}</td>
                        <td className="description">
                          {new Date(
                            withdrawal.requestedOn
                          ).toLocaleDateString()}
                        </td>
                        <td className="description">{withdrawal.phoneNo}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="description">
                        No pending withdrawals
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          <WithDrawalForm fetchPendingWithdrawals={fetchPendingWithdrawals} />
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
