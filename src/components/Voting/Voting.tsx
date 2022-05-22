import { t, Trans } from "@lingui/macro";
import { Box, Button, Zoom } from "@material-ui/core";
import { Paper } from "@olympusdao/component-library";
import { useState } from "react";

export default function Voting() {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div id="stake-view">
      <Zoom in onEntered={() => setIsZoomed(true)}>
        <Paper headerText={t`About Voting`}>
          <p>
            Voting for Triumph of the Commons will be setup in a Tricameral model, in order to insure representation of
            all interest groups in mutual balance. Bondholders will have the ability to vote on what assets the Treasury
            will consider a public good worth accepting into its Vault. Tokenholders for the protocol will vote on
            ratios of assets to accept into the Treasury, and Risk Management voters will govern bond market terms, risk
            assessment, and other factors such as the collateralization ratios that are required for each asset in order
            to mint the token when bonding.
          </p>

          <Box display="flex" flexDirection="column" alignItems="center" mt={6}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Button size="large" style={{ fontSize: "1.2857rem" }} href="https://snapshot.org/#/triumphdao.eth">
                <Trans>Learn More</Trans>
              </Button>
            </Box>
          </Box>
        </Paper>
      </Zoom>
    </div>
  );
}
