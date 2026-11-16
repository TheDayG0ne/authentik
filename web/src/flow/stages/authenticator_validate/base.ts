import { BaseStage } from "#flow/stages/base";
import TDGControls from "#flow/stages/tdg-controls.css";
import { StageChallengeLike } from "#flow/types";

import { DeviceChallenge } from "@goauthentik/api";

import { msg } from "@lit/localize";
import { CSSResult, html, nothing } from "lit";
import { property } from "lit/decorators.js";


export class BaseDeviceStage<Tin extends StageChallengeLike, Tout> extends BaseStage<Tin, Tout> {
    @property({ attribute: false })
    deviceChallenge?: DeviceChallenge;

    @property({ type: Boolean })
    showBackButton = false;

    static styles: CSSResult[] = [
        TDGControls,
    ];

    submit(payload: Tin): Promise<boolean> {
        return this.host?.submit(payload) || Promise.resolve();
    }

    public reset = () => {
        this.host?.reset?.();
    };

    protected renderReturnToDevicePicker() {
        if (!this.showBackButton) {
            return nothing;
        }

        return html`<button
            class="tdg-button tdg-button--secondary tdg-button--block"
            type="button"
            @click=${this.reset}
        >
            ${msg("Select another authentication method")}
        </button>`;
    }
}
