import {User} from "../Model/user";
import {Token} from "../Model/token";

export class UserService {
    private static PATH: string = 'http://localhost:9090';

    constructor() {
    }

    static async register(user: User) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(user);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        } satisfies RequestInit;

        return fetch(`${this.PATH}/users`, requestOptions);
    }

    static async getUser(token: Token) {
        const apiUrl = new URL(`${this.PATH}/users/${token.userId}`);
        if (token) {
            apiUrl.searchParams.append('token', token.token.token);
        }

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow',
        } satisfies RequestInit;

        return fetch(apiUrl.toString(), requestOptions);
    }
}