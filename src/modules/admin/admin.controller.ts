//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responseHandler.js";
import {
  createUser,
  getAllRoles,
  getUserRoles,
  listAllUsers,
  roleAction,
  deleteUser,
} from "../../services/admin.services.js";

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
    const response = await roleAction(userId, { action, rolename });
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, department } = req.body;
  try {
    const response = await createUser({ name, email, password, department });
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const listAllUsersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await listAllUsers();
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId!.toString();
  try {
    const response = await deleteUser(userId);
    return successResponse(res, response.code, response.message);
  } catch (err) {
    next(err);
  }
};
