import React, { useState, useEffect } from "react";
import AccountNavbar from "../../../components/account/AccountNavbar/AccountNavbar";
import AccountSidebar from "../../../components/account/AccountSidebar/AccountSidebar";
import Config from "../../../Config";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver"; // Import saveAs from file-saver

const InReview = () => {
  const [sidebar, showSidebar] = useState(false);
  const [inReviews, setInReviews] = useState([]);

  const handleShowSidebar = () => {
    showSidebar(!sidebar);
  };

  const fetchAssignmentsInReview = async () => {
    try {
      const response = await axios.get(
        `${
          Config.baseUrl
        }/api/writers/assignments/inReview/${sessionStorage.getItem("userId")}`
      );
      setInReviews(response.data.data);
    } catch (error) {
      console.log(
        `There was an error accessing the data from the backend`,
        error
      );
    }
  };

  useEffect(() => {
    fetchAssignmentsInReview();
  }, []);

  const downloadZip = async (files, subject) => {
    try {
      const zip = new JSZip();
      const promises = files.map(async (file) => {
        const url = file.downloadURL;
        const response = await axios.get(url, { responseType: "arraybuffer" });
        zip.file(file, response.data);
      });

      await Promise.all(promises);
      zip.generateAsync({ type: "blob" }).then((content) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.setAttribute("download", `${subject}_assignment_files.zip`);

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
      });
    } catch (error) {
      console.error("Error downloading files:", error);
    }
  };

  return (
    <div className="account withdrawal">
      <AccountNavbar
        sidebar={sidebar}
        handleShowSidebar={handleShowSidebar}
        title="IN REVIEW"
      />
      <AccountSidebar sidebar={sidebar} />
      <p className="empty"></p>
      <div className="container">
        <div className="table_wrapper">
          <table>
            <thead>
              <tr>
                <td>Page</td>
                <td>Words</td>
                <td>Subject</td>
                <td>Dateline</td>
                <td>Time</td>
                <td>Category</td>
                <td>Charges</td>
                <td>Files</td>
                <td>Assigned</td>
                <td>Completed</td>
                <td>Penalty</td>
              </tr>
            </thead>
            <tbody>
              {inReviews.map((review) => (
                <tr key={review._id}>
                  <td>{review.page}</td>
                  <td>{review.words}</td>
                  <td>{review.subject}</td>
                  <td>{new Date(review.dateline).toLocaleDateString()}</td>
                  <td>{review.time}</td>
                  <td>{review.category}</td>
                  <td>{review.charges}</td>
                  <td>
                    <button
                      onClick={() => downloadZip(review.files, review.subject)}
                    >
                      Download
                    </button>

                    {/* {review.files.map((file, index) => (
                      <a href={file.downloadURL}  >{file.downloadURL}</a>
                    ))} */}
                  </td>
                  <td>{review.assigned ? "Yes" : "No"}</td>
                  <td>{review.completed ? "Yes" : "No"}</td>
                  <td>{review.penalty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InReview;
