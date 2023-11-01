import {User} from "../Model/user";

export class UserService {

    constructor() {

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
}