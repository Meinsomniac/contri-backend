export type WeeklySettleSchedule = {
  type: "WEEKLY";
  dayOfWeek: number;
  hour: number;
};

export type MonthlySettleSchedule = {
  type: "MONTHLY";
  dayOfMonth: number;
  hour: number;
};

export type SettleSchedule = WeeklySettleSchedule | MonthlySettleSchedule;
