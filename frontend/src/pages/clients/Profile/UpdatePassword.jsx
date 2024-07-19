const UpdatePassword = () => {
  return (
    <div className="card">
      <p className="large-headers">PASSWORD UPDATE</p>
      <div className="input-group">
        <input type="text" name="phone" id="" placeholder="Password..." />
      </div>
      <div className="input-group">
        <input
          type="text"
          name="phone"
          id=""
          placeholder="Confirm password..."
        />
      </div>

      <input type="submit" value="UPDATE" className="submit-btn" />
    </div>
  );
};

export default UpdatePassword;
