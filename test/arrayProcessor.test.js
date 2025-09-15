const { processArrayField, processPairedArrays, processTripleArrays } = require('../utils/arrayProcessor');

describe('Array Processor Utilities', () => {
  describe('processArrayField', () => {
    it('should process array field with multiple values', () => {
      const body = { testField: ['value1', 'value2', 'value3'] };
      const result = processArrayField(body, 'testField');
      const parsedResult = JSON.parse(result);
      
      expect(Array.isArray(parsedResult)).toBe(true);
      expect(parsedResult).toEqual(['value1', 'value2', 'value3']);
    });

    it('should process array field with single value', () => {
      const body = { testField: 'singleValue' };
      const result = processArrayField(body, 'testField');
      const parsedResult = JSON.parse(result);
      
      expect(Array.isArray(parsedResult)).toBe(true);
      expect(parsedResult).toEqual(['singleValue']);
    });

    it('should filter out empty values', () => {
      const body = { testField: ['value1', '', 'value2', null, 'value3', undefined, '  '] };
      const result = processArrayField(body, 'testField');
      const parsedResult = JSON.parse(result);
      
      expect(parsedResult).toEqual(['value1', 'value2', 'value3']);
    });

    it('should return empty array for missing field', () => {
      const body = {};
      const result = processArrayField(body, 'missingField');
      const parsedResult = JSON.parse(result);
      
      expect(parsedResult).toEqual([]);
    });
  });

  describe('processPairedArrays', () => {
    it('should process paired arrays with multiple values', () => {
      const body = {
        field1: ['a1', 'a2', 'a3'],
        field2: ['b1', 'b2', 'b3']
      };
      const [result1, result2] = processPairedArrays(body, 'field1', 'field2');
      const parsedResult1 = JSON.parse(result1);
      const parsedResult2 = JSON.parse(result2);
      
      expect(parsedResult1).toEqual(['a1', 'a2', 'a3']);
      expect(parsedResult2).toEqual(['b1', 'b2', 'b3']);
    });

    it('should process paired arrays with single values', () => {
      const body = {
        field1: 'a1',
        field2: 'b1'
      };
      const [result1, result2] = processPairedArrays(body, 'field1', 'field2');
      const parsedResult1 = JSON.parse(result1);
      const parsedResult2 = JSON.parse(result2);
      
      expect(parsedResult1).toEqual(['a1']);
      expect(parsedResult2).toEqual(['b1']);
    });

    it('should handle mismatched array lengths', () => {
      const body = {
        field1: ['a1', 'a2'],
        field2: ['b1', 'b2', 'b3']
      };
      const [result1, result2] = processPairedArrays(body, 'field1', 'field2');
      const parsedResult1 = JSON.parse(result1);
      const parsedResult2 = JSON.parse(result2);
      
      expect(parsedResult1).toEqual(['a1', 'a2', '']);
      expect(parsedResult2).toEqual(['b1', 'b2', 'b3']);
    });
  });

  describe('processTripleArrays', () => {
    it('should process triple arrays with multiple values', () => {
      const body = {
        field1: ['a1', 'a2', 'a3'],
        field2: ['b1', 'b2', 'b3'],
        field3: ['c1', 'c2', 'c3']
      };
      const [result1, result2, result3] = processTripleArrays(body, 'field1', 'field2', 'field3');
      const parsedResult1 = JSON.parse(result1);
      const parsedResult2 = JSON.parse(result2);
      const parsedResult3 = JSON.parse(result3);
      
      expect(parsedResult1).toEqual(['a1', 'a2', 'a3']);
      expect(parsedResult2).toEqual(['b1', 'b2', 'b3']);
      expect(parsedResult3).toEqual(['c1', 'c2', 'c3']);
    });

    it('should process triple arrays with single values', () => {
      const body = {
        field1: 'a1',
        field2: 'b1',
        field3: 'c1'
      };
      const [result1, result2, result3] = processTripleArrays(body, 'field1', 'field2', 'field3');
      const parsedResult1 = JSON.parse(result1);
      const parsedResult2 = JSON.parse(result2);
      const parsedResult3 = JSON.parse(result3);
      
      expect(parsedResult1).toEqual(['a1']);
      expect(parsedResult2).toEqual(['b1']);
      expect(parsedResult3).toEqual(['c1']);
    });

    it('should handle mismatched array lengths', () => {
      const body = {
        field1: ['a1', 'a2'],
        field2: ['b1', 'b2', 'b3'],
        field3: ['c1']
      };
      const [result1, result2, result3] = processTripleArrays(body, 'field1', 'field2', 'field3');
      const parsedResult1 = JSON.parse(result1);
      const parsedResult2 = JSON.parse(result2);
      const parsedResult3 = JSON.parse(result3);
      
      expect(parsedResult1).toEqual(['a1', 'a2', '']);
      expect(parsedResult2).toEqual(['b1', 'b2', 'b3']);
      expect(parsedResult3).toEqual(['c1', '', '']);
    });
  });
});