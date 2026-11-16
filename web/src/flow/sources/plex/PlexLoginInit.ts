import "#elements/EmptyState";
import "#flow/components/ak-flow-card";
import "#elements/Divider";

import { aki } from "#common/api/client";
import { PlexAPIClient, popupCenterScreen } from "#common/helpers/plex";

import { showAPIErrorMessage } from "#elements/messages/MessageContainer";

import { BaseStage } from "#flow/stages/base";

import {
    PlexAuthenticationChallenge,
    PlexAuthenticationChallengeResponseRequest,
    SourcesApi,
} from "@goauthentik/api";

import { msg } from "@lit/localize";
import { CSSResult, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";


@customElement("ak-flow-source-plex")
export class PlexLoginInit extends BaseStage<
    PlexAuthenticationChallenge,
    PlexAuthenticationChallengeResponseRequest
> {
    @state()
    authUrl?: string;

    static styles = [];

    async firstUpdated(): Promise<void> {
        const authInfo = await PlexAPIClient.getPin(this.challenge?.clientId || "");
        this.authUrl = authInfo.authUrl;
        const authWindow = await popupCenterScreen(authInfo.authUrl, "plex auth", 550, 700);
        PlexAPIClient.pinPoll(this.challenge?.clientId || "", authInfo.pin.id).then((token) => {
            authWindow?.close();
            aki(SourcesApi)
                .sourcesPlexRedeemTokenCreate({
                    plexTokenRedeemRequest: {
                        plexToken: token,
                    },
                    slug: this.challenge?.slug || "",
                })
                .then((redirectChallenge) => {
                    window.location.assign(redirectChallenge.to);
                })
                .catch(async (error: unknown) => {
                    return showAPIErrorMessage(error).then(() => {
                        setTimeout(() => {
                            window.location.assign("/");
                        }, 5000);
                    });
                });
        });
    }

    render(): TemplateResult {
        return html`<ak-flow-card .challenge=${this.challenge}>
            <span slot="title">${msg("Authenticating with Plex...")}</span>
            <form class="tdg-form">
                <ak-empty-state loading
                    ><span>${msg("Waiting for authentication...")}></span>
                </ak-empty-state>
                <ak-divider></ak-divider>
                <p>${msg("If no Plex popup opens, click the button below.")}</p>
                <button
                    class="tdg-button tdg-button--block tdg-button--primary"
                    type="button"
                    @click=${() => {
                        window.open(this.authUrl, "_blank");
                    }}
                >
                    ${msg("Open login")}
                </button>
            </form>
        </ak-flow-card>`;
    }
}

export default PlexLoginInit;

declare global {
    interface HTMLElementTagNameMap {
        "ak-flow-source-plex": PlexLoginInit;
    }
}
