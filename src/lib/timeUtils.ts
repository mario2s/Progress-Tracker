export const timeUtils = {
  hoursToMinutes: (hours: number): number => hours * 60,

  minutesToHours: (minutes: number): number => minutes / 60,

  formatMinutesDisplay: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  },

  formatProgress: (progressMinutes: number, targetHours: number): string => {
    const progressHours = Math.floor(progressMinutes / 60);
    const progressMins = progressMinutes % 60;

    return `${progressHours}h ${progressMins}m / ${targetHours}h`;
  },

  getProgressPercentage: (progressMinutes: number, targetHours: number): number => {
    const targetMinutes = targetHours * 60;
    const percentage = (progressMinutes / targetMinutes) * 100;
    return percentage;
  },
};
