/* Register.jsx */
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(pwd);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage('⚠️ Заповніть усі поля');
      return;
    }
    if (!validatePassword(password)) {
      setMessage('⚠️ Пароль повинен містити щонайменше 8 символів, включаючи літери та цифри');
      return;
    }

    try {
      await axios.post('http://localhost:5001/api/register', {
        email,
        password,
      });
      setMessage('✅ Успішна реєстрація! Увійдіть у свій акаунт.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      setMessage('❌ Помилка реєстрації: ' + (error.response?.data?.message || 'Сервер недоступний'));
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2>Реєстрація</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Введіть ваш email"
            />
          </div>
          <div className="input-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Введіть пароль"
            />
          </div>
          <button type="submit">Зареєструватися</button>
        </form>
        {message && <p className="auth-message">{message}</p>}
        <p className="auth-switch">
          Вже маєте акаунт? <Link to="/login">Увійти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;