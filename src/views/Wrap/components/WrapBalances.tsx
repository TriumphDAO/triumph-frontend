import { t } from "@lingui/macro";
import { DataRow } from "@olympusdao/component-library";
import { useWeb3Context } from "src/hooks";
import { useGtocBalance, useStocBalance, useWstocBalance } from "src/hooks/useBalance";
import { useTestableNetworks } from "src/hooks/useTestableNetworks";

export const WrapBalances = () => {
  const networks = useTestableNetworks();
  const { networkId } = useWeb3Context();
  const stocBalance = useStocBalance()[networks.MAINNET].data;

  const gtocBalances = useGtocBalance();
  const gtocArb = gtocBalances[networks.ARBITRUM].data;
  const gtocAvax = gtocBalances[networks.AVALANCHE].data;
  const gtocMainnet = gtocBalances[networks.MAINNET].data;

  const wstocBalances = useWstocBalance();
  const wstocArb = wstocBalances[networks.ARBITRUM].data;
  const wstocAvax = wstocBalances[networks.AVALANCHE].data;

  if (networkId === networks.AVALANCHE)
    return (
      <>
        <DataRow
          isLoading={!wstocAvax}
          title={t`wsOHM Balance (Avalanche)`}
          balance={wstocAvax?.toFormattedString(4) + ` wsOHM`}
        />
        <DataRow
          isLoading={!gtocAvax}
          title={t`gOHM Balance (Avalanche)`}
          balance={gtocAvax?.toFormattedString(4) + ` gOHM`}
        />
      </>
    );

  if (networkId === networks.ARBITRUM)
    return (
      <>
        <DataRow
          isLoading={!wstocArb}
          title={t`wsOHM Balance (Arbitrum)`}
          balance={wstocArb?.toFormattedString(4) + ` wsOHM`}
        />
        <DataRow
          isLoading={!gtocArb}
          title={t`gOHM Balance (Arbitrum)`}
          balance={gtocArb?.toFormattedString(4) + ` gOHM`}
        />
      </>
    );

  return (
    <>
      <DataRow title={t`sOHM Balance`} isLoading={!stocBalance} balance={stocBalance?.toFormattedString(4) + ` sOHM`} />
      <DataRow title={t`gOHM Balance`} isLoading={!gtocMainnet} balance={gtocMainnet?.toFormattedString(4) + ` gOHM`} />
    </>
  );
};
