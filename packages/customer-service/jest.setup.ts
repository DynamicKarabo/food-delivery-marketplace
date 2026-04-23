// Set required environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-32-chars-long';
process.env.REFRESH_SECRET = 'test-refresh-secret-key-32-chars-long';

// Mock console.error to avoid noise in test output
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});
