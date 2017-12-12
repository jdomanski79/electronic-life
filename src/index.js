import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import World from './World';
import registerServiceWorker from './registerServiceWorker';

const worldWidth = 30;  // cells
const worldHeight = 30; // cells


ReactDOM.render(<World key = {1} width={worldWidth} height={worldHeight}/>, document.getElementById('root'));

registerServiceWorker();
