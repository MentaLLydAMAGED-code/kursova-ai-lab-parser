/* Profile.jsx */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage('⚠️ Будь ласка, увійдіть у свій акаунт');
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5001/api/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setMessage('❌ Не вдалося завантажити історію: ' + (error.response?.data?.message || 'Сервер недоступний'));
      }
    };
    fetchHistory();
  }, [navigate]);

  const handleFileSelect = (filePath, labResult) => {
    navigate('/process', { state: { filePath, labResult } });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Особистий кабінет</h2>
      <h3>Історія завантажених файлів</h3>
      {message && <p>{message}</p>}
      {history.length === 0 ? (
        <p>Історія порожня.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Файл</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Дата</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Дія</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.filePath || 'Невідомий файл'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {item.uploadedAt ? new Date(item.uploadedAt).toLocaleString() : 'Невідома дата'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button
                    onClick={() => handleFileSelect(item.filePath, item.labResult)}
                    style={{ padding: '5px 10px' }}
                  >
                    Переглянути
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Profile;