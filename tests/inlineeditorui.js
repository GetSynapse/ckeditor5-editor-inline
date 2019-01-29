/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */

import View from '@ckeditor/ckeditor5-ui/src/view';

import InlineEditorUI from '../src/inlineeditorui';
import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import InlineEditorUIView from '../src/inlineeditoruiview';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import utils from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { isElement } from 'lodash-es';

describe( 'InlineEditorUI', () => {
	let editor, view, ui, viewElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualInlineTestEditor
			.create( 'foo', {
				toolbar: [ 'foo', 'bar' ],
			} )
			.then( newEditor => {
				editor = newEditor;

				ui = editor.ui;
				view = ui.view;
				viewElement = view.editable.element;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'extends EditorUI', () => {
			expect( ui ).to.instanceof( EditorUI );
		} );
	} );

	describe( 'init()', () => {
		it( 'renders the #view', () => {
			expect( view.isRendered ).to.be.true;
		} );

		describe( 'panel', () => {
			it( 'binds view.panel#isVisible to editor.ui#focusTracker', () => {
				ui.focusTracker.isFocused = false;
				expect( view.panel.isVisible ).to.be.false;

				ui.focusTracker.isFocused = true;
				expect( view.panel.isVisible ).to.be.true;
			} );

			it( 'doesn\'t set the view#viewportTopOffset, if not specified in the config', () => {
				expect( view.viewportTopOffset ).to.equal( 0 );
			} );

			it( 'sets view#viewportTopOffset, if specified', () => {
				return VirtualInlineTestEditor
					.create( 'foo', {
						toolbar: {
							viewportTopOffset: 100
						}
					} )
					.then( editor => {
						const ui = editor.ui;
						const view = ui.view;

						expect( view.viewportTopOffset ).to.equal( 100 );

						return editor.destroy();
					} );
			} );

			// https://github.com/ckeditor/ckeditor5-editor-inline/issues/4
			it( 'pin() is called on editor.ui#update', () => {
				const spy = sinon.stub( view.panel, 'pin' );

				view.panel.hide();

				editor.ui.fire( 'update' );
				sinon.assert.notCalled( spy );

				view.panel.show();

				editor.ui.fire( 'update' );
				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, {
					target: view.editable.element,
					positions: sinon.match.array
				} );
			} );
		} );

		describe( 'editable', () => {
			let editable;

			beforeEach( () => {
				editable = editor.editing.view.document.getRoot();
			} );

			it( 'registers view.editable#element in editor focus tracker', () => {
				ui.focusTracker.isFocused = false;

				view.editable.element.dispatchEvent( new Event( 'focus' ) );
				expect( ui.focusTracker.isFocused ).to.true;
			} );

			it( 'sets view.editable#name', () => {
				expect( view.editable.name ).to.equal( editable.rootName );
			} );

			it( 'binds view.editable#isFocused', () => {
				utils.assertBinding(
					view.editable,
					{ isFocused: false },
					[
						[ ui.focusTracker, { isFocused: true } ]
					],
					{ isFocused: true }
				);
			} );
		} );

		describe( 'placeholder', () => {
			it( 'sets placeholder from editor.config.placeholder', () => {
				return VirtualInlineTestEditor
					.create( 'foo', {
						extraPlugins: [ Paragraph ],
						placeholder: 'placeholder-text',
					} )
					.then( newEditor => {
						editor = newEditor;

						const firstChild = editor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).to.equal( 'placeholder-text' );

						return editor.destroy();
					} );
			} );

			it( 'sets placeholder from "placeholder" attribute of a passed element', () => {
				const element = document.createElement( 'div' );

				element.setAttribute( 'placeholder', 'placeholder-text' );

				return VirtualInlineTestEditor
					.create( element, {
						extraPlugins: [ Paragraph ]
					} )
					.then( newEditor => {
						editor = newEditor;

						const firstChild = editor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).to.equal( 'placeholder-text' );

						return editor.destroy();
					} );
			} );

			it( 'uses editor.config.placeholder rather than "placeholder" attribute of a passed element', () => {
				const element = document.createElement( 'div' );

				element.setAttribute( 'placeholder', 'placeholder-text' );

				return VirtualInlineTestEditor
					.create( element, {
						placeholder: 'config takes precedence',
						extraPlugins: [ Paragraph ]
					} )
					.then( newEditor => {
						editor = newEditor;

						const firstChild = editor.editing.view.document.getRoot().getChild( 0 );

						expect( firstChild.getAttribute( 'data-placeholder' ) ).to.equal( 'config takes precedence' );

						return editor.destroy();
					} );
			} );
		} );

		describe( 'view.toolbar#items', () => {
			it( 'are filled with the config.toolbar (specified as an Array)', () => {
				return VirtualInlineTestEditor
					.create( '', {
						toolbar: [ 'foo', 'bar' ]
					} )
					.then( editor => {
						const items = editor.ui.view.toolbar.items;

						expect( items.get( 0 ).name ).to.equal( 'foo' );
						expect( items.get( 1 ).name ).to.equal( 'bar' );

						return editor.destroy();
					} );
			} );

			it( 'are filled with the config.toolbar (specified as an Object)', () => {
				return VirtualInlineTestEditor
					.create( '', {
						toolbar: {
							items: [ 'foo', 'bar' ],
							viewportTopOffset: 100
						}
					} )
					.then( editor => {
						const items = editor.ui.view.toolbar.items;

						expect( items.get( 0 ).name ).to.equal( 'foo' );
						expect( items.get( 1 ).name ).to.equal( 'bar' );

						return editor.destroy();
					} );
			} );
		} );

		it( 'initializes keyboard navigation between view#toolbar and view#editable', () => {
			return VirtualInlineTestEditor.create( '' )
				.then( editor => {
					const ui = editor.ui;
					const view = ui.view;
					const spy = testUtils.sinon.spy( view.toolbar, 'focus' );

					ui.focusTracker.isFocused = true;
					ui.view.toolbar.focusTracker.isFocused = false;

					editor.keystrokes.press( {
						keyCode: keyCodes.f10,
						altKey: true,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					} );

					sinon.assert.calledOnce( spy );

					return editor.destroy();
				} );
		} );
	} );

	describe( 'element()', () => {
		it( 'returns correct element instance', () => {
			expect( ui.element ).to.equal( viewElement );
		} );
	} );

	describe( 'getEditableElement()', () => {
		it( 'returns editable element (default)', () => {
			expect( ui.getEditableElement() ).to.equal( view.editable.element );
		} );

		it( 'returns editable element (root name passed)', () => {
			expect( ui.getEditableElement( 'main' ) ).to.equal( view.editable.element );
		} );

		it( 'returns undefined if editable with the given name is absent', () => {
			expect( ui.getEditableElement( 'absent' ) ).to.be.undefined;
		} );
	} );
} );

function viewCreator( name ) {
	return locale => {
		const view = new View( locale );

		view.name = name;
		view.element = document.createElement( 'a' );

		return view;
	};
}

class VirtualInlineTestEditor extends VirtualTestEditor {
	constructor( sourceElementOrData, config ) {
		super( config );

		if ( isElement( sourceElementOrData ) ) {
			this.sourceElement = sourceElementOrData;
		}

		const view = new InlineEditorUIView( this.locale, this.editing.view );
		this.ui = new InlineEditorUI( this, view );

		this.ui.componentFactory.add( 'foo', viewCreator( 'foo' ) );
		this.ui.componentFactory.add( 'bar', viewCreator( 'bar' ) );
	}

	destroy() {
		this.ui.destroy();

		return super.destroy();
	}

	static create( sourceElementOrData, config ) {
		return new Promise( resolve => {
			const editor = new this( sourceElementOrData, config );

			resolve(
				editor.initPlugins()
					.then( () => {
						editor.ui.init();

						const initialData = isElement( sourceElementOrData ) ?
							sourceElementOrData.innerHTML :
							sourceElementOrData;

						editor.data.init( initialData );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}
