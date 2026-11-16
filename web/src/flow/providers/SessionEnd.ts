import "#flow/FormStatic";
import "#flow/components/ak-flow-card";

import { SlottedTemplateResult } from "#elements/types";

import { FlowUserDetails } from "#flow/FormStatic";
import { BaseStage } from "#flow/stages/base";

import { SessionEndChallenge } from "@goauthentik/api";

import { msg, str } from "@lit/localize";
import { CSSResult, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";


@customElement("ak-stage-session-end")
export class SessionEnd extends BaseStage<SessionEndChallenge, unknown> {
    static styles = [];

    getText(challenge: SessionEndChallenge) {
        if (challenge.overviewUrl && challenge.invalidationFlowUrl) {
            return msg(
                str`You've logged out of ${challenge.applicationName}. You can go back to the overview to launch another application, or log out of your TDG.id account.`,
            );
        } else if (challenge.invalidationFlowUrl) {
            return msg(
                str`You've logged out of ${challenge.applicationName}. You can log out of your TDG.id account.`,
            );
        }
        return msg(str`You've logged out of ${challenge.applicationName}.`);
    }

    protected render(): SlottedTemplateResult {
        const { challenge } = this;

        if (!challenge) {
            return nothing;
        }

        return html`<ak-flow-card .challenge=${challenge}>
            <form class="tdg-form">
                ${FlowUserDetails({ challenge: challenge })}

                <p>${this.getText(challenge)}</p>
                ${challenge.overviewUrl
                    ? html`<a href="${challenge.overviewUrl}" class="tdg-button tdg-button--primary">
                          ${msg("Go back to overview")}
                      </a>`
                    : nothing}
                ${challenge.invalidationFlowUrl
                    ? html`
                          <a
                              href="${challenge.invalidationFlowUrl}"
                              class="tdg-button tdg-button--secondary"
                              id="logout"
                          >
                              ${msg(str`Log out of ${challenge.brandName}`)}
                          </a>
                      `
                    : nothing}
                ${challenge.applicationLaunchUrl && challenge.applicationName
                    ? html`
                          <a
                              href="${challenge.applicationLaunchUrl}"
                              class="tdg-button tdg-button--secondary"
                          >
                              ${msg(str`Log back into ${challenge.applicationName}`)}
                          </a>
                      `
                    : nothing}
            </form>
        </ak-flow-card>`;
    }
}

export default SessionEnd;

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-session-end": SessionEnd;
    }
}
