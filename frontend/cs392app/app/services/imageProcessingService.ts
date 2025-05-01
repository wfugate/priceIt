import axios from 'axios';
import { API_ENDPOINTS, COMMON_HEADERS, API_BASE_URL } from '../config/apiConfig';

// send an image to the backend for processing and recognition
export const scanImage = async (base64Image: string) => {
    try {
      // step 1: prepare request with base64 image data
      const response = await axios.post(
        API_ENDPOINTS.imageProcessing.process,
        { image: `data:image/jpeg;base64,${base64Image}` },
        {
          headers: COMMON_HEADERS,
          timeout: 30000 // set long timeout for image processing
        }
      );
      // step 2: return the recognized item from the response
      return response.data;
    } catch (error) {
      console.error('Scan image error:', error);
      return { item: null, error: 'Failed to process image' };
    }
  };