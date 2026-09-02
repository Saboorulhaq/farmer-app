export const formatFarmLabel = (
  ghanaPostGpsNumber?: string | null,
  address?: string | null,
  uuid?: string | null,
): string => {
  if (ghanaPostGpsNumber && ghanaPostGpsNumber.trim() !== '') {
    return ghanaPostGpsNumber.trim();
  }
  if (address && address.trim() !== '') {
    return address.trim();
  }
  if (uuid && uuid.trim() !== '') {
    const short = uuid.trim().slice(0, 8).replace(/[-\s]+$/g, '');
    return `Farm ${short}`;
  }
  return 'Farm';
};