import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export class ImageUploadService {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    this.maxImagesPerTrip = 20; // Limit for gallery
  }

  // Upload image to Firebase Storage
  async uploadImage(file, path) {
    try {
      // Validate file
      if (!this.isValidImage(file)) {
        throw new Error('Invalid image file. Please upload JPG, PNG, or WebP files under 5MB.');
      }

      // Compress image if needed
      const compressedFile = await this.compressImage(file);
      
      // Create storage reference
      const imageRef = ref(storage, path);
      
      // Upload file
      const snapshot = await uploadBytes(imageRef, compressedFile);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: path,
        size: compressedFile.size,
        name: file.name
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Delete image from Firebase Storage
  async deleteImage(imagePath) {
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // Validate image file
  isValidImage(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  // Compress image for web optimization
  async compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        
        // Set canvas size
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob((blob) => {
          // FIXED: Ensure filename is preserved properly
          const fileName = file.name || `image_${Date.now()}.jpg`;
          resolve(new File([blob], fileName, {
            type: file.type || 'image/jpeg',
            lastModified: Date.now()
          }));
        }, file.type || 'image/jpeg', quality);
      };
      
      // FIXED: Add error handling for image loading
      img.onerror = () => {
        console.error('Failed to load image for compression');
        resolve(file); // Return original file if compression fails
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Generate unique file path
  generateImagePath(userId, tripId, fileName) {
    const timestamp = Date.now();
    const extension = fileName.split('.').pop();
    return `trips/${userId}/${tripId}/cover_${timestamp}.${extension}`;
  }

  // New method for multiple image uploads
  // New method for multiple image uploads
  async uploadMultipleImages(files, tripId, userId, onProgress) {
    if (files.length > this.maxImagesPerTrip) {
      throw new Error(`Maximum ${this.maxImagesPerTrip} images allowed per trip`);
    }

    console.log('Starting upload for files:', files.map(f => f.name));
    console.log('Upload parameters:', { tripId, userId });
  
    const uploadPromises = files.map(async (file, index) => {
      try {
        console.log(`Processing file ${index + 1}:`, file.name, file.type, file.size);
        
        // Validate each file
        if (!this.isValidImage(file)) {
          throw new Error('Invalid image file. Please upload JPG, PNG, or WebP files under 5MB.');
        }
        
        // Compress each image
        const compressedFile = await this.compressImage(file);
        console.log(`Compressed file ${index + 1}:`, compressedFile.name, compressedFile.size);
        
        // Generate unique filename - FIXED: Better filename handling
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2);
        const originalName = file.name || `image_${timestamp}.jpg`;
        const extension = originalName.split('.').pop() || 'jpg';
        const fileName = `${timestamp}_${randomId}.${extension}`;
        const imagePath = `trips/${userId}/${tripId}/gallery/${fileName}`;
        
        console.log(`Uploading to path:`, imagePath);
        
        // Upload to Firebase Storage
        const storageRef = ref(storage, imagePath);
        const snapshot = await uploadBytes(storageRef, compressedFile);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        console.log(`Upload successful for ${originalName}:`, downloadURL);
        
        // Report progress
        if (onProgress) {
          onProgress(index + 1, files.length);
        }
        
        return {
          url: downloadURL,
          path: imagePath,
          filename: fileName,
          originalName: originalName,
          size: compressedFile.size,
          uploadedAt: new Date().toISOString(),
          order: index
        };
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }
    });
  
    const results = await Promise.all(uploadPromises);
    console.log('All uploads completed:', results);
    return results;
  }

  // Delete multiple images
  async deleteMultipleImages(imagePaths) {
    const deletePromises = imagePaths.map(async (path) => {
      try {
        const imageRef = ref(storage, path);
        await deleteObject(imageRef);
        return { success: true, path };
      } catch (error) {
        console.error(`Error deleting image ${path}:`, error);
        return { success: false, path, error: error.message };
      }
    });

    return Promise.all(deletePromises);
  }

  // Reorder images (for gallery management)
  reorderImages(images, fromIndex, toIndex) {
    const reorderedImages = [...images];
    const [movedImage] = reorderedImages.splice(fromIndex, 1);
    reorderedImages.splice(toIndex, 0, movedImage);
    
    // Update order indices
    return reorderedImages.map((image, index) => ({
      ...image,
      order: index
    }));
  }
}

export const imageUploadService = new ImageUploadService();