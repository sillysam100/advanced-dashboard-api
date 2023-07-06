declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      organizationId: string;
    };
  }
}
