import "#flow/FormStatic";
import "#flow/components/ak-flow-card";

import { SlottedTemplateResult } from "#elements/types";

import { AKFormErrors } from "#components/ak-field-errors";
import { AKLabel } from "#components/ak-label";

import { FlowUserDetails } from "#flow/FormStatic";
import { BaseStage } from "#flow/stages/base";
import TDGControls from "#flow/stages/tdg-controls.css";

import {
    AuthenticatorSMSChallenge,
    AuthenticatorSMSChallengeResponseRequest,
} from "@goauthentik/api";

import { msg } from "@lit/localize";
import { CSSResult, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";


@customElement("ak-stage-authenticator-sms")
export class AuthenticatorSMSStage extends BaseStage<
    AuthenticatorSMSChallenge,
    AuthenticatorSMSChallengeResponseRequest
> {
    static styles: CSSResult[] = [
        TDGControls,
    ];

    protected renderPhoneNumber(): SlottedTemplateResult {
        if (!this.challenge) {
            return nothing;
        }
        return html`<ak-flow-card .challenge=${this.challenge}>
            <form class="tdg-form" @submit=${this.submitForm}>
                ${FlowUserDetails({ challenge: this.challenge })}

                <div class="tdg-form__group">
                    ${AKLabel(
                        { required: true, htmlFor: "phone-number-input" },
                        msg("Phone number"),
                    )}

                    <input
                        type="tel"
                        name="phoneNumber"
                        placeholder="${msg("Please enter your Phone number.")}"
                        autofocus
                        autocomplete="tel"
                        class="tdg-control"
                        required
                    />
                    ${AKFormErrors({ errors: this.challenge.responseErrors?.phone_number })}
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

    protected renderCode(): SlottedTemplateResult {
        if (!this.challenge) {
            return nothing;
        }

        return html`<ak-flow-card .challenge=${this.challenge}>
            <form class="tdg-form" @submit=${this.submitForm}>
                ${FlowUserDetails({ challenge: this.challenge })}
                <div class="tdg-form__group">
                    ${AKLabel({ required: true, htmlFor: "sms-code-input" }, msg("Code"))}
                    <input
                        id="sms-code-input"
                        type="text"
                        name="code"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        placeholder="${msg("Please enter the code you received via SMS")}"
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

    render(): SlottedTemplateResult {
        if (this.challenge?.phoneNumberRequired) {
            return this.renderPhoneNumber();
        }

        return this.renderCode();
    }
}

export default AuthenticatorSMSStage;

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-authenticator-sms": AuthenticatorSMSStage;
    }
}
