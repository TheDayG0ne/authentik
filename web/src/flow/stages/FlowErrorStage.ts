import "#elements/EmptyState";
import "#flow/FormStatic";
import "#flow/components/ak-flow-card";

import { SlottedTemplateResult } from "#elements/types";

import { BaseStage } from "#flow/stages/base";
import TDGControls from "#flow/stages/tdg-controls.css";

import { FlowChallengeResponseRequest, FlowErrorChallenge } from "@goauthentik/api";

import { msg } from "@lit/localize";
import { css, CSSResult, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";


@customElement("ak-stage-flow-error")
export class FlowErrorStage extends BaseStage<FlowErrorChallenge, FlowChallengeResponseRequest> {
    static styles: CSSResult[] = [
        css`
            pre {
                overflow-x: scroll;
                max-width: 100%;
            }
        `,
        TDGControls,
    ];

    protected render(): SlottedTemplateResult {
        if (!this.challenge) {
            return nothing;
        }

        return html`<ak-flow-card .challenge=${this.challenge}>
            <form class="tdg-form">
                <ak-empty-state icon="fa-times"
                    ><span>
                        ${this.challenge.error
                            ? this.challenge.error
                            : msg("Something went wrong! Please try again later.")}</span
                    >
                    <div slot="body">
                        ${this.challenge?.traceback
                            ? html`<div class="tdg-form__group">
                                  <pre class="ak-exception">${this.challenge.traceback}</pre>
                              </div>`
                            : nothing}
                        ${this.challenge.requestId
                            ? html`<div class="tdg-form__group">
                                  <p>${msg("Request ID")}</p>
                                  <code>${this.challenge.requestId}</code>
                              </div>`
                            : nothing}
                    </div>
                </ak-empty-state>
            </form>
        </ak-flow-card>`;
    }
}

export default FlowErrorStage;

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-flow-error": FlowErrorStage;
    }
}
