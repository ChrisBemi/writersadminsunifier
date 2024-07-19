import Config from "../../../Config";
import axios from "axios";
import { useState } from "react";

const UpdatePhone = ({ user }) => {
  const [phoneNo, setPhoneNo] = useState("");
  const [message, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Validate phone number format (10 digits)
    if (/^\d{0,10}$/.test(value)) {
      setPhoneNo(value);
    }
  };

  const updatePhoneNumber = async () => {
    try {
      if (phoneNo.length !== 10) {
        setErrorMessage("Phone number must be 10 digits.");
        return;
      }

      const response = await axios.put(
        `${Config.baseUrl}/api/writers/phone-no/update/${user._id}`,
        { phoneNumber: phoneNo }
      );

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setPhoneNo("");
        setErrorMessage("");
      } else {
        setErrorMessage(response.data.message);
        setSuccessMessage("");
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("There was a problem updating the phone number.");
      }
    }
  };

  return (
    <div className="card">
      <p className="large-headers">PHONE NO UPDATE</p>
      <div className="input-group">
        <input
          type="text"
          name="phone"
          placeholder="Phone No..."
          value={phoneNo}
          onChange={handlePhoneChange}
        />
        {errorMessage && <p className="error" style={{ color: "var(--pinkRed)" }}>{errorMessage}</p>}
        {message && <p className="error" style={{ color: "green" }}>{message}</p>}
      </div>
      <input
        type="submit"
        value="UPDATE"
        className="submit-btn"
        style={{ marginTop: "1rem" }}
        onClick={updatePhoneNumber}
      />
    </div>
  );
};

export default UpdatePhone;
