import { addMembersUseCase } from "@application/use-cases/group/add-members.usecase";
import { archiveGroupUseCase } from "@application/use-cases/group/archive-group.usecase";
import { createGroupUseCase } from "@application/use-cases/group/create-group.usecase";
import { deleteGroupUseCase } from "@application/use-cases/group/delete-group.usecase";
import { getGroupUseCase } from "@application/use-cases/group/get-group.usecase";
import { listGroupsUseCase } from "@application/use-cases/group/list-groups.usecase";
import { removeMemberUseCase } from "@application/use-cases/group/remove-member.usecase";
import { setMemberAdminUseCase } from "@application/use-cases/group/set-member-admin.usecase";
import { updateGroupUseCase } from "@application/use-cases/group/update-group.usecase";
import { balanceRepository } from "@infrastructure/database/repositories/balance.repository";
import { Request, Response } from "express";

export class GroupController {
  static async createGroup(req: Request, res: Response) {
    const avatar = req.file?.buffer;
    const data = await createGroupUseCase.execute({
      ...req.body,
      avatar,
      createdBy: req.user!.id,
    });
    res.status(201).json({ success: true, data });
  }

  static async listGroups(req: Request, res: Response) {
    const data = await listGroupsUseCase.execute(req.user!.id);
    res.status(200).json({ success: true, data });
  }

  static async getGroup(req: Request, res: Response) {
    const data = await getGroupUseCase.execute(req.params.publicId);
    res.status(200).json({ success: true, data });
  }

  static async updateGroup(req: Request, res: Response) {
    const avatar = req.file?.buffer;
    const data = await updateGroupUseCase.execute({
      publicId: req.params.publicId,
      ...req.body,
      avatar,
    });
    res.status(200).json({ success: true, data });
  }

  static async deleteGroup(req: Request, res: Response) {
    await deleteGroupUseCase.execute(req.params.publicId);
    res.status(200).json({ success: true, message: "Group deleted successfully" });
  }

  static async archiveGroup(req: Request, res: Response) {
    const isArchived = await archiveGroupUseCase.execute(req.params.publicId);
    res.status(200).json({ success: true, message: `Group ${isArchived ? "archived" : "unarchived"} successfully` });
  }

  static async addMembers(req: Request, res: Response) {
    await addMembersUseCase.execute(req.params.publicId, req.body.userIds);
    res.status(200).json({ success: true, message: "Members added successfully" });
  }

  static async removeMember(req: Request, res: Response) {
    await removeMemberUseCase.execute(req.params.publicId, req.params.uid);
    res.status(200).json({ success: true, message: "Member removed successfully" });
  }

  static async setMemberAdmin(req: Request, res: Response) {
    await setMemberAdminUseCase.execute(
      req.params.publicId,
      req.params.uid,
      req.body.isAdmin,
    );
    res.status(200).json({ success: true, message: "Member role updated successfully" });
  }

  static async getBalances(req: Request, res: Response) {
    const data = await balanceRepository.getByGroup(req.group!.id);
    res.status(200).json({ success: true, data });
  }
}
