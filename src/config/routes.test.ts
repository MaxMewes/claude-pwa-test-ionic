import { describe, it, expect } from 'vitest';
import { ROUTES } from './routes';

describe('ROUTES', () => {
  describe('authentication routes', () => {
    it('should have login route', () => {
      expect(ROUTES.LOGIN).toBeDefined();
      expect(typeof ROUTES.LOGIN).toBe('string');
    });

    it('should have register route', () => {
      expect(ROUTES.REGISTER).toBeDefined();
      expect(typeof ROUTES.REGISTER).toBe('string');
    });

    it('should have reset password route', () => {
      expect(ROUTES.RESET_PASSWORD).toBeDefined();
      expect(typeof ROUTES.RESET_PASSWORD).toBe('string');
    });

    it('should have two factor route', () => {
      expect(ROUTES.TWO_FACTOR).toBeDefined();
      expect(typeof ROUTES.TWO_FACTOR).toBe('string');
    });
  });

  describe('main navigation routes', () => {
    it('should have results route', () => {
      expect(ROUTES.RESULTS).toBeDefined();
      expect(typeof ROUTES.RESULTS).toBe('string');
    });

    it('should have patients route', () => {
      expect(ROUTES.PATIENTS).toBeDefined();
      expect(typeof ROUTES.PATIENTS).toBe('string');
    });

    it('should have laboratories route', () => {
      expect(ROUTES.LABORATORIES).toBeDefined();
      expect(typeof ROUTES.LABORATORIES).toBe('string');
    });

    it('should have news route', () => {
      expect(ROUTES.NEWS).toBeDefined();
      expect(typeof ROUTES.NEWS).toBe('string');
    });

    it('should have settings route', () => {
      expect(ROUTES.SETTINGS).toBeDefined();
      expect(typeof ROUTES.SETTINGS).toBe('string');
    });
  });

  describe('settings sub-routes', () => {
    it('should have notifications settings route', () => {
      expect(ROUTES.SETTINGS_NOTIFICATIONS).toBeDefined();
      expect(ROUTES.SETTINGS_NOTIFICATIONS).toContain('settings');
    });

    it('should have biometric settings route', () => {
      expect(ROUTES.SETTINGS_BIOMETRIC).toBeDefined();
      expect(ROUTES.SETTINGS_BIOMETRIC).toContain('settings');
    });

    it('should have password change route', () => {
      expect(ROUTES.SETTINGS_PASSWORD).toBeDefined();
      expect(ROUTES.SETTINGS_PASSWORD).toContain('settings');
    });

    it('should have privacy policy route', () => {
      expect(ROUTES.SETTINGS_PRIVACY).toBeDefined();
      expect(ROUTES.SETTINGS_PRIVACY).toContain('settings');
    });

    it('should have FAQ route', () => {
      expect(ROUTES.SETTINGS_FAQ).toBeDefined();
      expect(ROUTES.SETTINGS_FAQ).toContain('settings');
    });
  });

  describe('help routes', () => {
    it('should have help route', () => {
      expect(ROUTES.HELP).toBeDefined();
      expect(typeof ROUTES.HELP).toBe('string');
    });

    it('should have about route', () => {
      expect(ROUTES.HELP_ABOUT).toBeDefined();
      expect(ROUTES.HELP_ABOUT).toContain('help');
    });

    it('should have feedback route', () => {
      expect(ROUTES.HELP_FEEDBACK).toBeDefined();
      expect(ROUTES.HELP_FEEDBACK).toContain('help');
    });
  });

  describe('route consistency', () => {
    it('should have all routes start with /', () => {
      Object.values(ROUTES).forEach((route) => {
        expect(route).toMatch(/^\//);
      });
    });

    it('should not have trailing slashes', () => {
      Object.values(ROUTES).forEach((route) => {
        if (route !== '/') {
          expect(route).not.toMatch(/\/$/);
        }
      });
    });

    it('should use lowercase paths', () => {
      Object.values(ROUTES).forEach((route) => {
        // Allow :id parameters
        const pathWithoutParams = route.replace(/:[^/]+/g, '');
        expect(pathWithoutParams).toBe(pathWithoutParams.toLowerCase());
      });
    });
  });
});
