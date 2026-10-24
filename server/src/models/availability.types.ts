export interface IOperatingHours {
  openingTime: string;
  closingTime: string;
  operatingDays: number[];
  slotIncrementMinutes: number;
  minDurationHours: number;
  maxDurationHours: number;
  bufferMinutes: number;
  timezone: string;
}

export interface IBlockedDateRange {
  _id?: string;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string;
}

export const defaultOperatingHours: IOperatingHours = {
  openingTime: '08:00',
  closingTime: '20:00',
  operatingDays: [0, 1, 2, 3, 4, 5, 6],
  slotIncrementMinutes: 60,
  minDurationHours: 1,
  maxDurationHours: 12,
  bufferMinutes: 0,
  timezone: 'Asia/Kolkata',
};

