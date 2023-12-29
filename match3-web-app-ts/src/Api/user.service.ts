import {User} from "../Model/user";
import {Token} from "../Model/token";

export class UserService {
    private static PATH: string = 'http://localhost:9090';

    private constructor() {
    }

    static async login(user: User){
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(user);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        } as RequestInit;

        return fetch("http://localhost:9090/login", requestOptions);
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
        } as RequestInit;

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
        } as RequestInit;

        return fetch(apiUrl.toString(), requestOptions);
    }

    static async updateUserProfile(token: Token, profileUpdates: {password?: string }) {
        const apiUrl = new URL(`${this.PATH}/users/${token.userId}`);

        if (token) {
            apiUrl.searchParams.append('token', token.token.token);
        }

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestBody = JSON.stringify({
            password: profileUpdates.password,
        });

        var requestOptions = {
            method: 'PATCH',
            headers: myHeaders,
            body: requestBody,
            redirect: 'follow',
        } as RequestInit;

        return fetch(apiUrl.toString(), requestOptions);
    }


}