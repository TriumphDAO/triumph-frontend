import { useQuery } from "react-query";
import { GOHM_ADDRESSES } from "src/constants/addresses";
import { getTokenPrice, parseBigNumber } from "src/helpers";
import { createDependentQuery } from "src/helpers/react-query/createDependentQuery";
import { queryAssertion } from "src/helpers/react-query/queryAssertion";
import { nonNullable } from "src/helpers/types/nonNullable";
import {
  useStaticBalancerV2PoolContract,
  useStaticBalancerVaultContract,
  useStaticPairContract,
} from "src/hooks/useContract";
import { useGtocPrice } from "src/hooks/usePrices";
import { ExternalPool } from "src/lib/ExternalPool";

export const stakePoolTVLQueryKey = (poolAddress: string) => ["useStakePoolTVL", poolAddress].filter(nonNullable);

export const useStakePoolTVL = (pool: ExternalPool) => {
  const contract = useStaticPairContract(pool.address, pool.networkID);

  // Get dependent data in parallel
  const key = stakePoolTVLQueryKey(pool.address);
  const useDependentQuery = createDependentQuery(key);
  const { data: gtocPrice } = useGtocPrice();
  const reserves = useDependentQuery("reserves", () => contract.getReserves());
  const firstTokenAddress = useDependentQuery("firstTokenAddress", () => contract.token0());
  const poolTokenSupply = useDependentQuery("poolTokenSupply", () => contract.totalSupply());
  const stakedBalance = useDependentQuery("stakedBalance", () => contract.balanceOf(pool.masterchef));
  const nonGtocTokenPrice = useDependentQuery("nonGtocTokenPrice", () => getTokenPrice(pool.pairGecko));

  return useQuery<number, Error>(
    key,
    async () => {
      queryAssertion(
        gtocPrice && stakedBalance && poolTokenSupply && reserves && nonGtocTokenPrice && firstTokenAddress,
        key,
      );

      const isFirstTokenGtoc =
        firstTokenAddress.toLowerCase() ===
        GOHM_ADDRESSES[pool.networkID as keyof typeof GOHM_ADDRESSES]?.toLowerCase();

      const firstTokenPrice = isFirstTokenGtoc ? gtocPrice : nonGtocTokenPrice;
      const secondTokenPrice = isFirstTokenGtoc ? nonGtocTokenPrice : gtocPrice;

      const totalLpAsUSD =
        parseBigNumber(reserves[0], 18) * firstTokenPrice + parseBigNumber(reserves[1], 18) * secondTokenPrice;

      const totalValueLocked = (totalLpAsUSD * parseBigNumber(stakedBalance, 18)) / parseBigNumber(poolTokenSupply, 18);

      return totalValueLocked;
    },
    {
      enabled:
        !!gtocPrice && !!stakedBalance && !!poolTokenSupply && !!reserves && !!nonGtocTokenPrice && !!firstTokenAddress,
    },
  );
};

export const BalancerPoolTVLQueryKey = (poolAddress: string) => ["useBalancerPoolTVL", poolAddress].filter(nonNullable);

export const BalancerPoolTVL = (pool: ExternalPool) => {
  const vault = pool.vault ? pool.vault : "";
  const useDependentQuery = createDependentQuery(BalancerPoolTVLQueryKey(pool.address));
  const poolContract = useStaticBalancerV2PoolContract(pool.address, pool.networkID);
  const vaultContract = useStaticBalancerVaultContract(vault, pool.networkID);
  const { data: gtocPrice } = useGtocPrice();
  const nonGtocTokenPrice = useDependentQuery("nonGtocTokenPrice", () => getTokenPrice("fantom"));
  const { data, isFetched, isLoading } = useQuery(
    ["BalancerPoolTVL", pool],
    async () => {
      queryAssertion(gtocPrice && nonGtocTokenPrice);
      const poolId = await poolContract.getPoolId();
      const stakedBalance = await poolContract.balanceOf(pool.masterchef);
      const vaultBalances = await vaultContract.getPoolTokens(poolId);
      const poolTokenSupply = await poolContract.totalSupply();
      const isFirstTokenGtoc =
        vaultBalances.tokens[0] === GOHM_ADDRESSES[pool.networkID as keyof typeof GOHM_ADDRESSES]?.toLowerCase();
      const firstTokenPrice = isFirstTokenGtoc ? gtocPrice : nonGtocTokenPrice;
      const secondTokenPrice = isFirstTokenGtoc ? nonGtocTokenPrice : gtocPrice;
      const totalLpAsUSD =
        parseBigNumber(vaultBalances.balances[0], 18) * firstTokenPrice +
        parseBigNumber(vaultBalances.balances[1], 18) * secondTokenPrice;
      const totalValueLocked = (totalLpAsUSD * parseBigNumber(stakedBalance, 18)) / parseBigNumber(poolTokenSupply, 18);
      return totalValueLocked;
    },
    { enabled: !!gtocPrice && !!nonGtocTokenPrice },
  );
  return { data, isFetched, isLoading };
};
