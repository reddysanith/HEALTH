const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const Appointment = require("../models/appointmentModel");

// ✅ Get all approved doctors
// ✅ Get all approved doctors
const getalldoctors = async (req, res) => {
  try {
    let filter = { isDoctor: true };

    if (req.locals) {
      filter._id = { $ne: req.locals };
    }

    const docs = await Doctor.find(filter)
      .populate("userId", "firstname lastname pic email mobile");

    res.status(200).send(docs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to get doctors");
  }
};

// ✅ Get all non-approved doctors
const getnotdoctors = async (req, res) => {
  try {
    let filter = { isDoctor: false };

    if (req.locals) {
      filter._id = { $ne: req.locals };
    }

    const docs = await Doctor.find(filter)
      .populate("userId", "firstname lastname pic email mobile");

    res.status(200).send(docs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to get non doctors");
  }
};


// ✅ Apply for doctor role
const applyfordoctor = async (req, res) => {
  try {
    const alreadyFound = await Doctor.findOne({ userId: req.locals });
    if (alreadyFound) {
      return res.status(400).send("Application already exists");
    }

    const doctor = Doctor({ ...req.body.formDetails, userId: req.locals });
    await doctor.save();

    return res.status(201).send("Application submitted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to submit application");
  }
};

// ✅ Accept doctor application
const acceptdoctor = async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.body.id },
      { isDoctor: true, status: "accepted" }
    );

    await Doctor.findOneAndUpdate(
      { userId: req.body.id },
      { isDoctor: true }
    );

    const notification = new Notification({
      userId: req.body.id,
      content: `Congratulations, Your application has been accepted.`,
    });

    await notification.save();

    return res.status(201).send("Application accepted notification sent");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while sending notification");
  }
};

// ✅ Reject doctor application
const rejectdoctor = async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.body.id },
      { isDoctor: false, status: "rejected" }
    );
    await Doctor.findOneAndDelete({ userId: req.body.id });

    const notification = new Notification({
      userId: req.body.id,
      content: `Sorry, Your application has been rejected.`,
    });

    await notification.save();

    return res.status(201).send("Application rejection notification sent");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while rejecting application");
  }
};

// ✅ Delete doctor
const deletedoctor = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.body.userId, { isDoctor: false });
    await Doctor.findOneAndDelete({ userId: req.body.userId });
    await Appointment.findOneAndDelete({ userId: req.body.userId });

    return res.send("Doctor deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to delete doctor");
  }
};

module.exports = {
  getalldoctors,
  getnotdoctors,
  deletedoctor,
  applyfordoctor,
  acceptdoctor,
  rejectdoctor,
};
