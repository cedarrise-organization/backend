//CONTROLLER
import { Request, Response, NextFunction } from "express";
import {
  listBlog,
  getSingleBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../../services/blog.services.js";
import { ValidationError } from "../../lib/error.js";
import { successResponse } from "../../utils/responseHandler.js";

export const listBlogController = async (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (err) {
    next(err);
  }
};

export const getSingleBlogController = async (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (err) {
    next(err);
  }
};

export const createBlogController = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description } = req.body;

  if (!req.file) throw new ValidationError("Please upload a file");

  console.log("\nREQUEST.FILE:\n",req.file)
  try {
    const response = await createBlog(req, title, description)
    return successResponse(res, response.code, response.message, response.data)
  } catch (err) {
    next(err);
  }
};

export const updateBlogController = async (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (err) {
    next(err);
  }
};

export const deleteBlogController = async (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (err) {
    next(err);
  }
};
