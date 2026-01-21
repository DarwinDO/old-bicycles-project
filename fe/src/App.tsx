import { Routes, Route } from 'react-router-dom'
import { ROUTES } from './constants/routes'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import BikeListingPage from './pages/BikeListingPage'
import BikeDetailPage from './pages/BikeDetailPage'
import SellBikePage from './pages/SellBikePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import GuidePage from './pages/GuidePage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.MARKET} element={<BikeListingPage />} />
        <Route path={ROUTES.BIKE_DETAIL} element={<BikeDetailPage />} />
        <Route path={ROUTES.SELL} element={<SellBikePage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.GUIDE} element={<GuidePage />} />
      </Route>
    </Routes>
  )
}

export default App
