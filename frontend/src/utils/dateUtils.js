const formatToTimezone = (isoDate, offsetHours = 0) => {
  // Crée la date puis applique un décalage horaire en heures (ex: +3 pour UTC+3)
  const d = new Date(isoDate);
  const shifted = new Date(d.getTime() + offsetHours * 60 * 60 * 1000);

  const datePart = shifted.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timePart = shifted.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${timePart}`;
};

export { formatToTimezone };
