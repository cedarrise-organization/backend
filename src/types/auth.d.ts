export interface TokenPayload {
    sub: string, 
    name: string,
    department: string,
    type: "access" | "refresh"
}