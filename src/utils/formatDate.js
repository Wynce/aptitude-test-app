// utils/formatDate.js
export function formatToMalaysiaTime(utcString) {
  const date = new Date(utcString);
  return date.toLocaleString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
