import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import {
    HomePage,
    BikeListingPage,
    BikeDetailPage,
    SellBikePage,
    LoginPage,
    RegisterPage,
    ProfilePage,
    GuidePage,
} from './lazyPages';
import NotFoundPage from '../pages/NotFoundPage';

// Loading fallback component
function PageLoader() {
    return (
        <div className="page-loader">
            <div className="loader-spinner"></div>
        </div>
    );
}

export default function AppRouter() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route element={<MainLayout />}>
                    {/* Public routes */}
                    <Route path={ROUTES.HOME} element={<HomePage />} />
                    <Route path={ROUTES.MARKET} element={<BikeListingPage />} />
                    <Route path={ROUTES.BIKE_DETAIL} element={<BikeDetailPage />} />
                    <Route path={ROUTES.GUIDE} element={<GuidePage />} />
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

                    {/* Protected routes - require authentication */}
                    <Route
                        path={ROUTES.SELL}
                        element={
                            <ProtectedRoute>
                                <SellBikePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.PROFILE}
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 fallback */}
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
}
