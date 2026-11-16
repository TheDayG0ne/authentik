import "#elements/Progress";

import { aki } from "#common/api/client";
import { globalAK } from "#common/global";

import { asInvoker } from "#elements/dialogs";
import { AKModal } from "#elements/dialogs/ak-modal";
import { WithBrandConfig } from "#elements/mixins/branding";
import { WithLicenseSummary } from "#elements/mixins/license";
import { SlottedTemplateResult } from "#elements/types";
import { DefaultFlowBackground, ThemedImage } from "#elements/utils/images";

import {
    AdminApi,
    CapabilitiesEnum,
    LicenseSummaryStatusEnum,
    SystemInfo,
    Version,
} from "@goauthentik/api";

import { msg } from "@lit/localize";
import { css, html } from "lit";
import { ref } from "lit-html/directives/ref.js";
import { until } from "lit-html/directives/until.js";
import { customElement, state } from "lit/decorators.js";

type AboutEntry = [label: string, content?: SlottedTemplateResult];

function renderEntry([label, content = null]: AboutEntry): SlottedTemplateResult {
    return html`<dt>${label}</dt>
        <dd>${content === null ? msg("Loading...") : content}</dd>`;
}

@customElement("ak-about-modal")
export class AboutModal extends WithLicenseSummary(WithBrandConfig(AKModal)) {
    public override formatARIALabel = () => msg("About TDG.id");

    public static hostStyles = [
        ...AKModal.hostStyles,
        css`
            .ak-c-dialog:has(ak-about-modal) {
                --ak-c-dialog--BackgroundColor: transparent;
                --ak-c-dialog--BorderColor: transparent;
                border-radius: 24px;
                overflow: hidden;
            }
        `,
    ];

    public static styles = [
        ...AKModal.styles,
        css`
            .tdg-about { position: relative; display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(13rem, .9fr); width: min(56rem, 90vw); max-height: 88vh; overflow: auto; border: 1px solid #b99bd145; border-radius: 24px; background: rgba(9, 8, 13, .94); color: #f7f4ff; font-family: Manrope, sans-serif; box-shadow: 0 24px 80px #000a; }
            .tdg-about__main { min-width: 0; padding: clamp(1.5rem, 4vw, 3rem); }
            .tdg-about__art { min-height: 28rem; background-color: #090810; background-position: center; background-size: cover; border-left: 1px solid #ffffff18; }
            .tdg-about__close { position: absolute; inset: 1rem 1rem auto auto; border: 1px solid #ac83ca55; border-radius: .75rem; color: inherit; background: #ffffff0a; font-size: 1.5rem; cursor: pointer; width: 2.75rem; height: 2.75rem; }
            .tdg-about__close:focus-visible { outline: 2px solid #d7a9ff; outline-offset: 3px; }
            .tdg-about__brand { display: flex; align-items: center; gap: 1rem; padding-right: 3rem; }
            .tdg-about__brand img { width: 3rem; height: 3rem; object-fit: contain; }
            .tdg-about__eyebrow { color: #cba2eb; font-family: 'Space Mono', monospace; font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; }
            h1 { margin: .2rem 0; font-size: clamp(1.5rem, 5vw, 2rem); }
            .tdg-about__panel { margin-top: 1.5rem; border: 1px solid #c69bed33; border-radius: 1rem; background: #ffffff08; padding: 1.25rem; }
            dl { display: grid; grid-template-columns: minmax(8rem, 1fr) minmax(0, 1.4fr); gap: .8rem 1rem; margin: 0; }
            dt { color: #baaacb; } dd { margin: 0; overflow-wrap: anywhere; font-family: 'Space Mono', monospace; font-size: .85rem; }
            details { margin-top: 1rem; } summary { cursor: pointer; color: #dfc4f5; } details dl { margin-top: 1rem; }
            @media (max-width: 42rem) { .tdg-about { grid-template-columns: 1fr; width: min(34rem, 92vw); } .tdg-about__art { min-height: 10rem; border-left: 0; border-top: 1px solid #ffffff18; order: 2; } }
            @media (max-width: 35rem) { dl { grid-template-columns: 1fr; gap: .3rem; } dd { margin-bottom: .7rem; } }
        `,
    ];

    public static ariaLabel = msg("About TDG.id");

    public static open = asInvoker(AboutModal);

    #api = aki(AdminApi);

    protected canDebug = globalAK().config.capabilities.includes(CapabilitiesEnum.CanDebug);

    @state()
    protected version: Version | null = null;

    @state()
    protected systemInfo: SystemInfo | null = null;

    @state()
    protected refreshPromise: Promise<[Version, SystemInfo]> | null = null;

    public refresh = (): void => {
        const versionPromise = this.#api.adminVersionRetrieve();
        const systemInfoPromise = this.#api.adminSystemRetrieve();

        this.refreshPromise = Promise.all([versionPromise, systemInfoPromise]).then((result) => {
            this.version = result[0];
            this.systemInfo = result[1];

            return result;
        });
    };

    public connectedCallback(): void {
        super.connectedCallback();
        this.refresh();
    }

    protected renderVersionInfo = () => {
        const { version } = this;

        let build: SlottedTemplateResult = null;

        if (this.canDebug) {
            build = msg("Development");
        } else if (version?.buildHash) {
            build = version.buildHash;
        } else if (version) {
            build = msg("Release");
        }

        const entries: AboutEntry[] = [
            [msg("Server Version"), version?.versionCurrent],
            [msg("Build"), build],
        ];

        return entries.map(renderEntry);
    };

    protected renderSystemInfo = () => {
        const { runtime } = this.systemInfo || {};

        const sslLabel = runtime
            ? `${runtime.opensslVersion} ${runtime.opensslFipsEnabled ? "FIPS" : ""}`
            : null;

        const entries: AboutEntry[] = [
            [msg("Python version"), runtime?.pythonVersion],
            [msg("Platform"), runtime?.platform],
            [msg("OpenSSL"), sslLabel],
            [
                msg("Kernel"),
                runtime?.uname ?? html`<div style="min-height: 3em;">${msg("Loading...")}</div>`,
            ],
        ];

        return entries.map(renderEntry);
    };

    //#region Renderers

    protected override renderCloseButton() {
        return null;
    }

    protected renderLoadingBar(): SlottedTemplateResult {
        return until(
            this.refreshPromise?.then(() => null),
            html`<ak-progress
                part="loading"
                variant="indeterminate"
                label=${msg("Loading")}
            ></ak-progress>`,
        );
    }

    protected override render() {
        let product = this.brandingTitle;

        if (this.licenseSummary?.status !== LicenseSummaryStatusEnum.Unlicensed) {
            product += ` ${msg("Enterprise")}`;
        }

        return html`<div ${ref(this.scrollContainerRef)} class="tdg-about" part="box">
            <section class="tdg-about__main">
                <button class="tdg-about__close" type="button" @click=${this.closeListener} aria-label=${msg("Close dialog")}>&times;</button>
                ${this.renderLoadingBar()}
                <div class="tdg-about__brand" part="brand">
                    ${ThemedImage({
                        src: this.brandingFavicon,
                        alt: msg("TDG.id Logo"),
                        theme: this.activeTheme,
                        themedUrls: this.brandingFaviconThemedUrls,
                    })}
                    <div><div class="tdg-about__eyebrow">${msg("About TDG.id")}</div><h1 id="modal-title" part="title">${product}</h1></div>
                </div>
                <div class="tdg-about__panel">
                    <dl><dt>${msg("UI Version")}</dt><dd>${import.meta.env.AK_VERSION}</dd>${until(this.refreshPromise?.then(this.renderVersionInfo), this.renderVersionInfo())}</dl>
                    <details><summary>${msg("System information")}</summary><dl>${until(this.refreshPromise?.then(this.renderSystemInfo), this.renderSystemInfo())}</dl></details>
                </div>
            </section>
            <aside class="tdg-about__art" aria-label=${msg("TDG.id background")} style=${`background-image: url(${DefaultFlowBackground})`}></aside>
        </div>`;
    }

    //#endregion
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-about-modal": AboutModal;
    }
}
