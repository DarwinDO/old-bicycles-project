import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BikeListingPage from './pages/BikeListingPage'
import MainLayout from './layouts/MainLayout'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/market" element={<BikeListingPage />} />
      </Route>
    </Routes>
  )
}

export default App
