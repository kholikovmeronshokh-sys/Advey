import './style.css';
import * as THREE from 'three';
import { initBackground } from './background';
import { initAuth } from './auth';
import { initChat } from './chat';
import { initLanguage } from './language';
import { initAdmin } from './admin';

// Initialize 3D background
initBackground();

// Initialize language system
initLanguage();

// Initialize authentication
initAuth();

// Initialize chat
initChat();

// Initialize admin (if user is admin)
initAdmin();
