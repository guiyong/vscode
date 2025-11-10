/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/toolsView.css';
import { IViewletViewOptions } from '../../../../workbench/browser/parts/views/viewsViewlet.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IViewDescriptorService } from '../../../../workbench/common/views.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { ViewPane } from '../../../../workbench/browser/parts/views/viewPane.js';
import { IEditorService } from '../../../../workbench/services/editor/common/editorService.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { StilSignalEditorInput } from './stilSignalEditorInput.js';
import { addDisposableListener } from '../../../../base/browser/dom.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { KeyCode } from '../../../../base/common/keyCodes.js';

export class ToolsView extends ViewPane {

	constructor(
		options: IViewletViewOptions,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IOpenerService openerService: IOpenerService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
		@IEditorService private readonly editorService: IEditorService
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);

		const content = document.createElement('div');
		content.classList.add('tools-view-content');

		// Create icon-only button for STIL Signal Editor
		const buttonContainer = document.createElement('div');
		buttonContainer.classList.add('tools-view-actions');

		const button = document.createElement('a');
		button.classList.add('action-label', 'codicon', `codicon-${Codicon.pulse.id}`);
		button.setAttribute('role', 'button');
		button.setAttribute('tabindex', '0');
		button.setAttribute('title', 'Edit STIL Signals');
		button.setAttribute('aria-label', 'Edit STIL Signals');

		this._register(addDisposableListener(button, 'click', () => {
			this.openStilSignalEditor();
		}));

		this._register(addDisposableListener(button, 'keydown', (e) => {
			const event = new StandardKeyboardEvent(e);
			if (event.equals(KeyCode.Enter) || event.equals(KeyCode.Space)) {
				e.preventDefault();
				this.openStilSignalEditor();
			}
		}));

		buttonContainer.appendChild(button);
		content.appendChild(buttonContainer);
		container.appendChild(content);
	}

	private async openStilSignalEditor(): Promise<void> {
		// Create singleton editor input - will reuse existing editor if already open
		const input = new StilSignalEditorInput();

		await this.editorService.openEditor(input, { pinned: true });
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
	}
}
