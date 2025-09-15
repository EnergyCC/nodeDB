const { hashPassword, comparePassword } = require('../utils/passwordUtils');

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      
      // Check that the hashed password is a string
      expect(typeof hashedPassword).toBe('string');
      
      // Check that the hashed password is different from the original
      expect(hashedPassword).not.toBe(password);
      
      // Check that the hashed password starts with the bcrypt prefix
      expect(hashedPassword.startsWith('$2b$')).toBe(true);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testpassword123';
      const hashedPassword1 = await hashPassword(password);
      const hashedPassword2 = await hashPassword(password);
      
      // Check that the hashes are different (due to different salts)
      expect(hashedPassword1).not.toBe(hashedPassword2);
    });

    it('should throw an error for invalid input', async () => {
      await expect(hashPassword(null)).rejects.toThrow();
      await expect(hashPassword(undefined)).rejects.toThrow();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      const isMatch = await comparePassword(password, hashedPassword);
      
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await hashPassword(password);
      const isMatch = await comparePassword(wrongPassword, hashedPassword);
      
      expect(isMatch).toBe(false);
    });

    it('should throw an error for invalid input', async () => {
      await expect(comparePassword(null, 'hash')).rejects.toThrow();
      await expect(comparePassword('password', null)).rejects.toThrow();
    });
  });
});