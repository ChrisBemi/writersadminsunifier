import CloseIcon from "../../assets/icons/close.png";
const JobDescription = ({ workingOrder, handleDescriptionModal }) => {
  return (
    <div className="modal-wrapper">
      <img
        src={CloseIcon}
        alt=""
        className="close-icon"
        onClick={handleDescriptionModal}
      />
      <p className="modals-header">{` ${workingOrder?.subject.toUpperCase()}  DESCRIPTION `}</p>
      <p>{workingOrder?.description}</p>
    </div>
  );
};

export default JobDescription;
