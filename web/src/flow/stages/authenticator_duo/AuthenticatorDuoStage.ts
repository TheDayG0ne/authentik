import "#flow/FormStatic";
import "#flow/components/ak-flow-card";

import { aki } from "#common/api/client";

import { SlottedTemplateResult } from "#elements/types";

import { FlowUserDetails } from "#flow/FormStatic";
import { BaseStage } from "#flow/stages/base";
import TDGControls from "#flow/stages/tdg-controls.css";

import {
    AuthenticatorDuoChallenge,
    AuthenticatorDuoChallengeResponseRequest,
    DuoResponseEnum,
    StagesApi,
} from "@goauthentik/api";

import { msg } from "@lit/localize";
import { CSSResult, html, nothing, PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";
import { guard } from "lit/directives/guard.js";


@customElement("ak-stage-authenticator-duo")
export class AuthenticatorDuoStage extends BaseStage<
    AuthenticatorDuoChallenge,
    AuthenticatorDuoChallengeResponseRequest
> {
    static styles: CSSResult[] = [
        TDGControls,
    ];

    updated(changedProperties: PropertyValues<this>) {
        super.updated(changedProperties);

        if (changedProperties.has("challenge") && this.challenge) {
            const i = setInterval(() => {
                this.#checkEnrollStatus().then((shouldStop) => {
                    if (shouldStop) {
                        clearInterval(i);
                    }
                });
            }, 3000);
        }
    }

    #checkEnrollStatus = async (): Promise<boolean> => {
        const status = await aki(StagesApi).stagesAuthenticatorDuoEnrollmentStatusCreate({
            stageUuid: this.challenge?.stageUuid || "",
        });
        console.debug(
            `authentik/stages/authenticator_duo: Enrollment status: ${status.duoResponse}`,
        );
        switch (status.duoResponse) {
            case DuoResponseEnum.Success:
                this.host?.submit({});
                return true;
            case DuoResponseEnum.Waiting:
                break;
        }
        return false;
    };

    render(): SlottedTemplateResult {
        return guard([this.challenge], () => {
            if (!this.challenge) {
                return nothing;
            }

            return html`<ak-flow-card .challenge=${this.challenge}>
                <form class="tdg-form" @submit=${this.submitForm}>
                    ${FlowUserDetails({ challenge: this.challenge })}

                    <img
                        src=${this.challenge.activationBarcode}
                        alt=${msg("Duo activation QR code")}
                    />
                    <p>
                        ${msg(
                            "Alternatively, if your current device has Duo installed, click on this link:",
                        )}
                    </p>
                    <a href=${this.challenge.activationCode}>${msg("Duo activation")}</a>

                    <fieldset class="ak-c-fieldset tdg-form__group tdg-form__actions">
                        <legend class="sr-only">${msg("Form actions")}</legend>
                        <button
                            type="button"
                            class="tdg-button tdg-button--primary tdg-button--block"
                            @click=${this.#checkEnrollStatus}
                        >
                            ${msg("Check status")}
                        </button>
                    </fieldset>
                </form>
            </ak-flow-card>`;
        });
    }
}

export default AuthenticatorDuoStage;

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-authenticator-duo": AuthenticatorDuoStage;
    }
}
