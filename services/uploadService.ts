/**
 * Uploads the audio blob to a temporary file hosting service (file.io)
 * to generate a publicly accessible URL for sharing via Webhooks.
 * 
 * NOTE: In a production environment, replace this with your own S3/OSS upload logic.
 */
export const uploadAudio = async (blob: Blob): Promise<string> => {
  const formData = new FormData();
  // Generate a unique filename
  const filename = `dege-voice-${Date.now()}.webm`;
  formData.append('file', blob, filename);

  try {
    // file.io is a free ephemeral file sharing service.
    // Files are deleted after 1 download or 14 days by default.
    // We request 14 days expiration for this demo utility.
    const response = await fetch('https://file.io/?expires=2w', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.link) {
      return data.link;
    } else {
      throw new Error('Upload failed: No link received');
    }
  } catch (error) {
    console.error('Audio upload error:', error);
    throw error;
  }
};