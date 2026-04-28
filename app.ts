import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import ImageKit from 'imagekit';
import { v2 as cloudinary } from 'cloudinary';

// Initialize SDKs lazily
let imageKitInstance: ImageKit | null = null;
let cloudinaryConfigured = false;

const getImageKit = () => {
  if (imageKitInstance) return imageKitInstance;

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || 'public_8ulBaGE6HasMRTYenvVihqllUm8=';
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || 'private_DBHLVLfKVktC1UhaxnMNjJ++5sc=';
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/crv2lglsp';

  if (!publicKey || !privateKey || !urlEndpoint) {
    return null;
  }

  try {
    imageKitInstance = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
    return imageKitInstance;
  } catch (error) {
    console.error('ImageKit Initialization Error:', error);
    return null;
  }
};

const configureCloudinary = () => {
  if (cloudinaryConfigured) return true;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'divloq4oz';
  const apiKey = process.env.CLOUDINARY_API_KEY || '999667235587213';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || 'hKQ5Q6x6bdJOflp14Nk_S-MGrkw';

  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    cloudinaryConfigured = true;
    return true;
  } catch (error) {
    console.error('Cloudinary Configuration Error:', error);
    return false;
  }
};

export function createSharedApp() {
  const app = express();
  
  // Custom Body Parser handling to avoid conflicts with Multer/Vercel
  app.use((req: Request, res: Response, next: NextFunction) => {
    // If Vercel already parsed the body into an object, skip our JSON parser
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      return next();
    }

    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      return next();
    }
    express.json({ limit: '10mb' })(req, res, next);
  });

  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { 
      fileSize: 10 * 1024 * 1024 // Increased to 10MB, but watch Vercel limits (4.5MB)
    }
  });

  // API Route for ImageKit Upload (Profile images)
  app.post('/api/upload', upload.single('image'), async (req: Request, res: Response) => {
    console.log('--- Upload request received ---');
    try {
      if (!req.file) {
        console.warn('No file in request');
        return res.status(400).json({ error: 'No image file provided' });
      }

      console.log(`File received: ${req.file.originalname}, Size: ${req.file.size}`);

      const ik = getImageKit();
      if (!ik) {
        console.error('ImageKit initialization failed (keys might be invalid)');
        return res.status(500).json({ 
          error: 'ImageKit configuration missing', 
          details: 'Internal configuration error.' 
        });
      }

      console.log('Uploading to ImageKit...');
      
      const uploadPromise = ik.upload({
        file: req.file.buffer, // Use multer buffer directly
        fileName: `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        folder: '/yalo-assets',
      });
      
      // Add a 7-second timeout to prevent Vercel 504 Gateway Timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('ImageKit upload timed out after 7 seconds')), 7000);
      });

      const response: any = await Promise.race([uploadPromise, timeoutPromise]);

      console.log('ImageKit upload successful:', response.url);
      res.json({ url: response.url, fileId: response.fileId });
    } catch (error: any) {
      console.error('ImageKit Upload Error:', error);
      res.status(500).json({ 
        error: 'Failed to upload image', 
        details: error.message || 'Unknown error during ImageKit upload'
      });
    }
  });

  // API Route for Cloudinary Upload (General Media)
  app.post('/api/upload-media', upload.single('file'), async (req: Request, res: Response) => {
    console.log('--- Media Upload request received ---');
    try {
      if (!req.file) {
        console.warn('No media file provided');
        return res.status(400).json({ error: 'No file provided' });
      }

      console.log(`Media received: ${req.file.originalname}, Size: ${req.file.size}`);

      if (!configureCloudinary()) {
        console.error('Cloudinary configuration failed');
        return res.status(500).json({ 
          error: 'Cloudinary configuration missing', 
          details: 'Internal configuration error.' 
        });
      }

      console.log('Uploading to Cloudinary...');
      
      const uploadPromise = new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            folder: 'media-assets', 
            resource_type: 'auto',
            public_id: `${Date.now()}-${req.file?.originalname.split('.')[0].replace(/[^a-zA-Z0-9_-]/g, '_')}`
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file?.buffer);
      });

      // Add a 7-second timeout to prevent Vercel 504 Gateway Timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Cloudinary upload timed out after 7 seconds')), 7000);
      });

      const uploadResult = await Promise.race([uploadPromise, timeoutPromise]);

      console.log('Cloudinary upload successful');
      res.json({ url: (uploadResult as any).secure_url });
    } catch (error: any) {
      console.error('Cloudinary Upload Error:', error);
      res.status(500).json({ 
        error: 'Failed to upload media',
        details: error.message || 'Unknown error during Cloudinary upload'
      });
    }
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      node: process.version
    });
  });

  // Debug check
  app.get('/api/debug', (req: Request, res: Response) => {
    res.json({
      env: process.env.NODE_ENV,
      hasIK: !!imageKitInstance,
      hasCloud: cloudinaryConfigured,
      vars: {
        IMAGEKIT_PUBLIC_KEY: !!process.env.IMAGEKIT_PUBLIC_KEY,
        IMAGEKIT_PRIVATE_KEY: !!process.env.IMAGEKIT_PRIVATE_KEY,
        IMAGEKIT_URL_ENDPOINT: !!process.env.IMAGEKIT_URL_ENDPOINT,
        CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
      },
      node: process.version,
      timestamp: Date.now()
    });
  });

  // 404 Handler for /api routes
  app.use('/api', (req: Request, res: Response) => {
    res.status(404).json({ 
      error: 'API Route Not Found', 
      path: req.originalUrl
    });
  });

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Global Server Error:', err);
    res.status(500).json({ 
      error: 'Internal Server Error',
      details: err.message || 'An unexpected error occurred on the server'
    });
  });

  return app;
}
