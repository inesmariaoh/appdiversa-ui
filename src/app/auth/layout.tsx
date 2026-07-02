import { LayoutAuthMigas } from '@/components/auth/012_layout_auth_migas';

export default function LayoutAuth({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <LayoutAuthMigas>{children}</LayoutAuthMigas>;
}
