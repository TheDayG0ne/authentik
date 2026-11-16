import "#elements/EmptyState";

import Styles from "./ak-flow-card.css";

import { AKElement } from "#elements/Base";
import { SlottedTemplateResult } from "#elements/types";

import { FormStaticChallenge } from "#flow/types";

import { CSSResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";



/**
 * @element ak-flow-card
 * @class FlowCard
 * @slot title - Title of the card, optional, when not set uses the flow title
 * @slot - Main body of the card
 * @slot footer - Footer links, optional
 * @slot footer-band - Band in the footer, option
 *
 */
@customElement("ak-flow-card")
export class FlowCard extends AKElement {
    role = "presentation";

    @property({ type: Object })
    public challenge: Pick<FormStaticChallenge, "flowInfo"> | null = null;

    @property({ type: Boolean })
    public loading = false;

    static styles: CSSResult[] = [Styles];

    render() {
        let inner = html`<slot></slot>`;
        if (!this.challenge || this.loading) {
            inner = html`<ak-empty-state loading default-label></ak-empty-state>`;
        }
        // No title if the challenge doesn't provide a title and no custom title is set
        let title: null | SlottedTemplateResult = null;
        if (this.findSlotted("title")) {
            title = html`<h1 class="tdgid-flow-card__title">
                <slot name="title"></slot>
            </h1>`;
        } else if (this.challenge?.flowInfo?.title) {
            title = html`<h1 class="tdgid-flow-card__title">
                ${this.challenge.flowInfo.title}
            </h1>`;
        }
        const footer = this.findSlotted("footer") ? html`<slot name="footer"></slot>` : null;
        const footerBand = this.findSlotted("footer-band")
            ? html`<slot name="footer-band"></slot>`
            : null;

        return html`${title ? html`<div class="tdgid-flow-card__header">${title}</div>` : null}
            <div class="tdgid-flow-card__body">${inner}</div>
            ${footer || footerBand
                ? html`<div class="tdgid-flow-card__footer">${footer}${footerBand}</div>`
                : null}`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-flow-card": FlowCard;
    }
}
