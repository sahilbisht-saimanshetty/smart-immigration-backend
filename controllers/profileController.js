import Profile from "../models/profileModel.js";
import { createTask } from "../helpers/clickup.js";


const createTaskDescription = (profileData) => {
  const { basicDetails, generalDetails } = profileData;
  
  let description = `
    **Basic Details**:
    - Name: ${basicDetails.name}
    - Email: ${basicDetails.email}
    - Phone: ${basicDetails.phone || 'Not provided'}
    - linkedin: ${basicDetails.linkedin || 'Not provided'}
    
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

    const taskData = {
      taskName: `${basicDetails.name} ||  SIUK Profile Query`,
      description: createTaskDescription(formData),
    };

    await createTask(taskData); 

    res.status(201).json({ message: 'Form submitted successfully', profile: newProfile });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

export default submitForm;
