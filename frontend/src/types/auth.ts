export interface LoginRequest {
    email: string;
    password: string;
}

interface UserBase {
    email: string;
    firstName: string;
    lastName: string;
}

export interface User extends UserBase {
    id: string;
    locale: string;
}

export interface UserRegistration extends UserBase {
    password: string;
}

export interface UserUpdate extends UserBase {}

