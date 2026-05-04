//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responseHandler.js";
import { getAllRoles, getUserRoles, roleAction } from "../../services/admin.services.js";

export const getAllRolesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await getAllRoles();

    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const getUserRolesController = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId!.toString();
  try {
    const response = await getUserRoles(userId);

    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const roleActionController = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId!.toString();
  const { action, rolename } = req.qtransformed;
  try {
    const response = await roleAction(userId, {action, rolename}); 
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};
