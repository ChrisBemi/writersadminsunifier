import Config from "../../Config";
import axios from "axios";
const DeleteWriter = ({
  handleDeleteModal,
  writerToWorkWith,
  fetchWriters,
}) => {
  const deleteWriter = async () => {
    try {
      const response = await axios.delete(
        `${Config.baseUrl}/api/writers/${writerToWorkWith._id}/delete`
      );

      if (response.data.success) {
        await fetchWriters();
        console.log("Writer deleted successfully");
        handleDeleteModal();
      } else {
        console.log("There was a problem deleting data from the backend");
      }
    } catch (error) {
      console.log(
        `There was an error deleting data from the backend => ${error.message}`
      );
    }
  };
  return (
    <div className="modal-wrapper">
      <p
        className="medium-header"
        style={{ color: "var(--blue)" }}
      >{`Are you sure you want to delete '${writerToWorkWith.firstName} ${writerToWorkWith.lastName}'?`}</p>
      <div className="row-buttons">
        <button className="modal-btn" onClick={handleDeleteModal}>
          CANCEL
        </button>
        <button className="modal-btn" onClick={deleteWriter}>
          OK
        </button>
      </div>
    </div>
  );
};
export default DeleteWriter;
