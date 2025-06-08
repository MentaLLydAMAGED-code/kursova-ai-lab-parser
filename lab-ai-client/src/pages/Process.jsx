/* Process.jsx */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './process.css';

const Process  = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const initialLabResult = state?.labResult || localStorage.getItem('lastLabResult') || '';
  const initialFilePath = state?.filePath || localStorage.getItem('lastFilePath') || '';

  const [editedResult, setEditedResult] = useState(initialLabResult);
  const [message, setMessage] = useState('');
  const [resultId, setResultId] = useState(null);

  useEffect(() => {
    const fetchSavedResult = async () => {
      if (!initialFilePath) return;

      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('⚠️ Будь ласка, увійдіть у свій акаунт.');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5001/api/get-result?filePath=${encodeURIComponent(initialFilePath)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && data.labResult) {
          setEditedResult(data.labResult);
          setResultId(data.id);
          setMessage(`✅ Завантажено збережений результат (ID: ${data.id})`);
        } else {
          setMessage('⚠️ Результат не знайдено.');
        }
      } catch (error) {
        setMessage('⚠️ Не вдалося завантажити збережений результат: ' + error.message);
      }
    };

    fetchSavedResult();
  }, [initialFilePath, navigate]);

  const handleChange = (e) => {
    const text = e.target.value;
    if (text.length > 10000) {
      setMessage('⚠️ Текст занадто довгий (максимум 10000 символів).');
      return;
    }
    setEditedResult(text);
    setMessage('');
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('⚠️ Будь ласка, увійдіть у свій акаунт.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ labResult: editedResult, filePath: initialFilePath }),
      });
      const result = await response.json();
      if (response.ok) {
        setResultId(result.id);
        setMessage(`✅ Зміни збережено! ID: ${result.id}`);
      } else {
        setMessage('❌ Помилка при збереженні: ' + result.message);
      }
    } catch (error) {
      setMessage('🚫 Сервер недоступний: ' + error.message);
    }
  };

  const handleExport = () => {
    const blob = new Blob([editedResult], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lab_result.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const displayResultId = resultId ? `Текущий ID результату: ${resultId}` : '';

  if (!initialLabResult && !initialFilePath) {
    return (
      <div className="process-wrapper">
        <div className="process-box">
          <h2>Обробка лабораторної роботи</h2>
          <p className="process-message">⚠️ Спочатку завантажте PDF на сторінці завантаження.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="process-wrapper">
      <div className="process-box">
        <h2>Результат лабораторної роботи</h2>

        <div className="task-result">
          <p><strong>Завантажений файл:</strong> <a href={initialFilePath} target="_blank" rel="noopener noreferrer">{initialFilePath}</a></p>
          <p>{displayResultId}</p>
          <h3>Результат від AI:</h3>
          <textarea
            value={editedResult}
            onChange={handleChange}
            rows={15}
            placeholder="Результат з'явиться тут після обробки..."
          />
          <div className="button-group">
            <button onClick={handleSave}>💾 Зберегти зміни</button>
            <button onClick={handleExport}>📥 Експортувати як TXT</button>
            <button onClick={() => navigate('/upload')}>⬅️ Повернутися до завантаження</button>
          </div>
        </div>

        {message && <p className="process-message">{message}</p>}
      </div>
    </div>
  );
};

export default Process;