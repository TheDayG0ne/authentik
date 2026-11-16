import "#flow/FormStatic";
import "#flow/components/ak-flow-card";

import { FlowUserDetails } from "#flow/FormStatic";
import { BaseStage } from "#flow/stages/base";
import TDGControls from "#flow/stages/tdg-controls.css";

import { AccessDeniedChallenge, FlowChallengeResponseRequest } from "@goauthentik/api";

import { msg } from "@lit/localize";
import { CSSResult, html, nothing, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";


@customElement("ak-stage-access-denied")
export class AccessDeniedStage extends BaseStage<
    AccessDeniedChallenge,
    FlowChallengeResponseRequest
> {
    static styles: CSSResult[] = [
        TDGControls,
    ];

    render(): TemplateResult {
        return html`<ak-flow-card .challenge=${this.challenge}>
            <form class="tdg-form">
                ${FlowUserDetails({ challenge: this.challenge })}
                <ak-empty-state icon="fa-times"
                    ><span>${msg("Request has been denied.")}</span>
                    ${this.challenge?.errorMessage
                        ? html`
                              <div slot="body">
                                  <p>${this.challenge?.errorMessage}</p>
                              </div>
                          `
                        : nothing}
                </ak-empty-state>
                ${this.challenge?.flowInfo?.cancelUrl
                    ? html`<fieldset class="ak-c-fieldset tdg-form__group tdg-form__actions">
                          <legend class="sr-only">${msg("Form actions")}</legend>
                          <a
                              class="tdg-button tdg-button--primary tdg-button--block"
                              href=${this.challenge.flowInfo?.cancelUrl}
                          >
                              ${msg("Go back", {
                                  id: "flow.navigation.go-back",
                              })}
                          </a>
                      </fieldset>`
                    : nothing}
            </form>
        </ak-flow-card>`;
    }
}

export default AccessDeniedStage;

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-access-denied": AccessDeniedStage;
    }
}
