const Withdrawal = require("../models/Withdrawal.model");
const User = require("../models/Users.model");
const express = require("express");

const requestWithDrawal = async (req, res, next) => {
  try {
    const { writerId } = req.params;
    const { amount, phoneNo } = req.body;

    if (!writerId) {
      return res
        .status(200)
        .json({ success: false, message: "Writer Id is required" });
    }
    const user = await User.findById(writerId);
    if (user.amount < amount) {
      return res.status(200).json({
        success: false,
        message:
          "Amount withdrawable should be more than balance in the system",
      });
    }
    const withdrawals = await Withdrawal.find({
      writer: writerId,
      pending: true,
    });
    if (withdrawals.length >= 5) {
      return res.status(200).json({
        success: false,
        message:
          "You cannot have more than 5 pending withdrawals. Please wait until others are processed.",
      });
    }
    if (!phoneNo || !phoneNo.trim().match(/^0\d{9}$/)) {
      return res.status(200).json({
        success: false,
        message: "A valid Safaricom phone number is required",
      });
    }
    if (!amount || isNaN(amount) || parseFloat(amount) < 2000) {
      return res.status(200).json({
        success: false,
        message: "Amount must be a number and at least 2000",
      });
    }

    const existingWithdrawal = await Withdrawal.findOne({ phoneNo: phoneNo });
    if (
      existingWithdrawal &&
      existingWithdrawal.writer.toString() !== writerId
    ) {
      return res.status(200).json({
        success: false,
        message: "Phone number is used by another withdrawer",
      });
    }
    const userUsingNumber = await User.findOne({ phoneNo: phoneNo });
    if (userUsingNumber && userUsingNumber._id.toString() !== writerId) {
      return res.status(200).json({
        success: false,
        message: "Phone number is already associated with another user",
      });
    }
    const newWithdrawal = new Withdrawal({
      writer: writerId,
      amount: amount,
      pending: true,
      phoneNo: phoneNo,
    });
    await newWithdrawal.save();
    return res.status(200).json({
      success: true,
      message: "Withdrawal request sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getWithDrawals = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find({}).populate({
      path: "writer",
      select: "firstName lastName email",
    });

    if (!withdrawals || withdrawals.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Withdrawals not found" });
    }

    return res.status(200).json({ success: true, data: withdrawals });
  } catch (error) {
    next(error);
  }
};

const getWithDrawalsById = async (req, res, next) => {
  try {
    const { writerId } = req.params;

    if (!writerId) {
      return res
        .status(400)
        .json({ success: false, message: "Writer ID is required" });
    }

    const withdrawals = await Withdrawal.find({
      writer: writerId,
      pending: true,
    });

    if (!withdrawals || withdrawals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "The user does not have any pending withdrawals",
      });
    }

    return res.status(200).json({ success: true, data: withdrawals });
  } catch (error) {
    next(error);
  }
};

const clearWithDrawal = async (req, res, next) => {
  try {
    const { withdrawalId } = req.params;
    const { amount, writerId } = req.body;

    if (!withdrawalId || !writerId) {
      return res.status(400).json({
        success: false,
        message: "Withdrawal ID and Writer ID are required!",
      });
    }

    const writerAccount = await User.findById(writerId);

    if (!writerAccount) {
      return res
        .status(404)
        .json({ success: false, message: "Writer account not found" });
    }

    if (writerAccount.amount - parseFloat(amount) < parseFloat(amount)) {
      return res
        .status(404)
        .json({
          success: false,
          message: "The user balance does not support withdrawal clearance",
        });
    }

    writerAccount.amount -= parseFloat(amount);

    await writerAccount.save();

    const deletedWithdrawal = await Withdrawal.findByIdAndDelete(withdrawalId);

    if (!deletedWithdrawal) {
      return res
        .status(404)
        .json({ success: false, message: "Withdrawal not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Withdrawal cleared successfully",
      deletedWithdrawal,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestWithDrawal,
  getWithDrawals,
  getWithDrawalsById,
  clearWithDrawal,
};
