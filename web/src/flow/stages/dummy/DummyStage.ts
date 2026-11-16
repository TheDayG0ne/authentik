import "#flow/FormStatic";
import "#flow/components/ak-flow-card";

import { BaseStage } from "#flow/stages/base";
import TDGControls from "#flow/stages/tdg-controls.css";

import { DummyChallenge, DummyChallengeResponseRequest } from "@goauthentik/api";

import { msg, str } from "@lit/localize";
import { CSSResult, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";


@customElement("ak-stage-dummy")
export class DummyStage extends BaseStage<DummyChallenge, DummyChallengeResponseRequest> {
    static styles: CSSResult[] = [
        TDGControls,
    ];

    render(): TemplateResult {
        return html`<ak-flow-card .challenge=${this.challenge}>
            <form class="tdg-form" @submit=${this.submitForm}>
                <p>${msg(str`Stage name: ${this.challenge?.name}`)}</p>
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

export default DummyStage;

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-dummy": DummyStage;
    }
}
