/*
* Version 1.0.0 - Initial release
* Version 1.0.1 - Sorting fixes and updates. Logic for new rules and deleted rules. 
*/
jQuery( document ).ready( function( $ ) {

	// Initial rulelist sortable
	initialize_sort();

	// Set initial input on page load
	rebuildArray();
	
	// Edit title button
	$( document ).on( 'click', 'i.edit', function() {
		
		// Get original value
		var orig_value = $( this ).siblings( 'span.group_name' ).text();
		var check_nodes = $( this ).siblings( 'span.group_name' ).html();
		
		// If we are already editing, don't edit again
		if( $( check_nodes ).length > 0 ) { return false; }
		
		// Create submit/cancel buttons and replace html
		var edit_input = '<input type="text" class="edit_title_input" value="' + orig_value + '" />';
		$( this ).siblings( 'span.group_name' ).html( edit_input );
		
		var edit_actions = '<span class="button submit_edit">Submit</span>';
		edit_actions += '<span class="button cancel_edit">Cancel</span>';
		edit_actions += '<input type="text" class="color_picker" />';
		edit_actions += '<span class="button title_bold"><i class="material-icons">format_bold</i></button>';
		$( this ).siblings( 'span.group_name_edit' ).html( edit_actions );
		
		// Check for current title color
		var title_color = $( this ).parent().siblings( 'input.title_color' ).val();
		var set_color = title_color === '' ? '#000' : title_color;
		
		// Check for current title bold
		var title_bold = $( this ).parent().siblings( 'input.title_bold' ).val();
		if( title_bold == 'true' ) {
			$( this ).siblings( 'span.group_name_edit' ).children( 'span.title_bold' ).addClass( 'active' );
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
            html += '<input type="hidden" class="title_color" />'
            html += '<input type="hidden" class="title_bold" />'
			html += '<h4>';
				html += '<span class="group_name">' + name + '</span>';
                html += '<span class="group_name_edit"></em></span>';
				html += '<span class="group_rule_count"><em>(0 items)</em></span>';
				html += '<i class="material-icons delete_group" title="Delete Group">delete</i>';
				html += '<i class="material-icons expand" title="Toggle Open/Close">file_upload</i>';
				html += '<i class="material-icons drag_handle" title="Drag/Sort">reorder</i>'
				html += '<i class="material-icons edit" title="Edit Title">edit</i>'
			html += '</h4>';
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
	$( document ).on( 'click', 'i.delete_group', function() {
		
		var this_delete = $( this );
		
		// Confirm deletion
		if( confirm( "Permenantly delete the group?\nAny remaining rules in this group will be moved to the Original Rules group." ) == true ) {
			
			// Check if any rules exist in container
			var check_rules = $( this_delete ).parent().siblings( 'ul' ).children();
			
			// If rules are found
			if( check_rules.length !== 0 ) {
				
				// Copy rules and append to original rules container
				var copy_html = $( this_delete ).parent().siblings( 'ul' ).html();
				$( 'div#original-rules' ).find( 'ul.rulelist' ).append( copy_html );
			}
		
			// Remove container
			$( this_delete ).parent().parent().remove();

			// Rebuild array
			rebuildArray();
		}
	});
	
	// Toggle open/close
	$( document ).on( 'click', 'i.expand', function() {
		
		// Switch material icon from open/close
		if( $( this ).text() == 'file_upload' ) {
			$( this ).text( 'file_download' );
		}
		else if( $( this ).text() == 'file_download' ) {
			$( this ).text( 'file_upload' );
		}
		
		// Toggle list
		$( this ).parent().siblings( 'ul' ).toggle();
		
		// Rebuild array
		rebuildArray();
	});
	
	// Copy rule
	$( document ).on( 'click', 'i.copy_rule', function() {
		
		var new_item = $( this ).parent().clone();
		new_item.find( 'i.copy_rule' ).remove();
		new_item.append( '<i class="material-icons delete_duplicate" title="Delete Duplicate Rule">delete</i>' );
		$( this ).parent().after( new_item );
		
		// Rebuild array
		rebuildArray();
	});
	
	// Delete duplicate rule
	$( document ).on( 'click', 'i.delete_duplicate', function() {
		
		$( this ).parent().remove();
		
		// Rebuild array
		rebuildArray();
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
	var rb_array = [];
	
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
		rb_array.push( this_array );
	});
	
	// Populate hidden input with new user array
	$( 'input#userArray' ).val( JSON.stringify( rb_array ) );
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
		//containment: "parent",
		opacity: 0.5,
		axis: 'y',
		tolerance: 'pointer',
		change: function(event, ui) {
			
			ui.placeholder.css({visibility: 'visible', border : '1px solid yellow', height: '80px'});
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
			
			ui.placeholder.css({visibility: 'visible', border : '1px solid yellow', height: '40px'});
		},
		stop: function() {
			
			rebuildArray();
		}
	});
}
