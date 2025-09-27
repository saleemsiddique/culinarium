// page.tsx (Server component wrapper)
import dynamic from "next/dynamic";

const ForgotPasswordClient = dynamic(
  () => import("./ForgotPasswordClient"),
  { ssr: false }
);

export default function Page() {
  return <ForgotPasswordClient />;
}
