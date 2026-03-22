import z from "zod";

const settleScheduleSchema = z
  .object({
    type: z.enum(["WEEKLY", "MONTHLY"]),
    dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
    dayOfMonth: z.coerce.number().int().min(1).max(31).optional(),
    hour: z.coerce.number().int().min(0).max(23),
  })
  .superRefine((val, ctx) => {
    if (val.type === "WEEKLY" && val.dayOfWeek === undefined) {
      ctx.addIssue({ code: "custom", message: "dayOfWeek is required for WEEKLY schedule" });
    }
    if (val.type === "MONTHLY" && val.dayOfMonth === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "dayOfMonth is required for MONTHLY schedule",
      });
    }
  });

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Group name is required"),
    avatar: z.string().optional(),
    note: z.string().optional(),
    settleSchedule: settleScheduleSchema.optional(),
  }),
});

export const updateGroupSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      avatar: z.string().nullable().optional(),
      note: z.string().nullable().optional(),
      settleSchedule: settleScheduleSchema.nullable().optional(),
    })
    .refine((val) => Object.keys(val).length > 0, {
      message: "At least one field is required",
    }),
});

export const addMembersSchema = z.object({
  body: z.object({
    userIds: z.array(z.string().min(1)).min(1, "At least one member is required"),
  }),
});

export const setMemberAdminSchema = z.object({
  body: z.object({
    isAdmin: z.boolean(),
  }),
});
