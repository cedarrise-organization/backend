//CONTROLLER
import { Request, Response, NextFunction } from "express";
import {
  listBlogs,
  getSingleBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../../../services/clientside/blog.services.js"
import { ValidationError } from "../../../lib/error.js";
import { successResponse } from "../../../utils/responseHandler.js";

export const listBlogsController = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit, search } = req.qtransformed;

  try {
    const response = await listBlogs(page, limit, search);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (err) {
    next(err);
  }
};

export const getSingleBlogController = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id!.toString();
  try {
    const response = await getSingleBlog(id!);
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const createBlogController = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description } = req.body;
  if (!req.file) throw new ValidationError("Please upload a file");
  try {
    const response = await createBlog(req, title, description);
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const updateBlogController = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description } = req.body;
  const id = req.params.id!.toString();
  try {
    const response = await updateBlog(id!, req, title, description);
    return successResponse(res, response.code, response.message);
  } catch (err) {
    next(err);
  }
};

export const deleteBlogController = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id!.toString();
  try {
    const response = await deleteBlog(id!);
    return successResponse(res, response.code, response.message);
  } catch (err) {
    next(err);
  }
};
