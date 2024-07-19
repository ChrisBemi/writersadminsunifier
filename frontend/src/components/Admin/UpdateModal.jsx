import "./updatemodal.css";
import CloseIcon from "../../assets/icons/close.png";
import UpdateOrderDescription from "./Updatework/UpdateOrderDescription";
import UpdateOrderDateline from "./Updatework/UpdateOrderDateline";
import UpdateOrderFiles from "./Updatework/UpdateOrderFiles";
const UpdateModal = ({ handleUpdateModal,orderToUpdate }) => {
  return (
    <div className="modal-wrapper update">
      
       <div className="wrapper-container">
       <img src={CloseIcon} alt="" className="close-icon" onClick={handleUpdateModal}/>
        <div className="medium-header">UPDATE ORDER</div>
        <div className="grid">
          <div className="col">
            <UpdateOrderDescription orderToUpdate={orderToUpdate} />
          </div>
          <div className="col">
            <UpdateOrderDateline orderToUpdate={orderToUpdate} />
            <UpdateOrderFiles orderToUpdate={orderToUpdate} />
          </div>
        </div>
        <div
          className="row-buttons"
          style={{
            marginTop: "1rem",
            borderTop: "2px solid var(--blue)",
            width: "100%",
          }}
        >
          <button className="modal-btn" onClick={handleUpdateModal}>
            CANCEL
          </button>
          <button className="modal-btn">OK</button>
        </div>
       </div>
      
    </div>
  );
};

export default UpdateModal;
