const Assignment = require("../models/Assignment.model");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const User = require("../models/Users.model");

const generateUniqueFilename = require("../utils/generateUniqueFilename");

const admin = require("firebase-admin");

const { Storage } = require("@google-cloud/storage");

require("dotenv").config();


const bucket = admin.storage().bucket();

const upload = multer({ storage: multer.memoryStorage() });

const validateAssignment = (data) => {
  const errors = {};
  if (!data.subject) errors.subject = "Subject is required";
  if (!data.dateline) errors.dateline = "Dateline is required";
  if (!data.time) errors.time = "Time is required";
  if (!data.category) errors.category = "Category is required";
  if (!data.charges) errors.charges = "Charges are required";
  if (!data.page && !data.words) {
    errors.page = "Either Pages or Words is required";
    errors.words = "Either Pages or Words is required";
  }
  return errors;
};

const createAssignment = async (req, res, next) => {
  const {
    page,
    words,
    subject,
    dateline,
    time,
    category,
    charges,
    description,
  } = req.body;

  const errors = validateAssignment(req.body);

  let emails = [];
  try {
    const users = await User.find({}, { email: 1 });
    emails = users.map((user) => user.email);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch users" });
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const uploadTasks = (req.files || []).map(async (file) => {
      const fileName = generateUniqueFilename(file.originalname);
      const fileBuffer = file.buffer;
      const folder = 'assignments/';
      const fileRef = bucket.file(folder + fileName);

      await fileRef.save(fileBuffer);
      const downloadURL = await fileRef.getSignedUrl({ action: "read",expires: '01-01-2026' });

      return { fileName, downloadURL: downloadURL[0] };
    });

    const uploadedFiles = await Promise.all(uploadTasks);

    const newAssignment = new Assignment({
      page,
      words,
      subject,
      dateline,
      time,
      category,
      charges,
      description: description || "",
      files: uploadedFiles.map((file) => ({
        fileName: file.fileName,
        downloadURL: file.downloadURL,
      })),
    });

    await newAssignment.save();
    // const transporter = nodemailer.createTransport({
    //   host: "smtp.gmail.com",
    //   port: 465,
    //   secure: true,
    //   auth: {
    //     user: process.env.COMPANY_EMAIL,
    //     pass: process.env.COMPANY_EMAIL_PASSWORD,
    //   },
    // });

    // const bccEmails = emails.join(", ");
    // await transporter.sendMail({
    //   from: `"BEMI EDITORS LIMITED" <${process.env.COMPANY_EMAIL}>`,
    //   bcc: bccEmails,
    //   subject: `Notification about Assignment`,
    //   text: `New assignment created with subject: ${subject}`,
    //   html: `
    //     <!DOCTYPE html>
    //     <html lang="en">
    //     <head>
    //       <meta charset="UTF-8">
    //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //       <style>
    //         /* Your email CSS styles here */
    //       </style>
    //     </head>
    //     <body>
    //       <div class="container">
    //         <div class="header">
    //           <h1>BEMI EDITORS LIMITED</h1>
    //         </div>
    //         <div class="content">
    //           <p>Dear User,</p>
    //           <p>This is to notify you that a new assignment has been created with subject: <strong>${subject}</strong>.</p>
    //           <p>Please review the details accordingly. And make a bid accordingly!</p>
    //           <a href="${process.env.FRONTEND_URL}/client/get-orders" class="button">View Assignment Details</a>
    //         </div>
    //       </div>
    //     </body>
    //     </html>
    //   `,
    // });

    return res
      .status(201)
      .json({ success: true, message: "Assignment created successfully!" });
  } catch (error) {
    next(error);
  }
};

const uploadFiles = upload.array("files", 10);

const getAssignments = async (req, res, next) => {
  try {
    const { page = 1, limit = 2 } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    if (isNaN(pageInt) || isNaN(limitInt) || pageInt < 1 || limitInt < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid page or limit parameters" });
    }

    const assignments = await Assignment.find()
      .populate({
        path: "writers",
        select:
          "firstName lastName email phoneNo educationalLevel qualifications description",
      })
      .sort({ assigned: 1 });

    if (!assignments || assignments.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No assignments found" });
    }

    const startIndex = (pageInt - 1) * limitInt;
    const endIndex = startIndex + limitInt;
    const totalPages = Math.ceil(assignments.length / limitInt);
    const paginatedAssignments = assignments.slice(startIndex, endIndex);

    const nextPage =
      endIndex < assignments.length
        ? `${process.env.BACKEND_URL}/api/assignments/get?page=${
            pageInt + 1
          }&limit=${limitInt}`
        : null;

    const previousPage =
      startIndex > 0
        ? `${process.env.BACKEND_URL}/api/assignments/get?page=${
            pageInt - 1
          }&limit=${limitInt}`
        : null;

    res.json({
      success: true,
      limit: limitInt,
      page: pageInt,
      totalPages,
      nextPage,
      previousPage,
      data: paginatedAssignments,
    });
  } catch (error) {
    next(error); // Ensure error handling middleware (like Express' default error handler) handles this error
  }
};

const getUnassignedAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ assigned: false }).populate({
      path: "writers",
      select:
        "firstName lastName email phoneNo educationalLevel qualifications description",
    });

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (fileName) => {
  try {

    const folder = 'assignments/';

    await admin.storage().bucket().file(folder + fileName).delete();
    console.log(`File ${fileName} deleted successfully from Firebase Storage.`);
  } catch (error) {
    console.error(`Error deleting file ${fileName} from Firebase Storage:`, error);
    throw error;
  }
};

const deleteAssignment = async (req, res, next) => {
  const { id } = req.params;

  try {
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res
        .status(200)
        .json({ success: false, message: "Assignment not found" });
    }
    const deleteFilePromises = assignment.files.map(async (file) => {
      try {
        await deleteFile(file.fileName); 
      } catch (error) {
        console.error(`Error deleting file ${file.fileName} from Firebase Storage:`, error);
      }
    });

    await Promise.all(deleteFilePromises);

    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Assignment and related files deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const addBind = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { writerId } = req.body;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "There is no such assignment in the database",
      });
    }
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(writerId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid orderId or writer ID" });
    }
    if (!assignment.writers.includes(writerId)) {
      assignment.bid += 1;
      assignment.writers.push(writerId);
      await assignment.save();
      return res.status(201).json({
        success: true,
        message: "Interest created successfully",
        data: assignment,
      });
    } else {
      return res.status(200).json({
        success: false,
        message:
          "You have already expressed interest in this work, wait for response from the company",
        data: assignment,
      });
    }
  } catch (error) {
    next(next);
  }
};

const checkIfUserHasBind = async (req, res, next) => {
  const { writerId, orderId } = req.params;
  try {
    const assignment = await Assignment.findById(orderId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "We don't have such order in the system",
        data: null,
      });
    }

    if (assignment.writers.map((w) => w.toString()).includes(writerId)) {
      return res.status(200).json({
        success: true,
        message:
          "You have already expressed interest in this work, wait for response from the company",
        data: assignment,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "You have not expressed interest in this work yet",
        data: assignment,
      });
    }
  } catch (error) {
    next(error);
  }
};
const removeBid = async (req, res, next) => {
  try {
    const { orderId, writerId } = req.params;
    const assignment = await Assignment.findById(orderId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "There is no such assignment in the database",
      });
    }
    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(writerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId or writer ID",
      });
    }
    if (assignment.writers.includes(writerId)) {
      assignment.bid -= 1;
      assignment.writers = assignment.writers.filter(
        (wId) => wId.toString() !== writerId
      );
      await assignment.save();
      return res.status(200).json({
        success: true,
        message: "Bid removed successfully",
        data: assignment,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "You have not placed a bid on this assignment",
      });
    }
  } catch (error) {
    next(error);
  }
};

const assignAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;

    const { writerId } = req.body;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found in the system",
      });
    } else {
      assignment.assigned = true;

      assignment.assignedTo = writerId;

      await assignment.save();

      return res.status(200).json({
        success: true,
        message: "The writer has successfully been assigned",
        data: assignment,
      });
    }
  } catch (error) {
    next(error);
  }
};



const getAssignedAssignments = async (req, res, next) => {
  try {
    const assignedAssignments = await Assignment.find({ assigned: true });

    if (!assignedAssignments) {
      return res
        .status(404)
        .json({ success: false, message: "There are no assigned assignments" });
    } else {
      return res.status(200).json({ success: true, data: assignedAssignments });
    }
  } catch (error) {
    next(error);
  }
};

// UpdateAssingments

// Update file
const updateAssignmentFiles = async (req, res, next) => {
  const { id } = req.params;
  const files = req.files; 
  const { existingFiles } = req.body;

  try {
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const bucket = admin.storage().bucket(); 
        const folder = "assignments/"; 
        const fileName =generateUniqueFilename(file.originalname);
        const fileUpload = bucket.file(folder + fileName);

        const stream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        stream.on("error", (err) => {
          console.error("Error uploading file to Firebase:", err);
          throw new Error("File upload failed");
        });

        stream.on("finish", async () => {
          const downloadURL = await fileUpload.getSignedUrl({
            action: "read",
            expires: "03-09-2491", 
          });

          assignment.files.push({
            fileName: fileName,
            downloadURL: downloadURL[0],
          });

    
          await assignment.save();
        });
        stream.end(file.buffer);
        return { fileName, downloadURL: null }; 
      })
    );

    res.status(200).json({
      success: true,
      message: "Files uploaded and URLs stored successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error updating assignment files:", error);
    next(error);
  }
};

// Update description

const updateAssignmentDescription = async (req, res, next) => {
  const { id } = req.params;
  const { description } = req.body;

  try {
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    assignment.description = description;
    await assignment.save();

    res.status(200).json({
      success: true,
      message: "Assignment description updated successfully",
      assignment: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const updateAssignmentDateline = async (req, res, next) => {
  const { id } = req.params;

  const { dateline } = req.body;

  try {
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    assignment.dateline = dateline;

    await assignment.save();

    res.status(200).json({
      success: true,

      message: "Assignment dateline updated successfully",

      assignment: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const updateAssignmentPenalty = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { penalty } = req.body;
    if (!assignmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Assignment id is required" });
    }
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }
    assignment.penalty += penalty;
    await assignment.save();
    return res.status(200).json({
      success: true,
      message: "Penalty updated successfully",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIfUserHasBind,
  uploadFiles,
  createAssignment,
  validateAssignment,
  getAssignments,
  deleteAssignment,
  addBind,
  removeBid,
  assignAssignment,

  getAssignedAssignments,
  updateAssignmentDateline,
  updateAssignmentDescription,
  updateAssignmentFiles,
  updateAssignmentPenalty,
  getUnassignedAssignments,
};
