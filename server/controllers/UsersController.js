const User = require("../models/Users.model");
const Assignment = require("../models/Assignment.model");

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log("User ID:", id); // Log to check received user ID

    // Fetch user details
    const singleUser = await User.findById(id);

    if (!singleUser) {
      return res
        .status(404)
        .json({ status: 404, success: false, message: "User not found" });
    }

    console.log("User Found:", singleUser); // Log to check user details

    // Count bids for the user
    const bidsCount = await Assignment.countDocuments({
      writers: id,
      assigned: false,
    });

    console.log("Bids Count:", bidsCount); // Log to check bids count

    // Count completed assignments for the user
    const completedCount = await Assignment.countDocuments({
      writers:id,
      completed:true,
    });

    console.log("Completed Count:", completedCount); // Log to check completed count

    // Count assignments in revision for the user
    const revisionCount = await Assignment.countDocuments({
      writers: id,
      inRevision:true
    });

    const inReviewCount = await Assignment.countDocuments({
      writers: id,
      inReview: true,
    });

    console.log("Revision Count:", revisionCount); // Log to check revision count

    // Count assignments in progress for the user
    const inProgressCount = await Assignment.countDocuments({
      assignedTo: id,
      assigned:true
    });

    console.log("In Progress Count:", inProgressCount); 
    const userData = {
      _id: singleUser._id,
      firstName: singleUser.firstName,
      lastName: singleUser.lastName,
      email: singleUser.email,
      phoneNo: singleUser.phoneNo,
      createdAt: singleUser.createdAt,
      role: singleUser.role,
      educationLevel: singleUser.educationLevel,
      qualifications: singleUser.qualifications,
      amount: singleUser.amount,
      systemId: singleUser.systemId,
      __v: singleUser.__v,
      description: singleUser.description,
      bidsCount,
      completedCount,
      revisionCount,
      inProgressCount,
      inReviewCount
    };

    return res.status(200).json({ status: 200, success: true, data: userData });
  } catch (error) {
    console.error("Error in getUserById:", error);
    next(error); // Pass error to the error handling middleware
  }
};

module.exports = { getUserById };
