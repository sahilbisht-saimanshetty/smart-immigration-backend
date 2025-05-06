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

export const createTask = async ({taskName , description}) => {
  try {
    const response = await clickUpApi.post(
      `/list/${process.env.CLICK_UP_LIST_ID}/task`, 
      {
        name: taskName,  
        description: description,
        priority: 3,     
        due_date: Date.now() + 86400000, 
      }
    );

    console.log('Task created successfully');
    return response.data; 
  } catch (error) {
    console.error('Error creating task:', error.response ? error.response.data : error.message);
    throw error; 
  }
};