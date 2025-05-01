import axios from 'axios';
import { API_ENDPOINTS, COMMON_HEADERS, API_BASE_URL } from '../config/apiConfig';

// Image processing function
export const scanImage = async (base64Image: string) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.imageProcessing.process,
        { image: `data:image/jpeg;base64,${base64Image}` },
        {
          headers: COMMON_HEADERS,
          timeout: 30000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Scan image error:', error);
      return { item: null, error: 'Failed to process image' };
    }
  };