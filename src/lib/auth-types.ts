import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      onboarded: boolean;
      image?: string | null;
    };
  }

  interface User {
    role: string;
    onboarded: boolean;
  }
}
