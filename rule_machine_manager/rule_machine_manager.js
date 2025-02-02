/*
* Version 3.0
*/

jQuery( document ).ready( function( $ ) {
	
	/*********************************************************
	Initial Page Stuff
	*********************************************************/

	// Initial rulelist sortable
	initialize_sort();
	initialize_multisort();

	// Rebuild array on page load (if not updating settings)
	if( ! $( 'div.preventRebuildArray' ).length ) { rebuildArray(); }
	
	/*********************************************************
	Quick Save Options
	*********************************************************/
	$( 'span#quick_save' ).click( function() {
		
		var thisSave = $( this );
		
		// Get variables from page
		var accessToken = $( 'input#accessToken' ).val();
		var appID = $( 'input#appID' ).val();
		var appState = $( 'input#appState' ).val();
		var userOpts = $( 'input#userArray' ).val();
		
		// Check if app has been installed first
		if( appState == 'INCOMPLETE' ) {
			
			// Alert user to first save the app
			Swal.fire({
				titleText: "App Not Installed",
				html: "<p>To use this feature; the app must first be installed. Please close this window, and click \"Done\" to save the app.</p>",
				icon: "warning",
				iconColor: "#81bc00",
				confirmButtonColor: "#81bc00",
				allowOutsideClick: false,
				allowEscapeKey: false,
				customClass: { popup: "headerSuccess", htmlContainer: "alignLeft" }
			});
			
			return false;
		}
		
		// If app is installed but an access token was not generated
		if( appState == 'COMPLETE' && ( ! accessToken || accessToken == 'null' ) ) {
			
			// Alert user on how to enable oauth for the app
			Swal.fire({
				titleText: "Authentication Required",
				html: "<p>To use this feature; oAuth must be enabled for this application.<p><p><strong>To enable oAuth:</strong><ul><li>Navigate To Apps Code -> Rule Machine Manager</li><li>Click the three dots at the top-right corner of the screen</li><li>Select oAuth</li><li>Click \"Enable oAuth in App\"</li><li>Click the \"Update\ button.</li><li>Navigate back to Rule Machine Manager and click the \"Done\" button.</ul></p><p>Finally, reload this page and the feature will become available.</p><p>Learn more about <a href='https://docs2.hubitat.com/en/user-interface/developer/apps-code' target='_blank'>oAuth with Hubitat Applications</a></p><p><strong>NOTE:</strong> If this message keeps displaying even though oAuth has been enabled; please click the \"Done\" button on the Rule Machine Manager page.</p>",
				icon: "warning",
				iconColor: "#81bc00",
				confirmButtonColor: "#81bc00",
				allowOutsideClick: false,
				allowEscapeKey: false,
				customClass: { popup: "headerSuccess", htmlContainer: "alignLeft" }
			});
			
			return false;
		}
		
		// Change icon to loader
		$( this ).html( '<i class="material-icons spin">autorenew</i>' );
		
		// Fire endpoint request with page settings array
		$.ajax({
			url: "/apps/api/" + appID + "/updateSettings?access_token=" + accessToken,
			method: "POST",
			headers: { 
				"Access-Control-Allow-Origin": "*", 
				"Authorization": "Bearer " + accessToken, 
			},
			data: { 'userOpts': userOpts },
			success: function( response ) {
				
				// Options were updated successfully
				if( response.status == 'success' ) {
					
					// Remove any page notices
					$( 'div.page_notice' ).slideToggle();
					
					// Define toast
					const Toast = Swal.mixin({
						toast: true,
						position: "top-end",
						showConfirmButton: false,
						timer: 3000,
						timerProgressBar: true,
						didOpen: (toast) => {
							toast.onmouseenter = Swal.stopTimer;
							toast.onmouseleave = Swal.resumeTimer;
						}
					});
					Toast.fire({
						icon: "success",
						iconColor: "#81bc00",
						title: "Options Saved Successfully"
					});
				}
			},
			error: function( xhr, textStatus, error ) {
				
				// Error updating options
				Swal.fire({
					titleText: "GET Request Error",
					html: "<p>An error was encountered while attempting the GET request.<p><p>XHR Status Text: " + xhr.statusText + "<br />Text Status: " + textStatus + "<br />Error: " + error,
					icon: "warning",
					iconColor: "#d33",
					confirmButtonColor: "#81bc00",
					allowOutsideClick: false,
					allowEscapeKey: false,
					customClass: { popup: "headerError", htmlContainer: "alignLeft" }
				});
			},
			complete: function() {
				
				// Redisplay icon
				$( thisSave ).html( '<i class="material-icons">rocket</i><span class="tooltiptext">Quick Save</span>' );
			}
		});
	});
	
	/*********************************************************
	Containers: Create, Edit and Delete
	*********************************************************/

	// Create container button
	$( "span#create_group_button" ).click( function() {
		
		Swal.fire({
			titleText: "Create New Container",
			html: "Please first enter a valid container name.",
			input: "text",
			inputPlaceholder: "Container Name...",
			icon: "question",
			iconColor: "#81bc00",
			confirmButtonColor: "#81bc00",
			showCancelButton: true,
			cancelButtonColor: "#d33",
			confirmButtonText: "Create",
			allowOutsideClick: false,
			allowEscapeKey: false,
			customClass: { popup: "headerSuccess" },
			willOpen: (value) => {
				
				// Change okay button type from button to submit; otherwise reloads page
				$( value ).find( 'button.swal2-confirm' ).removeAttr("type").attr("type", "submit");
			},
			inputValidator: (value) => {
				
				// Validate input field
				if ( ! value ) { return "Please enter a valid container name."; }
			}
		}).then((result) => {
			if (result.isConfirmed) {
				
				var html = '';
				html += '<div id="" class="rule_container">';

					// Check hide counts option
					var check_counts = $( 'span#hideCounts' ).hasClass( 'active' ) ? 'display: none;' : '';
					var check_filters = $( 'span#hideFilters' ).hasClass( 'active' ) ? 'display: none;' : '';

					// Hidden divs
					html += '<input type="hidden" class="title_color" />';
					html += '<input type="hidden" class="title_opacity" />';
					html += '<input type="hidden" class="title_bold" />';
					html += '<input type="hidden" class="container_color" value="#FFFFFF" />';
					html += '<input type="hidden" class="container_opacity" value="1" />';
					html += '<h4 class="mdl-grid container_title_h4">';
						html += '<div class="mdl-cell mdl-cell--9-col  mdl-cell--5-col-tablet container_title_left">';
							html += '<span class="group_name">' + result.value + '</span>';
							html += '<span class="group_name_edit"></em></span>';
							html += '<span class="group_rule_count" style="' + check_counts + '"><em>(0 items)</em></span>';
							html += '<span class="container_filter" style="' + check_filters + '"><input type="text" placeholder="Filter Container..."></span>';
						html += '</div>';
						html += '<div class="mdl-cell mdl-cell--3-col  mdl-cell--3-col-tablet container_title_right">';
							html += '<span class="tooltip moreOpts"><i class="material-icons submenu">settings</i><span class="tooltiptext">Container Options</span></span>';
							html += '<span class="tooltip toggleContainer"><i class="material-icons toggleContainer">file_upload</i><span class="tooltiptext">Collapse</span></span>';
							html += '<span class="tooltip drag_container drag_handle"><i class="material-icons drag_container">open_with</i><span class="tooltiptext">Move</span></span>';

							// Three dot menu
							html += '<div class="dropdown-content">';
								html += '<div class="edit_container_div"><i class="material-icons edit_container">edit</i> Edit Container</div>';
								html += '<div class="sortasc_container"><i class="material-icons">arrow_downward</i> Sort Asc</div>';
								html += '<div class="sortdesc_container"><i class="material-icons">arrow_upward</i> Sort Desc</div>';
								html += '<div class="delete_container"><i class="material-icons delete_group">delete</i> Delete Container</div>';
							html += '</div>';
						html += '</div>';
					html += '</h4>';

					// Rule list
					html += '<ul class="rulelist"></ul>';
				html += '</div>';

				// Append container to page
				$( 'div#rules_container' ).prepend( html );

				// Rebuild array
				rebuildArray();

				// Initialize sort
				initialize_sort();
				initialize_multisort();
			}
		});
	});
	
	// Edit container button
	$( document ).on( 'click', 'div.edit_container_div', function() {
		
		var thisEditContainer = $( this );
		
		// Hide list item dropdown content
		$(thisEditContainer).parent().hide();
		
		// Get container title, bold
		var getTitle = $( this ).parent().parent().siblings( 'div.container_title_left' ).children( 'span.group_name' ).html();
		var getTitleBold = $( this ).parents( 'h4' ).siblings( 'input.title_bold' ).val();
		
		// Get container color option
		var container_color = $( this ).parents( 'h4' ).siblings( 'input.container_color' ).val();
		var container_opacity = $( this ).parents( 'h4' ).siblings( 'input.container_opacity' ).val();
		var containerRgba = hexToRGB( container_color, container_opacity );
		
		// Get font color option
		var font_color = $( this ).parents( 'h4' ).siblings( 'input.title_color' ).val();
		var font_opacity = $( this ).parents( 'h4' ).siblings( 'input.title_opacity' ).val();
		var fontRgba = hexToRGB( font_color, font_opacity );
		
		// Define overlay html
		var editCont = '';
		editCont += '<p>Use this panel to adjust the visual appearance of the container.</p>';
		editCont += "<table id='containerOverlayOptions' style='width:100%;'><tbody>";
		
			// Only show title if not original rules container
			if( getTitle !== "Original Rules" ) { 
				editCont += "<tr>"
					editCont += "<td>Title</td>"
					editCont += "<td colspan='2'>";
						editCont += "<div id='overlayTitleError'><i class='material-icons'>info</i> Container Title is Required.</div>";
						editCont += "<input type='text' id='overlayContainerTitle' value='" + getTitle + "' />";
					editCont += "</td>"
				editCont += "</tr>"
			}
			editCont += "<tr><td>Title Bold</td><td><input type='checkbox' id='overlayTitleBold' " + ( getTitleBold == 'true' ? 'checked="checked"' : '' ) + " /></td><td></td></tr>";
			editCont += "<tr>";
				editCont += "<td>Container Color</td>";
					editCont += "<td><input type='text' class='cont_bg_color_picker' /></td>";
					editCont += "<td><button id='reset_background_color' class='button'>Restore Default Color</button></td>";
				editCont += "</tr>";
			editCont += "<tr>";
				editCont += "<td>Font Color</td>";
					editCont += "<td><input type='text' class='font_color_picker' /></td>";
					editCont += "<td><button id='reset_font_color' class='button'>Restore Default Color</button></td>";
				editCont += "</tr>";
		editCont += "</tbody></table>";
		editCont += '<p></p>';
		editCont += '<p><strong>NOTE:</strong> Remember to click "Done" on the main page after making any modifications.</p>';
		
		// Define overlay hidden inputs
		editCont += '<input type="hidden" id="overlayContainerColor" value="' + container_color + '" />';
		editCont += '<input type="hidden" id="overlayContainerOpacity" value="' + container_opacity + '" />';
		editCont += '<input type="hidden" id="overlayFontColor" value="' + font_color + '" />';
		editCont += '<input type="hidden" id="overlayFontOpacity" value="' + font_opacity + '" />';
		
		// Open overlay
		Swal.fire({
			titleText: "Edit Container",
			html: editCont,
			confirmButtonColor: "#81bc00",
			showCancelButton: true,
			cancelButtonColor: "#d33",
			confirmButtonText: "Apply",
			allowOutsideClick: false,
			allowEscapeKey: false,
			customClass: { popup: "headerSuccess", htmlContainer: "alignLeft" },
			willOpen: (value) => {
				
				// Change okay button type from button to submit; otherwise reloads page
				$( value ).find( 'button.swal2-confirm' ).removeAttr("type").attr("type", "submit");
			},
			preConfirm: () => {
				
				// If not original rules container; check for title
				if( getTitle != "Original Rules" ) {
					
					var checkTitle = $( 'input#overlayContainerTitle' ).val();
					if( ! checkTitle || checkTitle == "" ) {
						
						// Show input validation error
						$( 'div#overlayTitleError' ).show();
						$( 'input#overlayContainerTitle' ).css( 'border', '1px solid red');
						
						// Prevent overlay from closing
						return false;
					}
				}
			}
		}).then((result) => {
			if (result.isConfirmed) {
				
				// Get values from overlay form
				var newContainerTitle = getTitle != "Original Rules" ? $( 'input#overlayContainerTitle' ).val() : getTitle;
				var newContainerColor = $( 'input#overlayContainerColor' ).val();
				var newContainerOpacity = $( 'input#overlayContainerOpacity' ).val();
				var newContainerRgba = hexToRGB( newContainerColor, newContainerOpacity );
				var newContainerBold = $( 'input#overlayTitleBold' ).prop('checked');
				var newFontColor = $( 'input#overlayFontColor' ).val();
				var newFontOpacity = $( 'input#overlayFontOpacity' ).val();
				var newFontWeight = newContainerBold == true ? 'bold' : 'normal';
				
				// Populate main page hidden input fields for array rebuild
				$( thisEditContainer ).parents( 'h4' ).siblings( 'input.container_color' ).val( newContainerColor );
				$( thisEditContainer ).parents( 'h4' ).siblings( 'input.container_opacity' ).val( newContainerOpacity );
				$( thisEditContainer ).parents( 'h4' ).siblings( 'input.title_bold' ).val( newContainerBold == true ? 'true' : 'false' );
				$( thisEditContainer ).parents( 'h4' ).siblings( 'input.title_color' ).val( newFontColor );
				$( thisEditContainer ).parents( 'h4' ).siblings( 'input.title_opacity' ).val( newFontOpacity );

				// Update page container background color
				$( thisEditContainer ).parents( 'div.rule_container' ).css({ 'background-color': newContainerRgba });
				
				// Update page container name, count and icons
				$( thisEditContainer ).parent().parent().siblings( 'div.container_title_left' ).children( 'span.group_name' ).html( newContainerTitle ).css({ 'color': newFontColor, 'font-weight': newFontWeight, 'opacity': newFontOpacity });
				$( thisEditContainer ).parent().parent().siblings( 'div.container_title_left' ).children( 'span.group_rule_count' ).css({ 'color': newFontColor, 'font-weight': newFontWeight, 'opacity': newFontOpacity });
				
				// Update page container li elements
				$( thisEditContainer ).parents( 'h4' ).siblings( 'ul.rulelist' ).children( 'li' ).find( 'span.rule_name' ).css({ 'color': newFontColor, 'opacity': newFontOpacity });
				$( thisEditContainer ).parents( 'h4' ).siblings( 'ul.rulelist' ).children( 'li' ).find( 'i' ).css({ 'color': newFontColor, 'opacity': newFontOpacity });
				$( thisEditContainer ).parent().parent().find( 'i' ).css({ 'color': newFontColor, 'opacity': newFontOpacity });

				// Rebuild array
				rebuildArray();
			}
		});
	
		// Set container background color picker in overlay
		$(".cont_bg_color_picker").spectrum({
			color: containerRgba,
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
				
				// Populate overlay hidden input fields for later consumption
				$( this ).parents( 'table' ).siblings( 'input#overlayContainerColor' ).val( color.toHexString() );
				$( this ).parents( 'table' ).siblings( 'input#overlayContainerOpacity' ).val( color.getAlpha() );
			}
		});
	
		// Set font color picker in overlay
		$(".font_color_picker").spectrum({
			color: fontRgba,
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
				$( this ).parents( 'table' ).siblings( 'input#overlayFontColor' ).val( color.toHexString() );
				$( this ).parents( 'table' ).siblings( 'input#overlayFontOpacity' ).val( color.getAlpha() );
			}
		});
	});
	
	// Delete container button
	$( document ).on( 'click', 'div.delete_container', function() {
		
		var this_delete = $( this );
		
		Swal.fire({
			titleText: "Confirm Container Deletion",
			text: "Deleting this container will move all of this containers rules back to the Original Rules container.",
			icon: "question",
			iconColor: "#d33",
			showCancelButton: true,
			confirmButtonColor: "#81bc00",
			cancelButtonColor: "#d33",
			confirmButtonText: "Delete",
			allowOutsideClick: false,
			allowEscapeKey: false,
			customClass: { popup: "headerError" }
		}).then((result) => {
			if (result.isConfirmed) {
				
				// Check if any rules exist in container
				var check_rules = $( this_delete ).parents( 'h4.container_title_h4' ).siblings( 'ul' ).children();

				// If rules are found
				if( check_rules.length !== 0 ) {

					// Copy rules and append to original rules container
					var copy_html = $( this_delete ).parents( 'h4.container_title_h4' ).siblings( 'ul' ).html();
					$( 'div#original-rules' ).find( 'ul.rulelist' ).append( copy_html );
					
					// Get original container colors
					var deleteColor = $( 'div#original-rules' ).children( 'input.title_color' ).val();
					var deleteOpacity = $( 'div#original-rules' ).children( 'input.title_opacity' ).val();
					
					// Apply original container colors to elements
					$( 'div#original-rules' ).find( 'ul.rulelist' ).children( 'li' ).find( 'span.rule_name' ).css({ 'color': deleteColor, 'opacity': deleteOpacity });
					$( 'div#original-rules' ).find( 'ul.rulelist' ).children( 'li' ).find( 'i' ).css({ 'color': deleteColor, 'opacity': deleteOpacity });
				}

				// Remove container
				$( this_delete ).parents( 'div.rule_container' ).remove();

				// Rebuild array
				rebuildArray();
				
				// Define toast
				const Toast = Swal.mixin({
					toast: true,
					position: "top-end",
					showConfirmButton: false,
					timer: 3000,
					timerProgressBar: true,
					didOpen: (toast) => {
						toast.onmouseenter = Swal.stopTimer;
						toast.onmouseleave = Swal.resumeTimer;
					}
				});
				Toast.fire({
					icon: "success",
					iconColor: "#81bc00",
					title: "Container Deleted Successfully"
				});
			}
		});
	});
	
	/*********************************************************
	Container Helpers
	*********************************************************/
	
	// Toggle container expand/collapse
	$( document ).on( 'click', 'i.toggleContainer', function() {
		
		// Toggle list
		$( this ).parents( 'h4' ).siblings( 'ul' ).toggle();
		
		// Get color and opacity from sister element icon (hover interferes with original color)
		var thisColor = $( this ).parent().siblings( 'span.moreOpts' ).children( 'i' ).css( 'color' );
		var thisOpacity = $( this ).parent().siblings( 'span.moreOpts' ).children( 'i' ).css( 'opacity' );
		
		// Define additional styles
		var thisStyle = "color:" + thisColor + ";opacity:" + thisOpacity + ";";
		
		// Determine which icon and text to display
		if( $( this ).text() == 'file_upload' ) {
			
			$( this ).parent().html( '<i class="material-icons toggleContainer" style="' + thisStyle + '">file_download</i><span class="tooltiptext">Expand</span>' );
		}
		else if( $( this ).text() == 'file_download' ) {
			
			$( this ).parent().html( '<i class="material-icons toggleContainer" style="' + thisStyle + '">file_upload</i><span class="tooltiptext">Collapse</span>' );
		}
		
		// Rebuild array
		rebuildArray();
	});
	
	// Toggle container options dropdown
	$( document ).on( 'click', 'i.submenu', function() {
		
		// Close all dropdowns other than this; and toggle this dropdown
		$( 'div.dropdown-content' ).not( $( this ).parent().siblings( 'div.dropdown-content' ) ).hide();
		$( this ).parent().siblings( 'div.dropdown-content' ).toggle();
		$( this ).toggleClass( 'active' );
		
		// Rotate menu icon
		var css = ! $( this ).parent().siblings( 'div.dropdown-content' ).is( ':visible' ) ? '0deg' : '90deg';
		$( this ).css({ 'rotate': css, transition : 'rotate 0.3s ease-in-out' });
	});
	
	// Close container options dropdown if clicking anywhere outside of container
	window.onclick = function(event) {
		if( ! event.target.matches( '.submenu' ) ) {
			
			$( 'div.dropdown-content' ).hide();
			$( 'i.submenu' ).css( 'rotate', '0deg' );
			$( 'i.submenu' ).removeClass( 'active' );
		}
	}
	
	// Overlay keyup for title validation
	$( document ).on( 'focus', 'input#overlayContainerTitle', function() {
		
		$( this ).css( 'border', '1px solid #CCC' );
		$( this ).siblings( 'div#overlayTitleError' ).hide();
	});
	
	// Reset background color
	$( document ).on ( 'click', 'button#reset_background_color', function() {
		
		// Set color picker
		$(".cont_bg_color_picker").spectrum( "set", "#FFFFFF" );
		
		// Set overlay hidden input fields
		$( 'input#overlayContainerColor' ).val( '#FFFFFF' );
		$( 'input#overlayContainerOpacity' ).val( '1' );
	});
	
	// Reset font color
	$( document ).on( 'click', 'button#reset_font_color', function() {
		
		// Set color picker
		$(".font_color_picker").spectrum( "set", "#000000" );
		
		// Set overlay hidden input fields
		$( 'input#overlayFontColor' ).val( '#000000' );
		$( 'input#overlayFontOpacity' ).val( '1' );
	});
	
	/*********************************************************
	Container Dragging and Dropping
	*********************************************************/

	// Initialize drag/drop on containers
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

				// Rebuild Array
				rebuildArray();
			}
		});
	}
	
	// Initialize drag/drop on rule lists
	function initialize_multisort() {
		
		$('ul.rulelist').multipleSortable({
			items: 'li',
			selectedClass: 'selected',
			connectWith: 'ul.rulelist',
			container: '#rules_container',
			stop: function( event, ui, items ) {
				
				// Set background color of dropped rules to match container
				//var containerColor = $( items[0] ).parents( 'div.rule_container' ).css( 'background-color' );
				var fontColor = $( items[0] ).parent().siblings( 'h4' ).find( 'span.group_name' ).css( 'color' );
				var fontOpacity = $( items[0] ).parent().siblings( 'h4' ).find( 'span.group_name' ).css( 'opacity' );
				
				// Set font color on each dropped list item
				$( items ).each( function() { 
					$( this).find( 'span.rule_name' ).css({ 'color': fontColor, 'opacity': fontOpacity }); 
					$( this).find( 'i' ).css({ 'color': fontColor, 'opacity': fontOpacity }); 
				});

				// Rebuild Array
				rebuildArray();
			}
		});
	}
	
	// Set selected classes on rule list items for multi sortable function
	$( document ).on( 'click', 'ul.rulelist li.rule', function(e) {
				
		// If this list item has selected class
		if( $(this).hasClass( 'selected' ) ) {

			// Remove selected class
			$( this ).removeClass( 'selected' );
		}
		// Else this list item does not have selected class
		else {

			// If ctrl key is held; add to selected
			if( e.ctrlKey == true || e.metaKey == true ) {

				// Toggle selected class (add to items)
				$( this ).toggleClass( 'selected' );
			}
			// Else ctrl key was not held
			else {

				// Remove selected class from all items, and just select this
				$( 'ul.rulelist li.selected' ).removeClass( 'selected' );
				$( this ).toggleClass( 'selected' );
			}
		}
	});
	
	/*********************************************************
	Rules: Copy, Delete, View
	*********************************************************/
	
	// Copy rule
	$( document ).on( 'click', 'i.copy_rule', function(e) {
		
		// Prevent highlighting active row
		e.stopPropagation();
		
		// Get variables
		var thisCopy = $( this );
		var ruleName = $( this ).parent().parent().siblings( 'div.rule_title_left' ).children( 'span.rule_name' ).text();
		
		// Get icon color from sibling
		var iconColor = $( this ).parent().siblings( 'span.ruleViewLogs' ).children( 'i' ).css( 'color' );
		var iconOpacity = $( this ).parent().siblings( 'span.ruleViewLogs' ).children( 'i' ).css( 'opacity' );
		
		// Fire confirmation alert
		Swal.fire({
			titleText: "Duplicate Rule?",
			html: "Duplicating: " + ruleName + "<br /><br />Duplicating this rule only makes a duplicate in the context of this app. It does not actually duplicate the rule in the Rule Machine app.",
			icon: "info",
			iconColor: "#81bc00",
			showCancelButton: true,
			confirmButtonColor: "#81bc00",
			cancelButtonColor: "#d33",
			confirmButtonText: "Duplicate Rule",
			allowOutsideClick: false,
			allowEscapeKey: false,
			customClass: { popup: "headerSuccess" }
		}).then((result) => {
			if (result.isConfirmed) {
				
				// Clone rule and insert after itself
				var new_item = $( thisCopy ).parents( 'li' ).clone();
				$( thisCopy ).parents( 'li' ).after( new_item );
				
				// Adjust copy/delete icon
				new_item.find( 'span.copy_rule' ).remove();
				var text = "<span class='tooltip delete_duplicate'><i class='material-icons duplicate_rule rule'>delete_outline</i><span class='tooltiptext'>Remove Duplicate Rule</span></span>"
				$( text ).insertAfter( new_item.find( 'span.ruleViewLogs' ) );
				
				// Adjust new icon color
				new_item.find( 'i.duplicate_rule' ).css({ 'color': iconColor, 'opacity': iconOpacity });

				// Rebuild array
				rebuildArray();
			}
		});
	});
	
	// Delete duplicate rule
	$( document ).on( 'click', 'span.delete_duplicate', function(e) {
		
		// Prevent highlighting active row
		e.stopPropagation();
		
		// Get variables
		var thisDuplicate = $( this );
		var dupeName = $( this ).parent().siblings( 'div.rule_title_left' ).children( 'span.rule_name' ).text();
		
		Swal.fire({
			titleText: "Remove Duplicate Rule?",
			html: "Removing: " + dupeName + "<br /><br />Removing this duplicate rule only removes it in the context of this app. It does not actually remove the rule in the Rule Machine app.",
			icon: "question",
			iconColor: "#d33",
			showCancelButton: true,
			confirmButtonColor: "#81bc00",
			cancelButtonColor: "#d33",
			confirmButtonText: "Remove Rule",
			allowOutsideClick: false,
			allowEscapeKey: false,
			customClass: { popup: "headerError" }
		}).then((result) => {
			if (result.isConfirmed) {
				
				$( thisDuplicate ).parents( 'li' ).remove();
		
				// Rebuild array
				rebuildArray();
			}
		});
	});
	
	// View rule, view rule status, view rule logs
	$( document ).on( 'click', 'span.ruleView, span.ruleViewStatus, span.ruleViewLogs', function() {
		
		window.open( $( this ).attr( 'url' ) );
		return false;
	});
	
	/*********************************************************
	Sorting
	*********************************************************/
	
	// Sort ascending
	$( document ).on( 'click', 'div.sortasc_container', function() {
		
		// Get list items
		var list = $( this ).parents( 'h4' ).siblings( 'ul.rulelist' );
		var items = list.children( 'li' ).get();
		
		// Sort
		items.sort( function( a, b ) {
			
			var a_sort = $( a ).find( 'span.rule_name' ).text().toUpperCase();
			var b_sort = $( b ).find( 'span.rule_name' ).text().toUpperCase();
			
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
		var list = $( this ).parents( 'h4' ).siblings( 'ul.rulelist' );
		var items = list.children( 'li' ).get();
		
		// Sort
		items.sort( function( a, b ) {
			
			var b_sort = $( b ).find( 'span.rule_name' ).text().toUpperCase();
			var a_sort = $( a ).find( 'span.rule_name' ).text().toUpperCase();
			
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
	
	/*********************************************************
	Exporting and Importing
	*********************************************************/
	
	// Export options
	$( document ).on( 'click', 'span#generate_export', function() {
		
		// Get options from hidden input
		var options = $( 'input#userArray' ).val();
		
		// Place into textarea
		$( 'textarea#export_textarea' ).val( options );
	});
	
	// Copy export to clipboard
	$( document ).on( 'click', 'span#copy_export', function() {
		
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
			
			Swal.fire({
				titleText: "Clipboard Unavailable",
				text: "There is a problem with copying data to the clipboard. Try manually selecting the data, right-click and select Copy.",
				icon: "question",
				iconColor: "#d33",
				confirmButtonColor: "#81bc00",
				allowOutsideClick: false,
				allowEscapeKey: false,
				customClass: { popup: "headerError" }
			});
		}
		
		// Remove temp textarea
		document.body.removeChild( textArea );
	});
	
	// Copy export change text
	$( document ).on( 'mouseout', 'span#copy_export', function() {
		
		$( 'span#exportTooltip' ).html( 'Copy to clipboard' );
	});
	
	// Import options
	$( document ).on( 'click', 'span#generate_import', function() {
		
		// Get import value
		var import_opts = $( 'textarea#import_textarea' ).val();
		if( import_opts == '' ) {
			
			// Show import error
			$( 'div#importEmptyError' ).show();
			$( 'textarea#import_textarea' ).css( 'border', '1px solid red' );
			return false;
		}
		
		// Check if the import is parsable by json
		var json_check = true;
		try { var json = $.parseJSON( import_opts ); }
		catch( err ) { json_check = false; }
		
		if( ! json_check ) {
			
			// Show import error
			$( 'div#importMalformError' ).show();
			$( 'textarea#import_textarea' ).css( 'border', '1px solid red' );
			return false;
		}
		
		// Copy and paste into hidden input field
		$( 'input#userArray' ).val( import_opts );

		// Click "Done" button
		$( 'button#btnDone' ).click();
	});
	
	// Remove import errors from textarea when focused
	$( document ).on( 'focus', 'textarea#import_textarea', function() {
		
		$( 'div#importEmptyError' ).hide();
		$( 'div#importMalformError' ).hide();
		$( 'textarea#import_textarea' ).css( 'border', '1px solid black' );
	});
	
	/*********************************************************
	Reset Options
	*********************************************************/
	$( document ).on( 'click', 'span#reset_opts', function() {
		
		// Use a quick notice as a confirmation
		if( $( 'div#confirmReset' ).length == 0 ) {
			
			$( '<div id="confirmReset">Clicking the "Reset Options" button once more will permanently delete any customizations.</div>' ).insertBefore( $(this) );
		}
		else {
			
			// Get default setting
			var get_defaults = $( 'input#load_default_opts' ).val();

			// Set default setting
			$( 'input#userArray' ).val( get_defaults );
			
			// Click "Done" button
			$( 'button#btnDone' ).click();
		}
	});
	
	/*********************************************************
	Global and Container: Counts and Filters; Machine Names
	*********************************************************/
	
	// Global option hide container counts
	$( 'span#hideCounts' ).click( function() {
		
		if( $( this ).hasClass( 'active' ) ) {
			
			$( 'span.group_rule_count' ).show();
			$( 'span#hideCounts' ).removeClass( 'active' );
			$( 'span#hideCounts span.tooltiptext' ).text( 'Hide Counts' );
		}
		else {
			
			$( 'span.group_rule_count' ).hide();
			$( 'span#hideCounts' ).addClass( 'active' );
			$( 'span#hideCounts span.tooltiptext' ).text( 'Show Counts' );
		}
		
		// Rebuild array
		rebuildArray();
	});
	
	// Global option hide container filters
	$( 'span#hideFilters' ).click( function() {
		
		if( $( this ).hasClass( 'active' ) ) {
			
			$( 'span.container_filter' ).show();
			$( 'span#global_filter' ).show();
			$( 'span#hideFilters' ).removeClass( 'active' );
			$( 'span#hideFilters span.tooltiptext' ).text( 'Hide Filters' );
		}
		else {
			
			$( 'span.container_filter' ).hide();
			$( 'span#global_filter' ).hide();
			$( 'span#hideFilters' ).addClass( 'active' );
			$( 'span#hideFilters span.tooltiptext' ).text( 'Show Filters' );
		}
		
		// Rebuild array
		rebuildArray();
	});
	
	// Global show/hide rule machine names
	$( document ).on( 'click', 'span#hideMachines', function() {
		
		if( $( this ).hasClass( 'active' ) ) {
			
			$( 'ul.rulelist span.ruleType' ).show();
			$( 'span#hideMachines' ).removeClass( 'active' );
			$( 'span#hideMachines span.tooltiptext' ).text( 'Hide Machine Names' );
		}
		else {
			
			$( 'ul.rulelist span.ruleType' ).hide();
			$( 'span#hideMachines' ).addClass( 'active' );
			$( 'span#hideMachines span.tooltiptext' ).text( 'Show Machine Names' );
		}
		
		// Rebuild array
		rebuildArray();
	});
	
	// Filter global rules
	$( document ).on( 'keyup', 'span#global_filter', function() {
		
		// Get filter value
		var filterVal = $( this ).children('input').val();
		
		// Check if there is a value and add highlight color
		if( filterVal !== '' ) {
			$( this ).children( 'input' ).addClass( 'active' );
		} else {
			$( this ).children( 'input' ).removeClass( 'active' );
		}
		
		// Show or hide rules
		$( 'ul.rulelist' ).each( function() {
			
			$( this ).children().each(function() {
			
				var thisName = $(this).find( 'span.rule_name' ).text();
				if ( thisName.toLowerCase().indexOf( filterVal ) >= 0 ) {

					$( this ).show();
				}
				else {

					$( this ).hide();
				}
			});
			
			// Replace rule counts
			var ruleCount = $( this ).children( ':visible' ).length;
			var items = ruleCount == 1 ? 'item' : 'items';
			$( this ).siblings( 'h4' ).find( 'span.group_rule_count' ).html( '<em>(' + ruleCount + ' ' + items + ')</em>' );
		});
	});
	
	// Filter container rules
	$( document ).on( 'keyup', 'span.container_filter', function() {
		
		// Get filter value
		var filterVal = $( this ).children('input').val();
		
		// Check if there is a value and add highlight color
		if( filterVal !== '' ) {
			$( this ).children( 'input' ).addClass( 'active' );
		} else {
			$( this ).children( 'input' ).removeClass( 'active' );
		}
		
		// Show or hide rules
		$( this ).parents( 'h4' ).siblings( 'ul.rulelist' ).children().each( function() {
			
			var thisName = $(this).find( 'span.rule_name' ).text();
			if ( thisName.toLowerCase().indexOf( filterVal ) >= 0 ) {
				
				$( this ).show();
			}
			else {
				
				$( this ).hide();
			}
		});
		
		// Replace rule counts
		var ruleCount = $( this ).parents( 'h4' ).siblings( 'ul.rulelist' ).children( ':visible' ).length;
		var items = ruleCount == 1 ? 'item' : 'items';
		$( this ).siblings( 'span.group_rule_count' ).html( '<em>(' + ruleCount + ' ' + items + ')</em>' );
	});
	
	/*********************************************************
	Build User Array: Updates options to hidden input field
	*********************************************************/
	function rebuildArray() {

		// Define base array
		var rb_array = {};

		// Push global options
		rb_array.hide_counts = $( 'span#hideCounts' ).hasClass( 'active' ) ? 'true' : 'false';
		rb_array.hide_filters = $( 'span#hideFilters' ).hasClass( 'active' ) ? 'true' : 'false';
		rb_array.hide_machines = $( 'span#hideMachines' ).hasClass( 'active' ) ? 'true' : 'false';
		rb_array.welcome_nag = $( 'input#welcome_nag' ).val();
		rb_array.rule_machines = JSON.parse( $( 'input#ruleMachines' ).val() );
		rb_array.check_machines = JSON.parse( $( 'input#checkMachines' ).val() );
		rb_array.containers = [];

		// Loop each container
		$( 'div.rule_container' ).each( function() {

			// Create container array and populate
			var title = $( this ).children( 'h4' ).find( 'span.group_name' ).text();
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
			var count = $( this ).find( 'ul.rulelist' ).children( ':visible' ).length;
			var items = count == 1 ? 'item' : 'items';
			$( this ).children( 'h4' ).find( 'span.group_rule_count' ).html( '<em>(' + count + ' ' + items + ')</em>' );

			// Push this container to base array
			rb_array.containers.push( this_array );
		});

		// Populate hidden input with new user array
		$( 'input#userArray' ).val( JSON.stringify( rb_array ) );

		// Adjust list classes on duplicate items
		$( 'span.delete_duplicate' ).each( function() {

			$( this ).parents( 'li' ).addClass( 'duplicate' );
		});
	}
	
	/*********************************************************
	Page Options Overlay
	*********************************************************/
	
	// Toggle main page options overlay
	$( document ).on( 'click', 'span#options_panel', function() {
		
		var html = '';
		html += '<div id="overlayAccordian">';
			html += '<h3>Global Options</h3>';
			html += '<div>';
				html += '<p>Select which rules to display in the Rule Machine Manager main application.</p>';
		
				html += "<div class='twoColumnRow'>";
		
					// Get all default machine types; and loop for input fields
					var machineTypes = JSON.parse( $( 'input#load_default_opts' ).val() ).check_machines;
					$( machineTypes ).each( function( i, v ) {
						
						html += "<div class='twoColumn'>";
		
							html += '<label class="ruleMachineRadio" for="' + v + 'Radio">' + camelCaseToPretty( v ) + '</label>';
							html += '<input type="checkbox" class="mainOptsRadio" id="' + v + 'Radio" value="' + v + '">';
						html += "</div>";
					});
		
				html += "</div>";
			html += '</div>';
			html += '<h3>Export Options</h3>';
			html += '<div>';
				html += '<p>';
					html += "Click the \"Export Options\" button to generate the app settings into the textarea. ";
					html += "Copy/paste the text and save in a text document for importing at a later time.";
				html += '</p>';
				html += '<p>"Copy Options" will copy the text to the browser clipboard which can then be pasted into a document.</p>';
				html += '<p><textarea id="export_textarea"></textarea></p>';
				html += '<p>';
					html += '<span id="generate_export" class="button"><i class="material-icons">import_export</i> Export Options</span>';
					html += "<span class='tooltip tooltipBlock'>";
						html += "<span id='copy_export' class='button'>";
							html += "<span class='tooltiptext' id='exportTooltip'>Copy to clipboard</span>";
						html += "<i class='material-icons'>content_copy</i> Copy Options";
					html += "</span>";
				html += '</p>';
			html += '</div>';
			html += '<h3>Import Options</h3>';
			html += '<div>';
				html += '<p>';
					html += "Paste the contents from a previous export into the textarea.<br />"
					html += "Click Import Options to populate the settings.<br />"
					html += "<strong>NOTE:</strong> The page will reload automatically after clicking Import Options to save the settings."
				html += '</p>';
				html += '<div id="importEmptyError"><i class="material-icons">info</i> Import content cannot be empty.</div>';
				html += '<div id="importMalformError"><i class="material-icons">info</i> Import content is malformed.</div>';
				html += "<textarea id='import_textarea'></textarea>";
				html += "<span id='generate_import' class='button'><i class='material-icons'>import_export</i> Import Options</span>";
			html += '</div>';
			html += '<h3>Reset Options</h3>';
			html += '<div>';
				html += '<p>';
					html += "Use this tool to restore the app back to initial default values.<br />"
                    html += "This can be useful if something is buggy, or to start a clean slate.<br />"
					html += "<strong>Note:</strong> Clicking this button will erase any customizations and reload the page."
				html += '</p>';
				html += '<p>';
					html += "<span id='reset_opts' class='button'><i class='material-icons'>restart_alt</i> Reset Options</span>"
				html += '</p>';
			html += '</div>';
		html += '</div>';
		
		Swal.fire({
			width: '50em',
			titleText: "Options Panel",
			html: html,
			allowOutsideClick: false,
			allowEscapeKey: false,
			customClass: { popup: "headerSuccess", htmlContainer: "alignLeft" },
			confirmButtonColor: "#81bc00",
			showCancelButton: true,
			cancelButtonColor: "#d33",
			cancelButtonText: "Dismiss",
			didOpen: function() {
				
				// Instantiate jquery accordian
				$( "#overlayAccordian" ).accordion({ heightStyle: 'content' });
				
				// Instantiate jquery checkbox radio
				$( 'input.mainOptsRadio').checkboxradio();
				
				// Populate rule machines checkboxes
				var machines = $( 'input#ruleMachines' ).val();
				machines = JSON.parse( machines );
				
				// Loop each radio machine type and check if checked
				$( 'input.mainOptsRadio' ).each( function() {
					if( $.inArray( $( this ).val(), machines ) > -1 ) {
						
						$( this ).prop( "checked", true ).checkboxradio( "refresh" );
					}
				});
			}
		}).then((result) => {
			if (result.isConfirmed) {
				
				// Build array names list
				var ruleNames = [];
				
				// Loop each machine type radio selection
				$( 'input.mainOptsRadio' ).each( function() {
					
					// If this machine type is checked
					if( $( this ).prop( "checked" ) == true ) { 
						
						// Add to array names list
						ruleNames.push( $( this ).val() ); 
						
						// Show page elements
						$( 'li.' + $( this ).val() ).show();
					}
					else {
						
						// Hide page elements
						$( 'li.' + $( this ).val() ).hide();
					}
				});
				
				// Put array names list into input array in page
				$( 'input#ruleMachines' ).val( JSON.stringify( ruleNames ) );
				
				// Rebuild Array
				rebuildArray();
			}
		});
	});
	
	/*********************************************************
	Helper Functions
	*********************************************************/
	
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
	
	// Done function
	$( document ).on( 'click', 'span#done_submit', function() {
		
		// Click "Done" button
		$( 'button#btnDone' ).click();
	});
	
	// Camelcase to capitals and spaces
	function camelCaseToPretty( str ) {
		
		return str
		.replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space between lowercase and uppercase
		.replace(/^./, function(match) { return match.toUpperCase(); }); // Capitalize first letter
	}
	
	// Populate default check rule machines array into hidden input (used for comparisons alert for new rule machine types)
	var checkMachines = $( 'input#load_default_opts' ).val();
	$( 'input#checkMachines' ).val( JSON.stringify( JSON.parse( checkMachines ).check_machines ) );
	
	// Check user rule machines against allowed rule machines (used for comparisons alert for delete rule machine type)
	var userMachines = JSON.parse( $( 'input#ruleMachines' ).val() );
	var allowedMachines = JSON.parse( $( 'input#checkMachines' ).val() );
	userMachines = $.grep( userMachines, function( value ) { return $.inArray( value, allowedMachines ) > -1; });
	
	// Place updated array back into page
	$( 'input#ruleMachines' ).val( JSON.stringify( userMachines ) );
	
	rebuildArray();
	
	/*********************************************************
	Welcome/Helper Notice (Nag Notice)
	*********************************************************/
	
	// Welcome nag initial page load
	var checkWelcomeNag = $( 'input#welcome_nag' ).val();
	if( checkWelcomeNag == 'true' ) { welcomeNag(); }
	
	// Welcome nag click function
	$( 'span#help_welcome' ).click( function() { welcomeNag(); });
	
	// Welcome nag
	function welcomeNag( animation = true ) {
		
		var html = '';
		html = '<div id="nag_content" class="nag_content">';
			html += '<p>Welcome to the Rule Machine Manager Application! If this is the first time installing the app; please don\'t forget to press the "Done" button when finished.</p>';
			html += '<p>Rule Machine Manager (RMM) is a tool used to group and organize the rules created in the Rule Machine app. It allows creation of containers, drag/drop organizing, and many other features.</p>';
			html += '<p>RMM does not in any way interfere with the rules created, saved, and administered by the Rule Machine app. It only provides a visual interface to help organize and more quickly identify a rule.</p>';
			html += '<p>Click any of the following icons to learn more about Rule Machine Managers features.</p>';
			html += '<div class="welcome_header">App Features</div>';
			html += '<div class="row threeColumnRow">';
				html += '<div class="fourColumn"><i class="material-icons-outlined features containers">view_agenda</i><br /><strong>Containers</strong></div>';
				html += '<div class="fourColumn"><i class="material-icons features rules">dehaze</i><br /><strong>Rules</strong></div>';
				html += '<div class="fourColumn"><i class="material-icons-outlined features styling">palette</i><br /><strong>Styling</strong></div>';
				html += '<div class="fourColumn"><i class="material-icons-outlined features more">auto_awesome</i><br /><strong>More Features</strong></div>';
			html += '</div>';
			html += '<p class="welcome_note">'
				html += '<strong>Note:</strong> This modal can be re-opened anytime by clicking the "Help" icon on the top right area of the page.<br />';
				html += '<strong>Note:</strong> Vist the <a href="https://community.hubitat.com/t/initial-release-rule-machine-manager-new-rule-machine-interface/124689" target="_blank" />Hubitat Community Thread</a> for more help.'
			html += '</p>';
		html += '</div>';
		
		Swal.fire({
			width: '50em',
			titleText: "Welcome",
			html: html,
			allowOutsideClick: false,
			allowEscapeKey: false,
			customClass: { popup: "headerSuccess", htmlContainer: "alignLeft" },
			confirmButtonColor: "#81bc00",
			showCancelButton: true,
			cancelButtonColor: "#d33",
			cancelButtonText: "Dismiss",
			animation: animation
		}).then((result) => {
			if (result.isConfirmed || result.isDismissed) {
				
				// Update page hidden input value
				$( 'input#welcome_nag' ).val( 'false' );
				
				// Rebuild Array
				rebuildArray();
			}
		});
	}
	$( document ).on( 'click', 'div#nag_content i.features.containers', function() {
		
		var html = '';
		html += '<div class="nag_content">';
			html += '<p>Containers are where rules are stored and listed. RMM begins with one container already defined; the "Original Rules" container. This container houses all rules which have already been created using the Rule Manager app.</p>';
			html += '<p>New containers can be created and added to the page. Creating new containers helps with organization. The rules from the "Original Rules" container can then be moved to any other container on the page.</p>';
			html += '<p>Containers are sortable. Meaning, any container can be moved around on the page. Organize the containers in a way which best suits the viewer. After saving the app, the order of containers is preserved.</p>';
			html += '<p>Containers can be collapsed and expanded. Collapsing a container hides all the rules inside the container. This may be useful for containers whose rules are seldomly used, freeing up valuable working space. Expanding a container redisplays the hidden rules.</p>';
			html += '<p>Containers can be deleted; with the exception of the "Original Rules" container. Deleting a container with rules inside will delete the container, and move the rules back into the "Original Rules" container.</p>';
		html += '</div>';
		
		Swal.fire({
			width: '50em',
			titleText: "Containers",
			html: html,
			allowOutsideClick: false,
			allowEscapeKey: false,
			customClass: { popup: "headerSuccess", htmlContainer: "alignLeft" },
			confirmButtonColor: "#81bc00",
			confirmButtonText: "Back",
			showCancelButton: true,
			cancelButtonColor: "#d33",
			cancelButtonText: "Dismiss",
			animation: false
		}).then((result) => {
			if (result.isConfirmed) { welcomeNag( false ); }
			if (result.isDismissed) { $( 'input#welcome_nag' ).val( 'false' ); rebuildArray(); }
		});
	});
	$( document ).on( 'click', 'div#nag_content i.features.rules', function() {
		
		var html = '';
		html += '<div class="nag_content">';
			html += '<p>All rules appearing in RMM are simply placeholders. There is no chance of corrupting an actual Rule Manager rule. This app calls an endpoint which lists all the rule names; and the rest of the interface is built using that data.</p>';
			html += '<p>Rules will first appear in the "Original Rules" container (assuming some have been created using the Rule Manager app). Rules are draggable and sortable, and can be moved around into any order.</p>';
			html += '<p>Rules can be moved into other containers. This allows for greater flexibility in rule organization.</p>';
			html += '<p>Select multiple rules for moving by holding down the control key while clicking the rules to be moved.</p>';
			html += '<p>Rules can be duplicated; in the sense a duplicate placeholder is created in the app. Duplicating rules allows a rule to appear in multiple containers. Duplicate rules can be deleted; which only deletes the reference to the rule, not the actual rule itself.</p>';
			html += '<p>Rules can be automatically sorted inside their respective containers. Use the icons for the container to sort the rules in alphabetical order.</p>';
			html += '<p>Clicking the "View Rule" icon will open the rule in the Rule Manager app (edit mode) in a new browser window.</p>';
		html += '</div>';
		
		Swal.fire({
			width: '50em',
			titleText: "Rules",
			html: html,
			allowOutsideClick: false,
			allowEscapeKey: false,
			customClass: { popup: "headerSuccess", htmlContainer: "alignLeft" },
			confirmButtonColor: "#81bc00",
			confirmButtonText: "Back",
			showCancelButton: true,
			cancelButtonColor: "#d33",
			cancelButtonText: "Dismiss",
			animation: false
		}).then((result) => {
			if (result.isConfirmed) { welcomeNag( false ); }
			if (result.isDismissed) { $( 'input#welcome_nag' ).val( 'false' ); rebuildArray(); }
		});
	});
	$( document ).on( 'click', 'div#nag_content i.features.styling', function() {
		
		var html = '';
		html += '<div class="nag_content">';
			html += '<p>RMM allows styling of the container area. Containers can have their appearance altered; helping to visually identify certain containers.</p>';
			html += '<p>Styling the containers can help facilitate quick visual identification of frequently used rules. Use color combinations which can facilitate visual organization.</p>';
			html += '<p>All styling modifications are saved in the app settings and will be re-applied each time the app is loaded.</p>';
		html += '</div>';
		
		Swal.fire({
			width: '50em',
			titleText: "Styling",
			html: html,
			allowOutsideClick: false,
			allowEscapeKey: false,
			customClass: { popup: "headerSuccess", htmlContainer: "alignLeft" },
			confirmButtonColor: "#81bc00",
			confirmButtonText: "Back",
			showCancelButton: true,
			cancelButtonColor: "#d33",
			cancelButtonText: "Dismiss",
			animation: false
		}).then((result) => {
			if (result.isConfirmed) { welcomeNag( false ); }
			if (result.isDismissed) { $( 'input#welcome_nag' ).val( 'false' ); rebuildArray(); }
		});
	});
	$( document ).on( 'click', 'div#nag_content i.features.more', function() {
		
		var html = '';
		html += '<div class="nag_content"">';
			html += '<p>RMM is packed full of fun features to keep any user busy for hours. Here are just a few:</p>';
			html += '<ul>';
				html += '<li>Create containers to organize rules.</li>';
				html += '<li>Containers can be styled for visual appeal.</li>';
				html += '<li>Containers can be collapsed and expanded.</li>';
				html += '<li>Containers are sortable.</li>';
				html += '<li>Rules can be sorted inside containers.</li>';
				html += '<li>Rules can be filtered inside containers.</li>';
				html += '<li>Rules can be moved between containers.</li>';
				html += '<li>Multiple rules can be selected for moving.</li>';
				html += '<li>Rules can be copied; and copied rules can be deleted.</li>';
				html += '<li>App settings can be exported and imported.</li>';
				html += '<li>Easily reset app settings to defaults.</li>';
				html += '<li>Global filtering of all rules in all containers.</li>';
				html += '<li>Global options for hiding container counts and filters.</li>';
			html += '</ul>';
		html += '</div>';
		
		Swal.fire({
			width: '50em',
			titleText: "Features",
			html: html,
			allowOutsideClick: false,
			allowEscapeKey: false,
			customClass: { popup: "headerSuccess", htmlContainer: "alignLeft" },
			confirmButtonColor: "#81bc00",
			confirmButtonText: "Back",
			showCancelButton: true,
			cancelButtonColor: "#d33",
			cancelButtonText: "Dismiss",
			animation: false
		}).then((result) => {
			if (result.isConfirmed) { welcomeNag( false ); }
			if (result.isDismissed) { $( 'input#welcome_nag' ).val( 'false' ); rebuildArray(); }
		});
	});
});



/*********************************************************
Multiselect Script
https://www.jqueryscript.net/other/Multiple-Sortable-Plugin-jQuery-UI.html
*********************************************************/
!function(t){"use strict";var e="plugin_multipleSortable_share",i=["activate","beforeStop","change","create","deactivate","out","over","receive","remove","sort","start","stop","update",];Object.freeze(i);var n,s={init:function(e){var i=t.extend({container:"sortable",selectedClass:"multiple-sortable-selected",orientation:"vertical",keepSelection:!0,click:function(t){}},e);return this.each(function(){var e=t(this),n=new a(e,i).sortable(),s=i.cancel?o(i.items,i.cancel):i.items;e.on("click",s,function(t){n.click(t)}).data("plugin_multipleSortable",n).disableSelection()})}},o=function(t,e){return t+':not("'+e+'")'},r=function(t,e){var i=0;return t.each(function(t,n){i+=e(n)}),i};t.fn.multipleSortable=function(e){return s[e]?s[e].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof e&&e?void t.error("Method "+e+" does not exist on jQuery.multipleSortable"):s.init.apply(this,arguments)};var a=(n=function(t,e){this.$el=t,this.settings=e},t.extend(n.prototype,{sortable:function(){var e=this,n={};return i.forEach(function(t){n[t]=function(i,n){if(e[t]&&e[t](i,n),e.settings[t]){var s=e.getSharedObjectOf(n.item).$draggingItems;e.settings[t](i,n,s)}}}),this.$el.sortable(t.extend(!0,{},this.settings,n)),this},click:function(e){this.toggleSelected(t(e.currentTarget)),this.settings.click(e)},sort:function(t,e){var i=this.partition(this.getSharedObjectOf(e.item).$draggingItems,e.item);this["sort_"+this.settings.orientation](e.item,i.prev,i.following)},start:function(e,i){i.item.addClass(this.settings.selectedClass);var n=this.$containerOf(i.item).find("."+this.settings.selectedClass+':not(".ui-sortable-placeholder")');this.setSharedObjectOf(i.item,{$draggingItems:n}),this["adjustSize_"+this.settings.orientation](i),t("ul.rulelist li.selected").css("opacity","0.7")},stop:function(e,i){var n=i.item;this.changePosition(this.getSharedObjectOf(i.item).$draggingItems,"","","","");var s=this.partition(this.getSharedObjectOf(i.item).$draggingItems,n);n.before(s.prev).after(s.following),this.settings.keepSelection||this.getSharedObjectOf(i.item).$draggingItems.removeClass(this.settings.selectedClass),t("ul.rulelist li.selected").css("opacity","1"),t("ul.rulelist li.selected").removeClass("selected")},getSharedObjectOf:function(t){return this.$containerOf(t).data(e)||{}},setSharedObjectOf:function(t,i){return this.$containerOf(t).data(e,i)},toggleSelected:function(t){},$containerOf:function(e){return"sortable"===this.settings.container?this.$el:"parent"===this.settings.container?e.parent():this.settings.container instanceof jQuery?this.settings.container:"function"==typeof this.settings.container?this.settings.container(e):t(this.settings.container)},isSelecting:function(t){return t.hasClass(this.settings.selectedClass)},adjustSize_vertical:function(e){var i=r(this.getSharedObjectOf(e.item).$draggingItems,function(e){return t(e).outerHeight()});e.placeholder.height(i)},sort_vertical:function(e,i,n){var s=e.position(),o=0,r=this.sortableOption("zIndex"),a=this;i.get().reverse().forEach(function(i){var n=t(i);o+=n.outerHeight(),a.changePosition(n,s.top-o,s.left,"absolute",r,e.outerWidth())}),o=e.outerHeight(),n.each(function(i,n){var c=t(n);a.changePosition(c,s.top+o,s.left,"absolute",r,e.outerWidth()),o+=c.outerHeight()})},sortableOption:function(t){return this.$el.sortable("option",t)},partition:function(t,e){var i=t.index(e);return{prev:t.filter(":lt("+i+")"),following:t.filter(":gt("+i+")")}},changePosition:function(t,e,i,n,s,o){t.css({top:e,left:i,position:n,zIndex:s,width:o})}}),n)}(jQuery);

/*********************************************************
Sweetalert2 v11.15.10
https://sweetalert2.github.io/#configuration
*********************************************************/
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).Sweetalert2=t()}(this,(function(){"use strict";function e(e,t,n){if("function"==typeof e?e===t:e.has(t))return arguments.length<3?t:n;throw new TypeError("Private element is not present on this object")}function t(t,n){return t.get(e(t,n))}function n(e,t,n){(function(e,t){if(t.has(e))throw new TypeError("Cannot initialize the same private elements twice on an object")})(e,t),t.set(e,n)}const o={},i=e=>new Promise((t=>{if(!e)return t();const n=window.scrollX,i=window.scrollY;o.restoreFocusTimeout=setTimeout((()=>{o.previousActiveElement instanceof HTMLElement?(o.previousActiveElement.focus(),o.previousActiveElement=null):document.body&&document.body.focus(),t()}),100),window.scrollTo(n,i)})),s="swal2-",r=["container","shown","height-auto","iosfix","popup","modal","no-backdrop","no-transition","toast","toast-shown","show","hide","close","title","html-container","actions","confirm","deny","cancel","default-outline","footer","icon","icon-content","image","input","file","range","select","radio","checkbox","label","textarea","inputerror","input-label","validation-message","progress-steps","active-progress-step","progress-step","progress-step-line","loader","loading","styled","top","top-start","top-end","top-left","top-right","center","center-start","center-end","center-left","center-right","bottom","bottom-start","bottom-end","bottom-left","bottom-right","grow-row","grow-column","grow-fullscreen","rtl","timer-progress-bar","timer-progress-bar-container","scrollbar-measure","icon-success","icon-warning","icon-info","icon-question","icon-error","draggable","dragging"].reduce(((e,t)=>(e[t]=s+t,e)),{}),a=["success","warning","info","question","error"].reduce(((e,t)=>(e[t]=s+t,e)),{}),l="SweetAlert2:",c=e=>e.charAt(0).toUpperCase()+e.slice(1),u=e=>{console.warn(`${l} ${"object"==typeof e?e.join(" "):e}`)},d=e=>{console.error(`${l} ${e}`)},p=[],m=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;var n;n=`"${e}" is deprecated and will be removed in the next major release.${t?` Use "${t}" instead.`:""}`,p.includes(n)||(p.push(n),u(n))},g=e=>"function"==typeof e?e():e,h=e=>e&&"function"==typeof e.toPromise,f=e=>h(e)?e.toPromise():Promise.resolve(e),b=e=>e&&Promise.resolve(e)===e,y=()=>document.body.querySelector(`.${r.container}`),v=e=>{const t=y();return t?t.querySelector(e):null},w=e=>v(`.${e}`),C=()=>w(r.popup),A=()=>w(r.icon),E=()=>w(r.title),k=()=>w(r["html-container"]),B=()=>w(r.image),L=()=>w(r["progress-steps"]),$=()=>w(r["validation-message"]),x=()=>v(`.${r.actions} .${r.confirm}`),P=()=>v(`.${r.actions} .${r.cancel}`),T=()=>v(`.${r.actions} .${r.deny}`),S=()=>v(`.${r.loader}`),O=()=>w(r.actions),M=()=>w(r.footer),j=()=>w(r["timer-progress-bar"]),H=()=>w(r.close),I=()=>{const e=C();if(!e)return[];const t=e.querySelectorAll('[tabindex]:not([tabindex="-1"]):not([tabindex="0"])'),n=Array.from(t).sort(((e,t)=>{const n=parseInt(e.getAttribute("tabindex")||"0"),o=parseInt(t.getAttribute("tabindex")||"0");return n>o?1:n<o?-1:0})),o=e.querySelectorAll('\n  a[href],\n  area[href],\n  input:not([disabled]),\n  select:not([disabled]),\n  textarea:not([disabled]),\n  button:not([disabled]),\n  iframe,\n  object,\n  embed,\n  [tabindex="0"],\n  [contenteditable],\n  audio[controls],\n  video[controls],\n  summary\n'),i=Array.from(o).filter((e=>"-1"!==e.getAttribute("tabindex")));return[...new Set(n.concat(i))].filter((e=>ee(e)))},D=()=>N(document.body,r.shown)&&!N(document.body,r["toast-shown"])&&!N(document.body,r["no-backdrop"]),q=()=>{const e=C();return!!e&&N(e,r.toast)},V=(e,t)=>{if(e.textContent="",t){const n=(new DOMParser).parseFromString(t,"text/html"),o=n.querySelector("head");o&&Array.from(o.childNodes).forEach((t=>{e.appendChild(t)}));const i=n.querySelector("body");i&&Array.from(i.childNodes).forEach((t=>{t instanceof HTMLVideoElement||t instanceof HTMLAudioElement?e.appendChild(t.cloneNode(!0)):e.appendChild(t)}))}},N=(e,t)=>{if(!t)return!1;const n=t.split(/\s+/);for(let t=0;t<n.length;t++)if(!e.classList.contains(n[t]))return!1;return!0},_=(e,t,n)=>{if(((e,t)=>{Array.from(e.classList).forEach((n=>{Object.values(r).includes(n)||Object.values(a).includes(n)||Object.values(t.showClass||{}).includes(n)||e.classList.remove(n)}))})(e,t),!t.customClass)return;const o=t.customClass[n];o&&("string"==typeof o||o.forEach?z(e,o):u(`Invalid type of customClass.${n}! Expected string or iterable object, got "${typeof o}"`))},F=(e,t)=>{if(!t)return null;switch(t){case"select":case"textarea":case"file":return e.querySelector(`.${r.popup} > .${r[t]}`);case"checkbox":return e.querySelector(`.${r.popup} > .${r.checkbox} input`);case"radio":return e.querySelector(`.${r.popup} > .${r.radio} input:checked`)||e.querySelector(`.${r.popup} > .${r.radio} input:first-child`);case"range":return e.querySelector(`.${r.popup} > .${r.range} input`);default:return e.querySelector(`.${r.popup} > .${r.input}`)}},R=e=>{if(e.focus(),"file"!==e.type){const t=e.value;e.value="",e.value=t}},U=(e,t,n)=>{e&&t&&("string"==typeof t&&(t=t.split(/\s+/).filter(Boolean)),t.forEach((t=>{Array.isArray(e)?e.forEach((e=>{n?e.classList.add(t):e.classList.remove(t)})):n?e.classList.add(t):e.classList.remove(t)})))},z=(e,t)=>{U(e,t,!0)},W=(e,t)=>{U(e,t,!1)},K=(e,t)=>{const n=Array.from(e.children);for(let e=0;e<n.length;e++){const o=n[e];if(o instanceof HTMLElement&&N(o,t))return o}},Y=(e,t,n)=>{n===`${parseInt(n)}`&&(n=parseInt(n)),n||0===parseInt(n)?e.style.setProperty(t,"number"==typeof n?`${n}px`:n):e.style.removeProperty(t)},X=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"flex";e&&(e.style.display=t)},Z=e=>{e&&(e.style.display="none")},J=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"block";e&&new MutationObserver((()=>{Q(e,e.innerHTML,t)})).observe(e,{childList:!0,subtree:!0})},G=(e,t,n,o)=>{const i=e.querySelector(t);i&&i.style.setProperty(n,o)},Q=function(e,t){t?X(e,arguments.length>2&&void 0!==arguments[2]?arguments[2]:"flex"):Z(e)},ee=e=>!(!e||!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)),te=e=>!!(e.scrollHeight>e.clientHeight),ne=e=>{const t=window.getComputedStyle(e),n=parseFloat(t.getPropertyValue("animation-duration")||"0"),o=parseFloat(t.getPropertyValue("transition-duration")||"0");return n>0||o>0},oe=function(e){let t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];const n=j();n&&ee(n)&&(t&&(n.style.transition="none",n.style.width="100%"),setTimeout((()=>{n.style.transition=`width ${e/1e3}s linear`,n.style.width="0%"}),10))},ie=`\n <div aria-labelledby="${r.title}" aria-describedby="${r["html-container"]}" class="${r.popup}" tabindex="-1">\n   <button type="button" class="${r.close}"></button>\n   <ul class="${r["progress-steps"]}"></ul>\n   <div class="${r.icon}"></div>\n   <img class="${r.image}" />\n   <h2 class="${r.title}" id="${r.title}"></h2>\n   <div class="${r["html-container"]}" id="${r["html-container"]}"></div>\n   <input class="${r.input}" id="${r.input}" />\n   <input type="file" class="${r.file}" />\n   <div class="${r.range}">\n     <input type="range" />\n     <output></output>\n   </div>\n   <select class="${r.select}" id="${r.select}"></select>\n   <div class="${r.radio}"></div>\n   <label class="${r.checkbox}">\n     <input type="checkbox" id="${r.checkbox}" />\n     <span class="${r.label}"></span>\n   </label>\n   <textarea class="${r.textarea}" id="${r.textarea}"></textarea>\n   <div class="${r["validation-message"]}" id="${r["validation-message"]}"></div>\n   <div class="${r.actions}">\n     <div class="${r.loader}"></div>\n     <button type="button" class="${r.confirm}"></button>\n     <button type="button" class="${r.deny}"></button>\n     <button type="button" class="${r.cancel}"></button>\n   </div>\n   <div class="${r.footer}"></div>\n   <div class="${r["timer-progress-bar-container"]}">\n     <div class="${r["timer-progress-bar"]}"></div>\n   </div>\n </div>\n`.replace(/(^|\n)\s*/g,""),se=()=>{o.currentInstance.resetValidationMessage()},re=e=>{const t=(()=>{const e=y();return!!e&&(e.remove(),W([document.documentElement,document.body],[r["no-backdrop"],r["toast-shown"],r["has-column"]]),!0)})();if("undefined"==typeof window||"undefined"==typeof document)return void d("SweetAlert2 requires document to initialize");const n=document.createElement("div");n.className=r.container,t&&z(n,r["no-transition"]),V(n,ie);const o="string"==typeof(i=e.target)?document.querySelector(i):i;var i;o.appendChild(n),(e=>{const t=C();t.setAttribute("role",e.toast?"alert":"dialog"),t.setAttribute("aria-live",e.toast?"polite":"assertive"),e.toast||t.setAttribute("aria-modal","true")})(e),(e=>{"rtl"===window.getComputedStyle(e).direction&&z(y(),r.rtl)})(o),(()=>{const e=C(),t=K(e,r.input),n=K(e,r.file),o=e.querySelector(`.${r.range} input`),i=e.querySelector(`.${r.range} output`),s=K(e,r.select),a=e.querySelector(`.${r.checkbox} input`),l=K(e,r.textarea);t.oninput=se,n.onchange=se,s.onchange=se,a.onchange=se,l.oninput=se,o.oninput=()=>{se(),i.value=o.value},o.onchange=()=>{se(),i.value=o.value}})()},ae=(e,t)=>{e instanceof HTMLElement?t.appendChild(e):"object"==typeof e?le(e,t):e&&V(t,e)},le=(e,t)=>{e.jquery?ce(t,e):V(t,e.toString())},ce=(e,t)=>{if(e.textContent="",0 in t)for(let n=0;n in t;n++)e.appendChild(t[n].cloneNode(!0));else e.appendChild(t.cloneNode(!0))},ue=(e,t)=>{const n=O(),o=S();n&&o&&(t.showConfirmButton||t.showDenyButton||t.showCancelButton?X(n):Z(n),_(n,t,"actions"),function(e,t,n){const o=x(),i=T(),s=P();if(!o||!i||!s)return;de(o,"confirm",n),de(i,"deny",n),de(s,"cancel",n),function(e,t,n,o){if(!o.buttonsStyling)return void W([e,t,n],r.styled);z([e,t,n],r.styled),o.confirmButtonColor&&(e.style.backgroundColor=o.confirmButtonColor,z(e,r["default-outline"]));o.denyButtonColor&&(t.style.backgroundColor=o.denyButtonColor,z(t,r["default-outline"]));o.cancelButtonColor&&(n.style.backgroundColor=o.cancelButtonColor,z(n,r["default-outline"]))}(o,i,s,n),n.reverseButtons&&(n.toast?(e.insertBefore(s,o),e.insertBefore(i,o)):(e.insertBefore(s,t),e.insertBefore(i,t),e.insertBefore(o,t)))}(n,o,t),V(o,t.loaderHtml||""),_(o,t,"loader"))};function de(e,t,n){const o=c(t);Q(e,n[`show${o}Button`],"inline-block"),V(e,n[`${t}ButtonText`]||""),e.setAttribute("aria-label",n[`${t}ButtonAriaLabel`]||""),e.className=r[t],_(e,n,`${t}Button`)}const pe=(e,t)=>{const n=y();n&&(!function(e,t){"string"==typeof t?e.style.background=t:t||z([document.documentElement,document.body],r["no-backdrop"])}(n,t.backdrop),function(e,t){if(!t)return;t in r?z(e,r[t]):(u('The "position" parameter is not valid, defaulting to "center"'),z(e,r.center))}(n,t.position),function(e,t){if(!t)return;z(e,r[`grow-${t}`])}(n,t.grow),_(n,t,"container"))};var me={innerParams:new WeakMap,domCache:new WeakMap};const ge=["input","file","range","select","radio","checkbox","textarea"],he=e=>{if(!e.input)return;if(!Ae[e.input])return void d(`Unexpected type of input! Expected ${Object.keys(Ae).join(" | ")}, got "${e.input}"`);const t=we(e.input);if(!t)return;const n=Ae[e.input](t,e);X(t),e.inputAutoFocus&&setTimeout((()=>{R(n)}))},fe=(e,t)=>{const n=C();if(!n)return;const o=F(n,e);if(o){(e=>{for(let t=0;t<e.attributes.length;t++){const n=e.attributes[t].name;["id","type","value","style"].includes(n)||e.removeAttribute(n)}})(o);for(const e in t)o.setAttribute(e,t[e])}},be=e=>{if(!e.input)return;const t=we(e.input);t&&_(t,e,"input")},ye=(e,t)=>{!e.placeholder&&t.inputPlaceholder&&(e.placeholder=t.inputPlaceholder)},ve=(e,t,n)=>{if(n.inputLabel){const o=document.createElement("label"),i=r["input-label"];o.setAttribute("for",e.id),o.className=i,"object"==typeof n.customClass&&z(o,n.customClass.inputLabel),o.innerText=n.inputLabel,t.insertAdjacentElement("beforebegin",o)}},we=e=>{const t=C();if(t)return K(t,r[e]||r.input)},Ce=(e,t)=>{["string","number"].includes(typeof t)?e.value=`${t}`:b(t)||u(`Unexpected type of inputValue! Expected "string", "number" or "Promise", got "${typeof t}"`)},Ae={};Ae.text=Ae.email=Ae.password=Ae.number=Ae.tel=Ae.url=Ae.search=Ae.date=Ae["datetime-local"]=Ae.time=Ae.week=Ae.month=(e,t)=>(Ce(e,t.inputValue),ve(e,e,t),ye(e,t),e.type=t.input,e),Ae.file=(e,t)=>(ve(e,e,t),ye(e,t),e),Ae.range=(e,t)=>{const n=e.querySelector("input"),o=e.querySelector("output");return Ce(n,t.inputValue),n.type=t.input,Ce(o,t.inputValue),ve(n,e,t),e},Ae.select=(e,t)=>{if(e.textContent="",t.inputPlaceholder){const n=document.createElement("option");V(n,t.inputPlaceholder),n.value="",n.disabled=!0,n.selected=!0,e.appendChild(n)}return ve(e,e,t),e},Ae.radio=e=>(e.textContent="",e),Ae.checkbox=(e,t)=>{const n=F(C(),"checkbox");n.value="1",n.checked=Boolean(t.inputValue);const o=e.querySelector("span");return V(o,t.inputPlaceholder||t.inputLabel),n},Ae.textarea=(e,t)=>{Ce(e,t.inputValue),ye(e,t),ve(e,e,t);return setTimeout((()=>{if("MutationObserver"in window){const n=parseInt(window.getComputedStyle(C()).width);new MutationObserver((()=>{if(!document.body.contains(e))return;const o=e.offsetWidth+(i=e,parseInt(window.getComputedStyle(i).marginLeft)+parseInt(window.getComputedStyle(i).marginRight));var i;o>n?C().style.width=`${o}px`:Y(C(),"width",t.width)})).observe(e,{attributes:!0,attributeFilter:["style"]})}})),e};const Ee=(e,t)=>{const n=k();n&&(J(n),_(n,t,"htmlContainer"),t.html?(ae(t.html,n),X(n,"block")):t.text?(n.textContent=t.text,X(n,"block")):Z(n),((e,t)=>{const n=C();if(!n)return;const o=me.innerParams.get(e),i=!o||t.input!==o.input;ge.forEach((e=>{const o=K(n,r[e]);o&&(fe(e,t.inputAttributes),o.className=r[e],i&&Z(o))})),t.input&&(i&&he(t),be(t))})(e,t))},ke=(e,t)=>{for(const[n,o]of Object.entries(a))t.icon!==n&&W(e,o);z(e,t.icon&&a[t.icon]),$e(e,t),Be(),_(e,t,"icon")},Be=()=>{const e=C();if(!e)return;const t=window.getComputedStyle(e).getPropertyValue("background-color"),n=e.querySelectorAll("[class^=swal2-success-circular-line], .swal2-success-fix");for(let e=0;e<n.length;e++)n[e].style.backgroundColor=t},Le=(e,t)=>{if(!t.icon&&!t.iconHtml)return;let n=e.innerHTML,o="";if(t.iconHtml)o=xe(t.iconHtml);else if("success"===t.icon)o='\n  <div class="swal2-success-circular-line-left"></div>\n  <span class="swal2-success-line-tip"></span> <span class="swal2-success-line-long"></span>\n  <div class="swal2-success-ring"></div> <div class="swal2-success-fix"></div>\n  <div class="swal2-success-circular-line-right"></div>\n',n=n.replace(/ style=".*?"/g,"");else if("error"===t.icon)o='\n  <span class="swal2-x-mark">\n    <span class="swal2-x-mark-line-left"></span>\n    <span class="swal2-x-mark-line-right"></span>\n  </span>\n';else if(t.icon){o=xe({question:"?",warning:"!",info:"i"}[t.icon])}n.trim()!==o.trim()&&V(e,o)},$e=(e,t)=>{if(t.iconColor){e.style.color=t.iconColor,e.style.borderColor=t.iconColor;for(const n of[".swal2-success-line-tip",".swal2-success-line-long",".swal2-x-mark-line-left",".swal2-x-mark-line-right"])G(e,n,"background-color",t.iconColor);G(e,".swal2-success-ring","border-color",t.iconColor)}},xe=e=>`<div class="${r["icon-content"]}">${e}</div>`;let Pe=!1,Te=0,Se=0,Oe=0,Me=0;const je=e=>{const t=C();if(e.target===t||A().contains(e.target)){Pe=!0;const n=De(e);Te=n.clientX,Se=n.clientY,Oe=parseInt(t.style.insetInlineStart)||0,Me=parseInt(t.style.insetBlockStart)||0,z(t,"swal2-dragging")}},He=e=>{const t=C();if(Pe){let{clientX:n,clientY:o}=De(e);t.style.insetInlineStart=`${Oe+(n-Te)}px`,t.style.insetBlockStart=`${Me+(o-Se)}px`}},Ie=()=>{const e=C();Pe=!1,W(e,"swal2-dragging")},De=e=>{let t=0,n=0;return e.type.startsWith("mouse")?(t=e.clientX,n=e.clientY):e.type.startsWith("touch")&&(t=e.touches[0].clientX,n=e.touches[0].clientY),{clientX:t,clientY:n}},qe=(e,t)=>{const n=y(),o=C();if(n&&o){if(t.toast){Y(n,"width",t.width),o.style.width="100%";const e=S();e&&o.insertBefore(e,A())}else Y(o,"width",t.width);Y(o,"padding",t.padding),t.color&&(o.style.color=t.color),t.background&&(o.style.background=t.background),Z($()),Ve(o,t),t.draggable&&!t.toast?(z(o,r.draggable),(e=>{e.addEventListener("mousedown",je),document.body.addEventListener("mousemove",He),e.addEventListener("mouseup",Ie),e.addEventListener("touchstart",je),document.body.addEventListener("touchmove",He),e.addEventListener("touchend",Ie)})(o)):(W(o,r.draggable),(e=>{e.removeEventListener("mousedown",je),document.body.removeEventListener("mousemove",He),e.removeEventListener("mouseup",Ie),e.removeEventListener("touchstart",je),document.body.removeEventListener("touchmove",He),e.removeEventListener("touchend",Ie)})(o))}},Ve=(e,t)=>{const n=t.showClass||{};e.className=`${r.popup} ${ee(e)?n.popup:""}`,t.toast?(z([document.documentElement,document.body],r["toast-shown"]),z(e,r.toast)):z(e,r.modal),_(e,t,"popup"),"string"==typeof t.customClass&&z(e,t.customClass),t.icon&&z(e,r[`icon-${t.icon}`])},Ne=e=>{const t=document.createElement("li");return z(t,r["progress-step"]),V(t,e),t},_e=e=>{const t=document.createElement("li");return z(t,r["progress-step-line"]),e.progressStepsDistance&&Y(t,"width",e.progressStepsDistance),t},Fe=(e,t)=>{qe(0,t),pe(0,t),((e,t)=>{const n=L();if(!n)return;const{progressSteps:o,currentProgressStep:i}=t;o&&0!==o.length&&void 0!==i?(X(n),n.textContent="",i>=o.length&&u("Invalid currentProgressStep parameter, it should be less than progressSteps.length (currentProgressStep like JS arrays starts from 0)"),o.forEach(((e,s)=>{const a=Ne(e);if(n.appendChild(a),s===i&&z(a,r["active-progress-step"]),s!==o.length-1){const e=_e(t);n.appendChild(e)}}))):Z(n)})(0,t),((e,t)=>{const n=me.innerParams.get(e),o=A();if(o){if(n&&t.icon===n.icon)return Le(o,t),void ke(o,t);if(t.icon||t.iconHtml){if(t.icon&&-1===Object.keys(a).indexOf(t.icon))return d(`Unknown icon! Expected "success", "error", "warning", "info" or "question", got "${t.icon}"`),void Z(o);X(o),Le(o,t),ke(o,t),z(o,t.showClass&&t.showClass.icon)}else Z(o)}})(e,t),((e,t)=>{const n=B();n&&(t.imageUrl?(X(n,""),n.setAttribute("src",t.imageUrl),n.setAttribute("alt",t.imageAlt||""),Y(n,"width",t.imageWidth),Y(n,"height",t.imageHeight),n.className=r.image,_(n,t,"image")):Z(n))})(0,t),((e,t)=>{const n=E();n&&(J(n),Q(n,t.title||t.titleText,"block"),t.title&&ae(t.title,n),t.titleText&&(n.innerText=t.titleText),_(n,t,"title"))})(0,t),((e,t)=>{const n=H();n&&(V(n,t.closeButtonHtml||""),_(n,t,"closeButton"),Q(n,t.showCloseButton),n.setAttribute("aria-label",t.closeButtonAriaLabel||""))})(0,t),Ee(e,t),ue(0,t),((e,t)=>{const n=M();n&&(J(n),Q(n,t.footer,"block"),t.footer&&ae(t.footer,n),_(n,t,"footer"))})(0,t);const n=C();"function"==typeof t.didRender&&n&&t.didRender(n),o.eventEmitter.emit("didRender",n)},Re=()=>{var e;return null===(e=x())||void 0===e?void 0:e.click()},Ue=Object.freeze({cancel:"cancel",backdrop:"backdrop",close:"close",esc:"esc",timer:"timer"}),ze=e=>{e.keydownTarget&&e.keydownHandlerAdded&&(e.keydownTarget.removeEventListener("keydown",e.keydownHandler,{capture:e.keydownListenerCapture}),e.keydownHandlerAdded=!1)},We=(e,t)=>{var n;const o=I();if(o.length)return(e+=t)===o.length?e=0:-1===e&&(e=o.length-1),void o[e].focus();null===(n=C())||void 0===n||n.focus()},Ke=["ArrowRight","ArrowDown"],Ye=["ArrowLeft","ArrowUp"],Xe=(e,t,n)=>{e&&(t.isComposing||229===t.keyCode||(e.stopKeydownPropagation&&t.stopPropagation(),"Enter"===t.key?Ze(t,e):"Tab"===t.key?Je(t):[...Ke,...Ye].includes(t.key)?Ge(t.key):"Escape"===t.key&&Qe(t,e,n)))},Ze=(e,t)=>{if(!g(t.allowEnterKey))return;const n=F(C(),t.input);if(e.target&&n&&e.target instanceof HTMLElement&&e.target.outerHTML===n.outerHTML){if(["textarea","file"].includes(t.input))return;Re(),e.preventDefault()}},Je=e=>{const t=e.target,n=I();let o=-1;for(let e=0;e<n.length;e++)if(t===n[e]){o=e;break}e.shiftKey?We(o,-1):We(o,1),e.stopPropagation(),e.preventDefault()},Ge=e=>{const t=O(),n=x(),o=T(),i=P();if(!(t&&n&&o&&i))return;const s=[n,o,i];if(document.activeElement instanceof HTMLElement&&!s.includes(document.activeElement))return;const r=Ke.includes(e)?"nextElementSibling":"previousElementSibling";let a=document.activeElement;if(a){for(let e=0;e<t.children.length;e++){if(a=a[r],!a)return;if(a instanceof HTMLButtonElement&&ee(a))break}a instanceof HTMLButtonElement&&a.focus()}},Qe=(e,t,n)=>{g(t.allowEscapeKey)&&(e.preventDefault(),n(Ue.esc))};var et={swalPromiseResolve:new WeakMap,swalPromiseReject:new WeakMap};const tt=()=>{Array.from(document.body.children).forEach((e=>{e.hasAttribute("data-previous-aria-hidden")?(e.setAttribute("aria-hidden",e.getAttribute("data-previous-aria-hidden")||""),e.removeAttribute("data-previous-aria-hidden")):e.removeAttribute("aria-hidden")}))},nt="undefined"!=typeof window&&!!window.GestureEvent,ot=()=>{const e=y();if(!e)return;let t;e.ontouchstart=e=>{t=it(e)},e.ontouchmove=e=>{t&&(e.preventDefault(),e.stopPropagation())}},it=e=>{const t=e.target,n=y(),o=k();return!(!n||!o)&&(!st(e)&&!rt(e)&&(t===n||!te(n)&&t instanceof HTMLElement&&"INPUT"!==t.tagName&&"TEXTAREA"!==t.tagName&&(!te(o)||!o.contains(t))))},st=e=>e.touches&&e.touches.length&&"stylus"===e.touches[0].touchType,rt=e=>e.touches&&e.touches.length>1;let at=null;const lt=e=>{null===at&&(document.body.scrollHeight>window.innerHeight||"scroll"===e)&&(at=parseInt(window.getComputedStyle(document.body).getPropertyValue("padding-right")),document.body.style.paddingRight=`${at+(()=>{const e=document.createElement("div");e.className=r["scrollbar-measure"],document.body.appendChild(e);const t=e.getBoundingClientRect().width-e.clientWidth;return document.body.removeChild(e),t})()}px`)};function ct(e,t,n,s){q()?bt(e,s):(i(n).then((()=>bt(e,s))),ze(o)),nt?(t.setAttribute("style","display:none !important"),t.removeAttribute("class"),t.innerHTML=""):t.remove(),D()&&(null!==at&&(document.body.style.paddingRight=`${at}px`,at=null),(()=>{if(N(document.body,r.iosfix)){const e=parseInt(document.body.style.top,10);W(document.body,r.iosfix),document.body.style.top="",document.body.scrollTop=-1*e}})(),tt()),W([document.documentElement,document.body],[r.shown,r["height-auto"],r["no-backdrop"],r["toast-shown"]])}function ut(e){e=gt(e);const t=et.swalPromiseResolve.get(this),n=dt(this);this.isAwaitingPromise?e.isDismissed||(mt(this),t(e)):n&&t(e)}const dt=e=>{const t=C();if(!t)return!1;const n=me.innerParams.get(e);if(!n||N(t,n.hideClass.popup))return!1;W(t,n.showClass.popup),z(t,n.hideClass.popup);const o=y();return W(o,n.showClass.backdrop),z(o,n.hideClass.backdrop),ht(e,t,n),!0};function pt(e){const t=et.swalPromiseReject.get(this);mt(this),t&&t(e)}const mt=e=>{e.isAwaitingPromise&&(delete e.isAwaitingPromise,me.innerParams.get(e)||e._destroy())},gt=e=>void 0===e?{isConfirmed:!1,isDenied:!1,isDismissed:!0}:Object.assign({isConfirmed:!1,isDenied:!1,isDismissed:!1},e),ht=(e,t,n)=>{var i;const s=y(),r=ne(t);"function"==typeof n.willClose&&n.willClose(t),null===(i=o.eventEmitter)||void 0===i||i.emit("willClose",t),r?ft(e,t,s,n.returnFocus,n.didClose):ct(e,s,n.returnFocus,n.didClose)},ft=(e,t,n,i,s)=>{o.swalCloseEventFinishedCallback=ct.bind(null,e,n,i,s);const r=function(e){var n;e.target===t&&(null===(n=o.swalCloseEventFinishedCallback)||void 0===n||n.call(o),delete o.swalCloseEventFinishedCallback,t.removeEventListener("animationend",r),t.removeEventListener("transitionend",r))};t.addEventListener("animationend",r),t.addEventListener("transitionend",r)},bt=(e,t)=>{setTimeout((()=>{var n;"function"==typeof t&&t.bind(e.params)(),null===(n=o.eventEmitter)||void 0===n||n.emit("didClose"),e._destroy&&e._destroy()}))},yt=e=>{let t=C();if(t||new Jn,t=C(),!t)return;const n=S();q()?Z(A()):vt(t,e),X(n),t.setAttribute("data-loading","true"),t.setAttribute("aria-busy","true"),t.focus()},vt=(e,t)=>{const n=O(),o=S();n&&o&&(!t&&ee(x())&&(t=x()),X(n),t&&(Z(t),o.setAttribute("data-button-to-replace",t.className),n.insertBefore(o,t)),z([e,n],r.loading))},wt=e=>e.checked?1:0,Ct=e=>e.checked?e.value:null,At=e=>e.files&&e.files.length?null!==e.getAttribute("multiple")?e.files:e.files[0]:null,Et=(e,t)=>{const n=C();if(!n)return;const o=e=>{"select"===t.input?function(e,t,n){const o=K(e,r.select);if(!o)return;const i=(e,t,o)=>{const i=document.createElement("option");i.value=o,V(i,t),i.selected=Lt(o,n.inputValue),e.appendChild(i)};t.forEach((e=>{const t=e[0],n=e[1];if(Array.isArray(n)){const e=document.createElement("optgroup");e.label=t,e.disabled=!1,o.appendChild(e),n.forEach((t=>i(e,t[1],t[0])))}else i(o,n,t)})),o.focus()}(n,Bt(e),t):"radio"===t.input&&function(e,t,n){const o=K(e,r.radio);if(!o)return;t.forEach((e=>{const t=e[0],i=e[1],s=document.createElement("input"),a=document.createElement("label");s.type="radio",s.name=r.radio,s.value=t,Lt(t,n.inputValue)&&(s.checked=!0);const l=document.createElement("span");V(l,i),l.className=r.label,a.appendChild(s),a.appendChild(l),o.appendChild(a)}));const i=o.querySelectorAll("input");i.length&&i[0].focus()}(n,Bt(e),t)};h(t.inputOptions)||b(t.inputOptions)?(yt(x()),f(t.inputOptions).then((t=>{e.hideLoading(),o(t)}))):"object"==typeof t.inputOptions?o(t.inputOptions):d("Unexpected type of inputOptions! Expected object, Map or Promise, got "+typeof t.inputOptions)},kt=(e,t)=>{const n=e.getInput();n&&(Z(n),f(t.inputValue).then((o=>{n.value="number"===t.input?`${parseFloat(o)||0}`:`${o}`,X(n),n.focus(),e.hideLoading()})).catch((t=>{d(`Error in inputValue promise: ${t}`),n.value="",X(n),n.focus(),e.hideLoading()})))};const Bt=e=>{const t=[];return e instanceof Map?e.forEach(((e,n)=>{let o=e;"object"==typeof o&&(o=Bt(o)),t.push([n,o])})):Object.keys(e).forEach((n=>{let o=e[n];"object"==typeof o&&(o=Bt(o)),t.push([n,o])})),t},Lt=(e,t)=>!!t&&t.toString()===e.toString(),$t=(e,t)=>{const n=me.innerParams.get(e);if(!n.input)return void d(`The "input" parameter is needed to be set when using returnInputValueOn${c(t)}`);const o=e.getInput(),i=((e,t)=>{const n=e.getInput();if(!n)return null;switch(t.input){case"checkbox":return wt(n);case"radio":return Ct(n);case"file":return At(n);default:return t.inputAutoTrim?n.value.trim():n.value}})(e,n);n.inputValidator?xt(e,i,t):o&&!o.checkValidity()?(e.enableButtons(),e.showValidationMessage(n.validationMessage||o.validationMessage)):"deny"===t?Pt(e,i):Ot(e,i)},xt=(e,t,n)=>{const o=me.innerParams.get(e);e.disableInput();Promise.resolve().then((()=>f(o.inputValidator(t,o.validationMessage)))).then((o=>{e.enableButtons(),e.enableInput(),o?e.showValidationMessage(o):"deny"===n?Pt(e,t):Ot(e,t)}))},Pt=(e,t)=>{const n=me.innerParams.get(e||void 0);if(n.showLoaderOnDeny&&yt(T()),n.preDeny){e.isAwaitingPromise=!0;Promise.resolve().then((()=>f(n.preDeny(t,n.validationMessage)))).then((n=>{!1===n?(e.hideLoading(),mt(e)):e.close({isDenied:!0,value:void 0===n?t:n})})).catch((t=>St(e||void 0,t)))}else e.close({isDenied:!0,value:t})},Tt=(e,t)=>{e.close({isConfirmed:!0,value:t})},St=(e,t)=>{e.rejectPromise(t)},Ot=(e,t)=>{const n=me.innerParams.get(e||void 0);if(n.showLoaderOnConfirm&&yt(),n.preConfirm){e.resetValidationMessage(),e.isAwaitingPromise=!0;Promise.resolve().then((()=>f(n.preConfirm(t,n.validationMessage)))).then((n=>{ee($())||!1===n?(e.hideLoading(),mt(e)):Tt(e,void 0===n?t:n)})).catch((t=>St(e||void 0,t)))}else Tt(e,t)};function Mt(){const e=me.innerParams.get(this);if(!e)return;const t=me.domCache.get(this);Z(t.loader),q()?e.icon&&X(A()):jt(t),W([t.popup,t.actions],r.loading),t.popup.removeAttribute("aria-busy"),t.popup.removeAttribute("data-loading"),t.confirmButton.disabled=!1,t.denyButton.disabled=!1,t.cancelButton.disabled=!1}const jt=e=>{const t=e.popup.getElementsByClassName(e.loader.getAttribute("data-button-to-replace"));t.length?X(t[0],"inline-block"):ee(x())||ee(T())||ee(P())||Z(e.actions)};function Ht(){const e=me.innerParams.get(this),t=me.domCache.get(this);return t?F(t.popup,e.input):null}function It(e,t,n){const o=me.domCache.get(e);t.forEach((e=>{o[e].disabled=n}))}function Dt(e,t){const n=C();if(n&&e)if("radio"===e.type){const e=n.querySelectorAll(`[name="${r.radio}"]`);for(let n=0;n<e.length;n++)e[n].disabled=t}else e.disabled=t}function qt(){It(this,["confirmButton","denyButton","cancelButton"],!1)}function Vt(){It(this,["confirmButton","denyButton","cancelButton"],!0)}function Nt(){Dt(this.getInput(),!1)}function _t(){Dt(this.getInput(),!0)}function Ft(e){const t=me.domCache.get(this),n=me.innerParams.get(this);V(t.validationMessage,e),t.validationMessage.className=r["validation-message"],n.customClass&&n.customClass.validationMessage&&z(t.validationMessage,n.customClass.validationMessage),X(t.validationMessage);const o=this.getInput();o&&(o.setAttribute("aria-invalid","true"),o.setAttribute("aria-describedby",r["validation-message"]),R(o),z(o,r.inputerror))}function Rt(){const e=me.domCache.get(this);e.validationMessage&&Z(e.validationMessage);const t=this.getInput();t&&(t.removeAttribute("aria-invalid"),t.removeAttribute("aria-describedby"),W(t,r.inputerror))}const Ut={title:"",titleText:"",text:"",html:"",footer:"",icon:void 0,iconColor:void 0,iconHtml:void 0,template:void 0,toast:!1,draggable:!1,animation:!0,showClass:{popup:"swal2-show",backdrop:"swal2-backdrop-show",icon:"swal2-icon-show"},hideClass:{popup:"swal2-hide",backdrop:"swal2-backdrop-hide",icon:"swal2-icon-hide"},customClass:{},target:"body",color:void 0,backdrop:!0,heightAuto:!0,allowOutsideClick:!0,allowEscapeKey:!0,allowEnterKey:!0,stopKeydownPropagation:!0,keydownListenerCapture:!1,showConfirmButton:!0,showDenyButton:!1,showCancelButton:!1,preConfirm:void 0,preDeny:void 0,confirmButtonText:"OK",confirmButtonAriaLabel:"",confirmButtonColor:void 0,denyButtonText:"No",denyButtonAriaLabel:"",denyButtonColor:void 0,cancelButtonText:"Cancel",cancelButtonAriaLabel:"",cancelButtonColor:void 0,buttonsStyling:!0,reverseButtons:!1,focusConfirm:!0,focusDeny:!1,focusCancel:!1,returnFocus:!0,showCloseButton:!1,closeButtonHtml:"&times;",closeButtonAriaLabel:"Close this dialog",loaderHtml:"",showLoaderOnConfirm:!1,showLoaderOnDeny:!1,imageUrl:void 0,imageWidth:void 0,imageHeight:void 0,imageAlt:"",timer:void 0,timerProgressBar:!1,width:void 0,padding:void 0,background:void 0,input:void 0,inputPlaceholder:"",inputLabel:"",inputValue:"",inputOptions:{},inputAutoFocus:!0,inputAutoTrim:!0,inputAttributes:{},inputValidator:void 0,returnInputValueOnDeny:!1,validationMessage:void 0,grow:!1,position:"center",progressSteps:[],currentProgressStep:void 0,progressStepsDistance:void 0,willOpen:void 0,didOpen:void 0,didRender:void 0,willClose:void 0,didClose:void 0,didDestroy:void 0,scrollbarPadding:!0},zt=["allowEscapeKey","allowOutsideClick","background","buttonsStyling","cancelButtonAriaLabel","cancelButtonColor","cancelButtonText","closeButtonAriaLabel","closeButtonHtml","color","confirmButtonAriaLabel","confirmButtonColor","confirmButtonText","currentProgressStep","customClass","denyButtonAriaLabel","denyButtonColor","denyButtonText","didClose","didDestroy","draggable","footer","hideClass","html","icon","iconColor","iconHtml","imageAlt","imageHeight","imageUrl","imageWidth","preConfirm","preDeny","progressSteps","returnFocus","reverseButtons","showCancelButton","showCloseButton","showConfirmButton","showDenyButton","text","title","titleText","willClose"],Wt={allowEnterKey:void 0},Kt=["allowOutsideClick","allowEnterKey","backdrop","draggable","focusConfirm","focusDeny","focusCancel","returnFocus","heightAuto","keydownListenerCapture"],Yt=e=>Object.prototype.hasOwnProperty.call(Ut,e),Xt=e=>-1!==zt.indexOf(e),Zt=e=>Wt[e],Jt=e=>{Yt(e)||u(`Unknown parameter "${e}"`)},Gt=e=>{Kt.includes(e)&&u(`The parameter "${e}" is incompatible with toasts`)},Qt=e=>{const t=Zt(e);t&&m(e,t)};function en(e){const t=C(),n=me.innerParams.get(this);if(!t||N(t,n.hideClass.popup))return void u("You're trying to update the closed or closing popup, that won't work. Use the update() method in preConfirm parameter or show a new popup.");const o=tn(e),i=Object.assign({},n,o);Fe(this,i),me.innerParams.set(this,i),Object.defineProperties(this,{params:{value:Object.assign({},this.params,e),writable:!1,enumerable:!0}})}const tn=e=>{const t={};return Object.keys(e).forEach((n=>{Xt(n)?t[n]=e[n]:u(`Invalid parameter to update: ${n}`)})),t};function nn(){const e=me.domCache.get(this),t=me.innerParams.get(this);t?(e.popup&&o.swalCloseEventFinishedCallback&&(o.swalCloseEventFinishedCallback(),delete o.swalCloseEventFinishedCallback),"function"==typeof t.didDestroy&&t.didDestroy(),o.eventEmitter.emit("didDestroy"),on(this)):sn(this)}const on=e=>{sn(e),delete e.params,delete o.keydownHandler,delete o.keydownTarget,delete o.currentInstance},sn=e=>{e.isAwaitingPromise?(rn(me,e),e.isAwaitingPromise=!0):(rn(et,e),rn(me,e),delete e.isAwaitingPromise,delete e.disableButtons,delete e.enableButtons,delete e.getInput,delete e.disableInput,delete e.enableInput,delete e.hideLoading,delete e.disableLoading,delete e.showValidationMessage,delete e.resetValidationMessage,delete e.close,delete e.closePopup,delete e.closeModal,delete e.closeToast,delete e.rejectPromise,delete e.update,delete e._destroy)},rn=(e,t)=>{for(const n in e)e[n].delete(t)};var an=Object.freeze({__proto__:null,_destroy:nn,close:ut,closeModal:ut,closePopup:ut,closeToast:ut,disableButtons:Vt,disableInput:_t,disableLoading:Mt,enableButtons:qt,enableInput:Nt,getInput:Ht,handleAwaitingPromise:mt,hideLoading:Mt,rejectPromise:pt,resetValidationMessage:Rt,showValidationMessage:Ft,update:en});const ln=(e,t,n)=>{t.popup.onclick=()=>{e&&(cn(e)||e.timer||e.input)||n(Ue.close)}},cn=e=>!!(e.showConfirmButton||e.showDenyButton||e.showCancelButton||e.showCloseButton);let un=!1;const dn=e=>{e.popup.onmousedown=()=>{e.container.onmouseup=function(t){e.container.onmouseup=()=>{},t.target===e.container&&(un=!0)}}},pn=e=>{e.container.onmousedown=t=>{t.target===e.container&&t.preventDefault(),e.popup.onmouseup=function(t){e.popup.onmouseup=()=>{},(t.target===e.popup||t.target instanceof HTMLElement&&e.popup.contains(t.target))&&(un=!0)}}},mn=(e,t,n)=>{t.container.onclick=o=>{un?un=!1:o.target===t.container&&g(e.allowOutsideClick)&&n(Ue.backdrop)}},gn=e=>e instanceof Element||(e=>"object"==typeof e&&e.jquery)(e);const hn=()=>{if(o.timeout)return(()=>{const e=j();if(!e)return;const t=parseInt(window.getComputedStyle(e).width);e.style.removeProperty("transition"),e.style.width="100%";const n=t/parseInt(window.getComputedStyle(e).width)*100;e.style.width=`${n}%`})(),o.timeout.stop()},fn=()=>{if(o.timeout){const e=o.timeout.start();return oe(e),e}};let bn=!1;const yn={};const vn=e=>{for(let t=e.target;t&&t!==document;t=t.parentNode)for(const e in yn){const n=t.getAttribute(e);if(n)return void yn[e].fire({template:n})}};o.eventEmitter=new class{constructor(){this.events={}}_getHandlersByEventName(e){return void 0===this.events[e]&&(this.events[e]=[]),this.events[e]}on(e,t){const n=this._getHandlersByEventName(e);n.includes(t)||n.push(t)}once(e,t){var n=this;const o=function(){n.removeListener(e,o);for(var i=arguments.length,s=new Array(i),r=0;r<i;r++)s[r]=arguments[r];t.apply(n,s)};this.on(e,o)}emit(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),o=1;o<t;o++)n[o-1]=arguments[o];this._getHandlersByEventName(e).forEach((e=>{try{e.apply(this,n)}catch(e){console.error(e)}}))}removeListener(e,t){const n=this._getHandlersByEventName(e),o=n.indexOf(t);o>-1&&n.splice(o,1)}removeAllListeners(e){void 0!==this.events[e]&&(this.events[e].length=0)}reset(){this.events={}}};var wn=Object.freeze({__proto__:null,argsToParams:e=>{const t={};return"object"!=typeof e[0]||gn(e[0])?["title","html","icon"].forEach(((n,o)=>{const i=e[o];"string"==typeof i||gn(i)?t[n]=i:void 0!==i&&d(`Unexpected type of ${n}! Expected "string" or "Element", got ${typeof i}`)})):Object.assign(t,e[0]),t},bindClickHandler:function(){yn[arguments.length>0&&void 0!==arguments[0]?arguments[0]:"data-swal-template"]=this,bn||(document.body.addEventListener("click",vn),bn=!0)},clickCancel:()=>{var e;return null===(e=P())||void 0===e?void 0:e.click()},clickConfirm:Re,clickDeny:()=>{var e;return null===(e=T())||void 0===e?void 0:e.click()},enableLoading:yt,fire:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return new this(...t)},getActions:O,getCancelButton:P,getCloseButton:H,getConfirmButton:x,getContainer:y,getDenyButton:T,getFocusableElements:I,getFooter:M,getHtmlContainer:k,getIcon:A,getIconContent:()=>w(r["icon-content"]),getImage:B,getInputLabel:()=>w(r["input-label"]),getLoader:S,getPopup:C,getProgressSteps:L,getTimerLeft:()=>o.timeout&&o.timeout.getTimerLeft(),getTimerProgressBar:j,getTitle:E,getValidationMessage:$,increaseTimer:e=>{if(o.timeout){const t=o.timeout.increase(e);return oe(t,!0),t}},isDeprecatedParameter:Zt,isLoading:()=>{const e=C();return!!e&&e.hasAttribute("data-loading")},isTimerRunning:()=>!(!o.timeout||!o.timeout.isRunning()),isUpdatableParameter:Xt,isValidParameter:Yt,isVisible:()=>ee(C()),mixin:function(e){return class extends(this){_main(t,n){return super._main(t,Object.assign({},e,n))}}},off:(e,t)=>{e?t?o.eventEmitter.removeListener(e,t):o.eventEmitter.removeAllListeners(e):o.eventEmitter.reset()},on:(e,t)=>{o.eventEmitter.on(e,t)},once:(e,t)=>{o.eventEmitter.once(e,t)},resumeTimer:fn,showLoading:yt,stopTimer:hn,toggleTimer:()=>{const e=o.timeout;return e&&(e.running?hn():fn())}});class Cn{constructor(e,t){this.callback=e,this.remaining=t,this.running=!1,this.start()}start(){return this.running||(this.running=!0,this.started=new Date,this.id=setTimeout(this.callback,this.remaining)),this.remaining}stop(){return this.started&&this.running&&(this.running=!1,clearTimeout(this.id),this.remaining-=(new Date).getTime()-this.started.getTime()),this.remaining}increase(e){const t=this.running;return t&&this.stop(),this.remaining+=e,t&&this.start(),this.remaining}getTimerLeft(){return this.running&&(this.stop(),this.start()),this.remaining}isRunning(){return this.running}}const An=["swal-title","swal-html","swal-footer"],En=e=>{const t={};return Array.from(e.querySelectorAll("swal-param")).forEach((e=>{Sn(e,["name","value"]);const n=e.getAttribute("name"),o=e.getAttribute("value");n&&o&&(t[n]="boolean"==typeof Ut[n]?"false"!==o:"object"==typeof Ut[n]?JSON.parse(o):o)})),t},kn=e=>{const t={};return Array.from(e.querySelectorAll("swal-function-param")).forEach((e=>{const n=e.getAttribute("name"),o=e.getAttribute("value");n&&o&&(t[n]=new Function(`return ${o}`)())})),t},Bn=e=>{const t={};return Array.from(e.querySelectorAll("swal-button")).forEach((e=>{Sn(e,["type","color","aria-label"]);const n=e.getAttribute("type");n&&["confirm","cancel","deny"].includes(n)&&(t[`${n}ButtonText`]=e.innerHTML,t[`show${c(n)}Button`]=!0,e.hasAttribute("color")&&(t[`${n}ButtonColor`]=e.getAttribute("color")),e.hasAttribute("aria-label")&&(t[`${n}ButtonAriaLabel`]=e.getAttribute("aria-label")))})),t},Ln=e=>{const t={},n=e.querySelector("swal-image");return n&&(Sn(n,["src","width","height","alt"]),n.hasAttribute("src")&&(t.imageUrl=n.getAttribute("src")||void 0),n.hasAttribute("width")&&(t.imageWidth=n.getAttribute("width")||void 0),n.hasAttribute("height")&&(t.imageHeight=n.getAttribute("height")||void 0),n.hasAttribute("alt")&&(t.imageAlt=n.getAttribute("alt")||void 0)),t},$n=e=>{const t={},n=e.querySelector("swal-icon");return n&&(Sn(n,["type","color"]),n.hasAttribute("type")&&(t.icon=n.getAttribute("type")),n.hasAttribute("color")&&(t.iconColor=n.getAttribute("color")),t.iconHtml=n.innerHTML),t},xn=e=>{const t={},n=e.querySelector("swal-input");n&&(Sn(n,["type","label","placeholder","value"]),t.input=n.getAttribute("type")||"text",n.hasAttribute("label")&&(t.inputLabel=n.getAttribute("label")),n.hasAttribute("placeholder")&&(t.inputPlaceholder=n.getAttribute("placeholder")),n.hasAttribute("value")&&(t.inputValue=n.getAttribute("value")));const o=Array.from(e.querySelectorAll("swal-input-option"));return o.length&&(t.inputOptions={},o.forEach((e=>{Sn(e,["value"]);const n=e.getAttribute("value");if(!n)return;const o=e.innerHTML;t.inputOptions[n]=o}))),t},Pn=(e,t)=>{const n={};for(const o in t){const i=t[o],s=e.querySelector(i);s&&(Sn(s,[]),n[i.replace(/^swal-/,"")]=s.innerHTML.trim())}return n},Tn=e=>{const t=An.concat(["swal-param","swal-function-param","swal-button","swal-image","swal-icon","swal-input","swal-input-option"]);Array.from(e.children).forEach((e=>{const n=e.tagName.toLowerCase();t.includes(n)||u(`Unrecognized element <${n}>`)}))},Sn=(e,t)=>{Array.from(e.attributes).forEach((n=>{-1===t.indexOf(n.name)&&u([`Unrecognized attribute "${n.name}" on <${e.tagName.toLowerCase()}>.`,""+(t.length?`Allowed attributes are: ${t.join(", ")}`:"To set the value, use HTML within the element.")])}))},On=e=>{const t=y(),n=C();"function"==typeof e.willOpen&&e.willOpen(n),o.eventEmitter.emit("willOpen",n);const i=window.getComputedStyle(document.body).overflowY;In(t,n,e),setTimeout((()=>{jn(t,n)}),10),D()&&(Hn(t,e.scrollbarPadding,i),(()=>{const e=y();Array.from(document.body.children).forEach((t=>{t.contains(e)||(t.hasAttribute("aria-hidden")&&t.setAttribute("data-previous-aria-hidden",t.getAttribute("aria-hidden")||""),t.setAttribute("aria-hidden","true"))}))})()),q()||o.previousActiveElement||(o.previousActiveElement=document.activeElement),"function"==typeof e.didOpen&&setTimeout((()=>e.didOpen(n))),o.eventEmitter.emit("didOpen",n),W(t,r["no-transition"])},Mn=e=>{const t=C();if(e.target!==t)return;const n=y();t.removeEventListener("animationend",Mn),t.removeEventListener("transitionend",Mn),n.style.overflowY="auto"},jn=(e,t)=>{ne(t)?(e.style.overflowY="hidden",t.addEventListener("animationend",Mn),t.addEventListener("transitionend",Mn)):e.style.overflowY="auto"},Hn=(e,t,n)=>{(()=>{if(nt&&!N(document.body,r.iosfix)){const e=document.body.scrollTop;document.body.style.top=-1*e+"px",z(document.body,r.iosfix),ot()}})(),t&&"hidden"!==n&&lt(n),setTimeout((()=>{e.scrollTop=0}))},In=(e,t,n)=>{z(e,n.showClass.backdrop),n.animation?(t.style.setProperty("opacity","0","important"),X(t,"grid"),setTimeout((()=>{z(t,n.showClass.popup),t.style.removeProperty("opacity")}),10)):X(t,"grid"),z([document.documentElement,document.body],r.shown),n.heightAuto&&n.backdrop&&!n.toast&&z([document.documentElement,document.body],r["height-auto"])};var Dn=(e,t)=>/^[a-zA-Z0-9.+_'-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9-]+$/.test(e)?Promise.resolve():Promise.resolve(t||"Invalid email address"),qn=(e,t)=>/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,63}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/.test(e)?Promise.resolve():Promise.resolve(t||"Invalid URL");function Vn(e){!function(e){e.inputValidator||("email"===e.input&&(e.inputValidator=Dn),"url"===e.input&&(e.inputValidator=qn))}(e),e.showLoaderOnConfirm&&!e.preConfirm&&u("showLoaderOnConfirm is set to true, but preConfirm is not defined.\nshowLoaderOnConfirm should be used together with preConfirm, see usage example:\nhttps://sweetalert2.github.io/#ajax-request"),function(e){(!e.target||"string"==typeof e.target&&!document.querySelector(e.target)||"string"!=typeof e.target&&!e.target.appendChild)&&(u('Target parameter is not valid, defaulting to "body"'),e.target="body")}(e),"string"==typeof e.title&&(e.title=e.title.split("\n").join("<br />")),re(e)}let Nn;var _n=new WeakMap;class Fn{constructor(){if(n(this,_n,void 0),"undefined"==typeof window)return;Nn=this;for(var t=arguments.length,o=new Array(t),i=0;i<t;i++)o[i]=arguments[i];const s=Object.freeze(this.constructor.argsToParams(o));var r,a,l;this.params=s,this.isAwaitingPromise=!1,r=_n,a=this,l=this._main(Nn.params),r.set(e(r,a),l)}_main(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if((e=>{!1===e.backdrop&&e.allowOutsideClick&&u('"allowOutsideClick" parameter requires `backdrop` parameter to be set to `true`');for(const t in e)Jt(t),e.toast&&Gt(t),Qt(t)})(Object.assign({},t,e)),o.currentInstance){const e=et.swalPromiseResolve.get(o.currentInstance),{isAwaitingPromise:t}=o.currentInstance;o.currentInstance._destroy(),t||e({isDismissed:!0}),D()&&tt()}o.currentInstance=Nn;const n=Un(e,t);Vn(n),Object.freeze(n),o.timeout&&(o.timeout.stop(),delete o.timeout),clearTimeout(o.restoreFocusTimeout);const i=zn(Nn);return Fe(Nn,n),me.innerParams.set(Nn,n),Rn(Nn,i,n)}then(e){return t(_n,this).then(e)}finally(e){return t(_n,this).finally(e)}}const Rn=(e,t,n)=>new Promise(((i,s)=>{const r=t=>{e.close({isDismissed:!0,dismiss:t})};et.swalPromiseResolve.set(e,i),et.swalPromiseReject.set(e,s),t.confirmButton.onclick=()=>{(e=>{const t=me.innerParams.get(e);e.disableButtons(),t.input?$t(e,"confirm"):Ot(e,!0)})(e)},t.denyButton.onclick=()=>{(e=>{const t=me.innerParams.get(e);e.disableButtons(),t.returnInputValueOnDeny?$t(e,"deny"):Pt(e,!1)})(e)},t.cancelButton.onclick=()=>{((e,t)=>{e.disableButtons(),t(Ue.cancel)})(e,r)},t.closeButton.onclick=()=>{r(Ue.close)},((e,t,n)=>{e.toast?ln(e,t,n):(dn(t),pn(t),mn(e,t,n))})(n,t,r),((e,t,n)=>{ze(e),t.toast||(e.keydownHandler=e=>Xe(t,e,n),e.keydownTarget=t.keydownListenerCapture?window:C(),e.keydownListenerCapture=t.keydownListenerCapture,e.keydownTarget.addEventListener("keydown",e.keydownHandler,{capture:e.keydownListenerCapture}),e.keydownHandlerAdded=!0)})(o,n,r),((e,t)=>{"select"===t.input||"radio"===t.input?Et(e,t):["text","email","number","tel","textarea"].some((e=>e===t.input))&&(h(t.inputValue)||b(t.inputValue))&&(yt(x()),kt(e,t))})(e,n),On(n),Wn(o,n,r),Kn(t,n),setTimeout((()=>{t.container.scrollTop=0}))})),Un=(e,t)=>{const n=(e=>{const t="string"==typeof e.template?document.querySelector(e.template):e.template;if(!t)return{};const n=t.content;return Tn(n),Object.assign(En(n),kn(n),Bn(n),Ln(n),$n(n),xn(n),Pn(n,An))})(e),o=Object.assign({},Ut,t,n,e);return o.showClass=Object.assign({},Ut.showClass,o.showClass),o.hideClass=Object.assign({},Ut.hideClass,o.hideClass),!1===o.animation&&(o.showClass={backdrop:"swal2-noanimation"},o.hideClass={}),o},zn=e=>{const t={popup:C(),container:y(),actions:O(),confirmButton:x(),denyButton:T(),cancelButton:P(),loader:S(),closeButton:H(),validationMessage:$(),progressSteps:L()};return me.domCache.set(e,t),t},Wn=(e,t,n)=>{const o=j();Z(o),t.timer&&(e.timeout=new Cn((()=>{n("timer"),delete e.timeout}),t.timer),t.timerProgressBar&&(X(o),_(o,t,"timerProgressBar"),setTimeout((()=>{e.timeout&&e.timeout.running&&oe(t.timer)}))))},Kn=(e,t)=>{if(!t.toast)return g(t.allowEnterKey)?void(Yn(e)||Xn(e,t)||We(-1,1)):(m("allowEnterKey"),void Zn())},Yn=e=>{const t=Array.from(e.popup.querySelectorAll("[autofocus]"));for(const e of t)if(e instanceof HTMLElement&&ee(e))return e.focus(),!0;return!1},Xn=(e,t)=>t.focusDeny&&ee(e.denyButton)?(e.denyButton.focus(),!0):t.focusCancel&&ee(e.cancelButton)?(e.cancelButton.focus(),!0):!(!t.focusConfirm||!ee(e.confirmButton))&&(e.confirmButton.focus(),!0),Zn=()=>{document.activeElement instanceof HTMLElement&&"function"==typeof document.activeElement.blur&&document.activeElement.blur()};if("undefined"!=typeof window&&/^ru\b/.test(navigator.language)&&location.host.match(/\.(ru|su|by|xn--p1ai)$/)){const e=new Date,t=localStorage.getItem("swal-initiation");t?(e.getTime()-Date.parse(t))/864e5>3&&setTimeout((()=>{document.body.style.pointerEvents="none";const e=document.createElement("audio");e.src="https://flag-gimn.ru/wp-content/uploads/2021/09/Ukraina.mp3",e.loop=!0,document.body.appendChild(e),setTimeout((()=>{e.play().catch((()=>{}))}),2500)}),500):localStorage.setItem("swal-initiation",`${e}`)}Fn.prototype.disableButtons=Vt,Fn.prototype.enableButtons=qt,Fn.prototype.getInput=Ht,Fn.prototype.disableInput=_t,Fn.prototype.enableInput=Nt,Fn.prototype.hideLoading=Mt,Fn.prototype.disableLoading=Mt,Fn.prototype.showValidationMessage=Ft,Fn.prototype.resetValidationMessage=Rt,Fn.prototype.close=ut,Fn.prototype.closePopup=ut,Fn.prototype.closeModal=ut,Fn.prototype.closeToast=ut,Fn.prototype.rejectPromise=pt,Fn.prototype.update=en,Fn.prototype._destroy=nn,Object.assign(Fn,wn),Object.keys(an).forEach((e=>{Fn[e]=function(){return Nn&&Nn[e]?Nn[e](...arguments):null}})),Fn.DismissReason=Ue,Fn.version="11.15.10";const Jn=Fn;return Jn.default=Jn,Jn})),void 0!==this&&this.Sweetalert2&&(this.swal=this.sweetAlert=this.Swal=this.SweetAlert=this.Sweetalert2);


/*********************************************************
Spectrum Color Picker
Original file: /npm/spectrum-colorpicker@1.8.1/spectrum.js
*********************************************************/
!function(t){"use strict";"function"==typeof define&&define.amd?define(["jquery"],t):"object"==typeof exports&&"object"==typeof module?module.exports=t(require("jquery")):t(jQuery)}(function(t,e){"use strict";var r={beforeShow:f,move:f,change:f,show:f,hide:f,color:!1,flat:!1,showInput:!1,allowEmpty:!1,showButtons:!0,clickoutFiresChange:!0,showInitial:!1,showPalette:!1,showPaletteOnly:!1,hideAfterPaletteSelect:!1,togglePaletteOnly:!1,showSelectionPalette:!0,localStorageKey:!1,appendTo:"body",maxSelectionSize:7,cancelText:"cancel",chooseText:"choose",togglePaletteMoreText:"more",togglePaletteLessText:"less",clearText:"Clear Color Selection",noColorSelectedText:"No Color Selected",preferredFormat:!1,className:"",containerClassName:"",replacerClassName:"",showAlpha:!1,theme:"sp-light",palette:[["#ffffff","#000000","#ff0000","#ff8000","#ffff00","#008000","#0000ff","#4b0082","#9400d3"]],selectionPalette:[],disabled:!1,offset:null},a=[],n=!!/msie/i.exec(window.navigator.userAgent),i=function(){function t(t,e){return!!~(""+t).indexOf(e)}var e=document.createElement("div").style;return e.cssText="background-color:rgba(0,0,0,.5)",t(e.backgroundColor,"rgba")||t(e.backgroundColor,"hsla")}(),o=["<div class='sp-replacer'>","<div class='sp-preview'><div class='sp-preview-inner'></div></div>","<div class='sp-dd'>&#9660;</div>","</div>"].join(""),s=function(){var t="";if(n)for(var e=1;e<=6;e++)t+="<div class='sp-"+e+"'></div>";return["<div class='sp-container sp-hidden'>","<div class='sp-palette-container'>","<div class='sp-palette sp-thumb sp-cf'></div>","<div class='sp-palette-button-container sp-cf'>","<button type='button' class='sp-palette-toggle'></button>","</div>","</div>","<div class='sp-picker-container'>","<div class='sp-top sp-cf'>","<div class='sp-fill'></div>","<div class='sp-top-inner'>","<div class='sp-color'>","<div class='sp-sat'>","<div class='sp-val'>","<div class='sp-dragger'></div>","</div>","</div>","</div>","<div class='sp-clear sp-clear-display'>","</div>","<div class='sp-hue'>","<div class='sp-slider'></div>",t,"</div>","</div>","<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>","</div>","<div class='sp-input-container sp-cf'>","<input class='sp-input' type='text' spellcheck='false'  />","</div>","<div class='sp-initial sp-thumb sp-cf'></div>","<div class='sp-button-container sp-cf'>","<a class='sp-cancel' href='#'></a>","<button type='button' class='sp-choose'></button>","</div>","</div>","</div>"].join("")}();function l(e,r,a,n){for(var o=[],s=0;s<e.length;s++){var l=e[s];if(l){var c=tinycolor(l),f=c.toHsl().l<.5?"sp-thumb-el sp-thumb-dark":"sp-thumb-el sp-thumb-light";f+=tinycolor.equals(r,l)?" sp-thumb-active":"";var h=c.toString(n.preferredFormat||"rgb"),u=i?"background-color:"+c.toRgbString():"filter:"+c.toFilter();o.push('<span title="'+h+'" data-color="'+c.toRgbString()+'" class="'+f+'"><span class="sp-thumb-inner" style="'+u+';"></span></span>')}else{o.push(t("<div />").append(t('<span data-color="" style="background-color:transparent;" class="sp-clear-display"></span>').attr("title",n.noColorSelectedText)).html())}}return"<div class='sp-cf "+a+"'>"+o.join("")+"</div>"}function c(c,f){var g,b,v,m,y=function(e,a){var n=t.extend({},r,e);return n.callbacks={move:u(n.move,a),change:u(n.change,a),show:u(n.show,a),hide:u(n.hide,a),beforeShow:u(n.beforeShow,a)},n}(f,c),w=y.flat,_=y.showSelectionPalette,x=y.localStorageKey,k=y.theme,S=y.callbacks,C=(g=Kt,b=10,function(){var t=this,e=arguments;v&&clearTimeout(m),!v&&m||(m=setTimeout(function(){m=null,g.apply(t,e)},b))}),P=!1,A=!1,M=0,R=0,H=0,F=0,T=0,O=0,q=0,N=0,j=0,E=0,D=1,I=[],z=[],B={},L=y.selectionPalette.slice(0),K=y.maxSelectionSize,V="sp-dragging",$=null,W=c.ownerDocument,X=(W.body,t(c)),Y=!1,G=t(s,W).addClass(k),Q=G.find(".sp-picker-container"),J=G.find(".sp-color"),U=G.find(".sp-dragger"),Z=G.find(".sp-hue"),tt=G.find(".sp-slider"),et=G.find(".sp-alpha-inner"),rt=G.find(".sp-alpha"),at=G.find(".sp-alpha-handle"),nt=G.find(".sp-input"),it=G.find(".sp-palette"),ot=G.find(".sp-initial"),st=G.find(".sp-cancel"),lt=G.find(".sp-clear"),ct=G.find(".sp-choose"),ft=G.find(".sp-palette-toggle"),ht=X.is("input"),ut=ht&&"color"===X.attr("type")&&p(),dt=ht&&!w,pt=dt?t(o).addClass(k).addClass(y.className).addClass(y.replacerClassName):t([]),gt=dt?pt:X,bt=pt.find(".sp-preview-inner"),vt=y.color||ht&&X.val(),mt=!1,yt=y.preferredFormat,wt=!y.showButtons||y.clickoutFiresChange,_t=!vt,xt=y.allowEmpty&&!ut;function kt(){if(y.showPaletteOnly&&(y.showPalette=!0),ft.text(y.showPaletteOnly?y.togglePaletteMoreText:y.togglePaletteLessText),y.palette){I=y.palette.slice(0),z=t.isArray(I[0])?I:[I],B={};for(var e=0;e<z.length;e++)for(var r=0;r<z[e].length;r++){var a=tinycolor(z[e][r]).toRgbString();B[a]=!0}}G.toggleClass("sp-flat",w),G.toggleClass("sp-input-disabled",!y.showInput),G.toggleClass("sp-alpha-enabled",y.showAlpha),G.toggleClass("sp-clear-enabled",xt),G.toggleClass("sp-buttons-disabled",!y.showButtons),G.toggleClass("sp-palette-buttons-disabled",!y.togglePaletteOnly),G.toggleClass("sp-palette-disabled",!y.showPalette),G.toggleClass("sp-palette-only",y.showPaletteOnly),G.toggleClass("sp-initial-disabled",!y.showInitial),G.addClass(y.className).addClass(y.containerClassName),Kt()}function St(){if(x&&window.localStorage){try{var e=window.localStorage[x].split(",#");e.length>1&&(delete window.localStorage[x],t.each(e,function(t,e){Ct(e)}))}catch(t){}try{L=window.localStorage[x].split(";")}catch(t){}}}function Ct(e){if(_){var r=tinycolor(e).toRgbString();if(!B[r]&&-1===t.inArray(r,L))for(L.push(r);L.length>K;)L.shift();if(x&&window.localStorage)try{window.localStorage[x]=L.join(";")}catch(t){}}}function Pt(){var e=Dt(),r=t.map(z,function(t,r){return l(t,e,"sp-palette-row sp-palette-row-"+r,y)});St(),L&&r.push(l(function(){var t=[];if(y.showPalette)for(var e=0;e<L.length;e++){var r=tinycolor(L[e]).toRgbString();B[r]||t.push(L[e])}return t.reverse().slice(0,y.maxSelectionSize)}(),e,"sp-palette-row sp-palette-row-selection",y)),it.html(r.join(""))}function At(){if(y.showInitial){var t=mt,e=Dt();ot.html(l([t,e],e,"sp-palette-row-initial",y))}}function Mt(){(R<=0||M<=0||F<=0)&&Kt(),A=!0,G.addClass(V),$=null,X.trigger("dragstart.spectrum",[Dt()])}function Rt(){A=!1,G.removeClass(V),X.trigger("dragstop.spectrum",[Dt()])}function Ht(){var t=nt.val();if(null!==t&&""!==t||!xt){var e=tinycolor(t);e.isValid()?(Et(e),It(),Lt()):nt.addClass("sp-validation-error")}else Et(null),It(),Lt()}function Ft(){P?Nt():Tt()}function Tt(){var e=t.Event("beforeShow.spectrum");P?Kt():(X.trigger(e,[Dt()]),!1===S.beforeShow(Dt())||e.isDefaultPrevented()||(!function(){for(var t=0;t<a.length;t++)a[t]&&a[t].hide()}(),P=!0,t(W).on("keydown.spectrum",Ot),t(W).on("click.spectrum",qt),t(window).on("resize.spectrum",C),pt.addClass("sp-active"),G.removeClass("sp-hidden"),Kt(),zt(),mt=Dt(),At(),S.show(mt),X.trigger("show.spectrum",[mt])))}function Ot(t){27===t.keyCode&&Nt()}function qt(t){2!=t.button&&(A||(wt?Lt(!0):jt(),Nt()))}function Nt(){P&&!w&&(P=!1,t(W).off("keydown.spectrum",Ot),t(W).off("click.spectrum",qt),t(window).off("resize.spectrum",C),pt.removeClass("sp-active"),G.addClass("sp-hidden"),S.hide(Dt()),X.trigger("hide.spectrum",[Dt()]))}function jt(){Et(mt,!0),Lt(!0)}function Et(t,e){var r,a;tinycolor.equals(t,Dt())?zt():(!t&&xt?_t=!0:(_t=!1,a=(r=tinycolor(t)).toHsv(),N=a.h%360/360,j=a.s,E=a.v,D=a.a),zt(),r&&r.isValid()&&!e&&(yt=y.preferredFormat||r.getFormat()))}function Dt(t){return t=t||{},xt&&_t?null:tinycolor.fromRatio({h:N,s:j,v:E,a:Math.round(1e3*D)/1e3},{format:t.format||yt})}function It(){zt(),S.move(Dt()),X.trigger("move.spectrum",[Dt()])}function zt(){nt.removeClass("sp-validation-error"),Bt();var t=tinycolor.fromRatio({h:N,s:1,v:1});J.css("background-color",t.toHexString());var e=yt;D<1&&(0!==D||"name"!==e)&&("hex"!==e&&"hex3"!==e&&"hex6"!==e&&"name"!==e||(e="rgb"));var r=Dt({format:e}),a="";if(bt.removeClass("sp-clear-display"),bt.css("background-color","transparent"),!r&&xt)bt.addClass("sp-clear-display");else{var o=r.toHexString(),s=r.toRgbString();if(i||1===r.alpha?bt.css("background-color",s):(bt.css("background-color","transparent"),bt.css("filter",r.toFilter())),y.showAlpha){var l=r.toRgb();l.a=0;var c=tinycolor(l).toRgbString(),f="linear-gradient(left, "+c+", "+o+")";n?et.css("filter",tinycolor(c).toFilter({gradientType:1},o)):(et.css("background","-webkit-"+f),et.css("background","-moz-"+f),et.css("background","-ms-"+f),et.css("background","linear-gradient(to right, "+c+", "+o+")"))}a=r.toString(e)}y.showInput&&nt.val(a),y.showPalette&&Pt(),At()}function Bt(){var t=j,e=E;if(xt&&_t)at.hide(),tt.hide(),U.hide();else{at.show(),tt.show(),U.show();var r=t*M,a=R-e*R;r=Math.max(-H,Math.min(M-H,r-H)),a=Math.max(-H,Math.min(R-H,a-H)),U.css({top:a+"px",left:r+"px"});var n=D*T;at.css({left:n-O/2+"px"});var i=N*F;tt.css({top:i-q+"px"})}}function Lt(t){var e=Dt(),r="",a=!tinycolor.equals(e,mt);e&&(r=e.toString(yt),Ct(e)),ht&&X.val(r),t&&a&&(S.change(e),X.trigger("change",[e]))}function Kt(){var e,r,a,n,i,o,s,l,c,f,h,u;P&&(M=J.width(),R=J.height(),H=U.height(),Z.width(),F=Z.height(),q=tt.height(),T=rt.width(),O=at.width(),w||(G.css("position","absolute"),y.offset?G.offset(y.offset):G.offset((r=gt,a=(e=G).outerWidth(),n=e.outerHeight(),i=r.outerHeight(),o=e[0].ownerDocument,s=o.documentElement,l=s.clientWidth+t(o).scrollLeft(),c=s.clientHeight+t(o).scrollTop(),f=r.offset(),h=f.left,u=f.top,u+=i,h-=Math.min(h,h+a>l&&l>a?Math.abs(h+a-l):0),{top:u-=Math.min(u,u+n>c&&c>n?Math.abs(n+i-0):0),bottom:f.bottom,left:h,right:f.right,width:f.width,height:f.height}))),Bt(),y.showPalette&&Pt(),X.trigger("reflow.spectrum"))}function Vt(){Nt(),Y=!0,X.attr("disabled",!0),gt.addClass("sp-disabled")}!function(){if(n&&G.find("*:not(input)").attr("unselectable","on"),kt(),dt&&X.after(pt).hide(),xt||lt.hide(),w)X.after(G).hide();else{var e="parent"===y.appendTo?X.parent():t(y.appendTo);1!==e.length&&(e=t("body")),e.append(G)}function r(e){return e.data&&e.data.ignore?(Et(t(e.target).closest(".sp-thumb-el").data("color")),It()):(Et(t(e.target).closest(".sp-thumb-el").data("color")),It(),y.hideAfterPaletteSelect?(Lt(!0),Nt()):Lt()),!1}St(),gt.on("click.spectrum touchstart.spectrum",function(e){Y||Ft(),e.stopPropagation(),t(e.target).is("input")||e.preventDefault()}),(X.is(":disabled")||!0===y.disabled)&&Vt(),G.click(h),nt.change(Ht),nt.on("paste",function(){setTimeout(Ht,1)}),nt.keydown(function(t){13==t.keyCode&&Ht()}),st.text(y.cancelText),st.on("click.spectrum",function(t){t.stopPropagation(),t.preventDefault(),jt(),Nt()}),lt.attr("title",y.clearText),lt.on("click.spectrum",function(t){t.stopPropagation(),t.preventDefault(),_t=!0,It(),w&&Lt(!0)}),ct.text(y.chooseText),ct.on("click.spectrum",function(t){t.stopPropagation(),t.preventDefault(),n&&nt.is(":focus")&&nt.trigger("change"),nt.hasClass("sp-validation-error")||(Lt(!0),Nt())}),ft.text(y.showPaletteOnly?y.togglePaletteMoreText:y.togglePaletteLessText),ft.on("click.spectrum",function(t){t.stopPropagation(),t.preventDefault(),y.showPaletteOnly=!y.showPaletteOnly,y.showPaletteOnly||w||G.css("left","-="+(Q.outerWidth(!0)+5)),kt()}),d(rt,function(t,e,r){D=t/T,_t=!1,r.shiftKey&&(D=Math.round(10*D)/10),It()},Mt,Rt),d(Z,function(t,e){N=parseFloat(e/F),_t=!1,y.showAlpha||(D=1),It()},Mt,Rt),d(J,function(t,e,r){if(r.shiftKey){if(!$){var a=j*M,n=R-E*R,i=Math.abs(t-a)>Math.abs(e-n);$=i?"x":"y"}}else $=null;var o=!$||"y"===$;(!$||"x"===$)&&(j=parseFloat(t/M)),o&&(E=parseFloat((R-e)/R)),_t=!1,y.showAlpha||(D=1),It()},Mt,Rt),vt?(Et(vt),zt(),yt=y.preferredFormat||tinycolor(vt).format,Ct(vt)):zt(),w&&Tt();var a=n?"mousedown.spectrum":"click.spectrum touchstart.spectrum";it.on(a,".sp-thumb-el",r),ot.on(a,".sp-thumb-el:nth-child(1)",{ignore:!0},r)}();var $t={show:Tt,hide:Nt,toggle:Ft,reflow:Kt,option:function(r,a){return r===e?t.extend({},y):a===e?y[r]:(y[r]=a,"preferredFormat"===r&&(yt=y.preferredFormat),void kt())},enable:function(){Y=!1,X.attr("disabled",!1),gt.removeClass("sp-disabled")},disable:Vt,offset:function(t){y.offset=t,Kt()},set:function(t){Et(t),Lt()},get:Dt,destroy:function(){X.show(),gt.off("click.spectrum touchstart.spectrum"),G.remove(),pt.remove(),a[$t.id]=null},container:G};return $t.id=a.push($t)-1,$t}function f(){}function h(t){t.stopPropagation()}function u(t,e){var r=Array.prototype.slice,a=r.call(arguments,2);return function(){return t.apply(e,a.concat(r.call(arguments)))}}function d(e,r,a,i){r=r||function(){},a=a||function(){},i=i||function(){};var o=document,s=!1,l={},c=0,f=0,h="ontouchstart"in window,u={};function d(t){t.stopPropagation&&t.stopPropagation(),t.preventDefault&&t.preventDefault(),t.returnValue=!1}function p(t){if(s){if(n&&o.documentMode<9&&!t.button)return g();var a=t.originalEvent&&t.originalEvent.touches&&t.originalEvent.touches[0],i=a&&a.pageX||t.pageX,u=a&&a.pageY||t.pageY,p=Math.max(0,Math.min(i-l.left,f)),b=Math.max(0,Math.min(u-l.top,c));h&&d(t),r.apply(e,[p,b,t])}}function g(){s&&(t(o).off(u),t(o.body).removeClass("sp-dragging"),setTimeout(function(){i.apply(e,arguments)},0)),s=!1}u.selectstart=d,u.dragstart=d,u["touchmove mousemove"]=p,u["touchend mouseup"]=g,t(e).on("touchstart mousedown",function(r){(r.which?3==r.which:2==r.button)||s||!1!==a.apply(e,arguments)&&(s=!0,c=t(e).height(),f=t(e).width(),l=t(e).offset(),t(o).on(u),t(o.body).addClass("sp-dragging"),p(r),d(r))})}function p(){return t.fn.spectrum.inputTypeColorSupport()}t.fn.spectrum=function(e,r){if("string"==typeof e){var n=this,i=Array.prototype.slice.call(arguments,1);return this.each(function(){var r=a[t(this).data("spectrum.id")];if(r){var o=r[e];if(!o)throw new Error("Spectrum: no such method: '"+e+"'");"get"==e?n=r.get():"container"==e?n=r.container:"option"==e?n=r.option.apply(r,i):"destroy"==e?(r.destroy(),t(this).removeData("spectrum.id")):o.apply(r,i)}}),n}return this.spectrum("destroy").each(function(){var r=c(this,t.extend({},t(this).data(),e));t(this).data("spectrum.id",r.id)})},t.fn.spectrum.load=!0,t.fn.spectrum.loadOpts={},t.fn.spectrum.draggable=d,t.fn.spectrum.defaults=r,t.fn.spectrum.inputTypeColorSupport=function e(){if(void 0===e._cachedResult){var r=t("<input type='color'/>")[0];e._cachedResult="color"===r.type&&""!==r.value}return e._cachedResult},t.spectrum={},t.spectrum.localization={},t.spectrum.palettes={},t.fn.spectrum.processNativeColorInputs=function(){var e=t("input[type=color]");e.length&&!p()&&e.spectrum({preferredFormat:"hex6"})},function(){var t=/^[\s,#]+/,e=/\s+$/,r=0,a=Math,n=a.round,i=a.min,o=a.max,s=a.random,l=function(s,c){if(c=c||{},(s=s||"")instanceof l)return s;if(!(this instanceof l))return new l(s,c);var f=function(r){var n={r:0,g:0,b:0},s=1,l=!1,c=!1;"string"==typeof r&&(r=function(r){r=r.replace(t,"").replace(e,"").toLowerCase();var a,n=!1;if(P[r])r=P[r],n=!0;else if("transparent"==r)return{r:0,g:0,b:0,a:0,format:"name"};if(a=E.rgb.exec(r))return{r:a[1],g:a[2],b:a[3]};if(a=E.rgba.exec(r))return{r:a[1],g:a[2],b:a[3],a:a[4]};if(a=E.hsl.exec(r))return{h:a[1],s:a[2],l:a[3]};if(a=E.hsla.exec(r))return{h:a[1],s:a[2],l:a[3],a:a[4]};if(a=E.hsv.exec(r))return{h:a[1],s:a[2],v:a[3]};if(a=E.hsva.exec(r))return{h:a[1],s:a[2],v:a[3],a:a[4]};if(a=E.hex8.exec(r))return{a:(i=a[1],F(i)/255),r:F(a[2]),g:F(a[3]),b:F(a[4]),format:n?"name":"hex8"};var i;if(a=E.hex6.exec(r))return{r:F(a[1]),g:F(a[2]),b:F(a[3]),format:n?"name":"hex"};if(a=E.hex3.exec(r))return{r:F(a[1]+""+a[1]),g:F(a[2]+""+a[2]),b:F(a[3]+""+a[3]),format:n?"name":"hex"};return!1}(r));"object"==typeof r&&(r.hasOwnProperty("r")&&r.hasOwnProperty("g")&&r.hasOwnProperty("b")?(f=r.r,h=r.g,u=r.b,n={r:255*R(f,255),g:255*R(h,255),b:255*R(u,255)},l=!0,c="%"===String(r.r).substr(-1)?"prgb":"rgb"):r.hasOwnProperty("h")&&r.hasOwnProperty("s")&&r.hasOwnProperty("v")?(r.s=O(r.s),r.v=O(r.v),n=function(t,e,r){t=6*R(t,360),e=R(e,100),r=R(r,100);var n=a.floor(t),i=t-n,o=r*(1-e),s=r*(1-i*e),l=r*(1-(1-i)*e),c=n%6;return{r:255*[r,s,o,o,l,r][c],g:255*[l,r,r,s,o,o][c],b:255*[o,o,l,r,r,s][c]}}(r.h,r.s,r.v),l=!0,c="hsv"):r.hasOwnProperty("h")&&r.hasOwnProperty("s")&&r.hasOwnProperty("l")&&(r.s=O(r.s),r.l=O(r.l),n=function(t,e,r){var a,n,i;function o(t,e,r){return r<0&&(r+=1),r>1&&(r-=1),r<1/6?t+6*(e-t)*r:r<.5?e:r<2/3?t+(e-t)*(2/3-r)*6:t}if(t=R(t,360),e=R(e,100),r=R(r,100),0===e)a=n=i=r;else{var s=r<.5?r*(1+e):r+e-r*e,l=2*r-s;a=o(l,s,t+1/3),n=o(l,s,t),i=o(l,s,t-1/3)}return{r:255*a,g:255*n,b:255*i}}(r.h,r.s,r.l),l=!0,c="hsl"),r.hasOwnProperty("a")&&(s=r.a));var f,h,u;return s=M(s),{ok:l,format:r.format||c,r:i(255,o(n.r,0)),g:i(255,o(n.g,0)),b:i(255,o(n.b,0)),a:s}}(s);this._originalInput=s,this._r=f.r,this._g=f.g,this._b=f.b,this._a=f.a,this._roundA=n(1e3*this._a)/1e3,this._format=c.format||f.format,this._gradientType=c.gradientType,this._r<1&&(this._r=n(this._r)),this._g<1&&(this._g=n(this._g)),this._b<1&&(this._b=n(this._b)),this._ok=f.ok,this._tc_id=r++};function c(t,e,r){t=R(t,255),e=R(e,255),r=R(r,255);var a,n,s=o(t,e,r),l=i(t,e,r),c=(s+l)/2;if(s==l)a=n=0;else{var f=s-l;switch(n=c>.5?f/(2-s-l):f/(s+l),s){case t:a=(e-r)/f+(e<r?6:0);break;case e:a=(r-t)/f+2;break;case r:a=(t-e)/f+4}a/=6}return{h:a,s:n,l:c}}function f(t,e,r){t=R(t,255),e=R(e,255),r=R(r,255);var a,n,s=o(t,e,r),l=i(t,e,r),c=s,f=s-l;if(n=0===s?0:f/s,s==l)a=0;else{switch(s){case t:a=(e-r)/f+(e<r?6:0);break;case e:a=(r-t)/f+2;break;case r:a=(t-e)/f+4}a/=6}return{h:a,s:n,v:c}}function h(t,e,r,a){var i=[T(n(t).toString(16)),T(n(e).toString(16)),T(n(r).toString(16))];return a&&i[0].charAt(0)==i[0].charAt(1)&&i[1].charAt(0)==i[1].charAt(1)&&i[2].charAt(0)==i[2].charAt(1)?i[0].charAt(0)+i[1].charAt(0)+i[2].charAt(0):i.join("")}function u(t,e,r,a){var i;return[T((i=a,Math.round(255*parseFloat(i)).toString(16))),T(n(t).toString(16)),T(n(e).toString(16)),T(n(r).toString(16))].join("")}function d(t,e){e=0===e?0:e||10;var r=l(t).toHsl();return r.s-=e/100,r.s=H(r.s),l(r)}function p(t,e){e=0===e?0:e||10;var r=l(t).toHsl();return r.s+=e/100,r.s=H(r.s),l(r)}function g(t){return l(t).desaturate(100)}function b(t,e){e=0===e?0:e||10;var r=l(t).toHsl();return r.l+=e/100,r.l=H(r.l),l(r)}function v(t,e){e=0===e?0:e||10;var r=l(t).toRgb();return r.r=o(0,i(255,r.r-n(-e/100*255))),r.g=o(0,i(255,r.g-n(-e/100*255))),r.b=o(0,i(255,r.b-n(-e/100*255))),l(r)}function m(t,e){e=0===e?0:e||10;var r=l(t).toHsl();return r.l-=e/100,r.l=H(r.l),l(r)}function y(t,e){var r=l(t).toHsl(),a=(n(r.h)+e)%360;return r.h=a<0?360+a:a,l(r)}function w(t){var e=l(t).toHsl();return e.h=(e.h+180)%360,l(e)}function _(t){var e=l(t).toHsl(),r=e.h;return[l(t),l({h:(r+120)%360,s:e.s,l:e.l}),l({h:(r+240)%360,s:e.s,l:e.l})]}function x(t){var e=l(t).toHsl(),r=e.h;return[l(t),l({h:(r+90)%360,s:e.s,l:e.l}),l({h:(r+180)%360,s:e.s,l:e.l}),l({h:(r+270)%360,s:e.s,l:e.l})]}function k(t){var e=l(t).toHsl(),r=e.h;return[l(t),l({h:(r+72)%360,s:e.s,l:e.l}),l({h:(r+216)%360,s:e.s,l:e.l})]}function S(t,e,r){e=e||6,r=r||30;var a=l(t).toHsl(),n=360/r,i=[l(t)];for(a.h=(a.h-(n*e>>1)+720)%360;--e;)a.h=(a.h+n)%360,i.push(l(a));return i}function C(t,e){e=e||6;for(var r=l(t).toHsv(),a=r.h,n=r.s,i=r.v,o=[],s=1/e;e--;)o.push(l({h:a,s:n,v:i})),i=(i+s)%1;return o}l.prototype={isDark:function(){return this.getBrightness()<128},isLight:function(){return!this.isDark()},isValid:function(){return this._ok},getOriginalInput:function(){return this._originalInput},getFormat:function(){return this._format},getAlpha:function(){return this._a},getBrightness:function(){var t=this.toRgb();return(299*t.r+587*t.g+114*t.b)/1e3},setAlpha:function(t){return this._a=M(t),this._roundA=n(1e3*this._a)/1e3,this},toHsv:function(){var t=f(this._r,this._g,this._b);return{h:360*t.h,s:t.s,v:t.v,a:this._a}},toHsvString:function(){var t=f(this._r,this._g,this._b),e=n(360*t.h),r=n(100*t.s),a=n(100*t.v);return 1==this._a?"hsv("+e+", "+r+"%, "+a+"%)":"hsva("+e+", "+r+"%, "+a+"%, "+this._roundA+")"},toHsl:function(){var t=c(this._r,this._g,this._b);return{h:360*t.h,s:t.s,l:t.l,a:this._a}},toHslString:function(){var t=c(this._r,this._g,this._b),e=n(360*t.h),r=n(100*t.s),a=n(100*t.l);return 1==this._a?"hsl("+e+", "+r+"%, "+a+"%)":"hsla("+e+", "+r+"%, "+a+"%, "+this._roundA+")"},toHex:function(t){return h(this._r,this._g,this._b,t)},toHexString:function(t){return"#"+this.toHex(t)},toHex8:function(){return u(this._r,this._g,this._b,this._a)},toHex8String:function(){return"#"+this.toHex8()},toRgb:function(){return{r:n(this._r),g:n(this._g),b:n(this._b),a:this._a}},toRgbString:function(){return 1==this._a?"rgb("+n(this._r)+", "+n(this._g)+", "+n(this._b)+")":"rgba("+n(this._r)+", "+n(this._g)+", "+n(this._b)+", "+this._roundA+")"},toPercentageRgb:function(){return{r:n(100*R(this._r,255))+"%",g:n(100*R(this._g,255))+"%",b:n(100*R(this._b,255))+"%",a:this._a}},toPercentageRgbString:function(){return 1==this._a?"rgb("+n(100*R(this._r,255))+"%, "+n(100*R(this._g,255))+"%, "+n(100*R(this._b,255))+"%)":"rgba("+n(100*R(this._r,255))+"%, "+n(100*R(this._g,255))+"%, "+n(100*R(this._b,255))+"%, "+this._roundA+")"},toName:function(){return 0===this._a?"transparent":!(this._a<1)&&(A[h(this._r,this._g,this._b,!0)]||!1)},toFilter:function(t){var e="#"+u(this._r,this._g,this._b,this._a),r=e,a=this._gradientType?"GradientType = 1, ":"";t&&(r=l(t).toHex8String());return"progid:DXImageTransform.Microsoft.gradient("+a+"startColorstr="+e+",endColorstr="+r+")"},toString:function(t){var e=!!t;t=t||this._format;var r=!1,a=this._a<1&&this._a>=0;return e||!a||"hex"!==t&&"hex6"!==t&&"hex3"!==t&&"name"!==t?("rgb"===t&&(r=this.toRgbString()),"prgb"===t&&(r=this.toPercentageRgbString()),"hex"!==t&&"hex6"!==t||(r=this.toHexString()),"hex3"===t&&(r=this.toHexString(!0)),"hex8"===t&&(r=this.toHex8String()),"name"===t&&(r=this.toName()),"hsl"===t&&(r=this.toHslString()),"hsv"===t&&(r=this.toHsvString()),r||this.toHexString()):"name"===t&&0===this._a?this.toName():this.toRgbString()},_applyModification:function(t,e){var r=t.apply(null,[this].concat([].slice.call(e)));return this._r=r._r,this._g=r._g,this._b=r._b,this.setAlpha(r._a),this},lighten:function(){return this._applyModification(b,arguments)},brighten:function(){return this._applyModification(v,arguments)},darken:function(){return this._applyModification(m,arguments)},desaturate:function(){return this._applyModification(d,arguments)},saturate:function(){return this._applyModification(p,arguments)},greyscale:function(){return this._applyModification(g,arguments)},spin:function(){return this._applyModification(y,arguments)},_applyCombination:function(t,e){return t.apply(null,[this].concat([].slice.call(e)))},analogous:function(){return this._applyCombination(S,arguments)},complement:function(){return this._applyCombination(w,arguments)},monochromatic:function(){return this._applyCombination(C,arguments)},splitcomplement:function(){return this._applyCombination(k,arguments)},triad:function(){return this._applyCombination(_,arguments)},tetrad:function(){return this._applyCombination(x,arguments)}},l.fromRatio=function(t,e){if("object"==typeof t){var r={};for(var a in t)t.hasOwnProperty(a)&&(r[a]="a"===a?t[a]:O(t[a]));t=r}return l(t,e)},l.equals=function(t,e){return!(!t||!e)&&l(t).toRgbString()==l(e).toRgbString()},l.random=function(){return l.fromRatio({r:s(),g:s(),b:s()})},l.mix=function(t,e,r){r=0===r?0:r||50;var a,n=l(t).toRgb(),i=l(e).toRgb(),o=r/100,s=2*o-1,c=i.a-n.a,f=1-(a=((a=s*c==-1?s:(s+c)/(1+s*c))+1)/2),h={r:i.r*a+n.r*f,g:i.g*a+n.g*f,b:i.b*a+n.b*f,a:i.a*o+n.a*(1-o)};return l(h)},l.readability=function(t,e){var r=l(t),a=l(e),n=r.toRgb(),i=a.toRgb(),o=r.getBrightness(),s=a.getBrightness(),c=Math.max(n.r,i.r)-Math.min(n.r,i.r)+Math.max(n.g,i.g)-Math.min(n.g,i.g)+Math.max(n.b,i.b)-Math.min(n.b,i.b);return{brightness:Math.abs(o-s),color:c}},l.isReadable=function(t,e){var r=l.readability(t,e);return r.brightness>125&&r.color>500},l.mostReadable=function(t,e){for(var r=null,a=0,n=!1,i=0;i<e.length;i++){var o=l.readability(t,e[i]),s=o.brightness>125&&o.color>500,c=o.brightness/125*3+o.color/500;(s&&!n||s&&n&&c>a||!s&&!n&&c>a)&&(n=s,a=c,r=l(e[i]))}return r};var P=l.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",rebeccapurple:"663399",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"},A=l.hexNames=function(t){var e={};for(var r in t)t.hasOwnProperty(r)&&(e[t[r]]=r);return e}(P);function M(t){return t=parseFloat(t),(isNaN(t)||t<0||t>1)&&(t=1),t}function R(t,e){(function(t){return"string"==typeof t&&-1!=t.indexOf(".")&&1===parseFloat(t)})(t)&&(t="100%");var r=function(t){return"string"==typeof t&&-1!=t.indexOf("%")}(t);return t=i(e,o(0,parseFloat(t))),r&&(t=parseInt(t*e,10)/100),a.abs(t-e)<1e-6?1:t%e/parseFloat(e)}function H(t){return i(1,o(0,t))}function F(t){return parseInt(t,16)}function T(t){return 1==t.length?"0"+t:""+t}function O(t){return t<=1&&(t=100*t+"%"),t}var q,N,j,E=(N="[\\s|\\(]+("+(q="(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)")+")[,|\\s]+("+q+")[,|\\s]+("+q+")\\s*\\)?",j="[\\s|\\(]+("+q+")[,|\\s]+("+q+")[,|\\s]+("+q+")[,|\\s]+("+q+")\\s*\\)?",{rgb:new RegExp("rgb"+N),rgba:new RegExp("rgba"+j),hsl:new RegExp("hsl"+N),hsla:new RegExp("hsla"+j),hsv:new RegExp("hsv"+N),hsva:new RegExp("hsva"+j),hex3:/^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex8:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/});window.tinycolor=l}(),t(function(){t.fn.spectrum.load&&t.fn.spectrum.processNativeColorInputs()})});