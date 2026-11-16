import "#flow/FormStatic";
import "#flow/components/ak-flow-card";

import { AKFormErrors } from "#components/ak-field-errors";
import { AKLabel } from "#components/ak-label";

import { BaseStage } from "#flow/stages/base";

import {
    OAuthDeviceCodeChallenge,
    OAuthDeviceCodeChallengeResponseRequest,
} from "@goauthentik/api";

import { msg } from "@lit/localize";
import { CSSResult, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";


@customElement("ak-flow-provider-oauth2-code")
export class OAuth2DeviceCode extends BaseStage<
    OAuthDeviceCodeChallenge,
    OAuthDeviceCodeChallengeResponseRequest
> {
    static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

    static styles = [];

    render(): TemplateResult {
        return html`<ak-flow-card .challenge=${this.challenge}>
            <form class="tdg-form" @submit=${this.submitForm}>
                <div class="tdg-form__group">
                    ${AKLabel({ required: true, htmlFor: "device-code-input" }, msg("Device Code"))}

                    <input
                        ${this.primaryFocusTarget.toRef()}
                        id="device-code-input"
                        type="text"
                        name="code"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        placeholder="${msg("Please enter your code")}"
                        autofocus
                        autocomplete="off"
                        class="tdg-control"
                        value=""
                        required
                    />
                    ${AKFormErrors({ errors: this.challenge?.responseErrors?.code })}
                </div>

                <div class="tdg-form__group tdg-form__actions">
                    <button
                        name="continue"
                        type="submit"
                        class="tdg-button tdg-button--primary tdg-button--block"
                    >
                        ${msg("Continue")}
                    </button>
                </div>
            </form>
        </ak-flow-card>`;
    }
}

export default OAuth2DeviceCode;

declare global {
    interface HTMLElementTagNameMap {
        "ak-flow-provider-oauth2-code": OAuth2DeviceCode;
    }
}
