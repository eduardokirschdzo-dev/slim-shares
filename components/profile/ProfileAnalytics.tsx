interface ProfileAnalyticsProps {
  totalAcessos: number;
  ultimoAcesso: string;
}

export default function ProfileAnalytics({
  totalAcessos,
  ultimoAcesso,
}: ProfileAnalyticsProps) {
  return (
    <div className="w-full mt-8 bg-[#0a0a0a] border border-yellow-600/30 rounded-3xl p-5 shadow-[0_0_20px_rgba(202,138,4,0.05)] relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-yellow-600/20 to-transparent pointer-events-none"></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>

            <span className="text-3xl font-bold text-white">
              {totalAcessos}
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Acessos nesse checkpoint
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            Último acesso
          </p>

          <p className="text-sm font-medium text-gray-300 mt-1">
            {ultimoAcesso}
          </p>
        </div>
      </div>

      <div className="w-full h-12 relative z-10">
        <svg
          viewBox="0 0 100 30"
          className="w-full h-full preserve-3d"
          preserveAspectRatio="none"
        >
          <path
            d="M0,25 C10,25 15,10 25,18 C35,26 40,5 50,15 C60,25 65,12 75,20 C85,28 95,5 100,10"
            fill="none"
            stroke="#eab308"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]"
          />
        </svg>
      </div>
    </div>
  );
}