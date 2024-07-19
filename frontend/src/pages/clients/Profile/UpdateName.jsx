import React, { useState } from "react";
import axios from "axios";
import Config from "../../../Config";

const UpdateName = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!firstName.trim() && !lastName.trim()) {
      setError("Please fill at least one of the fields.");
      return;
    }

    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/profile/${sessionStorage.getItem(
          "userId"
        )}/update/name`,
        {
          firstName,
          lastName,
        }
      );
      if (response.data.success) {
        setFirstName("");
        setLastName("");
        setSuccess(response.data.message);
      } else {
        setError(
          response.data.message || "An error occurred while updating the name."
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while updating the name."
      );
    }
  };

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
    if (error) {
      setError("");
      setSuccess("");
    }
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
    if (error) {
      setError("");
      setSuccess("");
    }
  };

  return (
    <div className="card">
      <p className="large-headers">UPDATE NAME</p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            name="firstName"
            id="firstName"
            placeholder="Firstname..."
            value={firstName}
            onChange={handleFirstNameChange}
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            name="lastName"
            id="lastName"
            placeholder="Lastname..."
            value={lastName}
            onChange={handleLastNameChange}
          />
          {error && <p className="error">{error}</p>}
          {success && (
            <p className="success" style={{ color: "var(--success-color)" }}>
              {success}
            </p>
          )}
        </div>

        <input
          type="submit"
          value="UPDATE"
          className="submit-btn"
          style={{ marginTop: "1rem" }}
        />
      </form>
    </div>
  );
};

export default UpdateName;