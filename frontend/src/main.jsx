// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import { AuthProvider } from './authContext.jsx'  
// import ProjectRoutes from './Routes.jsx'
// import { BrowserRouter as Router} from 'react-router-dom'
// createRoot(document.getElementById('root')).render(
//   <AuthProvider>
//   <Router>
//     <ProjectRoutes />
//     </Router>
//   </AuthProvider>,
// )


import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './authContext.jsx'
import ProjectRoutes from './Routes.jsx';
import Footer from './components/Footer.jsx';
import { BrowserRouter as Router } from 'react-router-dom'

const AppLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ProjectRoutes />
      <Footer />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <Router>
      <AppLayout />
    </Router>
  </AuthProvider>
);