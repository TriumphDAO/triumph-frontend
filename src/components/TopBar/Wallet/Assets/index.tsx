import { Box, Fade, Link, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { OHMTokenStackProps, WalletBalance } from "@olympusdao/component-library";
import { FC } from "react";
import { NavLink } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { formatCurrency, formatNumber, trim } from "src/helpers";
import { DecimalBigNumber } from "src/helpers/DecimalBigNumber/DecimalBigNumber";
import { prettifySeconds } from "src/helpers/timeUtil";
import { nonNullable } from "src/helpers/types/nonNullable";
import { useAppSelector } from "src/hooks";
import {
  useFuseBalance,
  useGtocBalance,
  useGtocTokemakBalance,
  useOhmBalance,
  useStocBalance,
  useV1OhmBalance,
  useV1StocBalance,
  useWstocBalance,
} from "src/hooks/useBalance";
import { useCurrentIndex } from "src/hooks/useCurrentIndex";
import { useOhmPrice } from "src/hooks/usePrices";
import { useStakingRebaseRate } from "src/hooks/useStakingRebaseRate";
import { useTestableNetworks } from "src/hooks/useTestableNetworks";
import { NetworkId } from "src/networkDetails";
import { IUserNote } from "src/slices/BondSliceV2";
import { useNextRebaseDate } from "src/views/Stake/components/StakeArea/components/RebaseTimer/hooks/useNextRebaseDate";

import { GetTokenPrice } from "../queries";
import Balances from "./Balances";
import TransactionHistory from "./TransactionHistory";

const useStyles = makeStyles<Theme>(theme => ({
  selector: {
    "& p": {
      fontSize: "16px",
      fontWeight: 400,
      fontFamily: "SquareMedium",
      lineHeight: "24px",

      cursor: "pointer",
    },
    "& a": {
      color: theme.colors.gray[90],
      marginRight: "18px",
    },
    "& a:last-child": {
      marginRight: 0,
    },
    "& .active": {
      color: theme.palette.type === "light" ? theme.palette.primary.main : theme.colors.primary[300],
      textDecoration: "inherit",
    },
  },
  forecast: {
    textAlign: "right",
    "& .number": {
      fontWeight: 400,
    },
    "& .numberSmall": {
      justifyContent: "flex-end",
    },
  },
}));

/**
 * Component for Displaying Assets
 */

export interface OHMAssetsProps {
  path?: string;
}
const AssetsIndex: FC<OHMAssetsProps> = (props: { path?: string }) => {
  const history = useHistory();
  const networks = useTestableNetworks();
  const { data: tocPrice = 0 } = useOhmPrice();
  const { data: priceFeed = { usd_24h_change: -0 } } = GetTokenPrice();
  const { data: currentIndex = new DecimalBigNumber("0", 9) } = useCurrentIndex();
  const { data: nextRebaseDate } = useNextRebaseDate();
  const { data: rebaseRate = 0 } = useStakingRebaseRate();
  const { data: tocBalance = new DecimalBigNumber("0", 9) } = useOhmBalance()[networks.MAINNET];
  const { data: v1OhmBalance = new DecimalBigNumber("0", 9) } = useV1OhmBalance()[networks.MAINNET];
  const { data: v1StocBalance = new DecimalBigNumber("0", 9) } = useV1StocBalance()[networks.MAINNET];
  const { data: sOhmBalance = new DecimalBigNumber("0", 9) } = useStocBalance()[networks.MAINNET];
  const wstocBalances = useWstocBalance();
  const gtocBalances = useGtocBalance();
  const { data: gtocFuseBalance = new DecimalBigNumber("0", 18) } = useFuseBalance()[NetworkId.MAINNET];
  const { data: gtocTokemakBalance = new DecimalBigNumber("0", 18) } = useGtocTokemakBalance()[NetworkId.MAINNET];

  const gtocTokens = [
    gtocFuseBalance,
    gtocTokemakBalance,
    gtocBalances[networks.MAINNET].data,
    gtocBalances[NetworkId.ARBITRUM].data,
    gtocBalances[NetworkId.AVALANCHE].data,
    gtocBalances[NetworkId.POLYGON].data,
    gtocBalances[NetworkId.FANTOM].data,
    gtocBalances[NetworkId.OPTIMISM].data,
  ];
  const wstocTokens = [
    wstocBalances[NetworkId.MAINNET].data,
    wstocBalances[NetworkId.ARBITRUM].data,
    wstocBalances[NetworkId.AVALANCHE].data,
  ];

  const totalGtocBalance = gtocTokens
    .filter(nonNullable)
    .reduce((res, bal) => res.add(bal), new DecimalBigNumber("0", 18));

  const totalWstocBalance = wstocTokens
    .filter(nonNullable)
    .reduce((res, bal) => res.add(bal), new DecimalBigNumber("0", 18));

  const accountNotes: IUserNote[] = useAppSelector(state => state.bondingV2.notes);
  const formattedtocBalance = tocBalance.toFormattedString(4);
  const formattedV1OhmBalance = v1OhmBalance.toFormattedString(4);
  const formattedV1StocBalance = v1StocBalance.toFormattedString(4);
  const formattedWsOhmBalance = totalWstocBalance.toFormattedString(4);
  const formattedgOhmBalance = totalGtocBalance.toFormattedString(4);
  const formattedSOhmBalance = sOhmBalance.toFormattedString(4);
  const gOhmPriceChange = priceFeed.usd_24h_change * currentIndex.toApproxNumber();
  const gOhmPrice = tocPrice * currentIndex.toApproxNumber();
  const rebaseAmountPerDay = rebaseRate * Number(formattedSOhmBalance) * 3;
  const totalAsStoc = totalGtocBalance
    .mul(currentIndex, 9)
    .add(totalWstocBalance.mul(currentIndex, 9))
    .add(sOhmBalance)
    .add(v1StocBalance);

  const sOHMDailyForecast = formatNumber(totalAsStoc.toApproxNumber() * rebaseRate * 3, 2);
  const usdDailyForecast = formatCurrency(Number(sOHMDailyForecast) * tocPrice, 2);

  const tokenArray = [
    {
      symbol: ["OHM"] as OHMTokenStackProps["tokens"],
      balance: formattedtocBalance,
      assetValue: Number(formattedtocBalance) * tocPrice,
      alwaysShow: true,
    },
    {
      symbol: ["OHM"] as OHMTokenStackProps["tokens"],
      balance: formattedV1OhmBalance,
      label: "(v1)",
      assetValue: Number(formattedV1OhmBalance) * tocPrice,
    },
    {
      symbol: ["sOHM"] as OHMTokenStackProps["tokens"],
      balance: formattedSOhmBalance,
      timeRemaining:
        nextRebaseDate && `Stakes in ${prettifySeconds((nextRebaseDate.getTime() - new Date().getTime()) / 1000)}`,
      assetValue: Number(formattedSOhmBalance) * tocPrice,
      alwaysShow: true,
      lineThreeLabel: "Rebases per day",
      lineThreeValue:
        Number(formattedSOhmBalance) > 0
          ? `${trim(rebaseAmountPerDay, 3)} sOHM / ${formatCurrency(rebaseAmountPerDay * tocPrice, 2)}`
          : undefined,
    },
    {
      symbol: ["sOHM"] as OHMTokenStackProps["tokens"],
      balance: formattedV1StocBalance,
      label: "(v1)",
      timeRemaining:
        nextRebaseDate && `Stakes in ${prettifySeconds((nextRebaseDate.getTime() - new Date().getTime()) / 1000)}`,
      assetValue: Number(formattedV1StocBalance) * tocPrice,
    },
    {
      symbol: ["wsOHM"] as OHMTokenStackProps["tokens"],
      balance: formattedWsOhmBalance,
      assetValue: gOhmPrice * Number(formattedWsOhmBalance),
      geckoTicker: "governance-toc",
    },
    {
      symbol: ["gOHM"] as OHMTokenStackProps["tokens"],
      balance: formattedgOhmBalance,
      assetValue: gOhmPrice * Number(formattedgOhmBalance),
      pnl: formattedgOhmBalance ? 0 : formatCurrency(totalGtocBalance.toApproxNumber() * gOhmPriceChange, 2),
      alwaysShow: true,
      geckoTicker: "governance-toc",
    },
  ];

  const bondsArray = accountNotes.map((note, index) => ({
    key: index,
    symbol: note.bondIconSvg,
    balance: trim(note.payout, 4),
    label: "(Bond)",
    timeRemaining: note.timeLeft,
    assetValue: note.payout * gOhmPrice,
    underlyingSymbol: "gOHM",
    pnl: Number(note.payout) === 0 ? 0 : formatCurrency(note.payout * gOhmPriceChange, 2),
    ctaText: "Claim",
    ctaOnClick: () => history.push("/bonds"),
    geckoTicker: "governance-toc",
  }));

  const classes = useStyles();

  const assets = [...tokenArray, ...bondsArray];
  const walletTotalValueUSD = Object.values(assets).reduce((totalValue, token) => totalValue + token.assetValue, 0);

  return (
    <Fade in={true}>
      <Box>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <WalletBalance
            title="Balance"
            usdBalance={formatCurrency(walletTotalValueUSD, 2)}
            underlyingBalance={`${formatNumber(walletTotalValueUSD / tocPrice, 2)} OHM`}
          />
          <WalletBalance
            className={classes.forecast}
            title="Today's Forecast"
            usdBalance={`+ ${usdDailyForecast}`}
            underlyingBalance={`+${sOHMDailyForecast} OHM`}
          />
        </Box>
        <Box display="flex" flexDirection="row" className={classes.selector} mb="18px" mt="18px">
          <Link exact component={NavLink} to="/wallet">
            <Typography>My Wallet</Typography>
          </Link>
          <Link component={NavLink} to="/wallet/history">
            <Typography>History</Typography>
          </Link>
        </Box>
        {(() => {
          switch (props.path) {
            case "history":
              return <TransactionHistory />;
            default:
              return (
                <>
                  {assets.map(asset => (
                    <Balances token={asset} />
                  ))}
                </>
              );
          }
        })()}
      </Box>
    </Fade>
  );
};

export default AssetsIndex;
