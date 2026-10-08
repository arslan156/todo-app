export const formatLocalDateKey = (date = new Date()) => {
  const pad = (number) => String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}`;
};

export const getDueDateStatus = (
  dueDate,
  today = formatLocalDateKey()
) => {
  if (!dueDate) {
    return null;
  }

  if (dueDate < today) {
    return "overdue";
  }

  if (dueDate === today) {
    return "today";
  }

  return "upcoming";
};
