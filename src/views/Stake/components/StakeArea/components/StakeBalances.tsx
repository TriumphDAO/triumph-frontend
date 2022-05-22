import { t } from "@lingui/macro";
import { Accordion, AccordionDetails, AccordionSummary } from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { DataRow } from "@olympusdao/component-library";
import { NetworkId } from "src/constants";
import { DecimalBigNumber } from "src/helpers/DecimalBigNumber/DecimalBigNumber";
import { nonNullable } from "src/helpers/types/nonNullable";
import {
  useFuseBalance,
  useGtocBalance,
  useGtocTokemakBalance,
  useOhmBalance,
  useStocBalance,
  useV1StocBalance,
  useWstocBalance,
} from "src/hooks/useBalance";
import { useCurrentIndex } from "src/hooks/useCurrentIndex";
import { useTestableNetworks } from "src/hooks/useTestableNetworks";

const DECIMAL_PLACES_SHOWN = 4;

const hasVisibleBalance = (balance?: DecimalBigNumber) =>
  balance && balance.toApproxNumber() > 9 / Math.pow(10, DECIMAL_PLACES_SHOWN + 1);

const formatBalance = (balance?: DecimalBigNumber) => balance?.toFormattedString(DECIMAL_PLACES_SHOWN);

export const StakeBalances = () => {
  const networks = useTestableNetworks();
  const { data: currentIndex } = useCurrentIndex();

  const gtocBalances = useGtocBalance();
  const wstocBalances = useWstocBalance();

  const tocBalance = useOhmBalance()[networks.MAINNET].data;
  const stocBalance = useStocBalance()[networks.MAINNET].data;
  const v1stocBalance = useV1StocBalance()[networks.MAINNET].data;
  const gtocFuseBalance = useFuseBalance()[NetworkId.MAINNET].data;
  const gtocTokemakBalance = useGtocTokemakBalance()[NetworkId.MAINNET].data;

  const stocTokens = [stocBalance, v1stocBalance];

  const gtocTokens = [
    gtocFuseBalance,
    gtocTokemakBalance,
    gtocBalances[networks.MAINNET].data,
    gtocBalances[networks.ARBITRUM].data,
    gtocBalances[networks.AVALANCHE].data,
    gtocBalances[NetworkId.POLYGON].data,
    gtocBalances[NetworkId.FANTOM].data,
    wstocBalances[networks.MAINNET].data,
    wstocBalances[networks.ARBITRUM].data,
    wstocBalances[networks.AVALANCHE].data,
    gtocBalances[NetworkId.OPTIMISM].data,
  ];

  const totalStocBalance = stocTokens
    .filter(nonNullable)
    .reduce((res, bal) => res.add(bal), new DecimalBigNumber("0", 9));

  const totalGtocBalance = gtocTokens
    .filter(nonNullable)
    .reduce((res, bal) => res.add(bal), new DecimalBigNumber("0", 18));

  const totalStakedBalance = currentIndex && formatBalance(totalGtocBalance.mul(currentIndex, 9).add(totalStocBalance));

  const allBalancesLoaded = stocTokens.every(Boolean) && gtocTokens.every(Boolean);

  return (
    <>
      <DataRow
        id="user-balance"
        title={t`Unstaked Balance`}
        isLoading={!tocBalance}
        balance={`${formatBalance(tocBalance)} OHM`}
      />

      <Accordion className="stake-accordion" square defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore className="stake-expand" />}>
          <DataRow
            id="user-staked-balance"
            isLoading={!allBalancesLoaded}
            title={t`Total Staked Balance`}
            balance={`${totalStakedBalance} sOHM`}
          />
        </AccordionSummary>

        <AccordionDetails>
          <DataRow
            indented
            title={t`sOHM`}
            id="stoc-balance"
            isLoading={!stocBalance}
            balance={`${formatBalance(stocBalance)} sOHM`}
          />

          <DataRow
            indented
            title={t`gOHM`}
            isLoading={!gtocBalances[networks.MAINNET].data}
            balance={`${formatBalance(gtocBalances[networks.MAINNET].data)} gOHM`}
          />

          {hasVisibleBalance(gtocBalances[NetworkId.ARBITRUM].data) && (
            <DataRow
              indented
              title={t`gOHM (Arbitrum)`}
              isLoading={!gtocBalances[NetworkId.ARBITRUM].data}
              balance={`${formatBalance(gtocBalances[NetworkId.ARBITRUM].data)} gOHM`}
            />
          )}

          {hasVisibleBalance(gtocBalances[NetworkId.AVALANCHE].data) && (
            <DataRow
              indented
              title={t`gOHM (Avalanche)`}
              isLoading={!gtocBalances[NetworkId.AVALANCHE].data}
              balance={`${formatBalance(gtocBalances[NetworkId.AVALANCHE].data)} gOHM`}
            />
          )}

          {hasVisibleBalance(gtocBalances[NetworkId.POLYGON].data) && (
            <DataRow
              indented
              title={t`gOHM (Polygon)`}
              isLoading={!gtocBalances[NetworkId.POLYGON].data}
              balance={`${formatBalance(gtocBalances[NetworkId.POLYGON].data)} gOHM`}
            />
          )}

          {hasVisibleBalance(gtocBalances[NetworkId.FANTOM].data) && (
            <DataRow
              indented
              title={t`gOHM (Fantom)`}
              isLoading={!gtocBalances[NetworkId.FANTOM].data}
              balance={`${formatBalance(gtocBalances[NetworkId.FANTOM].data)} gOHM`}
            />
          )}

          {hasVisibleBalance(gtocBalances[NetworkId.OPTIMISM].data) && (
            <DataRow
              indented
              title={t`gOHM (Optimism)`}
              isLoading={!gtocBalances[NetworkId.OPTIMISM].data}
              balance={`${formatBalance(gtocBalances[NetworkId.OPTIMISM].data)} gOHM`}
            />
          )}

          {hasVisibleBalance(gtocTokemakBalance) && (
            <DataRow
              indented
              title={t`gOHM (Tokemak)`}
              isLoading={!gtocTokemakBalance}
              balance={`${formatBalance(gtocTokemakBalance)} gOHM`}
            />
          )}

          {hasVisibleBalance(gtocFuseBalance) && (
            <DataRow
              indented
              title={t`gOHM (Fuse)`}
              isLoading={!gtocFuseBalance}
              balance={`${formatBalance(gtocFuseBalance)} gOHM`}
            />
          )}

          {hasVisibleBalance(v1stocBalance) && (
            <DataRow
              indented
              title={t`sOHM (v1)`}
              isLoading={!v1stocBalance}
              balance={`${formatBalance(v1stocBalance)} sOHM`}
            />
          )}

          {hasVisibleBalance(wstocBalances[networks.MAINNET].data) && (
            <DataRow
              indented
              title={t`wsOHM`}
              isLoading={!wstocBalances[networks.MAINNET].data}
              balance={`${formatBalance(wstocBalances[networks.MAINNET].data)} wsOHM`}
            />
          )}

          {hasVisibleBalance(wstocBalances[NetworkId.ARBITRUM].data) && (
            <DataRow
              indented
              title={t`wsOHM (Arbitrum)`}
              isLoading={!wstocBalances[NetworkId.ARBITRUM].data}
              balance={`${formatBalance(wstocBalances[NetworkId.ARBITRUM].data)} wsOHM`}
            />
          )}

          {hasVisibleBalance(wstocBalances[NetworkId.AVALANCHE].data) && (
            <DataRow
              indented
              title={t`wsOHM (Avalanche)`}
              isLoading={!wstocBalances[NetworkId.AVALANCHE].data}
              balance={`${formatBalance(wstocBalances[NetworkId.AVALANCHE].data)} wsOHM`}
            />
          )}
        </AccordionDetails>
      </Accordion>
    </>
  );
};
