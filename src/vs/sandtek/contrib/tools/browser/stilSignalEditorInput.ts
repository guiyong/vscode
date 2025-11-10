/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EditorInput } from '../../../../workbench/common/editor/editorInput.js';
import { URI } from '../../../../base/common/uri.js';
import { IUntypedEditorInput } from '../../../../workbench/common/editor.js';
import { Schemas } from '../../../../base/common/network.js';

export class StilSignalEditorInput extends EditorInput {

	static readonly ID = 'workbench.input.stilSignalEditor';

	override readonly resource: URI = URI.from({
		scheme: Schemas.untitled,
		path: 'stil-signals'
	});

	constructor() {
		super();
	}

	override matches(otherInput: EditorInput | IUntypedEditorInput): boolean {
		// Ensure singleton behavior - all instances match each other
		return super.matches(otherInput) || otherInput instanceof StilSignalEditorInput;
	}

	override get typeId(): string {
		return StilSignalEditorInput.ID;
	}

	override getName(): string {
		return 'STIL Signal Editor';
	}

	override async resolve(): Promise<null> {
		return null;
	}
}
