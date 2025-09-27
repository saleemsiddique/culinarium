// page.tsx (server component - pequeño wrapper)
import dynamic from "next/dynamic";

const ForgotPasswordClient = dynamic(
  () => import("./ForgotPasswordClient"),
  { ssr: false }
);

export default function Page() {
  return <ForgotPasswordClient />;
}
