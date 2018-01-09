/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-inline/inlineeditorui
 */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';
import normalizeToolbarConfig from '@ckeditor/ckeditor5-ui/src/toolbar/normalizetoolbarconfig';

/**
 * The inline editor UI class.
 *
 * @implements module:core/editor/editorui~EditorUI
 */
export default class InlineEditorUI {
	/**
	 * Creates an instance of the editor UI class.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {module:ui/editorui/editoruiview~EditorUIView} view The view of the UI.
	 */
	constructor( editor, view ) {
		/**
		 * @inheritDoc
		 */
		this.editor = editor;

		/**
		 * @inheritDoc
		 */
		this.view = view;

		/**
		 * @inheritDoc
		 */
		this.componentFactory = new ComponentFactory( editor );

		/**
		 * @inheritDoc
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * A normalized `config.toolbar` object.
		 *
		 * @type {Object}
		 * @private
		 */
		this._toolbarConfig = normalizeToolbarConfig( editor.config.get( 'toolbar' ) );
	}

	/**
	 * Initializes the UI.
	 */
	init() {
		const editor = this.editor;
		const view = this.view;

		view.render();

		// Set–up the view#panel.
		view.panel.bind( 'isVisible' ).to( this.focusTracker, 'isFocused' );

		if ( this._toolbarConfig.viewportTopOffset ) {
			view.viewportTopOffset = this._toolbarConfig.viewportTopOffset;
		}

		// https://github.com/ckeditor/ckeditor5-editor-inline/issues/4
		view.listenTo( editor.editing.view, 'render', () => {
			// Don't pin if the panel is not already visible. It prevents the panel
			// showing up when there's no focus in the UI.
			if ( view.panel.isVisible ) {
				view.panel.pin( {
					target: view.editableElement,
					positions: view.panelPositions
				} );
			}
		} );

		// Setup the editable.
		const editingRoot = editor.editing.view.getRoot();
		view.editable.bind( 'isReadOnly' ).to( editingRoot );

		// Bind to focusTracker instead of editor.editing.view because otherwise
		// focused editable styles disappear when view#toolbar is focused.
		view.editable.bind( 'isFocused' ).to( this.focusTracker );
		editor.editing.view.attachDomRoot( view.editableElement );
		view.editable.name = editingRoot.rootName;

		this.focusTracker.add( view.editableElement );

		view.toolbar.fillFromConfig( this._toolbarConfig.items, this.componentFactory );

		enableToolbarKeyboardFocus( {
			origin: editor.editing.view,
			originFocusTracker: this.focusTracker,
			originKeystrokeHandler: editor.keystrokes,
			toolbar: view.toolbar
		} );
	}

	/**
	 * Destroys the UI.
	 */
	destroy() {
		this.view.destroy();
	}
}
