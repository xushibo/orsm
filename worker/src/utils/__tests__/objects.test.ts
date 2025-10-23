/**
 * Tests for objects utility
 */

import { COMMON_OBJECTS, extractObjectName } from '../objects';

describe('Objects Utility', () => {
  describe('COMMON_OBJECTS', () => {
    it('should contain expected common objects', () => {
      expect(COMMON_OBJECTS).toContain('cat');
      expect(COMMON_OBJECTS).toContain('dog');
      expect(COMMON_OBJECTS).toContain('car');
      expect(COMMON_OBJECTS).toContain('apple');
      expect(COMMON_OBJECTS).toContain('book');
    });

    it('should have reasonable number of objects', () => {
      expect(COMMON_OBJECTS.length).toBeGreaterThan(20);
      expect(COMMON_OBJECTS.length).toBeLessThan(100);
    });
  });

  describe('extractObjectName', () => {
    it('should extract object name from text containing common objects', () => {
      expect(extractObjectName('I can see a cat in this picture')).toBe('Cat');
      expect(extractObjectName('There is a dog playing in the yard')).toBe('Dog');
      expect(extractObjectName('A red car is parked outside')).toBe('Car');
    });

    it('should return capitalized first letter', () => {
      expect(extractObjectName('I see an apple on the table')).toBe('Apple');
      expect(extractObjectName('There is a book on the shelf')).toBe('Book');
    });

    it('should return first word if no common object found', () => {
      expect(extractObjectName('I see a zebra in the zoo')).toBe('Zebra');
      expect(extractObjectName('There is a unicorn in the forest')).toBe('Unicorn');
    });

    it('should handle empty or invalid input', () => {
      expect(extractObjectName('')).toBeNull();
      expect(extractObjectName('   ')).toBeNull();
      expect(extractObjectName('123 456')).toBeNull();
    });

    it('should handle special characters', () => {
      expect(extractObjectName('I see a cat!')).toBe('Cat');
      expect(extractObjectName('There is a dog, and it\'s happy')).toBe('Dog');
    });

    it('should return null for very short words', () => {
      expect(extractObjectName('I see a')).toBeNull();
      expect(extractObjectName('There is an')).toBeNull();
    });
  });
});
