interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

interface ProfileLinksProps {
  links: LinkItem[];
}

export default function ProfileLinks({ links }: ProfileLinksProps) {
  if (!links || links.length === 0) {
    return <p className="text-center text-sm text-zinc-400 py-4">Nenhum link cadastrado ainda.</p>;
  }

  return (
    <div className="w-full space-y-3 mt-4">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full p-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium text-zinc-800 dark:text-zinc-200 transition-all shadow-sm hover:scale-[1.01]"
        >
          {link.title}
        </a>
      ))}
    </div>
  );
}