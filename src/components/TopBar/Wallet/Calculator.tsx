import { Box, Fade, Grid, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { DottedDataRow, Input, ProgressCircle, Slider } from "@olympusdao/component-library";
import { FC, useEffect, useState } from "react";
import { formatNumber, trim } from "src/helpers";
import { DecimalBigNumber } from "src/helpers/DecimalBigNumber/DecimalBigNumber";
import { nonNullable } from "src/helpers/types/nonNullable";
import {
  useFuseBalance,
  useGtocBalance,
  useGtocTokemakBalance,
  useStocBalance,
  useV1StocBalance,
  useWstocBalance,
} from "src/hooks/useBalance";
import { useCurrentIndex } from "src/hooks/useCurrentIndex";
import { useProtocolMetrics } from "src/hooks/useProtocolMetrics";
import { useStakingRebaseRate } from "src/hooks/useStakingRebaseRate";
import { useTestableNetworks } from "src/hooks/useTestableNetworks";
import { NetworkId } from "src/networkDetails";

const useStyles = makeStyles<Theme>(theme => ({
  title: {
    color: theme.colors.gray[40],
    lineHeight: "18px",
    fontWeight: 400,
  },
  investmentAmount: {
    fontSize: "30px",
    lineHeight: "38px",
    fontWeight: 600,
  },
  runway: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 400,
    color: theme.colors.gray[90],
    " & span": {
      color: theme.palette.primary.main,
    },
  },
  progressMetric: {
    fontSize: "12px",
    lineHeight: "18px",
    fontWeight: 600,
  },
  progressLabel: {
    fontSize: "12px",
    lineHeight: "18px",
    fontWeight: 400,
    color: theme.colors.gray[90],
  },
  selector: {
    "& p": {
      fontSize: "16px",
      fontWeight: 400,
      fontFamily: "SquareMedium",
      lineHeight: "24px",
      marginRight: "18px",
      cursor: "pointer",
      color: theme.colors.gray[90],
      "&.active": {
        color: theme.palette.type === "light" ? theme.palette.primary.main : theme.colors.gray[10],
      },
      "&.active-primary": {
        color: theme.palette.type === "light" ? theme.palette.primary.main : theme.colors.primary[300],
      },
    },
    "& p:last-child": {
      marginRight: 0,
    },
  },
  radioGroup: {
    "& .MuiFormControlLabel-root:last-child": {
      marginRight: 0,
    },
  },
  targetDate: {
    fontSize: "16px",
    lineHeight: "24px",
    "& span": {
      marginLeft: "18px",
      color: theme.palette.type == "light" ? theme.colors.gray[90] : theme.colors.gray[40],
    },
  },
  ctaTitle: {
    fontWeight: 600,
    lineHeight: "24px",
    fontSize: "16px",
    marginBottom: "6px",
  },
  ctaSubtitle: {
    color: theme.colors.gray[90],
    fontWeight: 500,
    lineHeight: "20px",
  },
}));

/**
 * Component for Displaying Calculator
 */
const Calculator: FC = () => {
  const networks = useTestableNetworks();
  const { data: currentRebaseRate = 0 } = useStakingRebaseRate();
  const gtocBalances = useGtocBalance();
  const { data: sOhmBalance = new DecimalBigNumber("0", 9) } = useStocBalance()[networks.MAINNET];
  const { data: currentIndex = new DecimalBigNumber("0", 9) } = useCurrentIndex();
  const { data: gtocFuseBalance = new DecimalBigNumber("0", 18) } = useFuseBalance()[NetworkId.MAINNET];
  const { data: gtocTokemakBalance = new DecimalBigNumber("0", 18) } = useGtocTokemakBalance()[NetworkId.MAINNET];
  const wstocBalances = useWstocBalance();
  const { data: v1StocBalance = new DecimalBigNumber("0", 9) } = useV1StocBalance()[networks.MAINNET];

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

  const walletStoc = totalGtocBalance
    .mul(currentIndex, 9)
    .add(totalWstocBalance.mul(currentIndex, 9))
    .add(sOhmBalance)
    .add(v1StocBalance)
    .toApproxNumber();

  const [initialInvestment, setInitialInvestment] = useState(0);
  const [duration, setDuration] = useState(365);
  const [manualRebaseRate, setManualRebaseRate] = useState(0);
  const [advanced, setAdvanced] = useState(false);
  const classes = useStyles();
  const rebases = duration * 3;
  const { data: runwayData } = useProtocolMetrics();

  //protocol metrics hook is causing this ts error. disabling for now.
  //@ts-expect-error
  const runway = runwayData && trim(runwayData[0].runwayCurrent, 1);

  //If values are set on the Advanced view.
  const rebaseRate = advanced ? manualRebaseRate : +trim(currentRebaseRate, 7);

  const totalsOHM = (1 + rebaseRate) ** rebases * initialInvestment;
  const stocProfit = totalsOHM - initialInvestment;
  const pieValue = (stocProfit / totalsOHM) * 100;
  useEffect(() => {
    setManualRebaseRate(+trim(currentRebaseRate, 7));
  }, [currentRebaseRate]);

  useEffect(() => {
    setInitialInvestment(walletStoc);
  }, [walletStoc]);

  const ROI = formatNumber((stocProfit / initialInvestment) * 100);

  const handleChange: any = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setInitialInvestment(newValue);
    }
  };

  const handleDurationChange: any = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setDuration(newValue);
    }
  };

  const formattedProfits = formatNumber(stocProfit, 2);
  const formattedInitialInvestment = formatNumber(initialInvestment, 2);

  const durations = [
    { days: 365, label: "12 months" },
    { days: 180, label: "6 m" },
    { days: 90, label: "3 m" },
    { days: 60, label: "2 m" },
    { days: 30, label: "1 m" },
  ];

  return (
    <Fade in={true}>
      <Box>
        <Box display="flex" flexDirection="column" mb="21px">
          <Box display="flex" flexDirection="row" className={classes.selector} mb="30px">
            <Typography
              className={!advanced ? "active-primary" : ""}
              onClick={() => {
                setAdvanced(false);
              }}
            >
              Simple
            </Typography>
            <Typography className={advanced ? "active-primary" : ""} onClick={() => setAdvanced(true)}>
              Advanced
            </Typography>
          </Box>
          {!advanced && (
            <>
              <Box display="flex" justifyContent="center" mb="3px">
                <Typography className={classes.title}>Investment Amount:</Typography>
              </Box>
              <Box display="flex" justifyContent="center" mb="18px">
                <Typography className={classes.investmentAmount}>{formattedInitialInvestment} OHM</Typography>
              </Box>
              <Box display="flex" justifyContent="center">
                <Typography className={classes.runway}>
                  Runway: <span>{runway} Days</span>
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {advanced ? (
          <>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Input
                  id="amount"
                  label="sOHM Amount"
                  value={initialInvestment}
                  onChange={e => setInitialInvestment(Number(e.target.value))}
                  type="number"
                  inputProps={{ inputMode: "numeric" }}
                />
              </Grid>
              <Grid item xs={6}>
                <Input
                  id="rebaseRate"
                  label="Rebase Rate"
                  value={rebaseRate * 100}
                  onChange={e => setManualRebaseRate(Number(e.target.value) / 100)}
                  type="number"
                  endString="%"
                  inputProps={{ inputMode: "numeric" }}
                />
              </Grid>
            </Grid>

            <Box display="flex" flexDirection="row" justifyContent="space-between" mt="30px" mb="30px">
              <Typography className={classes.targetDate}>
                {duration} Days <span>Target date</span>
              </Typography>
              <Typography className={classes.runway}>
                Runway: <span>{runway} Days</span>
              </Typography>
            </Box>
            <Box ml="12px" mr="12px">
              <Slider value={duration} onChange={handleDurationChange} min={1} max={1825} />
            </Box>
          </>
        ) : (
          <Box ml="12px" mr="12x">
            <Slider value={initialInvestment} min={0} max={5000} step={1} onChange={handleChange} />
          </Box>
        )}
        {!advanced && (
          <>
            <Box display="flex" justifyContent="space-around" alignItems="center" mt="18px" mb="18px">
              <Box display="flex" flexDirection="column" textAlign="right" flexGrow={0.33}>
                <Typography className={classes.progressMetric}>{formattedInitialInvestment} OHM</Typography>
                <Typography className={classes.progressLabel}>Invested</Typography>
              </Box>
              <Box position="relative">
                <ProgressCircle balance={formatNumber(totalsOHM, 2)} label="Total OHM" progress={pieValue} />
              </Box>
              <Box display="flex" flexDirection="column" textAlign="left" flexGrow={0.33}>
                <Typography className={classes.progressMetric}>{formattedProfits} OHM</Typography>
                <Typography className={classes.progressLabel}>ROI in {duration} days</Typography>
              </Box>
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              className={classes.selector}
              justifyContent="center"
            >
              {durations.map((dur, index) => (
                <Typography
                  key={index}
                  className={duration === dur.days ? "active" : ""}
                  onClick={() => setDuration(dur.days)}
                >
                  {dur.label}
                </Typography>
              ))}
            </Box>
          </>
        )}
        <DottedDataRow title="Initial Investment" value={`${formattedInitialInvestment} OHM`} />
        {!advanced && <DottedDataRow title="Rebase Rate" value={`${formatNumber(rebaseRate * 100, 4)} %`} />}
        <DottedDataRow title="ROI" value={`${initialInvestment > 0 ? ROI : "0"}%`} />
        <DottedDataRow title="Total sOHM" value={formatNumber(totalsOHM, 2)} bold />
        <Box display="flex" justifyContent="center" mt={"15px"} textAlign="center">
          <p>
            This is strictly a tool to help Ohmies better estimate potential ROI. The estimates above are based on
            current market conditions and should not be interpreted as financial advice in any way
          </p>
        </Box>
      </Box>
    </Fade>
  );
};

export default Calculator;
