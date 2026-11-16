import "#flow/FormStatic";
import "#flow/components/ak-flow-card";

import { FlowUserDetails } from "#flow/FormStatic";
import { BaseStage } from "#flow/stages/base";
import TDGControls from "#flow/stages/tdg-controls.css";

import { UserLoginChallenge, UserLoginChallengeResponseRequest } from "@goauthentik/api";

import { msg } from "@lit/localize";
import { CSSResult, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";


@customElement("ak-stage-user-login")
export class PasswordStage extends BaseStage<
    UserLoginChallenge,
    UserLoginChallengeResponseRequest
> {
    static styles: CSSResult[] = [
        TDGControls,
    ];

    render(): TemplateResult {
        return html`<ak-flow-card .challenge=${this.challenge}>
            <form
                class="tdg-form"
                @submit=${(event: SubmitEvent) => {
                    event.preventDefault();

                    const submitter =
                        event.submitter instanceof HTMLButtonElement ? event.submitter : null;

                    this.submitForm(event, {
                        rememberMe: submitter?.name === "remember-me",
                    });
                }}
            >
                ${FlowUserDetails({ challenge: this.challenge })}

                <div class="tdg-form__group">
                    <h3 data-test-id="stage-heading" class="tdg-heading tdg-heading--xl tdg-space-bottom-xl">
                        ${msg("Stay signed in?")}
                    </h3>
                    <p class="tdg-space-bottom-sm">
                        ${msg("Select Yes to reduce the number of times you're asked to sign in.")}
                    </p>
                </div>

                <fieldset class="ak-c-fieldset tdg-form__group tdg-form__actions">
                    <legend class="sr-only">${msg("Form actions")}</legend>
                    <button name="remember-me" type="submit" class="tdg-button tdg-button--primary">
                        ${msg("Yes")}
                    </button>
                    <button name="forget-me" type="submit" class="tdg-button tdg-button--secondary">
                        ${msg("No")}
                    </button>
                </fieldset>
            </form>
        </ak-flow-card>`;
    }
}

export default PasswordStage;

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-user-login": PasswordStage;
    }
}
