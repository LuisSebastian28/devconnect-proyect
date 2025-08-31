import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  if (!address) return null;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 border rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 shadow-sm">
        {ensAvatar && (
          <img
            alt="ENS Avatar"
            src={ensAvatar}
            className="w-6 h-6 rounded-full"
          />
        )}
        <span className="truncate max-w-xs">
          {ensName ? `${ensName} (${address})` : address}
        </span>
      </div>

      {/* Botón de desconexión */}
      <button
        onClick={() => disconnect()}
        className="px-3 py-2 rounded-lg border border-red-500 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition"
      >
        Disconnect
      </button>
    </div>
  );
}
