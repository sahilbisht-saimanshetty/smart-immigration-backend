import Profile from "../models/profileModel.js";
import { createCustomFieldsIfNotExist, createTask } from "../helpers/clickup.js";

const createTaskDescription = (profileData) => {
  const { basicDetails, generalDetails } = profileData;

  let description = `
    **Basic Details**:
    - Name: ${basicDetails.name}
    - Email: ${basicDetails.email}
    - Phone: ${basicDetails.phone || 'Not provided'}
    - LinkedIn: ${basicDetails.linkedin || 'Not provided'}
    
    **General Details**:
    - Purpose: ${generalDetails.purpose || 'Not provided'}
    - Field of Work: ${generalDetails.fieldOfWork || 'Not provided'}
    - Service Interested In: ${generalDetails.service || 'Not provided'}
  `;

  if (generalDetails.qualifications) {
    description += `
    **Qualifications**:
    - Selected: ${generalDetails.qualifications.selected?.join(' || ') || 'None'}
    - Other: ${generalDetails.qualifications.other || 'None'}
    `;
  }

  if (generalDetails.visaInfo) {
    description += `
    **Visa Information**:
    - Visa Applied For: ${generalDetails.visaInfo.visaApplied || 'Not specified'}
    - Visa Status: ${generalDetails.visaInfo.visaStatus || 'Not specified'}
    `;
  }

  description += `
    **How They Found Us**: ${generalDetails.foundUs || 'Not specified'}
    **Consent Given**: ${generalDetails.consent ? 'Yes' : 'No'}
  `;

  return description;
};

const submitForm = async (req, res) => {
  try {
    const formData = req.body;
    const { basicDetails, generalDetails } = formData;

    if (!basicDetails?.name?.trim() || !basicDetails?.email?.trim()) {
      return res.status(400).json({ message: 'Name and Email are required in basicDetails' });
    }

    if (!generalDetails) {
      return res.status(400).json({ message: 'generalDetails is required' });
    }

    const newProfile = new Profile(formData);
    await newProfile.save();

    const taskData = {
      taskName: `${basicDetails.name}`,
      description: createTaskDescription(formData),
      profileData: formData,
    };

    await createTask(taskData);

    res.status(201).json({ message: 'Form submitted successfully', profile: newProfile });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

export const getProfilesList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.body;

    if (!page || !limit) {
      return res.status(400).json({ 
        message: "Pagination parameters 'page' and 'limit' are required" 
      });
    }
    
    // Check email in headers
    const email = req.headers.email;
    if (email !== "sahil.b@cachelabs.io") {
      return res.status(403).json({ 
        message: "Forbidden: You are not authorized to access this resource" 
      });
    }

    // Convert to numbers and validate
    const pageNum = Number(page);
    const limitNum = Number(limit);
    
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ 
        message: "Invalid pagination parameters" 
      });
    }

    // Calculate skip value
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination info
    const total = await Profile.countDocuments();
    const totalPages = Math.ceil(total / limitNum);

    // Fetch profiles with pagination
    const profiles = await Profile.find()
      .skip(skip)
      .limit(limitNum)
      .lean(); // Using lean() for better performance

    // Add createdAt if not present
    const result = profiles.map(profile => ({
      ...profile,
      createdAt: profile.createdAt || profile._id.getTimestamp()
    }));

    res.status(200).json({
      message: "Profiles fetched successfully",
      data: {
        profiles: result,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ 
      message: "Something went wrong",
      error: error.message
    });
  }
};


export const createCustomField = async (req , res) => {
  try {
      const response = await createCustomFieldsIfNotExist();
      return res.status(200).json({message : 'Custom fields created successfully'});
    } catch (error) {
    return res.status(500).json({ message: 'Something went wrong', error });
  }
};


export default submitForm;
