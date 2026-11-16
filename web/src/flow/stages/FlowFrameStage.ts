import "#elements/EmptyState";
import "#flow/FormStatic";
import "#flow/components/ak-flow-card";

import { SlottedTemplateResult } from "#elements/types";

import { BaseStage } from "#flow/stages/base";
import TDGControls from "#flow/stages/tdg-controls.css";

import { FrameChallenge, FrameChallengeResponseRequest } from "@goauthentik/api";

import { CSSResult, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";


@customElement("xak-flow-frame")
export class FlowFrameStage extends BaseStage<FrameChallenge, FrameChallengeResponseRequest> {
    static styles: CSSResult[] = [
        TDGControls,
    ];

    protected render(): SlottedTemplateResult {
        if (!this.challenge) {
            return nothing;
        }

        return html`<ak-flow-card .challenge=${this.challenge}>
            ${this.challenge.loadingOverlay
                ? html`<ak-empty-state loading
                      >${this.challenge.loadingText
                          ? html`<span>${this.challenge.loadingText}</span>`
                          : nothing}
                  </ak-empty-state>`
                : nothing}
            <iframe
                style=${this.challenge.loadingOverlay ? "width:0;height:0;position:absolute;" : ""}
                src=${this.challenge.url}
            ></iframe>
        </ak-flow-card>`;
    }
}

export default FlowFrameStage;

declare global {
    interface HTMLElementTagNameMap {
        "xak-flow-frame": FlowFrameStage;
    }
}
