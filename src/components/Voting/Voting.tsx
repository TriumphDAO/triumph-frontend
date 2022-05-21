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
            Information about voting will go here. I self-identify as a little teapot, pronouns handle/spout. My vote
            counts as much as yours
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
