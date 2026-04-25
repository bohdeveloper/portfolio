import { prisma } from "../lib/prisma";

export const getProjects = () => {
  return prisma.project.findMany();
};

export const createProject = (data: any) => {
  return prisma.project.create({ data });
};
