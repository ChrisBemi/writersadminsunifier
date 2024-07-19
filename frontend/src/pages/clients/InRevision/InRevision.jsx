import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AccountNavbar from "../../../components/account/AccountNavbar/AccountNavbar";
import AccountSidebar from "../../../components/account/AccountSidebar/AccountSidebar";
import Config from "../../../Config";
import "./InRevision.css";
import "../Clients.css";
import SubmitOrders from "../SubmitOrders/SubmitOrders";
import JSZip from "jszip";

const InRevision = () => {
  const [sidebar, setSidebar] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [workingOrder, setWorkingOrder] = useState(null);
  const [submitModal, setSubmitModal] = useState(false);

  const handleWorkingOrder = (order) => {
    setWorkingOrder(order);
  };

  const toggleSubmitModal = () => {
    setSubmitModal(!submitModal);
  };

  const toggleSidebar = () => {
    setSidebar(!sidebar);
  };

  const fetchAssignmentsInRevision = async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/answers/${sessionStorage.getItem(
          "userId"
        )}/work/in/revision`
      );
      setAssignments(response.data.data);
    } catch (error) {
      console.error("Error fetching assignments in revision:", error);
      // Handle error gracefully (e.g., show error message to user)
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("userId")) {
      fetchAssignmentsInRevision();
    }
  }, []);

  // Function to handle downloading all files associated with an assignment
  const handleDownloadAllFiles = async (files, subject,name) => {
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
        link.setAttribute("download", `${subject}_${name}_files.zip`);

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
      });
    } catch (error) {
      console.error("Error downloading files:", error);
    }
  };
 

  return (
    <div className="orders account revision">
      <AccountNavbar
        sidebar={sidebar}
        handleShowSidebar={toggleSidebar}
        title="IN REVISION"
      />
      <p className="empty"></p>

      <p className="medium-header">IN REVISION</p>
      <AccountSidebar sidebar={sidebar} />
      <div className="container">
        <p>
          Once you've submitted the work! If it coincides with the client's
          specification, it will be completed then If there is penalty, it will
          be deducted from the the cost of the work!
          <br />
          If the work is not upto standards the client will require you to carry
          out revision! Meanwhile total charges - any penalties will only be
          after the client has presided over the work with the utmost degree of
          satisfaction!
        </p>
        <div className="table_wrapper">
          <table>
            <thead>
              <tr>
                <td>Order Id</td>
                <td>Subject</td>
                <td>Created</td>
                <td>Comments</td>
                <td>In Revision Files</td>
                <td>Original Files</td>
                <td>Your answers</td>
                <td>Submit</td>
              </tr>
            </thead>
            <tbody>
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td>{assignment.assignmentId._id}</td>
                    <td>{assignment.assignmentId.subject}</td>
                    <td>
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </td>
                    <td>{assignment.assignmentId.inRevisionComment}</td>
                    <td>
                      {assignment.assignmentId.inRevisionFiles.length > 0 ? (
                        <button
                          className="table-btn"
                          onClick={() =>
                            handleDownloadAllFiles(
                              assignment.assignmentId.inRevisionFiles,
                              assignment.assignmentId.subject,
                              "revision"
                            )
                          }
                        >
                          Download
                        </button>
                      ) : (
                        <p>No Revision Files</p>
                      )}
                    </td>
                    <td>
                      {assignment.assignmentId.files.length === 0 ? (
                        <p>Assignment had no files</p>
                      ) : (
                        <p
                          className="table-btn"
                          onClick={() =>
                            handleDownloadAllFiles(assignment.assignmentId.files,assignment.assignmentId.subject,"assignments")
                          }
                        >
                          Download
                        </p>
                      )}
                    </td>
                    <td>
                      { assignment.files === 0 ?(<p>No files</p>) : (
                        <button
                        className="table-btn"
                        onClick={() =>
                          handleDownloadAllFiles(
                            assignment.files,
                            assignment.assignmentId.subject,
                           "answers"
                          )
                        }
                      >
                        Download
                      </button>
                      ) }
                    </td>
                    <td>
                      <button
                        className="table-btn"
                        onClick={() => {
                          handleWorkingOrder({
                            subject: assignment.assignmentId.subject,
                            _id: assignment.assignmentId._id,
                          });
                          toggleSubmitModal();
                        }}
                      >
                        SUBMIT
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No assignments in revision</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div
          className={`submit-orders account modal ${
            submitModal ? "active" : ""
          }`}
        >
          <SubmitOrders
            handleSubmitModal={toggleSubmitModal}
            workingOrder={workingOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default InRevision;
