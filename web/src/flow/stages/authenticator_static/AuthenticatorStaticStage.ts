import "#flow/FormStatic";
import "#flow/components/ak-flow-card";

import { SlottedTemplateResult } from "#elements/types";

import { FlowUserDetails } from "#flow/FormStatic";
import { BaseStage } from "#flow/stages/base";
import TDGControls from "#flow/stages/tdg-controls.css";

import {
    AuthenticatorStaticChallenge,
    AuthenticatorStaticChallengeResponseRequest,
} from "@goauthentik/api";

import { msg } from "@lit/localize";
import { css, CSSResult, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";


@customElement("ak-stage-authenticator-static")
export class AuthenticatorStaticStage extends BaseStage<
    AuthenticatorStaticChallenge,
    AuthenticatorStaticChallengeResponseRequest
> {
    static styles: CSSResult[] = [
        css`
            /* Static OTP Tokens */
            .token-list {
                list-style: disc;
                padding-left: 1.5rem;
                margin: 0.75rem 0;
            }
            .token-list li {
                font-family: "Space Mono", monospace;
                font-size: 0.95rem;
                margin-bottom: 0.4rem;
                word-break: break-all;
            }
        `,
        TDGControls,
    ];

    protected render(): SlottedTemplateResult {
        if (!this.challenge) {
            return nothing;
        }

        return html`<ak-flow-card .challenge=${this.challenge}>
            <form class="tdg-form" @submit=${this.submitForm}>
                ${FlowUserDetails({ challenge: this.challenge })}

                <ul class="tdg-form__group token-list">
                    ${this.challenge.codes.map((token) => {
                        return html`<li>${token}</li>`;
                    })}
                </ul>
                <p>${msg("Make sure to keep these tokens in a safe place.")}</p>

                <fieldset class="ak-c-fieldset tdg-form__group tdg-form__actions">
                    <legend class="sr-only">${msg("Form actions")}</legend>
                    <button
                        name="continue"
                        type="submit"
                        class="tdg-button tdg-button--primary tdg-button--block"
                    >
                        ${msg("Continue")}
                    </button>
                </fieldset>
            </form>
        </ak-flow-card>`;
    }
}

export default AuthenticatorStaticStage;

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-authenticator-static": AuthenticatorStaticStage;
    }
}
