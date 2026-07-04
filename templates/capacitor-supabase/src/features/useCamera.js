import { useState } from 'react';
export function useCamera() {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const takePhoto = async () => {
    setLoading(true);
    try {
      const Camera = (await import('@capacitor/camera')).Camera;
      const img = await Camera.getPhoto({ quality: 50, allowEditing: false, resultType: 'DataUrl' });
      setPhoto(img.dataUrl);
      return img;
    } catch (e) { console.error('Camera error:', e); return null; }
    finally { setLoading(false); }
  };
  const pickFromGallery = async () => {
    setLoading(true);
    try {
      const Camera = (await import('@capacitor/camera')).Camera;
      const img = await Camera.getPhoto({ quality: 50, allowEditing: true, resultType: 'DataUrl', source: 'PHOTOS' });
      setPhoto(img.dataUrl);
      return img;
    } catch (e) { console.error('Gallery error:', e); return null; }
    finally { setLoading(false); }
  };
  return { photo, loading, takePhoto, pickFromGallery };
}