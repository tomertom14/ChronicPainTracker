// Define what we send to the server
export interface LoginRequest {
  username: string;
  password?: string; // Optional because we might not send it back
}

// Define exactly what the server returns (based on our C# AuthController)
export interface AuthResponse {
  token: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}