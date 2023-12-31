/*
* Version 1.1.4
*/

jQuery( document ).ready( function( $ ) {

	// Initial rulelist sortable
	initialize_sort();

	// Rebuild array on page load (if not updating settings)
	if( ! $( 'div.preventRebuildArray' ).length ) {
		
		rebuildArray();
	}
	
	// Edit title button
	$( document ).on( 'click', 'div.edit_title_div', function() {
		
		// Get original value
		var orig_value = $( this ).parent().siblings( 'span.group_name' ).text();
		var check_nodes = $( this ).parent().siblings( 'span.group_name' ).children( 'input.edit_title_input' );
		
		// If we are already editing, don't edit again
		if( $( check_nodes ).length > 0 ) { return false; }
		
		// Create submit/cancel buttons and replace html
		var edit_input = '<input type="text" class="edit_title_input" value="' + orig_value + '" />';
		$( this ).parent().siblings( 'span.group_name' ).html( edit_input );
		
		var edit_actions = '<span class="button submit_edit">Submit</span>';
		edit_actions += '<span class="button cancel_edit">Cancel</span>';
		edit_actions += '<input type="text" class="color_picker" />';
		edit_actions += '<span class="button title_bold"><i class="material-icons">format_bold</i></button>';
		$( this ).parent().siblings( 'span.group_name_edit' ).html( edit_actions );
		
		// Check for current title color
		var title_color = $( this ).parent().parent().siblings( 'input.title_color' ).val();
		var set_color = title_color === '' ? '#000' : title_color;
		
		// Check for current title opacity
		var title_opacity = $( this ).parent().parent().siblings( 'input.title_opacity' ).val();
		var set_opacity = title_opacity === '' ? '1' : title_opacity;
		
		// Check for current title bold
		var title_bold = $( this ).parent().parent().siblings( 'input.title_bold' ).val();
		if( title_bold == 'true' ) {
			$( this ).parent().siblings( 'span.group_name_edit' ).children( 'span.title_bold' ).addClass( 'active' );
		}
		
		// Build rgba from color and opacity
		var rgba = hexToRGB( set_color, set_opacity );
	
		// Set color picker
		$(".color_picker").spectrum({
			color: rgba,
			showInitial: true,
			showPaletteOnly: true,
			togglePaletteOnly: true,
			togglePaletteMoreText: 'Show More',
			togglePaletteLessText: 'Show Less',
			chooseText: 'Choose',
			cancelText: 'Cancel',
			hideAfterPaletteSelect: true,
			showAlpha: true,
			palette: [
				["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
				["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
				["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
				["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
				["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
				["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
				["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
				["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
			],
			change: function( color ) {
				
				// Populate hidden input field for later consumption
				$( this ).parent().parent().siblings( 'input.title_color' ).val( color.toHexString() );
				$( this ).parent().parent().siblings( 'input.title_opacity' ).val( color.getAlpha() );
			}
		});
	});
	
	// Edit container button
	$( document ).on( 'click', 'div.edit_container_div', function() {
		
		// If we are already editing, don't edit again
		var check_nodes = $( this ).parent().parent().siblings( 'div.container_options' ).children( 'input.cont_bg_color_picker' );
		if( $( check_nodes ).length > 0 ) { return false; }
		
		// Define container html
		var html = '';
		html += 'Container Background Color: <input type="text" class="cont_bg_color_picker" />';
		html += '<span class="button submit_edit_container">Submit</span>';
		html += '<span class="button cancel_edit_container">Cancel</span>';
		
		// Build new container options panel
		var new_div = $( '<div class="container_options">' );
		$( new_div ).html( html );
		$( new_div ).prependTo( $( this ).parent().parent().parent( 'div.rule_container' ) ).fadeIn();
		
		// Get container color option
		var container_color = $( this ).parent().parent().siblings( 'input.container_color' ).val();
		var container_opacity = $( this ).parent().parent().siblings( 'input.container_opacity' ).val();
		
		// Build rgba from color and opacity
		var rgba = hexToRGB( container_color, container_opacity );
	
		// Set color picker
		$(".cont_bg_color_picker").spectrum({
			color: rgba,
			showInitial: true,
			showPaletteOnly: true,
			togglePaletteOnly: true,
			togglePaletteMoreText: 'Show More',
			togglePaletteLessText: 'Show Less',
			chooseText: 'Choose',
			cancelText: 'Cancel',
			hideAfterPaletteSelect: true,
			showAlpha: true,
			palette: [
				["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
				["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
				["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
				["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
				["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
				["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
				["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
				["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
			],
			change: function( color ) {
				
				// Populate hidden input field for later consumption
				$( this ).parent().siblings( 'input.container_color' ).val( color.toHexString() );
				$( this ).parent().siblings( 'input.container_opacity' ).val( color.getAlpha() );
			}
		});
	});
	
	// Title bold button click
	$( document ).on( 'click', 'span.title_bold', function() {
		
		// Toggle active class
		$( this ).toggleClass( 'active' );
		
		// Get and set hidden input field
		var title_bold = $( this ).hasClass( 'active' ) ? 'true' : 'false';
		$( this ).parent().parent().siblings( 'input.title_bold' ).val( title_bold );
	});
	
	// Cancel edit title button
	$( document ).on( 'click', 'span.cancel_edit', function() {
		
		// Get original value
		var orig_value = $( this ).parent().siblings( 'span.group_name' ).children( 'input.edit_title_input' ).val();
		
		// Replace title with original value
		$( this ).parent().siblings( 'span.group_name' ).html( orig_value );
		
		// Clear edit area
		$( this ).parent().html( '' );
		
		// Rebuild user array
		rebuildArray();
	});
	
	// Cancel edit container button
	$( document ).on( 'click', 'span.cancel_edit_container', function() {
		
		// Remove edit container div
		$( this ).parent().fadeOut( "normal", function() { $( this ).remove(); });
		
		// Rebuild user array
		rebuildArray();
	});
	
	// Submit edit title button
	$( document ).on( 'click', 'span.submit_edit', function() {
		
		// Get new title value
		var new_value = $( this ).parent().siblings( 'span.group_name' ).children( 'input.edit_title_input' ).val();
		
		// Get title color
		var title_color = $( this ).parent().parent().siblings( 'input.title_color' ).val();
		
		// Get title opacity
		var title_opacity = $( this ).parent().parent().siblings( 'input.title_opacity' ).val();
		
		// Get title bold
		var title_bold = $( this ).parent().parent().siblings( 'input.title_bold' ).val();
		var font_weight = title_bold == 'true' ? 'bold' : 'normal';
		
		// Replace title with new values
		$( this ).parent().siblings( 'span.group_name' ).html( new_value ).css({ 'color': title_color, 'font-weight': font_weight, 'opacity': title_opacity });
		
		// Clear edit area
		$( this ).parent().html( '' );
		
		// Rebuild array
		rebuildArray();
	});
	
	// Submit edit container
	$( document ).on( 'click', 'span.submit_edit_container', function() {
		
		// Get container color
		var container_color = $( this ).parent().siblings( 'input.container_color' ).val();
		
		// Get container opacity
		var container_opacity = $( this ).parent().siblings( 'input.container_opacity' ).val();
		
		// Combine rgba
		var rgba = hexToRGB( container_color, container_opacity );
		
		// Replace container with new values
		$( this ).parent().parent().css({ 'background-color': rgba });
		
		// Remove edit container div
		$( this ).parent().fadeOut( "normal", function() { $( this ).remove(); });
		
		// Rebuild array
		rebuildArray();
	});

	// Create container button
	$( "span#create_group_button" ).click( function() {

		// Get name from input
		var name = $( 'input#new_group_name' ).val();

		// If no name, alert and bail
		if( name == '' ) {

			alert( "Please enter a valid Group Name.");
			return false;
		}
		
		// Create html for new container
		var html = '';
		html += '<div id="" class="rule_container">';
		
			// Check hide counts option
			var check_counts = $( 'input#hide_counts' ).is( ':checked' ) ? 'display: none;' : '';
		
			// Hidden divs
            html += '<input type="hidden" class="title_color" />';
            html += '<input type="hidden" class="title_opacity" />';
            html += '<input type="hidden" class="title_bold" />';
            html += '<input type="hidden" class="container_color" value="#FFFFFF" />';
            html += '<input type="hidden" class="container_opacity" value="1" />';
			html += '<h4>';
				html += '<span class="group_name">' + name + '</span>';
                html += '<span class="group_name_edit"></em></span>';
				html += '<span class="group_rule_count" style="' + check_counts + '"><em>(0 items)</em></span>';
				html += '<i class="material-icons submenu">more_vert</i>';
		
				// Three dot menu
				html += '<div class="dropdown-content">';
					html += '<div class="drag_container drag_handle"><i class="material-icons" title="Drag/Sort">open_with</i> Move</div>';
					html += '<div class="toggle_container"><i class="material-icons expand">file_upload</i> Collapse</div>';
					html += '<div class="edit_container_div"><i class="material-icons edit_container">edit</i> Edit Container</div>';
					html += '<div class="edit_title_div"><i class="material-icons edit">edit</i> Edit Title</div>';
					html += '<div class="sortasc_container"><i class="material-icons">arrow_downward</i> Sort Asc</div>';
					html += '<div class="sortdesc_container"><i class="material-icons">arrow_upward</i> Sort Desc</div>';
					html += '<div class="delete_container"><i class="material-icons delete_group">delete</i> Delete Container</div>';
				html += '</div>';
			html += '</h4>';
		
			// Rule list
			html += '<ul class="rulelist"></ul>';
		html += '</div>';

		// Append container to page
		$( 'div#rules_container' ).prepend( html );
		
		// Clear input field
		$( 'input#new_group_name' ).val( '' );
		
		// Rebuild array
		rebuildArray();
		
		// Initialize sort
		initialize_sort();
	});
	
	// Delete section button
	$( document ).on( 'click', 'div.delete_container', function() {
		
		var this_delete = $( this );
		
		// Confirm deletion
		if( confirm( "Permenantly delete the group?\nAny remaining rules in this group will be moved to the Original Rules group." ) == true ) {
			
			// Check if any rules exist in container
			var check_rules = $( this_delete ).parent().parent().siblings( 'ul' ).children();
			
			// If rules are found
			if( check_rules.length !== 0 ) {
				
				// Copy rules and append to original rules container
				var copy_html = $( this_delete ).parent().parent().siblings( 'ul' ).html();
				$( 'div#original-rules' ).find( 'ul.rulelist' ).append( copy_html );
			}
		
			// Remove container
			$( this_delete ).parent().parent().parent().remove();

			// Rebuild array
			rebuildArray();
		}
	});
	
	// Toggle open/close
	$( document ).on( 'click', 'div.toggle_container', function() {
		
		// Switch material icon from open/close
		if( $( this ).children( 'i' ).text() == 'file_upload' ) {
			
			$( this ).html( '<i class="material-icons expand">file_download</i> Expand' );
		}
		else if( $( this ).children( 'i' ).text() == 'file_download' ) {
			
			$( this ).html( '<i class="material-icons expand">file_upload</i> Collapse' );
		}
		
		// Toggle list
		$( this ).parent().parent().siblings( 'ul' ).toggle();
		
		// Rebuild array
		rebuildArray();
	});
	
	// Copy rule
	$( document ).on( 'click', 'div.copy_rule', function() {
		
		var new_item = $( this ).parent().parent().clone();
		new_item.find( 'div.copy_rule' ).remove();
		new_item.children( 'div.dropdown-content' ).prepend( '<div class="delete_duplicate"><i class="material-icons">delete</i> Delete Rule</div>' );
		$( this ).parent().parent().after( new_item );
		
		// Rebuild array
		rebuildArray();
	});
	
	// View rule
	$( document ).on( 'click', 'div.view_rule', function() {
		
		window.open( $( this ).attr( 'url' ) );
		$( this ).parent().hide();
		return false;
	});
	
	// Delete duplicate rule
	$( document ).on( 'click', 'div.delete_duplicate', function() {
		
		$( this ).parent().parent().remove();
		
		// Rebuild array
		rebuildArray();
	});
	
	
	// Three dot submenu click function
	$( document ).on( 'click', 'i.submenu', function() {
		
		$( 'div.dropdown-content' ).not( $( this ).siblings( 'div.dropdown-content' ) ).hide();
		$( this ).siblings( 'div.dropdown-content' ).toggle();
		$( this ).toggleClass( 'active' );
		
		var css = ! $( this ).siblings( 'div.dropdown-content' ).is( ':visible' ) ? '0deg' : '90deg';
		$( this ).css( 'rotate', css );
	});
	
	// Three dot close if clicking anywhere outside of container
	window.onclick = function(event) {
		if( ! event.target.matches( '.submenu' ) ) {
			
			$( 'div.dropdown-content' ).hide();
			$( 'i.submenu' ).css( 'rotate', '0deg' );
			$( 'i.submenu' ).removeClass( 'active' );
		}
	}
	
	// Sort ascending
	$( document ).on( 'click', 'div.sortasc_container', function() {
		
		// Get list items
		var list = $( this ).parent().parent().siblings( 'ul.rulelist' );
		var items = list.children( 'li' ).get();
		
		// Sort
		items.sort( function( a, b ) {
			
			var a_sort = $( a ).children( 'span.rule_name' ).text().toUpperCase();
			var b_sort = $( b ).children( 'span.rule_name' ).text().toUpperCase();
			
			// Remove special characters
			a_sort = a_sort.replace( /[^\w\s]/gi, '' );
			b_sort = b_sort.replace( /[^\w\s]/gi, '' );
			
			return a_sort.localeCompare( b_sort );
		});
		
		// Append back to list
		$.each( items, function( idx, itm ) { list.append( itm ); });
		
		// Rebuild array
		rebuildArray();
	});
	
	// Sort descending
	$( document ).on( 'click', 'div.sortdesc_container', function() {
		
		// Get list items
		var list = $( this ).parent().parent().siblings( 'ul.rulelist' );
		var items = list.children( 'li' ).get();
		
		// Sort
		items.sort( function( a, b ) {
			
			var b_sort = $( b ).children( 'span.rule_name' ).text().toUpperCase();
			var a_sort = $( a ).children( 'span.rule_name' ).text().toUpperCase();
			
			// Remove special characters
			b_sort = b_sort.replace( /[^\w\s]/gi, '' );
			a_sort = a_sort.replace( /[^\w\s]/gi, '' );
			
			return b_sort.localeCompare( a_sort );
		});
		
		// Append back to list
		$.each( items, function( idx, itm ) { list.append( itm ); });
		
		// Rebuild array
		rebuildArray();
	});
	
	// Toggle options panel
	$( document ).on( 'click', 'span#options_panel', function() {
		
		$( this ).toggleClass( 'active' );
		$( 'div#options_section' ).fadeToggle();
	});
	
	// Export options
	$( 'span#generate_export').click( function() {
		
		// Get options from hidden input
		var options = $( 'input#userArray' ).val();
		
		// Place into textarea
		$( 'textarea#export_textarea' ).val( options );
	});
	
	// Import options
	$( 'span#generate_import' ).click( function() {
		
		// Get import value
		var import_opts = $( 'textarea#import_textarea' ).val();
		if( import_opts == '' ) {
			
			alert( 'Please paste the contents of an export into the import textarea.' );
			return false;
		}
		
		// Check if the import is parsable by json
		var json_check = true;
		try { var json = $.parseJSON( import_opts ); }
		catch( err ) { json_check = false; }
		
		// If hte data is good
		if( json_check ) {
			
			// Copy and paste into hidden input field
			$( 'input#userArray' ).val( import_opts );
		
			// Click "Done" button
			$( 'button#btnDone' ).click();
		}
		// Else the data is no good
		else {
			
			alert( 'There is a problem with the import data. Please ensure the data has been pasted correctly.' );
		}
	});
	
	// Copy export to clipboard
	$( 'span#copy_export' ).click( function() {
		
		// Get export value
		var text = $( 'textarea#export_textarea' ).val();
		
		// Hubitat does not always run over https.  In order for copy to clipboard on http, need js helper
		const textArea = document.createElement( 'textarea' );
		textArea.value = text;
		document.body.appendChild( textArea );
		textArea.focus();
		textArea.select();
		
		// Try to copy to clipboard; alert if unsuccessful
		try {
			
			document.execCommand( 'copy' );
		
			// Change tooltip text
			$( 'span#exportTooltip' ).text( 'Copied Successfully!' );
		} 
		catch (err) {
			
			alert( 'Unable to copy to clipboard' );
		}
		
		// Remove temp textarea
		document.body.removeChild( textArea );
	});
	
	// Copy export change text
	$( 'span#copy_export' ).mouseout( function() {
		
		// Get tooltip element and alter text
		var tooltip = document.getElementById( 'exportTooltip' );
		tooltip.innerHTML = 'Copy to clipboard';
	});
	
	// Global option hide container counts
	$( 'input#hide_counts' ).change( function() {
		
		if( $( this ).is( ':checked' ) ) {
			
			$( 'span.group_rule_count' ).hide();
		}
		else {
			
			$( 'span.group_rule_count' ).show();
		}
		
		// Rebuild array
		rebuildArray();
	});
	
	// If resetting rules; click the "Done" button
	$( 'span#reset_opts' ).click( function() {
		
		if( confirm( "Permanently reset all options? This will restore all default app setting, and save the app.\nThe window will return to the main Apps page." ) == true ) {
			
			// Get default setting
			var get_defaults = $( 'input#load_default_opts' ).val();
			
			// Set defualt setting
			$( 'input#userArray' ).val( get_defaults );
			
			// Click "Done" button
			$( 'button#btnDone' ).click();
		}
	});
	
	// Done function
	$( document ).on( 'click', 'span#done_submit', function() {
		
		// Click "Done" button
		$( 'button#btnDone' ).click();
	});

	// Build new user array
	function rebuildArray() {

		// Define base array
		var rb_array = {};

		// Push global options
		rb_array.hide_counts = $( 'input#hide_counts' ).is( ':checked' ) ? 'true' : 'false';
		rb_array.containers = [];

		// Loop each container
		$( 'div.rule_container' ).each( function() {

			// Create container array and populate
			var title = $( this ).children( 'h4' ).children( 'span.group_name' ).text();
			var this_array = {};
			this_array.name = title;
			this_array.slug = string_to_slug( title );
			this_array.title_color = $( this ).children( 'input.title_color' ).val();
			this_array.title_opacity = $( this ).children( 'input.title_opacity' ).val();
			this_array.title_bold = $( this ).children( 'input.title_bold' ).val();
			this_array.container_color = $( this ).children( 'input.container_color' ).val();
			this_array.container_opacity = $( this ).children( 'input.container_opacity' ).val();
			this_array.visible = $( this ).children( 'ul' ).is( ':visible' );

			// Populate all rules
			this_array.rules = [];
			$( this ).children( 'ul' ).children( 'li' ).each( function(i, v) { this_array.rules.push( v.id ); });

			// Count rules in this container and display on page
			var count = this_array.rules.length;
			var items = count == 1 ? 'item' : 'items';
			$( this ).children( 'h4' ).children( 'span.group_rule_count' ).html( '<em>(' + count + ' ' + items + ')</em>' );

			// Push this container to base array
			rb_array.containers.push( this_array );
		});

		// Populate hidden input with new user array
		$( 'input#userArray' ).val( JSON.stringify( rb_array ) );

		// Adjust list classes on duplicate items
		$( 'div.delete_duplicate' ).each( function() {

			$( this ).parent().parent().addClass( 'duplicate' );
		});
	}

	// Build slugs from friendly names
	function string_to_slug( str ) {

		// Trim string and cast to lowercase
		str = str.replace(/^\s+|\s+$/g, '');
		str = str.toLowerCase();

		// Remove accents, swap ñ for n, etc
		var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
		var to   = "aaaaeeeeiiiioooouuuunc------";
		for (var i=0, l=from.length ; i<l ; i++) {
			str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
		}

		// Remove invalid characters; collapse whitespace and replace with -; collapse dashes
		str = str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

		return str;
	}

	// Sort containers
	function initialize_sort() {

		// Sort main containers
		$( "div#rules_container" ).sortable({
			handle: '.drag_handle',
			opacity: 0.5,
			axis: 'y',
			tolerance: 'pointer',
			change: function(event, ui) {

				ui.placeholder.css({visibility: 'visible', border : '1px solid #1a77c9', height: '80px'});
			},
			stop: function() {

				rebuildArray();
			}
		});

		// Sort container rule sets
		$( ".rulelist" ).sortable({
			connectWith: '.rulelist',
			delay: 150,
			opacity: 0.5,
			change: function(event, ui) {

				ui.placeholder.css({visibility: 'visible', border : '1px solid #1a77c9', height: '40px'});
			},
			stop: function() {

				rebuildArray();
			}
		});
	}

	// Convert hex and alpha values to rgba
	function hexToRGB( hex, alpha ) {

		var r = parseInt( hex.slice( 1, 3 ), 16 ),
			g = parseInt( hex.slice( 3, 5 ), 16 ),
			b = parseInt( hex.slice( 5, 7 ), 16 );

		if (alpha) {
			return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
		} else {
			return "rgb(" + r + ", " + g + ", " + b + ")";
		}
	}
	
	// List items click function
	//$( document ).on( 'click', 'ul.rulelist li', function() {
		
		// Toggle selected class
		//$( this ).toggleClass( 'selected' );
	//});
});




/**
 * Minified by jsDelivr using Terser v3.14.1.
 * Original file: /npm/spectrum-colorpicker@1.8.1/spectrum.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
!function(t){"use strict";"function"==typeof define&&define.amd?define(["jquery"],t):"object"==typeof exports&&"object"==typeof module?module.exports=t(require("jquery")):t(jQuery)}(function(t,e){"use strict";var r={beforeShow:f,move:f,change:f,show:f,hide:f,color:!1,flat:!1,showInput:!1,allowEmpty:!1,showButtons:!0,clickoutFiresChange:!0,showInitial:!1,showPalette:!1,showPaletteOnly:!1,hideAfterPaletteSelect:!1,togglePaletteOnly:!1,showSelectionPalette:!0,localStorageKey:!1,appendTo:"body",maxSelectionSize:7,cancelText:"cancel",chooseText:"choose",togglePaletteMoreText:"more",togglePaletteLessText:"less",clearText:"Clear Color Selection",noColorSelectedText:"No Color Selected",preferredFormat:!1,className:"",containerClassName:"",replacerClassName:"",showAlpha:!1,theme:"sp-light",palette:[["#ffffff","#000000","#ff0000","#ff8000","#ffff00","#008000","#0000ff","#4b0082","#9400d3"]],selectionPalette:[],disabled:!1,offset:null},a=[],n=!!/msie/i.exec(window.navigator.userAgent),i=function(){function t(t,e){return!!~(""+t).indexOf(e)}var e=document.createElement("div").style;return e.cssText="background-color:rgba(0,0,0,.5)",t(e.backgroundColor,"rgba")||t(e.backgroundColor,"hsla")}(),o=["<div class='sp-replacer'>","<div class='sp-preview'><div class='sp-preview-inner'></div></div>","<div class='sp-dd'>&#9660;</div>","</div>"].join(""),s=function(){var t="";if(n)for(var e=1;e<=6;e++)t+="<div class='sp-"+e+"'></div>";return["<div class='sp-container sp-hidden'>","<div class='sp-palette-container'>","<div class='sp-palette sp-thumb sp-cf'></div>","<div class='sp-palette-button-container sp-cf'>","<button type='button' class='sp-palette-toggle'></button>","</div>","</div>","<div class='sp-picker-container'>","<div class='sp-top sp-cf'>","<div class='sp-fill'></div>","<div class='sp-top-inner'>","<div class='sp-color'>","<div class='sp-sat'>","<div class='sp-val'>","<div class='sp-dragger'></div>","</div>","</div>","</div>","<div class='sp-clear sp-clear-display'>","</div>","<div class='sp-hue'>","<div class='sp-slider'></div>",t,"</div>","</div>","<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>","</div>","<div class='sp-input-container sp-cf'>","<input class='sp-input' type='text' spellcheck='false'  />","</div>","<div class='sp-initial sp-thumb sp-cf'></div>","<div class='sp-button-container sp-cf'>","<a class='sp-cancel' href='#'></a>","<button type='button' class='sp-choose'></button>","</div>","</div>","</div>"].join("")}();function l(e,r,a,n){for(var o=[],s=0;s<e.length;s++){var l=e[s];if(l){var c=tinycolor(l),f=c.toHsl().l<.5?"sp-thumb-el sp-thumb-dark":"sp-thumb-el sp-thumb-light";f+=tinycolor.equals(r,l)?" sp-thumb-active":"";var h=c.toString(n.preferredFormat||"rgb"),u=i?"background-color:"+c.toRgbString():"filter:"+c.toFilter();o.push('<span title="'+h+'" data-color="'+c.toRgbString()+'" class="'+f+'"><span class="sp-thumb-inner" style="'+u+';"></span></span>')}else{o.push(t("<div />").append(t('<span data-color="" style="background-color:transparent;" class="sp-clear-display"></span>').attr("title",n.noColorSelectedText)).html())}}return"<div class='sp-cf "+a+"'>"+o.join("")+"</div>"}function c(c,f){var g,b,v,m,y=function(e,a){var n=t.extend({},r,e);return n.callbacks={move:u(n.move,a),change:u(n.change,a),show:u(n.show,a),hide:u(n.hide,a),beforeShow:u(n.beforeShow,a)},n}(f,c),w=y.flat,_=y.showSelectionPalette,x=y.localStorageKey,k=y.theme,S=y.callbacks,C=(g=Kt,b=10,function(){var t=this,e=arguments;v&&clearTimeout(m),!v&&m||(m=setTimeout(function(){m=null,g.apply(t,e)},b))}),P=!1,A=!1,M=0,R=0,H=0,F=0,T=0,O=0,q=0,N=0,j=0,E=0,D=1,I=[],z=[],B={},L=y.selectionPalette.slice(0),K=y.maxSelectionSize,V="sp-dragging",$=null,W=c.ownerDocument,X=(W.body,t(c)),Y=!1,G=t(s,W).addClass(k),Q=G.find(".sp-picker-container"),J=G.find(".sp-color"),U=G.find(".sp-dragger"),Z=G.find(".sp-hue"),tt=G.find(".sp-slider"),et=G.find(".sp-alpha-inner"),rt=G.find(".sp-alpha"),at=G.find(".sp-alpha-handle"),nt=G.find(".sp-input"),it=G.find(".sp-palette"),ot=G.find(".sp-initial"),st=G.find(".sp-cancel"),lt=G.find(".sp-clear"),ct=G.find(".sp-choose"),ft=G.find(".sp-palette-toggle"),ht=X.is("input"),ut=ht&&"color"===X.attr("type")&&p(),dt=ht&&!w,pt=dt?t(o).addClass(k).addClass(y.className).addClass(y.replacerClassName):t([]),gt=dt?pt:X,bt=pt.find(".sp-preview-inner"),vt=y.color||ht&&X.val(),mt=!1,yt=y.preferredFormat,wt=!y.showButtons||y.clickoutFiresChange,_t=!vt,xt=y.allowEmpty&&!ut;function kt(){if(y.showPaletteOnly&&(y.showPalette=!0),ft.text(y.showPaletteOnly?y.togglePaletteMoreText:y.togglePaletteLessText),y.palette){I=y.palette.slice(0),z=t.isArray(I[0])?I:[I],B={};for(var e=0;e<z.length;e++)for(var r=0;r<z[e].length;r++){var a=tinycolor(z[e][r]).toRgbString();B[a]=!0}}G.toggleClass("sp-flat",w),G.toggleClass("sp-input-disabled",!y.showInput),G.toggleClass("sp-alpha-enabled",y.showAlpha),G.toggleClass("sp-clear-enabled",xt),G.toggleClass("sp-buttons-disabled",!y.showButtons),G.toggleClass("sp-palette-buttons-disabled",!y.togglePaletteOnly),G.toggleClass("sp-palette-disabled",!y.showPalette),G.toggleClass("sp-palette-only",y.showPaletteOnly),G.toggleClass("sp-initial-disabled",!y.showInitial),G.addClass(y.className).addClass(y.containerClassName),Kt()}function St(){if(x&&window.localStorage){try{var e=window.localStorage[x].split(",#");e.length>1&&(delete window.localStorage[x],t.each(e,function(t,e){Ct(e)}))}catch(t){}try{L=window.localStorage[x].split(";")}catch(t){}}}function Ct(e){if(_){var r=tinycolor(e).toRgbString();if(!B[r]&&-1===t.inArray(r,L))for(L.push(r);L.length>K;)L.shift();if(x&&window.localStorage)try{window.localStorage[x]=L.join(";")}catch(t){}}}function Pt(){var e=Dt(),r=t.map(z,function(t,r){return l(t,e,"sp-palette-row sp-palette-row-"+r,y)});St(),L&&r.push(l(function(){var t=[];if(y.showPalette)for(var e=0;e<L.length;e++){var r=tinycolor(L[e]).toRgbString();B[r]||t.push(L[e])}return t.reverse().slice(0,y.maxSelectionSize)}(),e,"sp-palette-row sp-palette-row-selection",y)),it.html(r.join(""))}function At(){if(y.showInitial){var t=mt,e=Dt();ot.html(l([t,e],e,"sp-palette-row-initial",y))}}function Mt(){(R<=0||M<=0||F<=0)&&Kt(),A=!0,G.addClass(V),$=null,X.trigger("dragstart.spectrum",[Dt()])}function Rt(){A=!1,G.removeClass(V),X.trigger("dragstop.spectrum",[Dt()])}function Ht(){var t=nt.val();if(null!==t&&""!==t||!xt){var e=tinycolor(t);e.isValid()?(Et(e),It(),Lt()):nt.addClass("sp-validation-error")}else Et(null),It(),Lt()}function Ft(){P?Nt():Tt()}function Tt(){var e=t.Event("beforeShow.spectrum");P?Kt():(X.trigger(e,[Dt()]),!1===S.beforeShow(Dt())||e.isDefaultPrevented()||(!function(){for(var t=0;t<a.length;t++)a[t]&&a[t].hide()}(),P=!0,t(W).on("keydown.spectrum",Ot),t(W).on("click.spectrum",qt),t(window).on("resize.spectrum",C),pt.addClass("sp-active"),G.removeClass("sp-hidden"),Kt(),zt(),mt=Dt(),At(),S.show(mt),X.trigger("show.spectrum",[mt])))}function Ot(t){27===t.keyCode&&Nt()}function qt(t){2!=t.button&&(A||(wt?Lt(!0):jt(),Nt()))}function Nt(){P&&!w&&(P=!1,t(W).off("keydown.spectrum",Ot),t(W).off("click.spectrum",qt),t(window).off("resize.spectrum",C),pt.removeClass("sp-active"),G.addClass("sp-hidden"),S.hide(Dt()),X.trigger("hide.spectrum",[Dt()]))}function jt(){Et(mt,!0),Lt(!0)}function Et(t,e){var r,a;tinycolor.equals(t,Dt())?zt():(!t&&xt?_t=!0:(_t=!1,a=(r=tinycolor(t)).toHsv(),N=a.h%360/360,j=a.s,E=a.v,D=a.a),zt(),r&&r.isValid()&&!e&&(yt=y.preferredFormat||r.getFormat()))}function Dt(t){return t=t||{},xt&&_t?null:tinycolor.fromRatio({h:N,s:j,v:E,a:Math.round(1e3*D)/1e3},{format:t.format||yt})}function It(){zt(),S.move(Dt()),X.trigger("move.spectrum",[Dt()])}function zt(){nt.removeClass("sp-validation-error"),Bt();var t=tinycolor.fromRatio({h:N,s:1,v:1});J.css("background-color",t.toHexString());var e=yt;D<1&&(0!==D||"name"!==e)&&("hex"!==e&&"hex3"!==e&&"hex6"!==e&&"name"!==e||(e="rgb"));var r=Dt({format:e}),a="";if(bt.removeClass("sp-clear-display"),bt.css("background-color","transparent"),!r&&xt)bt.addClass("sp-clear-display");else{var o=r.toHexString(),s=r.toRgbString();if(i||1===r.alpha?bt.css("background-color",s):(bt.css("background-color","transparent"),bt.css("filter",r.toFilter())),y.showAlpha){var l=r.toRgb();l.a=0;var c=tinycolor(l).toRgbString(),f="linear-gradient(left, "+c+", "+o+")";n?et.css("filter",tinycolor(c).toFilter({gradientType:1},o)):(et.css("background","-webkit-"+f),et.css("background","-moz-"+f),et.css("background","-ms-"+f),et.css("background","linear-gradient(to right, "+c+", "+o+")"))}a=r.toString(e)}y.showInput&&nt.val(a),y.showPalette&&Pt(),At()}function Bt(){var t=j,e=E;if(xt&&_t)at.hide(),tt.hide(),U.hide();else{at.show(),tt.show(),U.show();var r=t*M,a=R-e*R;r=Math.max(-H,Math.min(M-H,r-H)),a=Math.max(-H,Math.min(R-H,a-H)),U.css({top:a+"px",left:r+"px"});var n=D*T;at.css({left:n-O/2+"px"});var i=N*F;tt.css({top:i-q+"px"})}}function Lt(t){var e=Dt(),r="",a=!tinycolor.equals(e,mt);e&&(r=e.toString(yt),Ct(e)),ht&&X.val(r),t&&a&&(S.change(e),X.trigger("change",[e]))}function Kt(){var e,r,a,n,i,o,s,l,c,f,h,u;P&&(M=J.width(),R=J.height(),H=U.height(),Z.width(),F=Z.height(),q=tt.height(),T=rt.width(),O=at.width(),w||(G.css("position","absolute"),y.offset?G.offset(y.offset):G.offset((r=gt,a=(e=G).outerWidth(),n=e.outerHeight(),i=r.outerHeight(),o=e[0].ownerDocument,s=o.documentElement,l=s.clientWidth+t(o).scrollLeft(),c=s.clientHeight+t(o).scrollTop(),f=r.offset(),h=f.left,u=f.top,u+=i,h-=Math.min(h,h+a>l&&l>a?Math.abs(h+a-l):0),{top:u-=Math.min(u,u+n>c&&c>n?Math.abs(n+i-0):0),bottom:f.bottom,left:h,right:f.right,width:f.width,height:f.height}))),Bt(),y.showPalette&&Pt(),X.trigger("reflow.spectrum"))}function Vt(){Nt(),Y=!0,X.attr("disabled",!0),gt.addClass("sp-disabled")}!function(){if(n&&G.find("*:not(input)").attr("unselectable","on"),kt(),dt&&X.after(pt).hide(),xt||lt.hide(),w)X.after(G).hide();else{var e="parent"===y.appendTo?X.parent():t(y.appendTo);1!==e.length&&(e=t("body")),e.append(G)}function r(e){return e.data&&e.data.ignore?(Et(t(e.target).closest(".sp-thumb-el").data("color")),It()):(Et(t(e.target).closest(".sp-thumb-el").data("color")),It(),y.hideAfterPaletteSelect?(Lt(!0),Nt()):Lt()),!1}St(),gt.on("click.spectrum touchstart.spectrum",function(e){Y||Ft(),e.stopPropagation(),t(e.target).is("input")||e.preventDefault()}),(X.is(":disabled")||!0===y.disabled)&&Vt(),G.click(h),nt.change(Ht),nt.on("paste",function(){setTimeout(Ht,1)}),nt.keydown(function(t){13==t.keyCode&&Ht()}),st.text(y.cancelText),st.on("click.spectrum",function(t){t.stopPropagation(),t.preventDefault(),jt(),Nt()}),lt.attr("title",y.clearText),lt.on("click.spectrum",function(t){t.stopPropagation(),t.preventDefault(),_t=!0,It(),w&&Lt(!0)}),ct.text(y.chooseText),ct.on("click.spectrum",function(t){t.stopPropagation(),t.preventDefault(),n&&nt.is(":focus")&&nt.trigger("change"),nt.hasClass("sp-validation-error")||(Lt(!0),Nt())}),ft.text(y.showPaletteOnly?y.togglePaletteMoreText:y.togglePaletteLessText),ft.on("click.spectrum",function(t){t.stopPropagation(),t.preventDefault(),y.showPaletteOnly=!y.showPaletteOnly,y.showPaletteOnly||w||G.css("left","-="+(Q.outerWidth(!0)+5)),kt()}),d(rt,function(t,e,r){D=t/T,_t=!1,r.shiftKey&&(D=Math.round(10*D)/10),It()},Mt,Rt),d(Z,function(t,e){N=parseFloat(e/F),_t=!1,y.showAlpha||(D=1),It()},Mt,Rt),d(J,function(t,e,r){if(r.shiftKey){if(!$){var a=j*M,n=R-E*R,i=Math.abs(t-a)>Math.abs(e-n);$=i?"x":"y"}}else $=null;var o=!$||"y"===$;(!$||"x"===$)&&(j=parseFloat(t/M)),o&&(E=parseFloat((R-e)/R)),_t=!1,y.showAlpha||(D=1),It()},Mt,Rt),vt?(Et(vt),zt(),yt=y.preferredFormat||tinycolor(vt).format,Ct(vt)):zt(),w&&Tt();var a=n?"mousedown.spectrum":"click.spectrum touchstart.spectrum";it.on(a,".sp-thumb-el",r),ot.on(a,".sp-thumb-el:nth-child(1)",{ignore:!0},r)}();var $t={show:Tt,hide:Nt,toggle:Ft,reflow:Kt,option:function(r,a){return r===e?t.extend({},y):a===e?y[r]:(y[r]=a,"preferredFormat"===r&&(yt=y.preferredFormat),void kt())},enable:function(){Y=!1,X.attr("disabled",!1),gt.removeClass("sp-disabled")},disable:Vt,offset:function(t){y.offset=t,Kt()},set:function(t){Et(t),Lt()},get:Dt,destroy:function(){X.show(),gt.off("click.spectrum touchstart.spectrum"),G.remove(),pt.remove(),a[$t.id]=null},container:G};return $t.id=a.push($t)-1,$t}function f(){}function h(t){t.stopPropagation()}function u(t,e){var r=Array.prototype.slice,a=r.call(arguments,2);return function(){return t.apply(e,a.concat(r.call(arguments)))}}function d(e,r,a,i){r=r||function(){},a=a||function(){},i=i||function(){};var o=document,s=!1,l={},c=0,f=0,h="ontouchstart"in window,u={};function d(t){t.stopPropagation&&t.stopPropagation(),t.preventDefault&&t.preventDefault(),t.returnValue=!1}function p(t){if(s){if(n&&o.documentMode<9&&!t.button)return g();var a=t.originalEvent&&t.originalEvent.touches&&t.originalEvent.touches[0],i=a&&a.pageX||t.pageX,u=a&&a.pageY||t.pageY,p=Math.max(0,Math.min(i-l.left,f)),b=Math.max(0,Math.min(u-l.top,c));h&&d(t),r.apply(e,[p,b,t])}}function g(){s&&(t(o).off(u),t(o.body).removeClass("sp-dragging"),setTimeout(function(){i.apply(e,arguments)},0)),s=!1}u.selectstart=d,u.dragstart=d,u["touchmove mousemove"]=p,u["touchend mouseup"]=g,t(e).on("touchstart mousedown",function(r){(r.which?3==r.which:2==r.button)||s||!1!==a.apply(e,arguments)&&(s=!0,c=t(e).height(),f=t(e).width(),l=t(e).offset(),t(o).on(u),t(o.body).addClass("sp-dragging"),p(r),d(r))})}function p(){return t.fn.spectrum.inputTypeColorSupport()}t.fn.spectrum=function(e,r){if("string"==typeof e){var n=this,i=Array.prototype.slice.call(arguments,1);return this.each(function(){var r=a[t(this).data("spectrum.id")];if(r){var o=r[e];if(!o)throw new Error("Spectrum: no such method: '"+e+"'");"get"==e?n=r.get():"container"==e?n=r.container:"option"==e?n=r.option.apply(r,i):"destroy"==e?(r.destroy(),t(this).removeData("spectrum.id")):o.apply(r,i)}}),n}return this.spectrum("destroy").each(function(){var r=c(this,t.extend({},t(this).data(),e));t(this).data("spectrum.id",r.id)})},t.fn.spectrum.load=!0,t.fn.spectrum.loadOpts={},t.fn.spectrum.draggable=d,t.fn.spectrum.defaults=r,t.fn.spectrum.inputTypeColorSupport=function e(){if(void 0===e._cachedResult){var r=t("<input type='color'/>")[0];e._cachedResult="color"===r.type&&""!==r.value}return e._cachedResult},t.spectrum={},t.spectrum.localization={},t.spectrum.palettes={},t.fn.spectrum.processNativeColorInputs=function(){var e=t("input[type=color]");e.length&&!p()&&e.spectrum({preferredFormat:"hex6"})},function(){var t=/^[\s,#]+/,e=/\s+$/,r=0,a=Math,n=a.round,i=a.min,o=a.max,s=a.random,l=function(s,c){if(c=c||{},(s=s||"")instanceof l)return s;if(!(this instanceof l))return new l(s,c);var f=function(r){var n={r:0,g:0,b:0},s=1,l=!1,c=!1;"string"==typeof r&&(r=function(r){r=r.replace(t,"").replace(e,"").toLowerCase();var a,n=!1;if(P[r])r=P[r],n=!0;else if("transparent"==r)return{r:0,g:0,b:0,a:0,format:"name"};if(a=E.rgb.exec(r))return{r:a[1],g:a[2],b:a[3]};if(a=E.rgba.exec(r))return{r:a[1],g:a[2],b:a[3],a:a[4]};if(a=E.hsl.exec(r))return{h:a[1],s:a[2],l:a[3]};if(a=E.hsla.exec(r))return{h:a[1],s:a[2],l:a[3],a:a[4]};if(a=E.hsv.exec(r))return{h:a[1],s:a[2],v:a[3]};if(a=E.hsva.exec(r))return{h:a[1],s:a[2],v:a[3],a:a[4]};if(a=E.hex8.exec(r))return{a:(i=a[1],F(i)/255),r:F(a[2]),g:F(a[3]),b:F(a[4]),format:n?"name":"hex8"};var i;if(a=E.hex6.exec(r))return{r:F(a[1]),g:F(a[2]),b:F(a[3]),format:n?"name":"hex"};if(a=E.hex3.exec(r))return{r:F(a[1]+""+a[1]),g:F(a[2]+""+a[2]),b:F(a[3]+""+a[3]),format:n?"name":"hex"};return!1}(r));"object"==typeof r&&(r.hasOwnProperty("r")&&r.hasOwnProperty("g")&&r.hasOwnProperty("b")?(f=r.r,h=r.g,u=r.b,n={r:255*R(f,255),g:255*R(h,255),b:255*R(u,255)},l=!0,c="%"===String(r.r).substr(-1)?"prgb":"rgb"):r.hasOwnProperty("h")&&r.hasOwnProperty("s")&&r.hasOwnProperty("v")?(r.s=O(r.s),r.v=O(r.v),n=function(t,e,r){t=6*R(t,360),e=R(e,100),r=R(r,100);var n=a.floor(t),i=t-n,o=r*(1-e),s=r*(1-i*e),l=r*(1-(1-i)*e),c=n%6;return{r:255*[r,s,o,o,l,r][c],g:255*[l,r,r,s,o,o][c],b:255*[o,o,l,r,r,s][c]}}(r.h,r.s,r.v),l=!0,c="hsv"):r.hasOwnProperty("h")&&r.hasOwnProperty("s")&&r.hasOwnProperty("l")&&(r.s=O(r.s),r.l=O(r.l),n=function(t,e,r){var a,n,i;function o(t,e,r){return r<0&&(r+=1),r>1&&(r-=1),r<1/6?t+6*(e-t)*r:r<.5?e:r<2/3?t+(e-t)*(2/3-r)*6:t}if(t=R(t,360),e=R(e,100),r=R(r,100),0===e)a=n=i=r;else{var s=r<.5?r*(1+e):r+e-r*e,l=2*r-s;a=o(l,s,t+1/3),n=o(l,s,t),i=o(l,s,t-1/3)}return{r:255*a,g:255*n,b:255*i}}(r.h,r.s,r.l),l=!0,c="hsl"),r.hasOwnProperty("a")&&(s=r.a));var f,h,u;return s=M(s),{ok:l,format:r.format||c,r:i(255,o(n.r,0)),g:i(255,o(n.g,0)),b:i(255,o(n.b,0)),a:s}}(s);this._originalInput=s,this._r=f.r,this._g=f.g,this._b=f.b,this._a=f.a,this._roundA=n(1e3*this._a)/1e3,this._format=c.format||f.format,this._gradientType=c.gradientType,this._r<1&&(this._r=n(this._r)),this._g<1&&(this._g=n(this._g)),this._b<1&&(this._b=n(this._b)),this._ok=f.ok,this._tc_id=r++};function c(t,e,r){t=R(t,255),e=R(e,255),r=R(r,255);var a,n,s=o(t,e,r),l=i(t,e,r),c=(s+l)/2;if(s==l)a=n=0;else{var f=s-l;switch(n=c>.5?f/(2-s-l):f/(s+l),s){case t:a=(e-r)/f+(e<r?6:0);break;case e:a=(r-t)/f+2;break;case r:a=(t-e)/f+4}a/=6}return{h:a,s:n,l:c}}function f(t,e,r){t=R(t,255),e=R(e,255),r=R(r,255);var a,n,s=o(t,e,r),l=i(t,e,r),c=s,f=s-l;if(n=0===s?0:f/s,s==l)a=0;else{switch(s){case t:a=(e-r)/f+(e<r?6:0);break;case e:a=(r-t)/f+2;break;case r:a=(t-e)/f+4}a/=6}return{h:a,s:n,v:c}}function h(t,e,r,a){var i=[T(n(t).toString(16)),T(n(e).toString(16)),T(n(r).toString(16))];return a&&i[0].charAt(0)==i[0].charAt(1)&&i[1].charAt(0)==i[1].charAt(1)&&i[2].charAt(0)==i[2].charAt(1)?i[0].charAt(0)+i[1].charAt(0)+i[2].charAt(0):i.join("")}function u(t,e,r,a){var i;return[T((i=a,Math.round(255*parseFloat(i)).toString(16))),T(n(t).toString(16)),T(n(e).toString(16)),T(n(r).toString(16))].join("")}function d(t,e){e=0===e?0:e||10;var r=l(t).toHsl();return r.s-=e/100,r.s=H(r.s),l(r)}function p(t,e){e=0===e?0:e||10;var r=l(t).toHsl();return r.s+=e/100,r.s=H(r.s),l(r)}function g(t){return l(t).desaturate(100)}function b(t,e){e=0===e?0:e||10;var r=l(t).toHsl();return r.l+=e/100,r.l=H(r.l),l(r)}function v(t,e){e=0===e?0:e||10;var r=l(t).toRgb();return r.r=o(0,i(255,r.r-n(-e/100*255))),r.g=o(0,i(255,r.g-n(-e/100*255))),r.b=o(0,i(255,r.b-n(-e/100*255))),l(r)}function m(t,e){e=0===e?0:e||10;var r=l(t).toHsl();return r.l-=e/100,r.l=H(r.l),l(r)}function y(t,e){var r=l(t).toHsl(),a=(n(r.h)+e)%360;return r.h=a<0?360+a:a,l(r)}function w(t){var e=l(t).toHsl();return e.h=(e.h+180)%360,l(e)}function _(t){var e=l(t).toHsl(),r=e.h;return[l(t),l({h:(r+120)%360,s:e.s,l:e.l}),l({h:(r+240)%360,s:e.s,l:e.l})]}function x(t){var e=l(t).toHsl(),r=e.h;return[l(t),l({h:(r+90)%360,s:e.s,l:e.l}),l({h:(r+180)%360,s:e.s,l:e.l}),l({h:(r+270)%360,s:e.s,l:e.l})]}function k(t){var e=l(t).toHsl(),r=e.h;return[l(t),l({h:(r+72)%360,s:e.s,l:e.l}),l({h:(r+216)%360,s:e.s,l:e.l})]}function S(t,e,r){e=e||6,r=r||30;var a=l(t).toHsl(),n=360/r,i=[l(t)];for(a.h=(a.h-(n*e>>1)+720)%360;--e;)a.h=(a.h+n)%360,i.push(l(a));return i}function C(t,e){e=e||6;for(var r=l(t).toHsv(),a=r.h,n=r.s,i=r.v,o=[],s=1/e;e--;)o.push(l({h:a,s:n,v:i})),i=(i+s)%1;return o}l.prototype={isDark:function(){return this.getBrightness()<128},isLight:function(){return!this.isDark()},isValid:function(){return this._ok},getOriginalInput:function(){return this._originalInput},getFormat:function(){return this._format},getAlpha:function(){return this._a},getBrightness:function(){var t=this.toRgb();return(299*t.r+587*t.g+114*t.b)/1e3},setAlpha:function(t){return this._a=M(t),this._roundA=n(1e3*this._a)/1e3,this},toHsv:function(){var t=f(this._r,this._g,this._b);return{h:360*t.h,s:t.s,v:t.v,a:this._a}},toHsvString:function(){var t=f(this._r,this._g,this._b),e=n(360*t.h),r=n(100*t.s),a=n(100*t.v);return 1==this._a?"hsv("+e+", "+r+"%, "+a+"%)":"hsva("+e+", "+r+"%, "+a+"%, "+this._roundA+")"},toHsl:function(){var t=c(this._r,this._g,this._b);return{h:360*t.h,s:t.s,l:t.l,a:this._a}},toHslString:function(){var t=c(this._r,this._g,this._b),e=n(360*t.h),r=n(100*t.s),a=n(100*t.l);return 1==this._a?"hsl("+e+", "+r+"%, "+a+"%)":"hsla("+e+", "+r+"%, "+a+"%, "+this._roundA+")"},toHex:function(t){return h(this._r,this._g,this._b,t)},toHexString:function(t){return"#"+this.toHex(t)},toHex8:function(){return u(this._r,this._g,this._b,this._a)},toHex8String:function(){return"#"+this.toHex8()},toRgb:function(){return{r:n(this._r),g:n(this._g),b:n(this._b),a:this._a}},toRgbString:function(){return 1==this._a?"rgb("+n(this._r)+", "+n(this._g)+", "+n(this._b)+")":"rgba("+n(this._r)+", "+n(this._g)+", "+n(this._b)+", "+this._roundA+")"},toPercentageRgb:function(){return{r:n(100*R(this._r,255))+"%",g:n(100*R(this._g,255))+"%",b:n(100*R(this._b,255))+"%",a:this._a}},toPercentageRgbString:function(){return 1==this._a?"rgb("+n(100*R(this._r,255))+"%, "+n(100*R(this._g,255))+"%, "+n(100*R(this._b,255))+"%)":"rgba("+n(100*R(this._r,255))+"%, "+n(100*R(this._g,255))+"%, "+n(100*R(this._b,255))+"%, "+this._roundA+")"},toName:function(){return 0===this._a?"transparent":!(this._a<1)&&(A[h(this._r,this._g,this._b,!0)]||!1)},toFilter:function(t){var e="#"+u(this._r,this._g,this._b,this._a),r=e,a=this._gradientType?"GradientType = 1, ":"";t&&(r=l(t).toHex8String());return"progid:DXImageTransform.Microsoft.gradient("+a+"startColorstr="+e+",endColorstr="+r+")"},toString:function(t){var e=!!t;t=t||this._format;var r=!1,a=this._a<1&&this._a>=0;return e||!a||"hex"!==t&&"hex6"!==t&&"hex3"!==t&&"name"!==t?("rgb"===t&&(r=this.toRgbString()),"prgb"===t&&(r=this.toPercentageRgbString()),"hex"!==t&&"hex6"!==t||(r=this.toHexString()),"hex3"===t&&(r=this.toHexString(!0)),"hex8"===t&&(r=this.toHex8String()),"name"===t&&(r=this.toName()),"hsl"===t&&(r=this.toHslString()),"hsv"===t&&(r=this.toHsvString()),r||this.toHexString()):"name"===t&&0===this._a?this.toName():this.toRgbString()},_applyModification:function(t,e){var r=t.apply(null,[this].concat([].slice.call(e)));return this._r=r._r,this._g=r._g,this._b=r._b,this.setAlpha(r._a),this},lighten:function(){return this._applyModification(b,arguments)},brighten:function(){return this._applyModification(v,arguments)},darken:function(){return this._applyModification(m,arguments)},desaturate:function(){return this._applyModification(d,arguments)},saturate:function(){return this._applyModification(p,arguments)},greyscale:function(){return this._applyModification(g,arguments)},spin:function(){return this._applyModification(y,arguments)},_applyCombination:function(t,e){return t.apply(null,[this].concat([].slice.call(e)))},analogous:function(){return this._applyCombination(S,arguments)},complement:function(){return this._applyCombination(w,arguments)},monochromatic:function(){return this._applyCombination(C,arguments)},splitcomplement:function(){return this._applyCombination(k,arguments)},triad:function(){return this._applyCombination(_,arguments)},tetrad:function(){return this._applyCombination(x,arguments)}},l.fromRatio=function(t,e){if("object"==typeof t){var r={};for(var a in t)t.hasOwnProperty(a)&&(r[a]="a"===a?t[a]:O(t[a]));t=r}return l(t,e)},l.equals=function(t,e){return!(!t||!e)&&l(t).toRgbString()==l(e).toRgbString()},l.random=function(){return l.fromRatio({r:s(),g:s(),b:s()})},l.mix=function(t,e,r){r=0===r?0:r||50;var a,n=l(t).toRgb(),i=l(e).toRgb(),o=r/100,s=2*o-1,c=i.a-n.a,f=1-(a=((a=s*c==-1?s:(s+c)/(1+s*c))+1)/2),h={r:i.r*a+n.r*f,g:i.g*a+n.g*f,b:i.b*a+n.b*f,a:i.a*o+n.a*(1-o)};return l(h)},l.readability=function(t,e){var r=l(t),a=l(e),n=r.toRgb(),i=a.toRgb(),o=r.getBrightness(),s=a.getBrightness(),c=Math.max(n.r,i.r)-Math.min(n.r,i.r)+Math.max(n.g,i.g)-Math.min(n.g,i.g)+Math.max(n.b,i.b)-Math.min(n.b,i.b);return{brightness:Math.abs(o-s),color:c}},l.isReadable=function(t,e){var r=l.readability(t,e);return r.brightness>125&&r.color>500},l.mostReadable=function(t,e){for(var r=null,a=0,n=!1,i=0;i<e.length;i++){var o=l.readability(t,e[i]),s=o.brightness>125&&o.color>500,c=o.brightness/125*3+o.color/500;(s&&!n||s&&n&&c>a||!s&&!n&&c>a)&&(n=s,a=c,r=l(e[i]))}return r};var P=l.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",rebeccapurple:"663399",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"},A=l.hexNames=function(t){var e={};for(var r in t)t.hasOwnProperty(r)&&(e[t[r]]=r);return e}(P);function M(t){return t=parseFloat(t),(isNaN(t)||t<0||t>1)&&(t=1),t}function R(t,e){(function(t){return"string"==typeof t&&-1!=t.indexOf(".")&&1===parseFloat(t)})(t)&&(t="100%");var r=function(t){return"string"==typeof t&&-1!=t.indexOf("%")}(t);return t=i(e,o(0,parseFloat(t))),r&&(t=parseInt(t*e,10)/100),a.abs(t-e)<1e-6?1:t%e/parseFloat(e)}function H(t){return i(1,o(0,t))}function F(t){return parseInt(t,16)}function T(t){return 1==t.length?"0"+t:""+t}function O(t){return t<=1&&(t=100*t+"%"),t}var q,N,j,E=(N="[\\s|\\(]+("+(q="(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)")+")[,|\\s]+("+q+")[,|\\s]+("+q+")\\s*\\)?",j="[\\s|\\(]+("+q+")[,|\\s]+("+q+")[,|\\s]+("+q+")[,|\\s]+("+q+")\\s*\\)?",{rgb:new RegExp("rgb"+N),rgba:new RegExp("rgba"+j),hsl:new RegExp("hsl"+N),hsla:new RegExp("hsla"+j),hsv:new RegExp("hsv"+N),hsva:new RegExp("hsva"+j),hex3:/^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex8:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/});window.tinycolor=l}(),t(function(){t.fn.spectrum.load&&t.fn.spectrum.processNativeColorInputs()})});
//# sourceMappingURL=/sm/8125124b086b7447ec93b2ff02f835d5d9ff4944574b812f98a120d20d4202be.map