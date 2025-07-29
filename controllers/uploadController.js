const { supabase } = require('../config/supabase');

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.file;
    
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const filePath = `uploads/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false 
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    if (!urlData) {
      throw new Error('Failed to generate public URL');
    }

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        path: filePath,
        publicUrl: urlData.publicUrl,
        fileName: fileName,
        mimeType: file.mimetype,
        size: file.size
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    let errorMessage = error.message;
    if (error.message.includes('Bucket not found')) {
      errorMessage = 'Storage bucket not configured. Please contact administrator.';
    } else if (error.message.includes('The resource already exists')) {
      errorMessage = 'File with this name already exists.';
    }

    return res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

module.exports = {
  uploadDocument
};