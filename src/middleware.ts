// import { authMiddleware } from "@kinde-oss/kinde-auth-nextjs/server";
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/auth-callback"],
};

export default function middleware(req: any) {
  return withAuth(req);
}
