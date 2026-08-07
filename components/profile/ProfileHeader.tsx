import Image from 'next/image';

interface ProfileHeaderProps {
  fullName: string;
  bio?: string;
  avatarUrl?: string;
}

export default function ProfileHeader({ fullName, bio, avatarUrl }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
      <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={fullName} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xl font-bold text-zinc-500">
            {fullName ? fullName.charAt(0).toUpperCase() : 'S'}
          </div>
        )}
      </div>
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{fullName || 'Usuário Slim'}</h1>
      {bio && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-xs">{bio}</p>}
    </div>
  );
}