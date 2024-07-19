import React, { useState, useRef } from "react";
import axios from "axios";
import ".././Clients.css";
import "./SubmitOrders.css";
import UploadIcon from "../../../assets/icons/upload (1).png";
import Config from "../../../Config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useDispatch, useSelector } from "react-redux";

import { showLoading, hideLoading } from "../../../Redux/features/AlertSlice";

import Preloader from "../../../Preloader/Preloader";

const SubmitOrders = ({ workingOrder, handleSubmitModal, fetchUserWork }) => {

  const dispatch = useDispatch()

  const loading = useSelector((state) => state.alerts.loading);
  const writerId = sessionStorage.getItem("userId");
  const [sidebar, showSidebar] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleDeleteFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setCategoryError("");

    setSubmissionMessage("");

    if (!category.trim()) {
      setCategoryError("Category is required.");
      return;
    }

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("assignmentId", workingOrder._id);
      if (description.trim()) {
        formData.append("description", description);
      }
      formData.append("category", category);
      formData.append("writerId", sessionStorage.getItem("userId"));

      dispatch(showLoading());

      const response = await axios.post(
        `${Config.baseUrl}/api/answers/post`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      dispatch(hideLoading());

      console.log(response.data);
      if (response.data.success) {
        setCategory("");
        setSelectedFiles([])
        fetchUserWork();
        handleSubmitModal();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while submitting the order.");
      }
    }
  };

  return (
    <>
      <div className="modal-wrapper account">
        <p
          className=""
          style={{
            color: "var(--blue)",
            textAlign: "center",
            textDecoration: "underline",
          }}
        >
          {`SUBMIT ${workingOrder?.subject.toUpperCase()}`}
        </p>
        <p className="" style={{ color: "var(--blue)", textAlign: "center" }}>
          Once you have submitted the work, wait for admin to approve your work.
          If it's viable, your amount in this system will be updated! If the
          work is not right, you'll be needed to revise it.
        </p>
        <div className="container">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <form onSubmit={handleSubmit} noValidate>
            <div className="input_group">
              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">SELECT CATEGORY</option>
                <option value="draft">DRAFT</option>
                <option value="final">FINAL</option>
              </select>
              {categoryError && <p className="error">{categoryError}</p>}
            </div>
            <div className="input_group" style={{ marginTop: "0.5rem" }}>
              <textarea
                name="description"
                cols="30"
                rows="10"
                placeholder="Write comment on the assignment kindly, if it's a revision kindly state.."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="uploads">
              <div className="input_group">
                <img
                  src={UploadIcon}
                  className="upload-icon"
                  onClick={() => fileInputRef.current.click()} // Click the file input when upload icon is clicked
                  style={{ cursor: "pointer" }}
                  alt="Upload Icon"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  multiple // Allow multiple file selection
                />
              </div>
              <div className="uploaded-files">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-preview">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      className="table-btn"
                      onClick={() => handleDeleteFile(index)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="row-buttons" style={{ marginTop: "2rem" }}>
              <button className="modal-btn" onClick={handleSubmitModal}>
                CANCEL
              </button>
              <button type="submit" className="modal-btn">
                OK
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading && <Preloader />}
    </>
  );
};

export default SubmitOrders;
