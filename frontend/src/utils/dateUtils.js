import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

// Fuseau horaire EAT (East Africa Time = UTC+3)
const TIMEZONE = "Africa/Nairobi";

/**
 * Convertit un timestamp UTC en heure locale EAT
 * @param {string|Date} utcDate - Date en UTC
 * @param {string} formatStr - Format d'affichage (ex: 'HH:mm', 'dd/MM/yyyy HH:mm')
 * @returns {string} - Date formatée en EAT
 */
export const convertToEAT = (utcDate, formatStr = "HH:mm") => {
  if (!utcDate) return "N/A";

  try {
    // Convertir en objet Date si c'est une string
    const date = typeof utcDate === "string" ? parseISO(utcDate) : utcDate;

    // Convertir vers le fuseau horaire EAT
    const zonedDate = toZonedTime(date, TIMEZONE);

    // Formater
    return format(zonedDate, formatStr);
  } catch (error) {
    console.error("Erreur de conversion de date:", error);
    return "Erreur";
  }
};

/**
 * Convertit pour l'affichage dans les graphiques (HH:mm)
 */
export const convertToEATForChart = (utcDate) => {
  return convertToEAT(utcDate, "HH:mm");
};

/**
 * Convertit pour l'affichage complet (date + heure)
 */
export const convertToEATFull = (utcDate) => {
  return convertToEAT(utcDate, "dd/MM/yyyy HH:mm:ss");
};

/**
 * Convertit pour l'affichage date + heure courte
 */
export const convertToEATDateTime = (utcDate) => {
  return convertToEAT(utcDate, "dd/MM/yyyy HH:mm");
};
