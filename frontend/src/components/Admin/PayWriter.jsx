import Config from "../../Config";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PayWriter = ({ handleShowPayModal, fetchPendingWithdrawals, writerToPay }) => {
  const clearUserPayment = async () => {
    try {
      const response = await axios.delete(
        `${Config.baseUrl}/api/withdraw/${writerToPay._id}/delete`,
        {
          data: {
            writerId: writerToPay.writer._id,
            amount: writerToPay.amount,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.data.success) {
        fetchPendingWithdrawals();
        handleShowPayModal();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error clearing user payment:", error);
      toast.error("Failed to clear user payment. Please try again.");
    }
  };

  return (
    <div className="modal-wrapper">
      
      <p className="medium-header" style={{ color: "var(--blue)" }}>
        {`Are you sure you want to pay ${writerToPay?.writer?.firstName} ${writerToPay?.writer?.lastName}?`}
      </p>
      <div className="row-buttons">
        <button className="modal-btn" onClick={handleShowPayModal}>
          CANCEL
        </button>
        <button className="modal-btn" onClick={clearUserPayment}>
          OK
        </button>
      </div>
    </div>
  );
};

export default PayWriter;
