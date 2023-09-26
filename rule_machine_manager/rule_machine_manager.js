/*
* Version 1.0.2
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
		var check_nodes = $( this ).parent().siblings( 'span.group_name' ).html();
		
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
		
		// Check for current title bold
		var title_bold = $( this ).parent().parent().siblings( 'input.title_bold' ).val();
		if( title_bold == 'true' ) {
			$( this ).parent().siblings( 'span.group_name_edit' ).children( 'span.title_bold' ).addClass( 'active' );
		}
	
		// Set color picker
		$(".color_picker").spectrum({
			color: set_color,
			change: function( color ) {
				
				// Populate hidden input field for later consumption
				$( this ).parent().parent().siblings( 'input.title_color' ).val( color.toHexString() );
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
	
	// Submit edit title button
	$( document ).on( 'click', 'span.submit_edit', function() {
		
		// Get new title value
		var new_value = $( this ).parent().siblings( 'span.group_name' ).children( 'input.edit_title_input' ).val();
		
		// Get title color
		var title_color = $( this ).parent().parent().siblings( 'input.title_color' ).val();
		
		// Get title bold
		var title_bold = $( this ).parent().parent().siblings( 'input.title_bold' ).val();
		var font_weight = title_bold == 'true' ? 'bold' : 'normal';
		
		// Replace title with new value
		$( this ).parent().siblings( 'span.group_name' ).html( new_value ).css({ 'color': title_color, 'font-weight': font_weight });
		
		// Clear edit area
		$( this ).parent().html( '' );
		
		// Rebuild array
		rebuildArray();
	});

	// Create section button
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
            html += '<input type="hidden" class="title_color" />'
            html += '<input type="hidden" class="title_bold" />'
			html += '<h4>';
				html += '<span class="group_name">' + name + '</span>';
                html += '<span class="group_name_edit"></em></span>';
				html += '<span class="group_rule_count" style="' + check_counts + '"><em>(0 items)</em></span>';
				html += '<i class="material-icons submenu">more_vert</i>';
		
				// Three dot menu
				html += '<div class="dropdown-content">';
					html += '<div class="edit_title_div"><i class="material-icons edit">edit</i> Edit Title</div>';
					html += '<div class="toggle_container"><i class="material-icons expand">file_upload</i> Collapse</div>';
					html += '<div class="sortasc_container"><i class="material-icons">arrow_downward</i> Sort Asc</div>';
					html += '<div class="sortdesc_container"><i class="material-icons">arrow_upward</i> Sort Desc</div>';
					html += '<div class="drag_container drag_handle"><i class="material-icons" title="Drag/Sort">open_with</i> Move</div>';
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
	
	// List items click function
	//$( document ).on( 'click', 'ul.rulelist li', function() {
		
		// Toggle selected class
		//$( this ).toggleClass( 'selected' );
	//});
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
		this_array.title_bold = $( this ).children( 'input.title_bold' ).val();
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