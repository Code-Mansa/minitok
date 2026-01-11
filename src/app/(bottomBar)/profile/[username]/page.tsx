import ProfilePage from "@/components/profile/ProfilePage";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return <ProfilePage username={username} />;
}
