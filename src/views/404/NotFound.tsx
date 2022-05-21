import "./NotFound.scss";

import { Trans } from "@lingui/macro";

import TriumphLogo from "../../assets/Triumph Logo.svg";

export default function NotFound() {
  return (
    <div id="not-found">
      <div className="not-found-header">
        <a href="https://olympusdao.finance" target="_blank">
          <img className="branding-header-icon" src={TriumphLogo} alt="TriumphDAO" />
        </a>

        <h4>
          <Trans>Page not found</Trans>
        </h4>
      </div>
    </div>
  );
}
