const axios = require('axios');
const FormData = require('form-data');
const { Buffer } = require('buffer');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the image data from the request body
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Create a buffer from the base64 image data
    const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
    
    // Create form data for the Imagga API
    const formData = new FormData();
    formData.append('image', imageBuffer, { filename: 'image.jpg' });
    
    // Make a request to the Imagga API
    const imaggaResponse = await axios({
      method: 'post',
      url: 'https://api.imagga.com/v2/tags',
      data: formData,
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Basic ' + Buffer.from('acc_631eee5b4b7e128:63f492447d67c51dec28fa0adba9ef29').toString('base64')
      }
    });

    // Process the Imagga API response
    console.log('Received response from Imagga API');
    
    // Extract tags from the response
    const tags = imaggaResponse.data.result.tags;
    console.log('Tags identified:', tags.slice(0, 5).map(tag => tag.tag.en).join(', '));
    
    // Generate location-based information
    // In a real application, you might use the tags to determine location
    // or use another API with the coordinates from EXIF data if available
    const locationData = [
      { category: "LOCATION", info: "Sanlitun, Beijing" },
      { category: "NEARBY FOOD", info: "Fei Restaurant" },
      { category: "NEARBY ATTRACTIONS", info: "Taikoo Li Sanlitun" },
      { category: "NEARBY HOTELS", info: "The Opposite House" }
    ];
    
    // Return the location data
    return res.status(200).json(locationData);
    
  } catch (error) {
    console.error('Error processing image:', error.message);
    
    // Provide more detailed error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from API');
    }
    
    return res.status(500).json({ error: 'Failed to process image' });
  }
};
