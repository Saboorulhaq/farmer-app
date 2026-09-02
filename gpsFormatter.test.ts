import { validDistrictCodes } from './src/constants/regionCodes';
import { formatGpsInput } from './src/util/formatGPSNumber';

const testCases: [string, string][] = [
  ['G', 'G'],
  ['GA', 'GA'],
  ['GA1', 'GA-1'],
  ['GAC', 'GA'],
  ['AA', 'AA'],
  ['AAF', 'AAF'],
  ['AAH', 'AA'],
  ['AAM', 'AAM'],
  ['AA1', 'AA-1'],
  ['AA1234567', 'AA-123-4567'],
  ['AAM1234567', 'AAM-123-4567'],
  ['AAZ', 'AA'],
  ['AB', 'AB'],
  ['AKW', 'AKW'],
  ['AOE', 'AOE'],
  ['ASU', 'ASU'],
  ['AW', 'AW'],
  ['GA1234', 'GA-123-4'],
  ['GA1234567', 'GA-123-4567'],
  ['ZZ', ''],
  ['Z', ''],
  ['AA-A', 'AA'],
  ['AA1A', 'AA-1'],
  ['AAM1234X', 'AAM-123-4'],
  ['AAA', 'AA'],

  // Single letter + number prefixes
  ['A2', 'A2'],
  ['A2X', 'A2'],
  ['A3', 'A3'],
  ['A3X', 'A3'],
  ['A4', 'A4'],
  ['A4X', 'A4'],
];

describe('Ghana GPS Formatter', () => {
  testCases.forEach(([input, expected]) => {
    it(`formats "${input}" → "${expected}"`, () => {
      expect(formatGpsInput(input, validDistrictCodes)).toBe(expected);
    });
  });
});
