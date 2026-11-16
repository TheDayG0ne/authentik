import "#flow/components/ak-flow-card";

import { BaseStage } from "#flow/stages/base";
import TDGControls from "#flow/stages/tdg-controls.css";

import { EmailChallenge, EmailChallengeResponseRequest } from "@goauthentik/api";

import { msg } from "@lit/localize";
import { CSSResult, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";


@customElement("ak-stage-email")
export class EmailStage extends BaseStage<EmailChallenge, EmailChallengeResponseRequest> {
    static styles: CSSResult[] = [
        TDGControls,
    ];

    render(): TemplateResult {
        return html`<ak-flow-card .challenge=${this.challenge}>
            <form class="tdg-form" @submit=${this.submitForm}>
                <div class="tdg-form__group">
                    <p>${msg("Check your Inbox for a verification email.")}</p>
                </div>

                <fieldset class="ak-c-fieldset tdg-form__group tdg-form__actions">
                    <legend class="sr-only">${msg("Form actions")}</legend>
                    <button
                        name="continue"
                        type="submit"
                        class="tdg-button tdg-button--primary tdg-button--block"
                    >
                        ${msg("Resend Email")}
                    </button>
                </fieldset>
            </form>
        </ak-flow-card>`;
    }
}

export default EmailStage;

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-email": EmailStage;
    }
}
