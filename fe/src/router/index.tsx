import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import InspectorLayout from '../layouts/InspectorLayout';
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

// Admin pages (lazy loaded)
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminListingsPage = lazy(() => import('../pages/admin/AdminListingsPage'));
const AdminReportsPage = lazy(() => import('../pages/admin/AdminReportsPage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminDisputesPage = lazy(() => import('../pages/admin/AdminDisputesPage'));

// Inspector pages (lazy loaded)
const InspectorDashboardPage = lazy(() => import('../pages/inspector/InspectorDashboardPage'));
const InspectionRequestsPage = lazy(() => import('../pages/inspector/InspectionRequestsPage'));
const InspectionFormPage = lazy(() => import('../pages/inspector/InspectionFormPage'));
const InspectionHistoryPage = lazy(() => import('../pages/inspector/InspectionHistoryPage'));

import BikeLoader from '../components/common/BikeLoader';

// Loading fallback component


export default function AppRouter() {
    return (
        <Suspense fallback={<BikeLoader />}>
            <Routes>
                {/* Main layout routes */}
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
                </Route>

                {/* Admin layout routes */}
                <Route element={<AdminLayout />}>
                    <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
                    <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
                    <Route path={ROUTES.ADMIN_LISTINGS} element={<AdminListingsPage />} />
                    <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReportsPage />} />
                    <Route path={ROUTES.ADMIN_CATEGORIES} element={<AdminCategoriesPage />} />
                    <Route path={ROUTES.ADMIN_DISPUTES} element={<AdminDisputesPage />} />
                </Route>

                {/* Inspector layout routes */}
                <Route element={<InspectorLayout />}>
                    <Route path={ROUTES.INSPECTOR} element={<InspectorDashboardPage />} />
                    <Route path={ROUTES.INSPECTOR_REQUESTS} element={<InspectionRequestsPage />} />
                    <Route path={ROUTES.INSPECTOR_FORM} element={<InspectionFormPage />} />
                    <Route path={ROUTES.INSPECTOR_HISTORY} element={<InspectionHistoryPage />} />
                </Route>

                {/* 404 fallback */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
}
