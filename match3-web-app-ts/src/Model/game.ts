import {User} from "./user";

export interface Game {
    id?: number;
    user_id: User["id"];
    score: number;
    completed: boolean;
}