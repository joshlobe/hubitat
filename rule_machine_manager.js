jQuery( document ).ready( function( $) {

	// Initial rulelist sortable
	initialize_sort();

	// Set initial input on page load
	rebuildArray();
	
	// Edit title button
	$( document ).on( 'click', 'i.edit', function() {
		
		// Get original value
		var orig_value = $( this ).siblings( 'span.group_name' ).text();
		
		// Create submit/cancel buttons and replace html
		var edit_input = '<input type="text" class="edit_title_input" value="' + orig_value + '" /> <span class="button submit_edit">Submit</span> <span class="button cancel_edit">Cancel</span>';
		$( this ).siblings( 'span.group_name' ).html( edit_input );
	});
	
	// Cancel edit title button
	$( document ).on( 'click', 'span.cancel_edit', function() {
		
		// Get original value
		var orig_value = $( this ).siblings( 'input.edit_title_input' ).val();
		
		// Replace title with original value
		$( this ).parent().html( orig_value );
		rebuildArray();
	});
	
	// Submit edit title button
	$( document ).on( 'click', 'span.submit_edit', function() {
		
		// Get new value
		var new_value = $( this ).siblings( 'input.edit_title_input' ).val();
		
		// Replace title with new value
		$( this ).parent().html( new_value );
		
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
			html += '<h4>';
				html += '<span class="group_name">' + name + '</span>';
				html += '<span class="group_rule_count"><em>(0 items)</em></span>';
				html += '<i class="material-icons delete_group" title="Delete Group">delete</i>';
				html += '<i class="material-icons expand" title="Toggle Open/Close">file_upload</i>';
				html += '<i class="material-icons drag_handle" title="Drag/Sort">reorder</i>'
				html += '<i class="material-icons edit" title="Edit Title">edit</i>'
			html += '</h4>';
			html += '<ul class="rulelist"></ul>';
		html += '</div>';

		// Append container to page
		$( 'div#rules_container' ).append( html );
		
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
		
				// Remove container
				$( this_delete ).parent().parent().remove();
				
				// Rebuild array
				rebuildArray();
			}
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
		this_array.visible = $( this ).children( 'ul' ).is( ':visible' );
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
		containment: "parent",
		stop: function() {
			
			rebuildArray();
		}
	});
	
	// Sort container rule sets
	$( ".rulelist" ).sortable({
		connectWith: '.rulelist',
		stop: function() {
			
			rebuildArray();
		}
	});
}