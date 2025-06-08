/* login.jsx */
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage('⚠️ Заповніть усі поля');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      setMessage('✅ Успішний вхід!');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (error) {
      setMessage('❌ Помилка входу: ' + (error.response?.data?.message || 'Сервер недоступний'));
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2>Вхід</h2>
        <form onSubmit={handleLogin}>
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
          <button type="submit">Увійти</button>
        </form>
        {message && <p className="auth-message">{message}</p>}
        <p className="auth-switch">
          Немає акаунту? <Link to="/register">Зареєструватися</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;