/* Header.jsx */
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './header.css';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <nav className="header">
      <ul>
        <li>
          <NavLink to="/" end>
            Головна
          </NavLink>
        </li>
        <li>
          <NavLink to="/upload">
            Завантаження
          </NavLink>
        </li>
        <li>
          <NavLink to="/process">
            Обробка
          </NavLink>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <NavLink to="/profile">
                Профіль
              </NavLink>
            </li>
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                Вихід
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/login">
                Вхід
              </NavLink>
            </li>
            <li>
              <NavLink to="/register">
                Реєстрація
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Header;