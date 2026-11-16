import "#flow/FormStatic";
import "#flow/components/ak-flow-card";

import { SlottedTemplateResult } from "#elements/types";

import { FlowUserDetails } from "#flow/FormStatic";
import { BaseStage } from "#flow/stages/base";
import TDGControls from "#flow/stages/tdg-controls.css";

import {
    ConsentChallenge,
    ConsentChallengeResponseRequest,
    ConsentPermission,
} from "@goauthentik/api";

import { msg } from "@lit/localize";
import { CSSResult, html, nothing, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";


@customElement("ak-stage-consent")
export class ConsentStage extends BaseStage<ConsentChallenge, ConsentChallengeResponseRequest> {
    static styles: CSSResult[] = [
        TDGControls,
    ];

    renderPermissions(perms: ConsentPermission[]): TemplateResult {
        return html`${perms.map((permission) => {
            if (permission.name === "") {
                return nothing;
            }
            // Special case for openid Scope
            if (permission.id === "openid") {
                return nothing;
            }
            return html`<li data-permission-code="${permission.id}">${permission.name}</li>`;
        })}`;
    }

    renderNoPrevious(): TemplateResult {
        return html`
            <div class="tdg-form__group">
                <h3 data-test-id="stage-heading" class="tdg-heading tdg-heading--xl tdg-space-bottom-md">
                    ${this.challenge?.headerText ?? ""}
                </h3>
                ${this.challenge?.permissions.length
                    ? html`
                          <p class="tdg-space-bottom-md">
                              ${msg("Application requires following permissions:")}
                          </p>
                          <ul class="tdg-list" id="permissions">
                              ${this.renderPermissions(this.challenge.permissions)}
                          </ul>
                      `
                    : nothing}
            </div>
        `;
    }

    renderAdditional(): TemplateResult {
        return html`
            <div class="tdg-form__group">
                <h3 data-test-id="stage-heading" class="tdg-heading tdg-heading--xl tdg-space-bottom-md">
                    ${this.challenge?.headerText ?? ""}
                </h3>
                ${this.challenge?.permissions.length
                    ? html`
                          <p class="tdg-space-bottom-md">
                              ${msg("Application already has access to the following permissions:")}
                          </p>
                          <ul class="tdg-list" id="permissions">
                              ${this.renderPermissions(this.challenge.permissions)}
                          </ul>
                      `
                    : nothing}
            </div>
            <div class="tdg-form__group">
                ${this.challenge?.additionalPermissions.length
                    ? html`
                          <p class="tdg-text-bold tdg-space-bottom-md">
                              ${msg("Application requires following new permissions:")}
                          </p>
                          <ul class="tdg-list" id="permissions">
                              ${this.renderPermissions(this.challenge.additionalPermissions)}
                          </ul>
                      `
                    : nothing}
            </div>
        `;
    }

    protected render(): SlottedTemplateResult {
        if (!this.challenge) {
            return nothing;
        }

        return html`<ak-flow-card .challenge=${this.challenge}>
            <form
                class="tdg-form"
                @submit=${(event: SubmitEvent) => {
                    if (!this.challenge) {
                        return;
                    }

                    this.submitForm(event, {
                        token: this.challenge.token,
                    });
                }}
            >
                ${FlowUserDetails({ challenge: this.challenge })}
                ${this.challenge?.additionalPermissions.length
                    ? this.renderAdditional()
                    : this.renderNoPrevious()}

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

export default ConsentStage;

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-consent": ConsentStage;
    }
}
