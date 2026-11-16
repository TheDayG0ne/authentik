import "#elements/EmptyState";
import "#flow/components/ak-flow-card";

import { ifPresent } from "#elements/utils/attributes";

import { BaseStage } from "#flow/stages/base";
import TDGControls from "#flow/stages/tdg-controls.css";

import { AutosubmitChallenge, AutoSubmitChallengeResponseRequest } from "@goauthentik/api";

import { CSSResult, html, PropertyValues, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";


@customElement("ak-stage-autosubmit")
export class AutosubmitStage extends BaseStage<
    AutosubmitChallenge,
    AutoSubmitChallengeResponseRequest
> {
    @query("form")
    private form?: HTMLFormElement;

    static styles: CSSResult[] = [
        TDGControls,
    ];

    updated(changed: PropertyValues<this>): void {
        super.updated(changed);

        if (changed.has("challenge") && this.challenge?.url) {
            console.debug("authentik/flow/stages/autosubmit: submitting");
            this.form?.submit();
        }
    }

    render(): TemplateResult {
        return html`<ak-flow-card .challenge=${this.challenge}>
            <form class="tdg-form" action=${ifPresent(this.challenge?.url)} method="post">
                ${Array.from(Object.entries(this.challenge?.attrs || {}), ([key, value]) => {
                    return html`<input
                        type="hidden"
                        name="${key as string}"
                        value="${value as string}"
                    />`;
                })}
                <ak-empty-state loading default-label></ak-empty-state>
            </form>
        </ak-flow-card>`;
    }
}

export default AutosubmitStage;

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-autosubmit": AutosubmitStage;
    }
}
