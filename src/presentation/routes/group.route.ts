import { GroupController } from "@presentation/controllers/group.controller";
import { authenticate } from "@infrastructure/middleware/authenticate";
import {
  requireAdmin,
  requireAdminOrSelf,
  requireMember,
} from "@infrastructure/middleware/group-auth.middleware";
import { validator } from "@infrastructure/middleware/validator";
import {
  addMembersSchema,
  createGroupSchema,
  setMemberAdminSchema,
  updateGroupSchema,
} from "@presentation/validators/group.validator";
import { Router } from "express";
import { uploadSingle } from "@infrastructure/middleware/upload";

const router: Router = Router();

router.post("/", authenticate,uploadSingle("avatar"), validator(createGroupSchema), GroupController.createGroup);
router.get("/", authenticate, GroupController.listGroups);
router.get("/:publicId", authenticate, requireMember, GroupController.getGroup);
router.patch(
  "/:publicId",
  authenticate,
  requireAdmin,
  uploadSingle("avatar"),
  validator(updateGroupSchema),
  GroupController.updateGroup,
);
router.delete("/:publicId", authenticate, requireAdmin, GroupController.deleteGroup);
router.post("/:publicId/archive", authenticate, requireAdmin, GroupController.archiveGroup);

router.post(
  "/:publicId/members",
  authenticate,
  requireAdmin,
  validator(addMembersSchema),
  GroupController.addMembers,
);
router.delete(
  "/:publicId/members/:uid",
  authenticate,
  requireAdminOrSelf,
  GroupController.removeMember,
);
router.patch(
  "/:publicId/members/:uid",
  authenticate,
  requireAdmin,
  validator(setMemberAdminSchema),
  GroupController.setMemberAdmin,
);

router.get("/:publicId/balances", authenticate, requireMember, GroupController.getBalances);

export default router;
