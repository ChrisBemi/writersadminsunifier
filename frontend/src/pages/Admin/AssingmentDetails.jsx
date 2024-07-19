import React, { useState, useRef } from "react";
import axios from "axios";
import UploadIcon from "../../assets/icons/upload (1).png";
import { hideLoading, showLoading } from "../../Redux/features/AlertSlice";

import Preloader from "../../Preloader/Preloader";

import { useSelector, useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AssignmentDetails = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.alerts.loading);
  const [formData, setFormData] = useState({
    page: "",
    words: "",
    subject: "",
    dateline: "",
    time: "",
    category: "",
    charges: "",
    files: [],
  });
  const [errors, setErrors] = useState({});
  const [filePreviews, setFilePreviews] = useState([]);

  const pdfInputRef = useRef(null);

  const handleUploadClick = (ref) => {
    ref.current.click();
  };
  const calculateCharges = (category, pages) => {
    switch (category) {
      case "Dissertation":
      case "Technical":
        return pages * 350;
      case "Non technical":
        return pages * 300;
      case "PowerPoint(With Speaker Notes)":
        return pages * 150;
      case "PowerPoint(Without Speaker Notes)":
        return pages * 100;
      default:
        return "";
    }
  };
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "files") {
      const selectedFiles = Array.from(files);
      setFilePreviews(
        selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) }))
      );
      setFormData((prev) => ({
        ...prev,
        [name]: selectedFiles,
      }));
    } else if (name === "dateline") {
      const selectedDate = new Date(value);
      const today = new Date();

      if (selectedDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
        // If selected date is today, ensure time is in the future
        const selectedTime = new Date(formData.time);
        const currentTime = new Date();

        if (selectedTime <= currentTime) {
          // Update errors for time input
          setErrors((prev) => ({
            ...prev,
            time: "Enter a futuristic time please",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            time: undefined,
          }));
        }
      }
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (name === "time") {
      const selectedTime = new Date(value);
      const currentTime = new Date();
      const selectedDate = new Date(formData.dateline);

      if (
        selectedDate.setHours(0, 0, 0, 0) ===
          currentTime.setHours(0, 0, 0, 0) &&
        selectedTime <= currentTime
      ) {
        console.log("Kindly enter a futuristic time");
      } else {
        // Update form data with the selected time
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }

      // Clear time error if input is valid
      setErrors((prev) => ({
        ...prev,
        time: undefined,
      }));
    } else if (name === "page") {
      // Update pages and calculate words based on 1 page = 250 words
      const pages = parseInt(value);
      let words;
      if (formData.category.includes("PowerPoint")) {
        words = pages * 100;
      } else {
        words = pages * 300;
      }
      const charges = calculateCharges(formData.category, pages);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        words: words.toString(), // Convert to string for consistency
        charges: charges.toString(), // Convert to string for consistency
      }));
    } else if (name === "category") {
      // Update category and recalculate charges
      const charges = calculateCharges(value, formData.page);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        charges: charges.toString(), // Convert to string for consistency
      }));
    } else {
      // Update other form data fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDeleteFile = (fileToDelete) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((file) => file.name !== fileToDelete.name),
    }));
    setFilePreviews((prev) =>
      prev.filter((preview) => preview.file.name !== fileToDelete.name)
    );
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.dateline).setHours(0, 0, 0, 0);
    const currentTime = new Date();

    if (selectedDate === today) {
      const selectedTime = new Date();
      const [hours, minutes] = formData.time.split(":").map(Number);
      selectedTime.setHours(hours, minutes, 0, 0);

      if (selectedTime <= currentTime) {
        newErrors.time = "Time must be in the future for today's date.";
      }
    }

    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.dateline) newErrors.dateline = "Dateline is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.charges) newErrors.charges = "Charges are required";

    if (!formData.page && !formData.words) {
      newErrors.page = "Either Pages or Words is required";
      newErrors.words = "Either Pages or Words is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("page", formData.page);
        formDataToSend.append("words", formData.words);
        formDataToSend.append("subject", formData.subject);
        formDataToSend.append("dateline", formData.dateline);
        formDataToSend.append("time", formData.time);
        formDataToSend.append("category", formData.category);
        formDataToSend.append("charges", formData.charges);

        formData.files.forEach((file) => {
          formDataToSend.append("files", file);
        });

        // Append description only if it's not empty
        if (formData.description) {
          formDataToSend.append("description", formData.description);
        }

        dispatch(showLoading());
        const response = await axios.post(
          "http://localhost:5000/api/assignments/post",
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );


        console.log(response.data)

        dispatch(hideLoading());

        if (response.data.success) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }

        setFormData({
          page: "",
          words: "",
          subject: "",
          dateline: "",
          time: "",
          category: "",
          charges: "",
          files: [],
        });
        if (formData.description) {
          setFormData((prevData) => ({ ...prevData, description: "" }));
        }
        setErrors({});
        setFilePreviews([]);
      } catch (error) {
        console.error("Error submitting form:", error);
        // Handle errors here
      }
    } else {
      setErrors(formErrors);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toTimeString().split(" ")[0];

  return (
    <>
      <ToastContainer />
      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          <div className="input-group">
            <p>
              Pages<sup>*</sup>
            </p>
            <input
              type="text"
              name="page"
              placeholder="Pages.."
              value={formData.page}
              onChange={handleChange}
            />
            {errors.page && <p className="error">{errors.page}</p>}
          </div>
          <div className="input-group">
            <p>
              Words<sup>*</sup>
            </p>
            <input
              type="text"
              name="words"
              placeholder="Words.."
              value={formData.words}
              onChange={handleChange}
              disabled // Disable input as it's dynamically calculated
            />
            {errors.words && <p className="error">{errors.words}</p>}
          </div>
        </div>
        <div className="input-group">
          <p>
            <sup>*</sup>
          </p>
          <input
            type="text"
            name="subject"
            placeholder="Subject.."
            value={formData.subject}
            onChange={handleChange}
          />
          {errors.subject && <p className="error">{errors.subject}</p>}
        </div>
        <p style={{ marginTop: "20px" }}>Select due date and time</p>
        <div className="row" style={{ marginTop: "-10px" }}>
          <div className="input-group">
            <p>
              <sup>*</sup>
            </p>
            <input
              type="date"
              name="dateline"
              value={formData.dateline}
              onChange={handleChange}
              min={today}
            />
            {errors.dateline && <p className="error">{errors.dateline}</p>}
          </div>
          <div className="input-group">
            <p>
              <sup>*</sup>
            </p>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              min={formData.dateline === today ? currentTime : "00:00"}
            />
            {errors.time && <p className="error">{errors.time}</p>}
          </div>
        </div>
        <div className="input-group">
          <p>
            <sup>*</sup>
          </p>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select category</option>
            <option value="Dissertation">Dissertation</option>
            <option value="Technical">Technical</option>
            <option value="Non technical">Non technical</option>
            <option value="PowerPoint(With Speaker Notes)">
              PowerPoint(With Speaker Notes)
            </option>
            <option value="PowerPoint(Without Speaker Notes)">
              PowerPoint(Without Speaker Notes)
            </option>
          </select>
          {errors.category && <p className="error">{errors.category}</p>}
        </div>
        <div className="input-group">
          <p style={{ marginTop: "1.7rem" }}>
            Charges<sup>*</sup>
          </p>
          <input
            type="text"
            name="charges"
            placeholder="Charges"
            value={formData.charges}
            onChange={handleChange}
            disabled // Disable input as it's dynamically calculated
          />
          {errors.charges && <p className="error">{errors.charges}</p>}
        </div>
        <div className="input_group">
          <textarea
            name="description"
            placeholder="Enter description.."
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="uploads" style={{ marginTop: "1.3rem" }}>
          <div className="input_group">
            <p>Upload Files (PDF, PPT, Excel, Pictures)</p>
            <input
              type="file"
              ref={pdfInputRef}
              style={{ display: "none" }}
              name="files"
              multiple
              onChange={handleChange}
            />

            <div
              className="uploadIcon"
              onClick={() => handleUploadClick(pdfInputRef)}
            >
              <img src={UploadIcon} alt="Upload Files" />
            </div>
          </div>
          <div className="uploaded-files">
            {filePreviews.map((preview, index) => (
              <div key={index} className="file-preview">
                <span>{preview.file.name}</span>
                <button
                  type="button"
                  className="table-btn"
                  onClick={() => handleDeleteFile(preview.file)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          {errors.files && <p className="error">{errors.files}</p>}
        </div>
        <input
          type="submit"
          value="SUBMIT"
          className="submit-btn"
          style={{
            margin: "1.5rem 0",
            border: "2px solid var(--success-color)",
            background: "var(--success-color)",
          }}
        />
      </form>
      {loading && <Preloader />}
    </>
  );
};

export default AssignmentDetails;
