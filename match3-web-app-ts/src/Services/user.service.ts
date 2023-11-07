import {User} from "../Model/user";
import {LocalStorageService} from "./localStorage.service";

export class UserService {

    private localStorageService: LocalStorageService;
    constructor() {
        this.localStorageService = new LocalStorageService();
    }

    async register(user: User) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(user);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        } satisfies RequestInit;

        return fetch("http://localhost:9090/users", requestOptions);
    }

    async getUser(userId: number) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        } satisfies RequestInit;

        return fetch(`http://localhost:9090/users/${userId}`, requestOptions);
    }

    isLoggedIn(): boolean {
        return this.localStorageService.get("user") != null;
    }
}