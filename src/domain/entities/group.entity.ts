import { nanoid } from "@shared/functions";
import { SettleSchedule } from "@shared/types/group.types";
import { AppError } from "@shared/error/AppError";

export class GroupMember {
  constructor(
    public readonly groupId: string,
    public readonly userId: string,
    public isAdmin: boolean = false,
    public joinedAt: Date = new Date(),
    public leftAt: Date | null = null,
  ) {}
}

export class Group {
  public readonly id: string;
  public publicId: string;
  public name: string;
  public avatar: string | null;
  public note: string | null;
  public settleSchedule: SettleSchedule | null;
  public nextSettleAt: Date | null;
  public isArchived: boolean;
  public createdBy: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date | null;
  public members: GroupMember[];

  constructor(
    id: string,
    name: string,
    createdBy: string,
    options?: {
      publicId?: string;
      avatar?: string | null;
      note?: string | null;
      settleSchedule?: SettleSchedule | null;
      nextSettleAt?: Date | null;
      isArchived?: boolean;
      createdAt?: Date;
      updatedAt?: Date;
      deletedAt?: Date | null;
      members?: GroupMember[];
    },
  ) {
    this.id = id;
    this.name = name;
    this.createdBy = createdBy;
    this.publicId = options?.publicId ?? this.generatePublicId();
    this.avatar = options?.avatar ?? null;
    this.note = options?.note ?? null;
    this.settleSchedule = options?.settleSchedule ?? null;
    this.nextSettleAt = options?.nextSettleAt ?? null;
    this.isArchived = options?.isArchived ?? false;
    this.createdAt = options?.createdAt ?? new Date();
    this.updatedAt = options?.updatedAt ?? new Date();
    this.deletedAt = options?.deletedAt ?? null;
    this.members = options?.members ?? [];
  }

  generatePublicId(): string {
    return `grp_${nanoid()}`;
  }

  static computeNextSettleAt(schedule: SettleSchedule | null): Date | null {
    if (!schedule) return null;
    const now = new Date();
    const next = new Date(now);
    next.setMinutes(0, 0, 0);

    console.log("schedule", schedule);

    if (schedule.type === "WEEKLY") {
      if (schedule.dayOfWeek < 0 || schedule.dayOfWeek > 6) {
        throw new AppError("Invalid weekly schedule dayOfWeek", 400);
      }
      const delta = (schedule.dayOfWeek - now.getDay() + 7) % 7;
      next.setDate(now.getDate() + delta);
      next.setHours(schedule.hour, 0, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 7);
      return next;
    }

    if (schedule.type === "MONTHLY") {
      if (schedule.dayOfMonth < 1 || schedule.dayOfMonth > 31) {
        throw new AppError("Invalid monthly schedule dayOfMonth", 400);
      }
      next.setDate(schedule.dayOfMonth);
      next.setHours(schedule.hour, 0, 0, 0);
      if (next <= now) next.setMonth(next.getMonth() + 1);
      return next;
    }

    throw new AppError("Unsupported settle schedule", 400);
  }

  canManage(userId: string): boolean {
    return this.members.some(
      (member) => member.userId === userId && member.isAdmin && !member.leftAt,
    );
  }

  isActiveMember(userId: string): boolean {
    return this.members.some(
      (member) => member.userId === userId && member.leftAt === null,
    );
  }
}
