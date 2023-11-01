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

        return fetch("http://localhost:9090/users", requestOptions)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(result => JSON.parse(result) as User)
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error.message);
    });
    }
}