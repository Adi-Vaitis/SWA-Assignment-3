import {Token} from "../Model/token";
import {Game} from "../Model/game";

export class GameService {
    private static API_URL: string = 'http://localhost:9090';
    private constructor() {
    }

    static async getGame(token: Token, gameId: number) {
        const apiUrl = new URL(`${this.API_URL}/games/${gameId}`);
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

    static async getGames(token: Token) {
        const apiUrl = new URL(`${this.API_URL}/games`);
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

    static async createGame(token: Token) {
        const apiUrl = new URL(`${this.API_URL}/games`);
        if (token) {
            apiUrl.searchParams.append('token', token.token.token);
        }

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow',
        } as RequestInit;

        return fetch(apiUrl.toString(), requestOptions);
    }

    static async updateGame(token: Token, gameId: number, gameUpdates: Game) {
        const apiUrl = new URL(`${this.API_URL}/games/${gameId}`);
        if (token) {
            apiUrl.searchParams.append('token', token.token.token);
        }

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(gameUpdates);

        var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        } as RequestInit;

        return fetch(apiUrl.toString(), requestOptions);
    }
}