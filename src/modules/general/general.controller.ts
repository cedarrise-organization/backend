//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { getProjects, createProjects, updateProjectStatus, deleteProjects } from "../../services/general.services.js";
import { successResponse } from "../../utils/responseHandler.js";

export const getProjectsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await getProjects();
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const createProjectsController = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description } = req.body;
  try {
    const response = await createProjects(req, { title, description });
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const updateProjectStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  const { status } = req.qtransformed;
  try {
    const response = await updateProjectStatus(id, status);
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const deleteProjectsController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteProjects(req, id);
    return successResponse(res, response.code, response.message);
  } catch (err) {
    next(err);
  }
};
