import { Router } from "express";
import { getAll, create } from "../controllers/projects.controller";

const router = Router();

router.get("/", getAll);
router.post("/", create);

export default router;
