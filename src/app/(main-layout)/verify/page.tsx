import { redirect } from 'next/navigation';

export default async function VerifyAliasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const email = typeof params.email === 'string' ? params.email : '';
  if (email) {
    redirect(`/verify-email?email=${encodeURIComponent(email)}`);
  }
  redirect('/verify-email');
}
