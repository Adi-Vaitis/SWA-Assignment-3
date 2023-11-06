import {User} from "../Model/user";

export class LoginService{

        constructor(){

        }

        async login(user: User){
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
}