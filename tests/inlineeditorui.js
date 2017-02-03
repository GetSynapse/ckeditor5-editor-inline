/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import View from '@ckeditor/ckeditor5-ui/src/view';

import InlineEditorUI from '../src/inlineeditorui';
import InlineEditorUIView from '../src/inlineeditoruiview';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import * as toolbarUtils from '@ckeditor/ckeditor5-ui/src/toolbar/utils';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import utils from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'InlineEditorUI', () => {
	let editorElement, editor, editable, view, ui;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = new ClassicTestEditor( editorElement, {
			toolbar: [ 'foo', 'bar' ]
		} );

		view = new InlineEditorUIView( editor.locale );
		ui = new InlineEditorUI( editor, view );
		editable = editor.editing.view.getRoot();

		ui.componentFactory.add( 'foo', viewCreator( 'foo' ) );
		ui.componentFactory.add( 'bar', viewCreator( 'bar' ) );
	} );

	describe( 'constructor()', () => {
		it( 'sets #editor', () => {
			expect( ui.editor ).to.equal( editor );
		} );

		it( 'sets #view', () => {
			expect( ui.view ).to.equal( view );
		} );

		it( 'creates #componentFactory factory', () => {
			expect( ui.componentFactory ).to.be.instanceOf( ComponentFactory );
		} );

		it( 'creates #focusTracker', () => {
			expect( ui.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		describe( 'toolbar', () => {
			it( 'binds view.toolbar#isActive to editor.ui#focusTracker', () => {
				ui.focusTracker.isFocused = false;
				expect( view.toolbar.isActive ).to.be.false;

				ui.focusTracker.isFocused = true;
				expect( view.toolbar.isActive ).to.be.true;
			} );

			it( 'sets view.toolbar#targetElement', () => {
				expect( view.toolbar.targetElement ).to.equal( view.editableElement );
			} );
		} );

		describe( 'editable', () => {
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

			it( 'binds view.editable#isReadOnly', () => {
				utils.assertBinding(
					view.editable,
					{ isReadOnly: false },
					[
						[ editable, { isReadOnly: true } ]
					],
					{ isReadOnly: true }
				);
			} );
		} );
	} );

	describe( 'init()', () => {
		afterEach( () => {
			return ui.destroy();
		} );

		it( 'returns a promise', () => {
			const promise = ui.init().then( () => {
				expect( promise ).to.be.instanceof( Promise );
			} );

			return promise;
		} );

		it( 'initializes the #view', () => {
			const spy = sinon.spy( view, 'init' );

			return ui.init().then( () => {
				sinon.assert.calledOnce( spy );
			} );
		} );

		it( 'fills view.toolbar#items with editor config', () => {
			const spy = testUtils.sinon.spy( toolbarUtils, 'expandToolbarConfig' );

			return ui.init().then( () => {
				sinon.assert.calledWithExactly( spy,
					editor.config.get( 'toolbar' ),
					view.toolbar.items,
					ui.componentFactory
				);
			} );
		} );

		it( 'initializes keyboard navigation between view#toolbar and view#editable', () => {
			const spy = testUtils.sinon.spy( toolbarUtils, 'enableToolbarKeyboardFocus' );

			return ui.init().then( () => {
				sinon.assert.calledWithExactly( spy, {
					origin: editor.editing.view,
					originFocusTracker: ui.focusTracker,
					originKeystrokeHandler: editor.keystrokes,
					toolbar: view.toolbar
				} );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'returns a promise', () => {
			return ui.init().then( () => {
				const promise = ui.destroy().then( () => {
					expect( promise ).to.be.instanceof( Promise );
				} );

				return promise;
			} );
		} );

		it( 'destroys the #view', () => {
			const spy = sinon.spy( view, 'destroy' );

			return ui.init()
				.then( () => ui.destroy() )
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );
	} );
} );

function viewCreator( name ) {
	return ( locale ) => {
		const view = new View( locale );

		view.name = name;
		view.element = document.createElement( 'a' );

		return view;
	};
}
