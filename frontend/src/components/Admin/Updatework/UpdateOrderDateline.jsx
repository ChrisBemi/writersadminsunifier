import React, { useState } from "react";
import axios from "axios";
import Config from "../../../Config";

const UpdateOrderDateline = ({ orderToUpdate }) => {
  const [dateline, setDateline] = useState("");
  const [errors, setErrors] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { value } = e.target;
    setDateline(value);
    const today = new Date().toISOString().split("T")[0];
    if (value < today) {
      setErrors("Dateline cannot be in the past");
    } else {
      setErrors("");
      setMessage("")
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    if (dateline < today) {
      setErrors("Dateline cannot be in the past");
      return;
    }
    if (!dateline) {
      setErrors("Dateline is required");
      return;
    }

    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/assignments/${orderToUpdate._id}/update/dateline`,
        { dateline }
      );

      if (response.data.success) {
        setMessage("Dateline updated successfully");
      } else {
        setErrors(response.data.message || "Failed to update dateline");
      }
    } catch (error) {
      setErrors("Failed to update dateline");
    }
    
    // Clear the input field after submission
    setDateline("");
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="input-group" style={{ marginTop: "18px" }}>
        <p>Update Job's Dateline</p>
        <input
          type="date"
          name="dateline"
          value={dateline}
          onChange={handleChange}
          min={today}
        />
        {errors && <p className="error">{errors}</p>}
        {message && <p className="success">{message}</p>}
      </div>
      <input
        type="submit"
        style={{ marginTop: "10px" }}
        className="submit-btn"
        value="UPDATE DATELINE"
      />
    </form>
  );
};

export default UpdateOrderDateline;
