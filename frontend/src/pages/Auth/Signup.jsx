import React from 'react';
import './Auth.css';

function Signup() {
  return (
    <div className="auth-container">
      <h2>Inscription</h2>
      <form>
        <input type="text" placeholder="Nom" required />
        <input type="text" placeholder="Prénom" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Mot de passe" required />
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
}

export default Signup;