import { Router } from "express";
import { createUser, findUser, findUsers, getTopUsersWithLatestComments, getTopUsersWithLatestCommentsWithQuery, login} from "../controllers/user";

const router = Router();

router.route("/users").post(createUser).get(findUsers);
router.post("/users/login", login);
router.get("/users/top-users", getTopUsersWithLatestComments);
router.get("/users/:id", findUser);

export default router;
