import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <h1>Bienvenue sur la plateforme</h1>
      <div className="buttons">
        <Link to="/login">Se connecter</Link>
        <Link to="/signup">S'inscrire</Link>
      </div>
    </div>
  );
}

export default Home;