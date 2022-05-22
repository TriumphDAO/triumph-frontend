import { t } from "@lingui/macro";
import { DataRow } from "@olympusdao/component-library";
import { formatNumber } from "src/helpers";
import { DecimalBigNumber } from "src/helpers/DecimalBigNumber/DecimalBigNumber";
import { nonNullable } from "src/helpers/types/nonNullable";
import {
  useFuseBalance,
  useGohmBalance,
  useSohmBalance,
  useV1SohmBalance,
  useWsohmBalance,
} from "src/hooks/useBalance";
import { useCurrentIndex } from "src/hooks/useCurrentIndex";
import { useStakingRebaseRate } from "src/hooks/useStakingRebaseRate";
import { useTestableNetworks } from "src/hooks/useTestableNetworks";
import { NetworkId } from "src/networkDetails";

export const StakeNextRebaseAmount = () => {
  const { data: rebaseRate } = useStakingRebaseRate();

  const stocBalances = useSohmBalance();
  const gtocBalances = useGohmBalance();
  const wstocBalances = useWsohmBalance();
  const v1stocBalances = useV1SohmBalance();
  const gtocFuseBalances = useFuseBalance();
  const gtocTokemakBalances = useGohmBalance();

  const networks = useTestableNetworks();
  const { data: currentIndex } = useCurrentIndex();

  const stocTokens = [stocBalances[networks.MAINNET].data, v1stocBalances[networks.MAINNET].data];
  const totalStocBalance = stocTokens
    .filter(nonNullable)
    .reduce((res, bal) => res.add(bal), new DecimalBigNumber("0", 9));

  const gtocTokens = [
    gtocBalances[networks.MAINNET].data,
    gtocBalances[NetworkId.ARBITRUM].data,
    gtocBalances[NetworkId.AVALANCHE].data,
    gtocBalances[NetworkId.POLYGON].data,
    gtocBalances[NetworkId.FANTOM].data,
    gtocBalances[NetworkId.OPTIMISM].data,
    wstocBalances[NetworkId.MAINNET].data,
    wstocBalances[NetworkId.ARBITRUM].data,
    wstocBalances[NetworkId.AVALANCHE].data,
    gtocFuseBalances[NetworkId.MAINNET].data,
    gtocTokemakBalances[NetworkId.MAINNET].data,
  ];
  const totalGtocBalance = gtocTokens
    .filter(nonNullable)
    .reduce((res, bal) => res.add(bal), new DecimalBigNumber("0", 18));

  const props: PropsOf<typeof DataRow> = { title: t`Next Reward Amount` };

  if (rebaseRate && stocBalances && totalGtocBalance && currentIndex) {
    const nextRewardAmount = rebaseRate * totalGtocBalance.mul(currentIndex, 9).add(totalStocBalance).toApproxNumber();
    props.balance = `${formatNumber(nextRewardAmount, 4)} sOHM`;
  } else props.isLoading = true;

  return <DataRow {...props} />;
};
