import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/constants/appRoutes";

/**
 * Entry point.
 *
 * By the time this page renders, middleware has already verified that the
 * user is configured (folder-configured cookie present). If they weren't,
 * they would have been redirected to /onboarding before reaching here.
 *
 * We simply forward them to the library view.
 */
export default function Home(): never {
  redirect(APP_ROUTES.library);
}
