import { Request, Response } from "express";
import { getProjects, createProject } from "../services/projects.service";

export const getAll = async (_req: Request, res: Response) => {
  const projects = await getProjects();
  res.json(projects);
};

export const create = async (req: Request, res: Response) => {
  const project = await createProject(req.body);
  res.json(project);
};
