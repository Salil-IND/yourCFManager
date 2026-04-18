import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Explorer from './pages/Explorer';
import Bookmarks from './pages/Bookmarks';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Explorer />} /> {/*This is the Default Child (caused by the index attribute) */}
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;