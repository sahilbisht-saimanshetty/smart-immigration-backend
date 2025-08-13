import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

const clickUpApi = axios.create({
  baseURL: 'https://api.clickup.com/api/v2',
  headers: {
    'Authorization': process.env.CLICK_UP_API_KEY,
    'Content-Type': 'application/json'
  }
});

const normalize = (str) => str.trim();

const getCustomFields = async () => {
  try {
    const response = await clickUpApi.get(`/list/${process.env.CLICK_UP_LIST_ID}/field`);
    return response.data?.fields || [];
  } catch (error) {
    console.error('Failed to fetch custom fields:', error.response?.data || error.message);
    return [];
  }
};

export const createTask = async ({ taskName, description, profileData }) => {
  try {
    const customFields = await getCustomFields();



    const customFieldMap = customFields.reduce((acc, field) => {
      acc[normalize(field.name)] = field.id;
      return acc;
    }, {});

    const { basicDetails, generalDetails } = profileData;

    const fieldData = {
      'Full Name': basicDetails.name,
      'Email ID': basicDetails.email,
      'Contact Number': basicDetails.phone || '',
      'LinkedIn': basicDetails.linkedin || '',
      'Purpose': generalDetails.purpose || '',
      'Field of Work': generalDetails.fieldOfWork || '',
      'Service Interested in': generalDetails.service || '',
      'Extra Qualification': generalDetails.qualifications?.other || '',
      'Qualification': (generalDetails.qualifications?.selected?.join(', ') || '') + ' , ' + generalDetails?.qualifications?.other,
      'GTV Applied': generalDetails.visaInfo?.visaApplied || '',
      'Current VISA Status': generalDetails.visaInfo?.visaStatus || '',
      'Source': generalDetails.foundUs || '',
      'Consent': generalDetails.consent ? 'Yes' : 'No',
    };

    // Map field names to ClickUp custom_field format
    const custom_fields = Object.entries(fieldData).reduce((arr, [key, value]) => {
      const fieldId = customFieldMap[normalize(key)];
      if (fieldId && value !== undefined) {
        arr.push({ id: fieldId, value });
      } else if (!fieldId) {
        console.warn(`Custom field '${key}' not found in ClickUp.`);
      }
      return arr;
    }, []);

    const response = await clickUpApi.post(
      `/list/${process.env.CLICK_UP_LIST_ID}/task`,
      {
        name: taskName,
        description,
        priority: 3,
        due_date: Date.now() + 86400000,
        custom_fields,
      }
    );

    console.log('Task created successfully');
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error.response?.data || error.message);
    throw error;
  }
};


export const createCustomFieldsIfNotExist = async () => {
  try {
  const customFieldNames = [
  'Full Name',
  'Email ID',
  'Contact Number',
  'LinkedIn',
  'Purpose',
  'Field of Work',
  'Service Interested in',
  'Extra Qualification',
  'Qualification',
  'GTV Applied',
  'Current VISA Status',
  'Source',
  'Consent'
];

    // 1. Get existing custom fields in the list
    const existingFieldsResponse = await clickUpApi.get(`/list/${process.env.CLICK_UP_LIST_ID}/field`);
    const existingFields = existingFieldsResponse.data.fields || [];
    
    // 2. Filter out fields that already exist
    const existingFieldNames = existingFields.map((field) => field.name.toLowerCase());
    const fieldsToCreate = customFieldNames.filter(
      name => !existingFieldNames.includes(name.toLowerCase())
    );

    if (fieldsToCreate.length === 0) {
      console.log("All custom fields already exist in the list");
      return;
    }

    // 3. Create missing fields
    for (const fieldName of fieldsToCreate) {
      try {
        const payload = {
          name: fieldName,
          type: 'text'
        };

        await clickUpApi.post(`/list/${process.env.CLICK_UP_LIST_ID}/field`, payload);
        console.log(`Created custom field: ${fieldName}`);
      } catch (error) {
        console.error(`Failed to create field ${fieldName}:`, error.response?.data || error.message);
      }
    }

  } catch (error) {
    console.error("Error in createCustomFieldsIfNotExist:", error.response?.data || error.message);
    throw error;
  }
}
