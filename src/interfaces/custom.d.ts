declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      username: string;
      organizationId: string;
      roleId: string;
      role: string;
    };
  }
}
