import "#flow/FormStatic";
import "#flow/components/ak-flow-card";

import { SlottedTemplateResult } from "#elements/types";

import { AKFormErrors } from "#components/ak-field-errors";
import { AKLabel } from "#components/ak-label";

import { FlowUserDetails } from "#flow/FormStatic";
import { BaseStage } from "#flow/stages/base";
import TDGControls from "#flow/stages/tdg-controls.css";

import {
    AuthenticatorEmailChallenge,
    AuthenticatorEmailChallengeResponseRequest,
} from "@goauthentik/api";

import { msg, str } from "@lit/localize";
import { CSSResult, html, nothing, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";


@customElement("ak-stage-authenticator-email")
export class AuthenticatorEmailStage extends BaseStage<
    AuthenticatorEmailChallenge,
    AuthenticatorEmailChallengeResponseRequest
> {
    static styles: CSSResult[] = [
        TDGControls,
    ];

    renderEmailInput(): TemplateResult {
        return html`<ak-flow-card .challenge=${this.challenge}>
            <form class="tdg-form" @submit=${this.submitForm}>
                ${FlowUserDetails({ challenge: this.challenge })}

                <div class="tdg-form__group">
                    ${AKLabel(
                        { required: true, htmlFor: "email-input" },
                        msg("Configure your email"),
                    )}
                    <input
                        id="email-input"
                        type="email"
                        name="email"
                        placeholder="${msg("Please enter your email address.")}"
                        autofocus
                        autocomplete="email"
                        class="tdg-control"
                        required
                    />
                    ${AKFormErrors({ errors: this.challenge?.responseErrors?.email })}
                </div>
                ${this.renderNonFieldErrors()}
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

    protected renderEmailOTPInput(): SlottedTemplateResult {
        if (!this.challenge) {
            return nothing;
        }

        const { email } = this.challenge;

        return html`<ak-flow-card .challenge=${this.challenge}>
            ${FlowUserDetails({ challenge: this.challenge })}

            <p>
                ${email
                    ? msg(
                          str`A verification token has been sent to your configured email address: ${email}`,
                          {
                              id: "stage.authenticator.email.sent-to-address",
                              desc: "Displayed when a verification token has been sent to the user's configured email address.",
                          },
                      )
                    : msg("A verification token has been sent to your email address.", {
                          id: "stage.authenticator.email.sent",
                          desc: "Displayed when a verification token has been sent to the user's email address.",
                      })}
            </p>
            <form class="tdg-form" @submit=${this.submitForm}>
                <div class="tdg-form__group">
                    ${AKLabel({ required: true, htmlFor: "code-input" }, msg("Code"))}
                    <input
                        id="code-input"
                        type="text"
                        name="code"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        placeholder="${msg("Please enter the code you received via email")}"
                        autofocus
                        autocomplete="one-time-code"
                        class="tdg-control tdg-control--mono"
                        required
                    />
                    ${AKFormErrors({ errors: this.challenge.responseErrors?.code })}
                </div>
                ${this.renderNonFieldErrors()}
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

    protected render(): SlottedTemplateResult {
        if (this.challenge?.emailRequired) {
            return this.renderEmailInput();
        }
        return this.renderEmailOTPInput();
    }
}

export default AuthenticatorEmailStage;

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-authenticator-email": AuthenticatorEmailStage;
    }
}
