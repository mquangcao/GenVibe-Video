import axiosClient from '@/apis/axiosClient';
import { useState } from 'react';

function UploadVideoPage() {
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState('Video demo');
  const [description, setDescription] = useState('Đây là mô tả video.');
  const [tags, setTags] = useState('test,ai,video');

  const handleUpload = async () => {
    if (!videoFile) {
      alert('Hãy chọn 1 file video');
      return;
    }

    const formData = new FormData();
    formData.append('videoFile', videoFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);

    try {
      const res = await axiosClient.post('/api/video/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('✅ Upload thành công: ' + res.data);
    } catch (err) {
      console.error(err);
      alert('❌ Upload thất bại: ' + err.response?.data || err.message);
    }
  };

  return (
    <div>
      <h2>Upload Video</h2>
      <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả" />
      <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tag cách nhau bởi dấu phẩy" />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default UploadVideoPage;
