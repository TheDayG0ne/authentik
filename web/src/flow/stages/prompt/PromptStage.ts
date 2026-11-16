import "#elements/Divider";
import "#flow/components/ak-flow-card";

import { WithCapabilitiesConfig } from "#elements/mixins/capabilities";
import { SlottedTemplateResult } from "#elements/types";

import { AKFormErrors } from "#components/ak-field-errors";
import { AKLabel } from "#components/ak-label";

import { BaseStage } from "#flow/stages/base";
import { LocalePrompt } from "#flow/stages/prompt/components/locale";
import TDGControls from "#flow/stages/tdg-controls.css";

import {
    CapabilitiesEnum,
    PromptChallenge,
    PromptChallengeResponseRequest,
    PromptTypeEnum,
    StagePrompt,
} from "@goauthentik/api";

import { msg } from "@lit/localize";
import { css, CSSResult, html } from "lit";
import { customElement } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";


// Fixes horizontal rule <hr> warning in select dropdowns.

/**
 * @prop {PromptChallenge} challenge - The challenge provided to this stage.
 * @prop {StageHost} host - The host managing this stage.
 */
@customElement("ak-stage-prompt")
export class PromptStage extends WithCapabilitiesConfig(
    BaseStage<PromptChallenge, PromptChallengeResponseRequest>,
) {
    static shadowRootOptions: ShadowRootInit = BaseStage.shadowRootOptions;

    static styles: CSSResult[] = [
        css`
            textarea {
                min-height: 4em;
                max-height: 15em;
                resize: vertical;
            }
        `,
        TDGControls,
    ];

    protected isAlertPromptType(prompt: StagePrompt): boolean {
        return (
            prompt.type === PromptTypeEnum.AlertInfo ||
            prompt.type === PromptTypeEnum.AlertWarning ||
            prompt.type === PromptTypeEnum.AlertDanger
        );
    }

    protected renderPromptAlert(
        prompt: StagePrompt,
        level: "info" | "warning" | "danger",
        icon: string,
    ): SlottedTemplateResult {
        return html`<div class="tdg-alert tdg-alert--${level} tdg-alert--inline">
            <div class="tdg-alert__icon">
                <i class="fas fa-fw ${icon}" aria-hidden="true"></i>
            </div>
            ${prompt.label ? html`<h4 class="tdg-alert__title">${prompt.label}</h4>` : null}
            <div class="tdg-alert__description tdg-content">
                ${unsafeHTML(prompt.initialValue)}
            </div>
        </div>`;
    }

    protected renderPromptInner(prompt: StagePrompt): SlottedTemplateResult {
        const fieldId = `field-${prompt.fieldKey}`;

        switch (prompt.type) {
            case PromptTypeEnum.Text:
                return html`<input
                    type="text"
                    id=${fieldId}
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    autocomplete="off"
                    class="tdg-control"
                    ?required=${prompt.required}
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.TextArea:
                return html`<textarea
                    id=${fieldId}
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    autocomplete="off"
                    class="tdg-control"
                    ?required=${prompt.required}
                >
${prompt.initialValue}</textarea
                >`;
            case PromptTypeEnum.TextReadOnly:
                return html`<input
                    type="text"
                    id=${fieldId}
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    class="tdg-control"
                    readonly
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.TextAreaReadOnly:
                return html`<textarea
                    id=${fieldId}
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    class="tdg-control"
                    readonly
                >
${prompt.initialValue}</textarea
                >`;
            case PromptTypeEnum.Username:
                return html`<input
                    type="text"
                    id=${fieldId}
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    autocomplete="username"
                    spellcheck="false"
                    class="tdg-control"
                    ?required=${prompt.required}
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.Email:
                return html`<input
                    type="email"
                    id=${fieldId}
                    autocomplete="email"
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    class="tdg-control"
                    ?required=${prompt.required}
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.Password:
                return html`<input
                    type="password"
                    id=${fieldId}
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    autocomplete="new-password"
                    class="tdg-control"
                    ?required=${prompt.required}
                />`;
            case PromptTypeEnum.Number:
                return html`<input
                    type="number"
                    id=${fieldId}
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    class="tdg-control"
                    ?required=${prompt.required}
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.Date:
                return html`<input
                    type="date"
                    id=${fieldId}
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    class="tdg-control"
                    ?required=${prompt.required}
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.DateTime:
                return html`<input
                    type="datetime"
                    id=${fieldId}
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    class="tdg-control"
                    ?required=${prompt.required}
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.File:
                return html`<input
                    type="file"
                    id=${fieldId}
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    class="tdg-control"
                    ?required=${prompt.required}
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.Separator:
                return html`<ak-divider>${prompt.placeholder}</ak-divider>`;
            case PromptTypeEnum.Hidden:
                return html`<input
                    type="hidden"
                    id=${fieldId}
                    name="${prompt.fieldKey}"
                    value="${prompt.initialValue}"
                    class="tdg-control"
                    ?required=${prompt.required}
                />`;
            case PromptTypeEnum.Static:
                return html`<p>${unsafeHTML(prompt.initialValue)}</p>`;
            case PromptTypeEnum.AlertInfo:
                return this.renderPromptAlert(prompt, "info", "fa-info-circle");
            case PromptTypeEnum.AlertWarning:
                return this.renderPromptAlert(prompt, "warning", "fa-exclamation-triangle");
            case PromptTypeEnum.AlertDanger:
                return this.renderPromptAlert(prompt, "danger", "fa-exclamation-circle");
            case PromptTypeEnum.Dropdown:
                return html`<select class="tdg-control" name="${prompt.fieldKey}">
                    ${prompt.choices?.map((choice) => {
                        return html`<option
                            value="${choice.value}"
                            ?selected=${prompt.initialValue === choice.value}
                        >
                            ${choice.label}
                        </option>`;
                    })}
                </select>`;
            case PromptTypeEnum.RadioButtonGroup:
                return html`${(prompt.choices || []).map((choice) => {
                    const id = `${prompt.fieldKey}-${choice.value}`;
                    return html`<div class="tdg-check">
                        <input
                            type="radio"
                            class="tdg-check__input"
                            name="${prompt.fieldKey}"
                            id="${id}"
                            ?checked="${prompt.initialValue === choice.value}"
                            ?required="${prompt.required}"
                            value="${choice.value}"
                        />
                        <label class="tdg-check__label" for=${id}>${choice.label}</label>
                    </div> `;
                })}`;
            case PromptTypeEnum.AkLocale: {
                return LocalePrompt({
                    activeLanguageTag: this.activeLanguageTag,
                    prompt,
                    fieldId,
                    debug: this.can(CapabilitiesEnum.CanDebug),
                });
            }
            default:
                return html`<p>invalid type '${prompt.type}'</p>`;
        }
    }

    protected renderPromptHelpText(prompt: StagePrompt): SlottedTemplateResult {
        if (!prompt.subText) {
            return null;
        }

        return html`<p class="tdg-form__helper">${unsafeHTML(prompt.subText)}</p>`;
    }

    protected shouldRenderInWrapper(prompt: StagePrompt): boolean {
        // Special types that aren't rendered in a wrapper
        return !(
            prompt.type === PromptTypeEnum.Static ||
            prompt.type === PromptTypeEnum.Hidden ||
            prompt.type === PromptTypeEnum.Separator ||
            this.isAlertPromptType(prompt)
        );
    }

    protected renderField(prompt: StagePrompt): SlottedTemplateResult {
        // Checkbox is rendered differently
        if (prompt.type === PromptTypeEnum.Checkbox) {
            return html`<div class="tdg-check">
                <input
                    type="checkbox"
                    class="tdg-check__input"
                    id="${prompt.fieldKey}"
                    name="${prompt.fieldKey}"
                    ?checked=${prompt.initialValue !== ""}
                    ?required=${prompt.required}
                />
                <label class="tdg-check__label" for="${prompt.fieldKey}">${prompt.label}</label>
                ${prompt.required
                    ? html`<p class="tdg-form__helper">${msg("Required.")}</p>`
                    : null}
                <p class="tdg-form__helper">${unsafeHTML(prompt.subText)}</p>
            </div>`;
        }
        if (this.shouldRenderInWrapper(prompt)) {
            const errors = this.challenge?.responseErrors?.[prompt.fieldKey];

            return html`<div class="tdg-form__group">
                ${AKLabel(
                    {
                        required: prompt.required,
                        htmlFor: `field-${prompt.fieldKey}`,
                    },
                    prompt.label,
                )}
                ${this.renderPromptInner(prompt)} ${this.renderPromptHelpText(prompt)}
                ${AKFormErrors({ errors })}
            </div>`;
        }
        return html`${this.renderPromptInner(prompt)} ${this.renderPromptHelpText(prompt)}`;
    }

    protected renderContinue(): SlottedTemplateResult {
        return html`<fieldset class="ak-c-fieldset tdg-form__group tdg-form__actions">
            <legend class="sr-only">${msg("Form actions")}</legend>
            <button name="continue" type="submit" class="tdg-button tdg-button--primary tdg-button--block">
                ${msg("Continue")}
            </button>
        </fieldset>`;
    }

    protected override render(): SlottedTemplateResult {
        return html`<ak-flow-card .challenge=${this.challenge}>
            <form class="tdg-form" @submit=${this.submitForm}>
                ${Array.from(this.challenge?.fields || [], (prompt) => {
                    return this.renderField(prompt);
                })}
                ${this.renderNonFieldErrors()} ${this.renderContinue()}
            </form>
        </ak-flow-card>`;
    }
}

export default PromptStage;

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-prompt": PromptStage;
    }
}
