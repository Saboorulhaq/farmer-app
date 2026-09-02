import { formatFarmLabel } from './src/util/formatFarmLabel';

describe('formatFarmLabel', () => {
  test('prefers Ghana POST GPS number over address and uuid', () => {
    expect(
      formatFarmLabel('GA-123-4567', 'Some Address', 'abc-def-123'),
    ).toBe('GA-123-4567');
  });

  test('falls back to address when no GPS number', () => {
    expect(formatFarmLabel(null, 'Some Address', 'abc-def-123')).toBe(
      'Some Address',
    );
  });

  test('trims surrounding whitespace', () => {
    expect(formatFarmLabel('  GA-123-4567  ', '  Address  ', 'abc')).toBe(
      'GA-123-4567',
    );
    expect(formatFarmLabel(null, '  Address  ', 'abc')).toBe('Address');
  });

  test('shows a short friendly label instead of the raw uuid', () => {
    const label = formatFarmLabel(null, null, 'abc-def-ghi-jkl');
    expect(label).toBe('Farm abc-def');
  });

  test('returns a generic label when nothing is available', () => {
    expect(formatFarmLabel(null, null, null)).toBe('Farm');
    expect(formatFarmLabel('', '', '')).toBe('Farm');
  });
});