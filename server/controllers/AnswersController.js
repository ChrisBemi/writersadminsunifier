const express = require("express");
const Answer = require("../models/Answers.model");
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
const DateGenerator = require("../utils/DateGenerator");
const archiver = require("archiver");
const Assignment = require("../models/Assignment.model");
const nodemailer = require("nodemailer");
require("dotenv").config();
const firebaseConfig = JSON.parse(process.env.FIREBASE_CREDENTIALS);
const generateUniqueFilename = require("../utils/generateUniqueFilename");
const { Storage } = require("@google-cloud/storage");
const admin = require("firebase-admin");
const { updateAssignmentPenalty } = require("./AssignmentController");

const bucket = admin.storage().bucket();

const upload = multer({ storage: multer.memoryStorage() });
const uploadFiles = upload.array("files", 10);

const submitAnswers = async (req, res, next) => {
  const { assignmentId, description, writerId, category } = req.body;

  // Validate required fields
  if (!assignmentId) {
    return res.status(400).json({ message: "Assignment ID is required" });
  }

  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  try {
    // Upload files to Google Cloud Storage
    const uploadTasks = (req.files || []).map(async (file) => {
      const fileName = generateUniqueFilename(file.originalname);
      const fileBuffer = file.buffer;
      const folder = "answers/";
      const fileRef = bucket.file(folder + fileName);

      await fileRef.save(fileBuffer);
      const downloadURL = await fileRef.getSignedUrl({
        action: "read",
        expires: "01-01-2026",
      });

      return { fileName, downloadURL: downloadURL[0] };
    });

    // Wait for all uploads to complete
    const uploadedFiles = await Promise.all(uploadTasks);

    // Retrieve assignment from MongoDB
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    // Update assignment status if category is "final"
    if (category === "final") {
      assignment.inReview = true;
      assignment.completed = false;
      assignment.inRevision = false;
      assignment.assigned = false;
    }

    // Create a new Answer document
    const newAnswer = new Answer({
      assignmentId,
      description,
      writerId,
      files: uploadedFiles.map((file) => ({
        fileName: file.fileName,
        downloadURL: file.downloadURL,
      })),
      category,
    });

    // Save assignment and new answer to MongoDB
    await assignment.save();
    await newAnswer.save();

    // Send success response
    res.status(200).json({
      success: true,
      message: "Answer submitted successfully",
      answer: newAnswer,
    });
  } catch (error) {
    // Pass error to error handling middleware
    next(error);
  }
};

const getSubmittedAnswers = async (req, res, next) => {
  try {
    const answers = await Answer.find({}).populate([
      {
        path: "writerId",
        select: "firstName lastName email",
      },
      {
        path: "assignmentId",
        select: "subject charges completed subject",
      },
    ]);

    if (!answers || answers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "There are no answers in the system currently",
      });
    }

    return res.status(200).json({ success: true, data: answers });
  } catch (error) {
    next(error);
  }
};

// Adjust the path according to your project structure

const setRevision = async (req, res) => {
  const { answerId } = req.params;
  const { comment, email, orderId } = req.body;

  if (!comment) {
    return res
      .status(400)
      .json({ success: false, message: "Comment is required" });
  }

  try {
    const answer = await Answer.findById(answerId);
    const assignment = await Assignment.findById(orderId);

    if (!answer) {
      return res
        .status(404)
        .json({ success: false, message: "Answer not found" });
    }

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    if (answer.inRevision) {
      return res
        .status(200)
        .json({ success: true, message: "The answer is still in revision" });
    }

    const uploadTasks = (req.files || []).map(async (file) => {
      const fileName = generateUniqueFilename(file.originalname);
      const fileBuffer = file.buffer;
      const folder = "assignments/";
      const fileRef = bucket.file(folder + fileName);

      await fileRef.save(fileBuffer);

      const downloadURL = await fileRef.getSignedUrl({
        action: "read",
        expires: "01-01-2026",
      });

      return { fileName, downloadURL: downloadURL[0] };
    });

    const uploadedFiles = await Promise.all(uploadTasks);

    assignment.inRevision = true;
    assignment.inRevisionComment = comment;
    assignment.inRevisionFiles = uploadedFiles;
    assignment.completed = false;

    answer.inRevision = true;
    await assignment.save();
    await answer.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.COMPANY_EMAIL,
        pass: process.env.COMPANY_EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"BEMI EDITORS LIMITED" <${process.env.COMPANY_EMAIL}>`,
      to: email,
      subject: `Notification about Order ID ${orderId}`,
      text: `Order ID ${orderId} has been set in revision.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Reset styles and basic typography */
            body, html {
              margin: 0;
              padding: 0;
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              background-color: #f4f4f4;
              color: #333;
            }
            /* Container styles */
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            }
            /* Header styles */
            .header {
              background-color: #4CAF50;
              color: #ffffff;
              text-align: center;
              padding: 10px;
              border-radius: 5px 5px 0 0;
            }
            /* Content styles */
            .content {
              padding: 20px;
            }
            /* Button styles */
            .button {
              display: inline-block;
              background-color: #4CAF50;
              color: #ffffff;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 5px;
              margin-top: 20px;
            }
            .button:hover {
              background-color: #45a049;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BEMI EDITORS LIMITED</h1>
            </div>
            <div class="content">
              <p>Dear User,</p>
              <p>This is to notify you that Order ID <strong>${orderId}</strong> has been set in revision.</p>
              <p>Please review the changes accordingly.</p>
              <a href="#" class="button">View Order Details</a>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return res
      .status(200)
      .json({ success: true, message: "In revision has been set!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const cancelInRevision = async (req, res, next) => {
  try {
    const { answerId } = req.params;

    if (!answerId) {
      return res
        .status(400)
        .json({ success: false, message: "The answer Id is required" });
    }

    const answer = await Answer.findById(answerId);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "The answer was not found in the store",
      });
    }

    answer.inRevision = false;

    await answer.save();

    return res
      .status(200)
      .json({ success: true, message: "In revision has been cancelled!" });
  } catch (error) {
    next(error);
  }
};

const downloadAnsweredFiles = async (req, res, next) => {
  const { answerId } = req.params;
  try {
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }
    if (!answer.files || answer.files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No files found for this assignment",
      });
    }

    const zipFileName = `answers_${answerId}_files.zip`;
    const outputFilePath = path.join(__dirname, `../downloads/${zipFileName}`);
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level
    });

    output.on("close", function () {
      console.log(`${archive.pointer()} total bytes`);
      console.log(
        "archiver has been finalized and the output file descriptor has closed."
      );

      res.download(outputFilePath, zipFileName, (err) => {
        if (err) {
          console.error("Download error:", err);
          next(err);
        } else {
          console.log(`Download successful: ${zipFileName}`);
          // Delete the zip file after successful download
          fs.unlinkSync(outputFilePath);
          console.log(`Deleted ${zipFileName} after download.`);
        }
      });
    });
    archive.on("error", function (err) {
      console.error("Archiving error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to create zip file",
      });
    });
    archive.pipe(output);
    answer.files.forEach((file) => {
      const filePath = path.join(__dirname, `../uploads/answers/${file}`);
      archive.file(filePath, { name: file });
    });
    await archive.finalize();
  } catch (error) {
    next(error);
  }
};

const getUsersInRevisionWork = async (req, res, next) => {
  try {
    const { writerId } = req.params;
    if (!writerId) {
      return res
        .status(400)
        .json({ success: false, message: "WriterId is required" });
    }
    const answers = await Answer.find({
      writerId: writerId,
      inRevision: true,
    }).populate({
      path: "assignmentId",
      select: "subject dateline files inRevisionComment inRevisionFiles",
    });
    if (!answers || answers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "The answer has not been found in the backend",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Data successfully fetched",
      data: answers,
    });
  } catch (error) {
    next(error);
  }
};
const deleteAnswer = async (req, res, next) => {
  const { answerId } = req.params;
  try {
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }
    const folder = "answers/";
    if (answer.files && answer.files.length > 0) {
      const promises = answer.files.map(async (file) => {
        const filePath = folder + file.fileName;
        await admin.storage().bucket().file(filePath).delete();
      });
      await Promise.all(promises);
    }

    await Answer.findByIdAndDelete(answerId);
    res.status(200).json({
      success: true,
      message: "Answer and associated files deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitAnswers,
  getSubmittedAnswers,
  uploadFiles,
  setRevision,
  cancelInRevision,
  downloadAnsweredFiles,
  getUsersInRevisionWork,
  deleteAnswer,
};
