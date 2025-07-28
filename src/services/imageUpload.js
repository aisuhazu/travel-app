import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

class ImageUploadService {
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
          resolve(new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          }));
        }, file.type, quality);
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
}

export const imageUploadService = new ImageUploadService();