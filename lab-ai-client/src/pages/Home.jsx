/* Home.jsx */
import React from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="page home-page">
      <div className="card">
        <h1>Ласкаво просимо! Це AI-сервіс для виконання лабораторних робіт.</h1>
        <p>Завантаж PDF з лабораторною, і ми все зробимо за тебе — аналіз, генерація, редагування та історія робіт.</p>
        <button onClick={() => navigate('/upload')}>Спробувати зараз</button>
      </div>
    </div>
  );
};

export default Home;




