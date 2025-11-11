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

		// Create tools grid
		const toolsGrid = document.createElement('div');
		toolsGrid.classList.add('tools-grid');

		// Define tools
		const tools = [
			{ icon: Codicon.pulse, title: 'STIL Signal Editor', description: 'Edit STIL test signals', action: () => this.openStilSignalEditor() },
			{ icon: Codicon.chip, title: 'Pattern Generator', description: 'Generate test patterns', action: () => this.showToolNotImplemented('Pattern Generator') },
			{ icon: Codicon.graphLine, title: 'Waveform Viewer', description: 'View signal waveforms', action: () => this.showToolNotImplemented('Waveform Viewer') },
			{ icon: Codicon.circuitBoard, title: 'Pin Mapper', description: 'Map device pins', action: () => this.showToolNotImplemented('Pin Mapper') },
			{ icon: Codicon.graph, title: 'Timing Analyzer', description: 'Analyze signal timing', action: () => this.showToolNotImplemented('Timing Analyzer') },
			{ icon: Codicon.database, title: 'Vector Database', description: 'Manage test vectors', action: () => this.showToolNotImplemented('Vector Database') },
			{ icon: Codicon.beaker, title: 'Test Builder', description: 'Build test sequences', action: () => this.showToolNotImplemented('Test Builder') },
			{ icon: Codicon.dashboard, title: 'Coverage Report', description: 'View test coverage', action: () => this.showToolNotImplemented('Coverage Report') },
			{ icon: Codicon.package, title: 'Device Library', description: 'Browse device models', action: () => this.showToolNotImplemented('Device Library') },
			{ icon: Codicon.tools, title: 'Debug Console', description: 'Hardware debug tools', action: () => this.showToolNotImplemented('Debug Console') },
			{ icon: Codicon.server, title: 'Tester Config', description: 'Configure test equipment', action: () => this.showToolNotImplemented('Tester Config') },
			{ icon: Codicon.checklist, title: 'Test Runner', description: 'Execute test suites', action: () => this.showToolNotImplemented('Test Runner') }
		];

		// Render tool items
		tools.forEach(tool => {
			const toolItem = this.createToolItem(tool.icon, tool.title, tool.description, tool.action);
			toolsGrid.appendChild(toolItem);
		});

		content.appendChild(toolsGrid);
		container.appendChild(content);
	}

	private createToolItem(icon: Codicon, title: string, description: string, action: () => void): HTMLElement {
		const item = document.createElement('div');
		item.classList.add('tool-item');
		item.setAttribute('role', 'button');
		item.setAttribute('tabindex', '0');
		item.setAttribute('aria-label', title);

		// Icon container
		const iconContainer = document.createElement('div');
		iconContainer.classList.add('tool-icon');
		const iconElement = document.createElement('div');
		iconElement.classList.add('codicon', `codicon-${icon.id}`);
		iconContainer.appendChild(iconElement);

		// Text container
		const textContainer = document.createElement('div');
		textContainer.classList.add('tool-text');

		const titleElement = document.createElement('div');
		titleElement.classList.add('tool-title');
		titleElement.textContent = title;

		const descElement = document.createElement('div');
		descElement.classList.add('tool-description');
		descElement.textContent = description;

		textContainer.appendChild(titleElement);
		textContainer.appendChild(descElement);

		item.appendChild(iconContainer);
		item.appendChild(textContainer);

		// Event listeners
		this._register(addDisposableListener(item, 'click', () => action()));

		this._register(addDisposableListener(item, 'keydown', (e) => {
			const event = new StandardKeyboardEvent(e);
			if (event.equals(KeyCode.Enter) || event.equals(KeyCode.Space)) {
				e.preventDefault();
				action();
			}
		}));

		return item;
	}

	private showToolNotImplemented(toolName: string): void {
		console.log(`${toolName} - Not yet implemented`);
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
