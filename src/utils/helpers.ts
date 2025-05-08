export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "";
  // More robust date formatting, handles potential invalid dates
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }
    return dateObj.toLocaleDateString(undefined, { // Use locale default, specify options
       year: 'numeric',
       month: 'short',
       day: 'numeric'
    });
  } catch (e) {
    console.error("Error formatting date:", date, e);
    return "Invalid Date";
  }
};