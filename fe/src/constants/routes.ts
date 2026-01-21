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
} as const;

// Helper function to build dynamic routes
export const buildRoute = {
  bikeDetail: (id: string | number) => `/bikes/${id}`,
};
