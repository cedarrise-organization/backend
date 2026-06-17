//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { Parser } from "json2csv";
import {
  getProjects,
  createProjects,
  updateProjectStatus,
  deleteProjects,
  getReceipts,
  createReceipts,
  deleteReceipts,
  exportReceiptsTableToCSV,
} from "../../services/general.services.js";
import { successResponse } from "../../utils/responseHandler.js";
import { ValidationError } from "../../lib/error.js";

// PROJECTS
export const getProjectsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await getProjects();
    return successResponse(res, response.code, response.message, response.data, response.meta);
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

// RECEIPTS
export const getReceiptsController = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit, orderBy, search, sortBy } = req.qtransformed;
  try {
    const response = await getReceipts(page, limit, orderBy, search, sortBy);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (err) {
    next(err);
  }
};
export const createReceiptsController = async (req: Request, res: Response, next: NextFunction) => {
  const { name, amount, description } = req.body;

  if (!req.file) throw new ValidationError("Please upload the receipt file image");
  try {
    const response = await createReceipts(req, { name, amount, description });
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};
export const deleteReceiptsController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteReceipts(req, id);
    return successResponse(res, response.code, response.message);
  } catch (err) {
    next(err);
  }
};
export const exportReceiptsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await exportReceiptsTableToCSV();

    const fields = [
      "id",
      "name",
      "amount",
      "description",
      "uploadedBy",
      "imageUrl",
      "imagePublicId",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", 'attachment; filename="receipts.csv"');

    return res.status(200).send(Buffer.from(csv, "utf-8"));
  } catch (error) {
    next(error);
  }
};
