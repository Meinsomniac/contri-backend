import { groupRepository } from "@infrastructure/database/repositories/group.repository";
import { AppError } from "@shared/error/AppError";
import { NextFunction, Request, Response } from "express";

export const requireMember = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const actorId = req.user?.id;
  if (!actorId) throw new AppError("Unauthorized", 401);
  const group = await groupRepository.findByPublicId(req.params.publicId);
  if (!group) throw new AppError("Group not found", 404);
  const membership = await groupRepository.findMember(group.id, actorId);
  if (!membership || membership.leftAt) throw new AppError("Not a group member", 403);
  req.group = group;
  req.membership = membership;
  next();
};

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await requireMember(req, res, () => undefined);
  if (!req.membership?.isAdmin) throw new AppError("Admin access required", 403);
  next();
};

export const requireAdminOrSelf = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await requireMember(req, res, () => undefined);
  if (!req.membership?.isAdmin && req.params.uid !== req.user?.id) {
    throw new AppError("Admin or self access required", 403);
  }
  next();
};
