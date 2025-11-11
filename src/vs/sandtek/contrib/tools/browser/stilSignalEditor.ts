/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/stilSignalEditor.css';
import { EditorPane } from '../../../../workbench/browser/parts/editor/editorPane.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { StilSignalEditorInput } from './stilSignalEditorInput.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IEditorOpenContext } from '../../../../workbench/common/editor.js';
import { IEditorGroup } from '../../../../workbench/services/editor/common/editorGroupsService.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import * as DOM from '../../../../base/browser/dom.js';
import { ActionBar, ActionsOrientation } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { Action } from '../../../../base/common/actions.js';
import { CodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { URI } from '../../../../base/common/uri.js';

enum ViewMode {
	ASCII = 'ascii',
	Spreadsheet = 'spreadsheet'
}

interface SignalRowData {
	signalName: string;
	packagedName: string;
	site1: number;
	site2: number;
}

export class StilSignalEditor extends EditorPane {

	static readonly ID = 'workbench.editor.stilSignalEditor';

	private headerContainer!: HTMLElement;
	private viewSwitcherBar!: ActionBar;
	private asciiViewAction!: Action;
	private spreadsheetViewAction!: Action;
	private contentContainer!: HTMLElement;
	private asciiViewContainer!: HTMLElement;
	private spreadsheetViewContainer!: HTMLElement;
	private codeEditor: ICodeEditor | null = null;
	private currentViewMode: ViewMode = ViewMode.ASCII;

	constructor(
		group: IEditorGroup,
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@ILogService private readonly logService: ILogService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IModelService private readonly modelService: IModelService
	) {
		super(StilSignalEditor.ID, group, telemetryService, themeService, storageService);
	}

	protected createEditor(parent: HTMLElement): void {
		this.logService.info('[STIL Signal Editor] Creating editor UI');

		// Set parent to fill available space
		parent.style.display = 'flex';
		parent.style.flexDirection = 'column';
		parent.style.height = '100%';

		// Create header with view switcher
		this.createHeader(parent);

		// Create content container
		this.contentContainer = DOM.append(parent, DOM.$('.stil-editor-content'));

		// Create ASCII view container (Monaco editor)
		this.asciiViewContainer = DOM.append(this.contentContainer, DOM.$('.ascii-view-container'));

		// Create Spreadsheet view container
		this.spreadsheetViewContainer = DOM.append(this.contentContainer, DOM.$('.spreadsheet-view-container'));
		this.spreadsheetViewContainer.style.display = 'none';
		this.createSpreadsheetView();

		// Initialize Monaco editor in ASCII view
		this.createMonacoEditor();

		this.logService.info('[STIL Signal Editor] Editor UI created successfully');
	}

	private createHeader(parent: HTMLElement): void {
		this.headerContainer = DOM.append(parent, DOM.$('.stil-editor-header'));

		const viewSwitcherContainer = DOM.append(this.headerContainer, DOM.$('.view-switcher-container'));
		this.viewSwitcherBar = this._register(new ActionBar(viewSwitcherContainer, {
			orientation: ActionsOrientation.HORIZONTAL,
			focusOnlyEnabledItems: true,
			ariaLabel: 'View Switcher',
			ariaRole: 'tablist'
		}));

		this.asciiViewAction = this._register(new Action('asciiView', 'ASCII', '.view-tab', true, () => this.switchView(ViewMode.ASCII)));
		this.asciiViewAction.checked = true;

		this.spreadsheetViewAction = this._register(new Action('spreadsheetView', 'Spreadsheet', '.view-tab', true, () => this.switchView(ViewMode.Spreadsheet)));

		this.viewSwitcherBar.push([this.asciiViewAction, this.spreadsheetViewAction]);
	}

	private createMonacoEditor(): void {
		const stilContent = `SignalMap DemoSignalMap {
	SiteMap 1, 2;
	PA1 ("1") 15,11;
	TEST_DPS ("2") 0,1;
	TEST_GPMU ("3") 2,0;
}`;

		this.logService.info('[STIL Signal Editor] Creating Monaco editor with content:', stilContent);

		// Create a text model
		const uri = URI.parse('inmemory://stil-signals-editor');
		const model = this.modelService.createModel(stilContent, null, uri);
		this._register(model);

		const editorOptions = {
			lineNumbers: 'on' as const,
			minimap: { enabled: false },
			automaticLayout: false,
			scrollBeyondLastLine: false
		};

		this.codeEditor = this._register(this.instantiationService.createInstance(
			CodeEditorWidget,
			this.asciiViewContainer,
			editorOptions,
			{}
		));

		// Set the model on the editor
		this.codeEditor.setModel(model);

		this.logService.info('[STIL Signal Editor] Monaco editor created, model:', this.codeEditor?.getModel()?.getValue());
	}

	private createSpreadsheetView(): void {
		// Parse signal data from STIL content
		const signalData: SignalRowData[] = [
			{ signalName: 'PA1', packagedName: '("1")', site1: 15, site2: 11 },
			{ signalName: 'TEST_DPS', packagedName: '("2")', site1: 0, site2: 1 },
			{ signalName: 'TEST_GPMU', packagedName: '("3")', site1: 2, site2: 0 }
		];

		// Create table element
		const table = DOM.append(this.spreadsheetViewContainer, DOM.$('table.signal-table'));

		// Create header row
		const thead = DOM.append(table, DOM.$('thead'));
		const headerRow = DOM.append(thead, DOM.$('tr'));
		const headers = ['Signal Name', 'Packaged Name', 'Site 1', 'Site 2'];
		headers.forEach(headerText => {
			const th = DOM.append(headerRow, DOM.$('th'));
			th.textContent = headerText;
		});

		// Create body with data rows
		const tbody = DOM.append(table, DOM.$('tbody'));
		signalData.forEach(row => {
			const tr = DOM.append(tbody, DOM.$('tr'));

			const tdSignalName = DOM.append(tr, DOM.$('td'));
			tdSignalName.textContent = row.signalName;

			const tdPackagedName = DOM.append(tr, DOM.$('td'));
			tdPackagedName.textContent = row.packagedName;

			const tdSite1 = DOM.append(tr, DOM.$('td'));
			tdSite1.textContent = row.site1.toString();

			const tdSite2 = DOM.append(tr, DOM.$('td'));
			tdSite2.textContent = row.site2.toString();
		});

		this.logService.info('[STIL Signal Editor] Spreadsheet view created with', signalData.length, 'rows');
	}

	private switchView(mode: ViewMode): void {
		this.currentViewMode = mode;

		if (mode === ViewMode.ASCII) {
			this.asciiViewAction.checked = true;
			this.spreadsheetViewAction.checked = false;
			this.asciiViewContainer.style.display = '';
			this.spreadsheetViewContainer.style.display = 'none';
			this.codeEditor?.layout();
			this.logService.info('[STIL Signal Editor] Switched to ASCII view');
		} else {
			this.asciiViewAction.checked = false;
			this.spreadsheetViewAction.checked = true;
			this.asciiViewContainer.style.display = 'none';
			this.spreadsheetViewContainer.style.display = '';
			this.logService.info('[STIL Signal Editor] Switched to Spreadsheet view');
		}
	}

	override async setInput(input: StilSignalEditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void> {
		await super.setInput(input, options, context, token);

		// Log editor activation
		const timestamp = new Date().toISOString();
		this.logService.info(`[STIL Signal Editor] Editor activated at ${timestamp}`);
		this.logService.info(`[STIL Signal Editor] Input: ${input.getName()}, Resource: ${input.resource.toString()}`);
	}

	override layout(dimension: { width: number; height: number }): void {
		this.logService.info(`[STIL Signal Editor] layout called: ${dimension.width}x${dimension.height}`);
		
		if (this.codeEditor && this.currentViewMode === ViewMode.ASCII) {
			const headerHeight = this.headerContainer?.offsetHeight || 0;
			const editorHeight = dimension.height - headerHeight;
			this.logService.info(`[STIL Signal Editor] Editor layout: ${dimension.width}x${editorHeight} (header: ${headerHeight})`);
			this.codeEditor.layout({
				width: dimension.width,
				height: editorHeight
			});
		}
	}

	override dispose(): void {
		if (this.codeEditor) {
			this.codeEditor.dispose();
			this.codeEditor = null;
		}
		super.dispose();
	}
}
