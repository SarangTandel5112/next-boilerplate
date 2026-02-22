/**
 * Application route constants.
 * Centralized location for all route paths to avoid hardcoded strings.
 */

/**
 * Main application routes.
 */
export const ROUTES = {
  /**
   * Home page route.
   */
  HOME: '/',

  /**
   * About page route.
   */
  ABOUT: '/about',

  /**
   * Counter feature page route.
   */
  COUNTER: '/counter',

  /**
   * Portfolio listing page route.
   */
  PORTFOLIO: '/portfolio',

  /**
   * Portfolio detail page route.
   * @param slug - Portfolio item slug/ID
   * @returns Portfolio detail route
   */
  PORTFOLIO_DETAIL: (slug: string | number) => `/portfolio/${slug}`,
} as const;
