// interface for getting the user when registering or getting it via ENDPOINT (for that it uses the loginUser.ts)
export interface User {
    id?: number;
    admin?: boolean;
    username: string;
    password: string;
}