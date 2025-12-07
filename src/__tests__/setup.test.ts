import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

describe('Project Setup', () => {
  describe('TypeScript Configuration', () => {
    it('should compile TypeScript without errors', () => {
      // If this test runs, TypeScript is configured correctly
      const testValue: string = 'TypeScript is working'
      expect(testValue).toBe('TypeScript is working')
    })

    it('should support type inference', () => {
      const inferredNumber = 42
      const inferredString = 'hello'
      const inferredArray = [1, 2, 3]
      
      expect(typeof inferredNumber).toBe('number')
      expect(typeof inferredString).toBe('string')
      expect(Array.isArray(inferredArray)).toBe(true)
    })
  })

  describe('Vitest Configuration', () => {
    it('should run tests successfully', () => {
      expect(true).toBe(true)
    })

    it('should support async tests', async () => {
      const result = await Promise.resolve('async works')
      expect(result).toBe('async works')
    })

    it('should have access to expect matchers', () => {
      expect(1).toBeDefined()
      expect(null).toBeNull()
      expect([1, 2, 3]).toHaveLength(3)
      expect({ key: 'value' }).toHaveProperty('key')
    })
  })

  describe('fast-check Configuration', () => {
    it('should be properly installed and importable', () => {
      expect(fc).toBeDefined()
      expect(typeof fc.assert).toBe('function')
      expect(typeof fc.property).toBe('function')
    })

    it('should run a simple property test', () => {
      fc.assert(
        fc.property(fc.integer(), (n) => {
          expect(n + 0).toBe(n)
        }),
        { numRuns: 100 }
      )
    })

    it('should support string generators', () => {
      fc.assert(
        fc.property(fc.string(), (s) => {
          expect(s.length).toBeGreaterThanOrEqual(0)
        }),
        { numRuns: 100 }
      )
    })

    it('should support array generators', () => {
      fc.assert(
        fc.property(fc.array(fc.integer()), (arr) => {
          expect(Array.isArray(arr)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })
  })
})
