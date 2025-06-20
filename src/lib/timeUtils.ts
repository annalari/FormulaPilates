// Portugal national and Braga holidays for 2024
const HOLIDAYS = {
  national: [
    "2024-01-01", // Ano Novo
    "2024-02-13", // Carnaval
    "2024-03-29", // Sexta-feira Santa
    "2024-03-31", // Páscoa
    "2024-04-25", // Dia da Liberdade
    "2024-05-01", // Dia do Trabalhador
    "2024-06-10", // Dia de Portugal
    "2024-06-20", // Corpo de Deus
    "2024-08-15", // Assunção de Nossa Senhora
    "2024-10-05", // Implantação da República
    "2024-11-01", // Dia de Todos os Santos
    "2024-12-01", // Restauração da Independência
    "2024-12-08", // Dia da Imaculada Conceição
    "2024-12-25", // Natal
  ],
  braga: [
    "2024-06-24", // São João
    "2024-12-08", // Imaculada Conceição
  ],
};

export const isValidDate = (date: Date | null): boolean => {
  if (date === null) return false;
  try {
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

export const isHoliday = (date: Date | null): boolean => {
  try {
    if (!isValidDate(date)) return false;
    const formattedDate = date!.toISOString().split("T")[0];
    return (
      HOLIDAYS.national.includes(formattedDate) ||
      HOLIDAYS.braga.includes(formattedDate)
    );
  } catch {
    return false;
  }
};

export const calculateHours = (start: Date | null, end: Date | null): number => {
  try {
    if (!isValidDate(start) || !isValidDate(end)) return 0;
    const diff = end!.getTime() - start!.getTime();
    if (diff < 0) return 0;
    return Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
  } catch {
    return 0;
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

export const formatDate = (date: Date | null): string => {
  if (!isValidDate(date)) return "--/--/----";
  // Format date as dd/mm/yyyy
  const day = date!.getDate().toString().padStart(2, '0');
  const month = (date!.getMonth() + 1).toString().padStart(2, '0');
  const year = date!.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatTime = (date: Date | null): string => {
  if (!isValidDate(date)) return "--:--";
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date!);
};

export type WorkLog = {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  hours: number;
  earnings: number;
};

export type Experimental = {
  id: string;
  date: Date;
  time: Date;
  patientName: string;
  closedPackage: boolean;
};
