import { WalletIcon } from "lucide-react";
import * as React from "react";
import { useConnect, type Connector } from "wagmi";

export function WalletOptions() {
  const { connectors, connect } = useConnect();
  const [open, setOpen] = React.useState(false);

  const handleSelect = async (connector: Connector) => {
    await connect({ connector });
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      >
        <WalletIcon className="h-5 w-5 text-indigo-600" />
        <span>Conect Wallet</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white shadow-lg z-50">
          <ul className="py-2 text-sm text-gray-700">
            {connectors.map((connector) => (
              <WalletOption
                key={connector.uid}
                connector={connector}
                onClick={() => handleSelect(connector)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector;
  onClick: () => void;
}) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  return (
    <li>
      <button
        disabled={!ready}
        onClick={onClick}
        className="block w-full text-left px-4 py-2 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {connector.name}
      </button>
    </li>
  );
}
