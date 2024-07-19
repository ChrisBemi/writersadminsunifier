const User = require("../models/Users.model");

const updateUserNames = async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName } = req.body;

  if (!firstName && !lastName) {
    return res
      .status(200)
      .json({
        success: false,
        message:
          "Please provide at least one of the fields: firstName or lastName.",
      });
  }

  try {
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res
        .status(200)
        .json({ success: false, message: "User not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Name updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the user." });
  }
};

module.exports = {
  updateUserNames,
};