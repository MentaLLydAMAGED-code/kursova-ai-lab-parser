/* Upload.jsx */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setMessage('');
    } else {
      setMessage('Будь ласка, виберіть PDF файл.');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Файл не обрано.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage('⚠️ Файл занадто великий (максимум 10 MB).');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('⚠️ Будь ласка, увійдіть у свій акаунт.');
      setIsLoading(false);
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        setMessage('✅ Файл успішно завантажено!');
        localStorage.setItem('lastLabResult', result.labResult);
        localStorage.setItem('lastFilePath', result.filePath);
        navigate('/process', { state: { labResult: result.labResult, filePath: result.filePath } });
      } else if (response.status === 401) {
        setMessage('❌ Сесія закінчилася. Будь ласка, увійдіть знову.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setMessage('❌ Помилка при завантаженні: ' + (await response.json()).message);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessage('⏰ Час запиту минув. Спробуйте ще раз.');
      } else {
        setMessage('🚫 Сервер недоступний: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-wrapper">
      <div className="upload-box">
        <h2>Завантаж PDF для обробки</h2>

        <label htmlFor="file-upload" className="custom-file-upload">
          📄 Вибрати файл
        </label>
        <input id="file-upload" type="file" accept="application/pdf" onChange={handleFileChange} />

        <button onClick={handleUpload} disabled={isLoading}>
          {isLoading ? '⏳ Обробка...' : '🚀 Завантажити'}
        </button>

        {isLoading && (
          <div className="loader">
            <div className="spinner"></div>
            <p>Обробка вашого PDF...</p>
          </div>
        )}

        {message && <p className="upload-message">{message}</p>}
      </div>
    </div>
  );
};

export default Upload;