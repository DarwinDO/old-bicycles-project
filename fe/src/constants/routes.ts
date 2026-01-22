// Route path constants for type-safe navigation
export const ROUTES = {
  HOME: '/',
  MARKET: '/market',
  BIKE_DETAIL: '/bikes/:id',
  SELL: '/sell',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  GUIDE: '/guide',
  // Admin routes
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_LISTINGS: '/admin/listings',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_DISPUTES: '/admin/disputes',
  // Inspector routes
  INSPECTOR: '/inspector',
  INSPECTOR_REQUESTS: '/inspector/requests',
  INSPECTOR_FORM: '/inspector/inspect/:id',
  INSPECTOR_HISTORY: '/inspector/history',
} as const;

// Helper function to build dynamic routes
export const buildRoute = {
  bikeDetail: (id: string | number) => `/bikes/${id}`,
};
