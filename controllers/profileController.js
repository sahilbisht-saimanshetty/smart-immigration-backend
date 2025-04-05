import Profile from "../models/profileModel.js";

const submitForm = async (req, res) => {
  try {
    const formData = req.body;

    const { basicDetails, generalDetails } = formData;

    if (
      !basicDetails?.name?.trim() ||
      !basicDetails?.email?.trim()
    ) {
      return res.status(400).json({ message: 'Name and Email are required in basicDetails' });
    }

    if (!generalDetails) {
      return res.status(400).json({ message: 'generalDetails is required' });
    }

    const newProfile = new Profile(formData);
    await newProfile.save();

    res.status(201).json({ message: 'Form submitted successfully', profile: newProfile });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

export default submitForm;
