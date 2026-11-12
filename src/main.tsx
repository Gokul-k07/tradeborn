import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { MotionConfig } from 'motion/react'
import '@fontsource-variable/manrope'
import '@fontsource-variable/dm-sans'
import '@fontsource/dm-mono/latin-400.css'
import '@fontsource/dm-mono/latin-500.css'
import './styles.css'
import './refinements.css'
import './motion.css'

createRoot(document.getElementById('root')!).render(<React.StrictMode><MotionConfig reducedMotion="user"><App /></MotionConfig></React.StrictMode>)
