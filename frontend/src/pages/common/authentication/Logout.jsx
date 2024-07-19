import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../AuthContext";

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        navigate('/');
      } catch (error) {
        console.error(`An error occurred: ${error.message}`);
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return <div>Logging out...</div>;
};

export default Logout;
