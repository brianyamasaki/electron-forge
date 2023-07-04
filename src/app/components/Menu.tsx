import React from 'react';
import { Link } from 'react-router-dom';
import './Menu.scss';

const Menu = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Back to Home</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
