import "#flow/FormStatic";
import "#flow/components/ak-flow-card";
import "#flow/components/ak-flow-password-input";

import { ErrorProp } from "#components/ak-field-errors";

import { FlowUserDetails } from "#flow/FormStatic";
import { BaseStage } from "#flow/stages/base";
import { PasswordManagerPrefill } from "#flow/stages/identification/IdentificationStage";
import TDGControls from "#flow/stages/tdg-controls.css";

import { PasswordChallenge, PasswordChallengeResponseRequest } from "@goauthentik/api";

import { msg } from "@lit/localize";
import { CSSResult, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";


@customElement("ak-stage-password")
export class PasswordStage extends BaseStage<PasswordChallenge, PasswordChallengeResponseRequest> {
    static styles: CSSResult[] = [
        TDGControls,
    ];

    #errors(field: string): ErrorProp[] | undefined {
        const errors = this.challenge?.responseErrors?.[field];

        return errors;
    }

    render(): TemplateResult {
        return html`<ak-flow-card .challenge=${this.challenge}>
            <form class="tdg-form" @submit=${this.submitForm}>
                ${FlowUserDetails({ challenge: this.challenge })}

                <input
                    name="username"
                    type="text"
                    autocomplete="username"
                    hidden
                    readonly
                    value="${this.challenge?.pendingUser ?? ""}"
                />
                <ak-flow-input-password
                    label=${msg("Password")}
                    grab-focus
                    class="tdg-form__group"
                    .errors=${this.#errors("password")}
                    ?allow-show-password=${!!this.challenge?.allowShowPassword}
                    prefill=${PasswordManagerPrefill.password ?? ""}
                    required
                ></ak-flow-input-password>
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
            ${this.challenge?.recoveryUrl
                ? html`<fieldset
                      slot="footer-band"
                      part="additional-actions"
                      name="additional-actions"
                      class="tdgid-flow-actions"
                  >
                      <legend class="sr-only">${msg("Additional actions")}</legend>
                      <div class="tdgid-flow-actions__item">
                          <a href="${this.challenge.recoveryUrl}">${msg("Forgot password?")}</a>
                      </div>
                  </fieldset>`
                : null}
        </ak-flow-card>`;
    }
}

export default PasswordStage;

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-password": PasswordStage;
    }
}
