/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize, localize2 } from '../../../../nls.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { IViewContainersRegistry, ViewContainerLocation, Extensions as ViewContainerExtensions, IViewsRegistry } from '../../../../workbench/common/views.js';
import { VIEWLET_ID, VIEW_ID } from '../common/tools.js';
import { ToolsViewPaneContainer } from './toolsViewPaneContainer.js';
import { ToolsView } from './toolsView.js';
import { toolsViewIcon } from './toolsIcons.js';
import { KeyMod, KeyCode } from '../../../../base/common/keyCodes.js';

// Register the Tools view container in the Activity Bar
const viewContainer = Registry.as<IViewContainersRegistry>(ViewContainerExtensions.ViewContainersRegistry).registerViewContainer({
	id: VIEWLET_ID,
	title: localize2('tools', 'Tools'),
	ctorDescriptor: new SyncDescriptor(ToolsViewPaneContainer),
	storageId: 'workbench.tools.views.state',
	icon: toolsViewIcon,
	alwaysUseContainerInfo: true,
	order: 10,
	hideIfEmpty: true,
	openCommandActionDescriptor: {
		id: VIEWLET_ID,
		mnemonicTitle: localize({ key: 'miViewTools', comment: ['&& denotes a mnemonic'] }, "T&&ools"),
		keybindings: {
			primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyT
		},
		order: 5,
	}
}, ViewContainerLocation.Sidebar);

// Register the Tools view inside the container
const viewsRegistry = Registry.as<IViewsRegistry>(ViewContainerExtensions.ViewsRegistry);

viewsRegistry.registerViews([{
	id: VIEW_ID,
	name: localize2('toolsView', 'Tools'),
	containerIcon: toolsViewIcon,
	canToggleVisibility: true,
	canMoveView: true,
	ctorDescriptor: new SyncDescriptor(ToolsView),
	weight: 100,
	order: 1
}], viewContainer);

// Register welcome content
viewsRegistry.registerViewWelcomeContent(VIEW_ID, {
	content: localize('noToolsAvailable', "No tools available yet.\n[Add Tool](command:workbench.action.openSettings)"),
	when: 'default'
});
