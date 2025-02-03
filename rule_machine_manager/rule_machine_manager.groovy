/**
 *  Rule Machine Manager
 *
 *	Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 *	in compliance with the License. You may obtain a copy of the License at:
 *
 *		http://www.apache.org/licenses/LICENSE-2.0
 *
 *	Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 *	on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License
 *	for the specific language governing permissions and limitations under the License.
 *
 * View the full changelog here:
 * https://raw.githubusercontent.com/joshlobe/hubitat/main/rule_machine_manager/changelog.txt
 */

// Define application
definition(
    name: "Rule Machine Manager",
    namespace: "ruleMachineManager",
    author: "Josh Lobe",
    description: "Visual Interface for Managing Rules from Various Applications.",
    category: "Convenience",
    importUrl: "https://raw.githubusercontent.com/joshlobe/hubitat/main/rule_machine_manager/rule_machine_manager.groovy",
    iconUrl: "",
    iconX2Url: ""
)

// Import helpers
import hubitat.helper.RMUtils
import hubitat.helper.ColorUtils
import groovy.json.JsonSlurper
import groovy.json.JsonOutput
import groovyx.net.http.HttpResponseException

// Define versions
def version() { "3.1" }
def js_version() { "3.0" }
def css_version() { "3.0" }

// Define globals (note: do not use def (scope))
ruleMap = [:]
ruleMapNames = [:]
newRulesCheck = []
populateRuleList()

// Begin preferences
preferences {
    
    // Define mappings to handle javascript requests
    mappings { path("/updateSettings") { action: [ POST: "updateSettings" ] } }
    
    // Begin page
    page(name: "mainPage", install: true, uninstall: true) {
        section {
            
            /**************************************************
            // Begin page html
            **************************************************/
            
            if( logDebugEnable ) log.debug "Beginning Page HTML..."
            html = ""
            
            /**************************************************
            // Page notices (new/deleted rules, new/deleted machines)
            **************************************************/
            
            // Check if there are user rules defined
            userRules = settings?.userArray ? settings?.userArray : ''
            
            // If user rules are found
            if( userRules != '' ) {
                
                if( logDebugEnable ) log.debug "Using User Created Rules for Containers..."
                
                // Decode rules
                userRules = new JsonSlurper().parseText( userRules )
                
                // Check for newly supported rule machine types
                checkNewMachines = checkForNewMachines( userRules )
                if( checkNewMachines ) { html += checkNewMachines }
                
                // Check for deleted rule machine types
                checkDeletedMachines = checkForDeletedMachines( userRules )
                if( checkDeletedMachines ) { html += checkDeletedMachines }
                
                // Check for new rules
                checkNewRules = checkForNewRules( userRules )
                if( checkNewRules ) { html += checkNewRules }
                
                // Check for deleted rules
                checkDeletedRules = checkForDeletedRules( userRules )
                if( checkDeletedRules ) { html += checkDeletedRules }
            
                // If there are new rules not yet saved in RMM, add them to the original rules container
                userRules.containers.each{
                    if( it.slug == "original-rules" ) {
                        def thisRules = it.rules
                        newRulesCheck.each{ thisRules.push( it.key ) }
                    }
                }
            }
            // Else use default rules
            else {
                
                if( logDebugEnable ) log.debug "Using Default Rules for Containers..."
                
                // Decode rules
                buildRules = defaultUserArrayText()
                userRules = new JsonSlurper().parseText( buildRules )
            }
            
            /**************************************************
            // Page header
            **************************************************/
            
            // Define variables
            welcome_nag = userRules.welcome_nag ? userRules.welcome_nag : 'true'
            ruleMachines = userRules.containsKey( 'rule_machines' ) ? JsonOutput.toJson( userRules.rule_machines ) : JsonOutput.toJson( new JsonSlurper().parseText( defaultUserArrayText() ).rule_machines )
            checkMachines = userRules.containsKey( 'check_machines' ) ? JsonOutput.toJson( userRules.check_machines ) : JsonOutput.toJson( new JsonSlurper().parseText( defaultUserArrayText() ).check_machines )
            activeMachines = userRules && userRules.hide_machines == 'true' ? 'active' : ''
            machinesText = userRules && userRules.hide_machines == 'true' ? 'Show Machine Names' : 'Hide Machine Names'
            activeCounts = userRules && userRules.hide_counts == 'true' ? 'active' : ''
            countsText = userRules && userRules.hide_counts == 'true' ? 'Show Counts' : 'Hide Counts'
            activeFilters = userRules && userRules.hide_filters == 'true' ? 'active' : ''
            filtersText = userRules && userRules.hide_filters == 'true' ? 'Show Filters' : 'Hide Filters'
            hideGlobalFilter = check_filters != '' ? 'display:none;' : ''

            // Begin header area
            html += "<div id='header_panel' class='mdl-grid'>"
                html += "<div id='header_left' class='mdl-cell mdl-cell--6-col graybox'>"
            
                    html += "<span id='create_group_button' class='button'><i class='material-icons'>add_circle</i>Create Container</span>"
                    html += "<span id='global_filter' style='${hideGlobalFilter}'><input id='global_filter_input' type='text' placeholder='Filter All Containers...' /></span>"
                html += "</div>"
                html += "<div id='header_right' class='mdl-cell mdl-cell--6-col graybox'>"

                    // Define hidden inputs
                    html += "<input type='hidden' id='appState' value='${app.getInstallationState()}' />"
                    html += "<input type='hidden' id='accessToken' value='${state.accessToken}' />"
                    html += "<input type='hidden' id='appID' value='${app.getId()}' />"
                    html += "<input type='hidden' id='load_default_opts' value='${defaultUserArrayText()}' />"
                    html += "<input type='hidden' id='welcome_nag' value='${welcome_nag}' />"
                    html += "<input type='hidden' id='ruleMachines' value='${ruleMachines}' />"
                    html += "<input type='hidden' id='checkMachines' value='${checkMachines}' />"
            
                    // Create hubitat hidden form input and variables
                    html += '<input type="hidden" name="userArray.type" value="text">'
                    html += '<input type="hidden" name="userArray.multiple" value="false">'
                    html += '<input type="hidden" name="settings[userArray]" class="mdl-textfield__input" id="userArray">'

                    // Header area icons
                    html += "<span class='tooltip'><span id='options_panel' class='button'><i class='material-icons'>settings</i><span class='tooltiptext'>App Options</span></span></span>"
                    html += "<span class='tooltip'><span id='help_welcome' class='button'><i class='material-icons'>help</i><span class='tooltiptext'>Help</span></span></span>"
                    html += "<span class='tooltip'><span id='quick_save' class='button'><i class='material-icons'>rocket</i><span class='tooltiptext'>Quick Save</span></span></span>"
                    html += "<span class='tooltip'><span id='hideCounts' class='button ${activeCounts}'><i class='material-icons'>ballot</i><span class='tooltiptext'>${countsText}</span></span></span>"
                    html += "<span class='tooltip'><span id='hideFilters' class='button ${activeFilters}'><i class='material-icons'>table_rows</i><span class='tooltiptext'>${filtersText}</span></span></span>"
                    html += "<span class='tooltip'><span id='hideMachines' class='button ${activeMachines}'><i class='material-icons'>data_array</i><span class='tooltiptext'>${machinesText}</span></span></span>"
                    html += "<span class='tooltip'><span id='done_submit' class='button'><i class='material-icons'>check_circle</i><span class='tooltiptext'>Done</span></span></span>"
                html += "</div>"
            html += "</div>"
            
            /**************************************************
            // Page containers
            **************************************************/
            
            if( logDebugEnable ) log.debug "Creating Page Containers..."
                    
            // Create temp array for duplication comparisons
            tempArray = []
          
            // Begin page containers
            html += "<div id='rules_container'>"

            // Loop each container
            userRules.containers.each{
                
                if( logDebugEnable ) log.debug "Creating Container ${it.name}..."

                // These are applied to the main container, and must be defined first
                container_color = ( it.container_color && it.container_color != '' && it.container_color != 'null' ) ? it.container_color : '#FFFFFF'
                container_opacity = ( it.container_opacity && it.container_opacity != '' && it.container_opacity != 'null' ) ? it.container_opacity : '1'

                // Convert colors to rgb
                rgb = hubitat.helper.ColorUtils.hexToRGB( container_color )
                rgba_string = "rgba(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ", " + container_opacity + ")"

                // Begin this container
                html += "<div id='${it.slug}' class='rule_container' style='background-color:${rgba_string};'>"

                    // Get values from database
                    title_color = ( it.title_color && it.title_color != '' && it.title_color != 'null' ) ? it.title_color : '#000'
                    title_opacity = ( it.title_opacity && it.title_opacity != '' && it.title_opacity != 'null' ) ? it.title_opacity : '1'
                    title_bold = ( it.title_bold && it.title_bold == 'true' ) ? 'true' : 'false'
                	font_weight = ( it.title_bold && it.title_bold == 'true' ) ? 'bold' : 'normal'

                	// Set hidden input fields for this container
                    html += "<input type='hidden' class='title_color' value='${title_color}' />"
                    html += "<input type='hidden' class='title_opacity' value='${title_opacity}' />"
                    html += "<input type='hidden' class='title_bold' value='${title_bold}' />"
                    html += "<input type='hidden' class='container_color' value='${container_color}' />"
                    html += "<input type='hidden' class='container_opacity' value='${container_opacity}' />"

                    // Container title area
                    html += "<h4 class='mdl-grid container_title_h4'>"
                
                		html += '<div class="mdl-cell mdl-cell--9-col  mdl-cell--5-col-tablet container_title_left">'
                
                			// Container title
                        	html += "<span class='group_name' style='color:${title_color};font-weight:${font_weight};opacity:${title_opacity};'>${it.name}</span>"
                        	html += "<span class='group_name_edit'></span>"

                        	// Add rule count (hide if user selected )
                        	hide_counts = userRules.hide_counts == 'true' ? 'display: none;' : ''
                        	html += "<span class='group_rule_count' style='${hide_counts}color:${title_color};font-weight:${font_weight};opacity:${title_opacity};'></span>"
                
                            // Add container filter (hide if user selected ) 
                            hide_filters = userRules.hide_filters == 'true' ? 'display: none;' : ''
                            html += "<span class='container_filter' style='${hide_filters}'><input name='container_filter_input' type='text' placeholder='Filter Container...'></span>"
                		html += '</div>'
                
                		html += '<div class="mdl-cell mdl-cell--3-col  mdl-cell--3-col-tablet container_title_right">'

                            // Add container options icon
                            html += "<span class='tooltip moreOpts'>"
                				html += "<i class='material-icons submenu' style='color:${title_color};opacity:${title_opacity};'>settings</i>"
                				html += "<span class='tooltiptext'>Container Options</span>"
                			html += "</span>"

                            // Add Expand/Collapse container icon
                            toggle_icon = it.visible == true ? 'file_upload' : 'file_download'
                            toggle_text = it.visible == true ? 'Collapse' : 'Expand'
                            html += "<span class='tooltip toggleContainer'>"
                				html += "<i class='material-icons toggleContainer' style='color:${title_color};opacity:${title_opacity};'>${toggle_icon}</i>"
                				html += "<span class='tooltiptext'>${toggle_text}</span>"
                			html += "</span>"

                            // Add move icon
                            html += "<span class='tooltip drag_container drag_handle'>"
                				html += "<i class='material-icons drag_container' style='color:${title_color};opacity:${title_opacity};'>open_with</i>"
                				html += "<span class='tooltiptext'>Move</span>"
                			html += "</span>"

                            // Begin submenu dropdown menu
                            html += '<div class="dropdown-content">'

                                // Add edit container
                                html += '<div class="edit_container_div"><i class="material-icons edit_container">edit</i> Edit Container</div>'

                                // Add sort icons
                                html += '<div class="sortasc_container"><i class="material-icons">arrow_downward</i> Sort Asc</div>'
                                html += '<div class="sortdesc_container"><i class="material-icons">arrow_upward</i> Sort Desc</div>'

                                // Add delete icon, but not to original rules container
                                if( it.slug != 'original-rules' ) {

                                    html += '<div class="delete_container"><i class="material-icons delete_group">delete</i> Delete Container</div>'
                                }
                            html += '</div>'
                        html += '</div>'
                    html += "</h4>"

                    /**************************************************
                    // Container rules
                    **************************************************/
                	if( logDebugEnable ) log.debug "Creating Rule List For Container ${it.name}..."
                    html += "<ul class='rulelist' style='${it.visible == false ? 'display:none;' : ''}'>"

                        // Loop each rule
                        it.rules.each{ 

                            // Setup vars
                            rule_id = it

                            // First ensure key exists (used when rules have been deleted from RM)
                            if( ruleMap.find{ it.key == rule_id.toInteger() } ) {

                                // Add this item to temp array (used later to determine if item is duplicate)
                                tempArray.push( it )

                                // Get rule attributes for paused and/or disabled
                                def getAtts = ruleMap[ rule_id.toInteger() ]
                                def name = getAtts?.name
                                def paused = getAtts?.paused == true ? ' <span class="paused">(Paused)</span>' : ''
                                def disabled = getAtts?.disabled == true ? ' <span class="disabled">(Disabled)</span>' : ''
                                def ruleType = getAtts?.ruleType
                                def fontStyle = "color:${title_color};opacity:${title_opacity};"
                                def machineType = "<span class='ruleType'>[${ruleMapNames[ruleType]}]</span>"
                                def machineCheckArray = userRules.rule_machines.contains( ruleType )
                                def listItemStyle = machineCheckArray == false ? 'display:none;' : ''

                                // Create list item
                                html += "<li id='${rule_id}' class='mdl-grid ui-state-default rule ${ruleType}' style='${listItemStyle}'>"
                                
                                	// Column left
                                	html += '<div class="mdl-cell mdl-cell--9-col  mdl-cell--5-col-tablet rule_title_left">'
                                
                                        // Rule name
                                        html += "<span class='rule_name' style='${fontStyle}'>${name}${disabled}${machineType}</span>"
                                	html += '</div>'
                                
                                	// Column right
                                	html += '<div class="mdl-cell mdl-cell--3-col  mdl-cell--3-col-tablet rule_title_right">'
                                
                                        // Add edit rule
                                        html += "<span class='tooltip ruleView' url='/installedapp/configure/${rule_id}'>"
                                            html += "<i class='material-icons view_rule rule' style='${fontStyle}'>content_paste_go</i><span class='tooltiptext'>Edit Rule</span>"
                                        html += '</span>'
                                
                                		// Add rule status
                                        html += "<span class='tooltip ruleViewStatus' url='/installedapp/status/${rule_id}'>"
                                            html += "<i class='material-icons-outlined view_rule_status rule' style='${fontStyle}'>ballot</i><span class='tooltiptext'>View Rule Status</span>"
                                        html += '</span>'
                                
                                		// Add rule logs
                                        html += "<span class='tooltip ruleViewLogs' url='/logs?tab=past&appId=${rule_id}'>"
                                            html += "<i class='material-icons-outlined view_rule_logs rule' style='${fontStyle}'>integration_instructions</i><span class='tooltiptext'>View Rule Logs</span>"
                                        html += '</span>'
                                
                                		// Add rule copy or delete
                                		def copyDel = tempArray.count( rule_id ) > 1 ? 'delete' : 'copy'
                                        html += "<span class='tooltip ${copyDel == 'copy' ? 'copy_rule' : 'delete_duplicate'}'>"
                                            html += "<i class='material-icons ${copyDel == 'copy' ? 'copy_rule' : 'duplicate_rule'} rule' style='${fontStyle}'>${copyDel == 'copy' ? 'content_copy' : 'delete_outline'}</i>"
                                			html += "<span class='tooltiptext'>${copyDel == 'copy' ? 'Create' : 'Delete'} Duplicate Rule</span>"
                                        html += "</span>"
                                
                                	html += '</div>'
                                html += "</li>"
                            }
                        }

                    html += "</ul>"
                	if( logDebugEnable ) log.debug "Finished Creating Rule List for Container ${it.name}..."
                html += "</div>"
                if( logDebugEnable ) log.debug "Finished Creating Container ${it.name}..."
            }
               
            html += '</div>'
            
            /**************************************************
            // Include scripts and styles
            **************************************************/
            
            // Include jquery
            html += "<script src='https://code.jquery.com/jquery-3.7.1.min.js'></script>"
            html += "<script src='https://code.jquery.com/ui/1.14.1/jquery-ui.min.js'></script>"
            html += "<link rel='stylesheet' href='https://code.jquery.com/ui/1.14.1/themes/base/jquery-ui.css'>"
            
            // Include confirm overlay
            html += "<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/sweetalert2/11.15.10/sweetalert2.min.css'>"
            
            // Include material icons
            html += "<link rel='stylesheet' href='https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined'>"
            
            // Add scripts/styles for page
			html += "<script defer src='/local/rule_machine_manager.js'></script>"
            html += "<link rel='stylesheet' href='/local/rule_machine_manager.css'>"
            
            /**************************************************
            // Page render html
            **************************************************/
            
            // Display page
            paragraph "${html}"
            paragraph "<hr />"
            
            /**************************************************
            // Page footer area
            **************************************************/
            
            if( logDebugEnable ) log.debug "Creating Page Footer..."
            
            // Log file
            paragraph "<p>Use the debug tool to generate information for the log file.</p>"
            input "logDebugEnable", "bool", required: false, title: "Enable Debug Logging (auto off in 15 minutes)", defaultValue: false
            paragraph "<hr />"
            
            // Footer area
            grid = "<div class='mdl-grid'>"
                grid += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                    grid += "<p>"
            
            			// Footer notes
                        grid += "<strong>NOTE:</strong> Remember to click \"Done\" after modifying any options or resetting the rules.<br />"
                        grid += "<strong>GET HELP:</strong> "
            			grid += "<a href='https://community.hubitat.com/t/initial-release-rule-machine-manager-new-rule-machine-interface/124689' target='_blank' />Hubitat Community Thread</a><br />"
                    grid += "</p>"
                grid += "</div>"
                grid += "<div class='mdl-cell mdl-cell--6-col graybox'>"
            
                    // Check if js and css files are stored locally
                    js_installed = '<span class="not_installed">Not Found in File Manager</span>'
                    css_installed = '<span class="not_installed">Not Found in File Manager</span>'

                    try {
                        httpGet([ uri: "http://127.0.0.1:8080/local/rule_machine_manager.js", contentType: "text/html" ]) { resp ->
                            if (resp.success) {  js_installed = '<span class="installed">Found in File Manager</span>' }
                        }
                    } 
                    catch (Exception e) { log.warn "Call to check js file in file manager failed: ${e.message}" }

                    try {
                        httpGet([ uri: "http://127.0.0.1:8080/local/rule_machine_manager.css", contentType: "text/html" ]) { resp ->
                            if (resp.success) {  css_installed = '<span class="installed">Found in File Manager</span>' }
                        }
                    } 
                    catch (Exception e) { log.warn "Call to check css file in file manager failed: ${e.message}" }

            		// Footer details area
            		def getStateSpan = app.getInstallationState() == 'COMPLETE' ? '<span class="installed">Enabled</span>' : '<span class="not_installed">Not Enabled</span>'
            		def getTokenSpan = state.accessToken != null && state.accessToken != '' ? '<span class="installed">Enabled</span>' : "Not Enabled"
                    grid += "<table id='appDetailsTable'><tbody>"
                        grid += "<tr><td><strong>App Version: </strong></td><td>${version()}</td></tr>"
                        grid += "<tr><td><strong>App State: </strong></td><td>${getStateSpan}</td></tr>"
                        grid += "<tr><td><strong>JS File: </strong></td><td>${js_installed}</td></tr>"
                        grid += "<tr><td><strong>CSS File: </strong></td><td>${css_installed}</td></tr>"
                        grid += "<tr><td><strong>oAuth: </strong></td><td>${getTokenSpan}</td></tr>"
                    grid += "</tbody></table>"
                grid += "</div>"
            grid += "</div>"
            
            // Display footer
            paragraph "${grid}"
            if( logDebugEnable ) log.debug "Finished Page Footer..."
            if( logDebugEnable ) log.debug "Finished Page HTML..."
        }
    }
}

// Define default container and array of rules not yet saved in the user settings
def defaultUserArrayText() {
    
    // Build names for hidden input
    buildNames = '['
    if( ruleMapNames ) {
        ruleMapNames.each{ buildNames += '"' + it.key + '",' }    
        buildNames = buildNames.substring( 0, buildNames.lastIndexOf( "," ) )
    }
    buildNames += ']'
                
    // Build string of rule ids, remove trailing comma
    buildRules = '['
    if( ruleMap ) {
        ruleMap.each{ buildRules += '"' + it.key + '",' }
        buildRules = buildRules.substring( 0, buildRules.lastIndexOf( "," ) )
    }
    buildRules += ']'
    
    // Create text string of plugin defaults
    text = '{'
        text += '"hide_counts":"false",'
        text += '"hide_filters":"false",'
        text += '"hide_machines":"false",'
        text += '"welcome_nag":"true",'
		text += '"rule_machines": ' + buildNames + ','
		text += '"check_machines": ' + buildNames + ','
        text += '"containers":[{'
            text += '"name":"Original Rules",'
            text += '"slug":"original-rules",'
            text += '"title_color":"",'
            text += '"title_opacity":"",'
            text += '"title_bold":"",'
            text += '"container_color":"",'
            text += '"container_opacity":"",'
            text += '"visible":true,'
            text += '"rules": ' + buildRules
        text += '}]'
    text += '}'
    
    return text
}

// Check for new rule machines
def checkForNewMachines( userRules ) {
    
    // Get default and user values
    defaults = new JsonSlurper().parseText( defaultUserArrayText() ).check_machines
    saved = userRules.check_machines ? userRules.check_machines : defaults
    
    // Remove from defaults any values already saved
    saved.each{ defaults.removeAll( it ) }
    
    // If there are remaining values
    if( defaults ) {
        
        // Loop each removed machine type and make human readable message of machine types
        defaultsString = ''
        defaults.each { defaultsString += splitCamelCase( it ) + ', ' }
    	defaultsString = defaultsString.substring( 0, defaultsString.lastIndexOf( "," ) )
        
        // Message
        message = "<div id='rule_machines_found' class='page_notice'>"
        
        	message += "<i class='material-icons notification'>notifications</i>"
        	message += "New rule machine types found <strong>(" + defaultsString + ")</strong>! Please visit App Options -> Global Options to enable."
        message += "</div>"
        
        return message
    }
    else {
        
        if( logDebugEnable ) log.debug "No Deleted Machines Found..."
        return false;
    }
}

// Check for deleted machines
def checkForDeletedMachines( userRules ) {
    
    // Get default and user values
    defaults = new JsonSlurper().parseText( defaultUserArrayText() ).check_machines
    saved = userRules.check_machines ? userRules.check_machines : defaults
    
    // Loop each defaults and remove if checked
	defaults.each{ saved.removeAll( it ) }
    
    // If any machines remaining; they have been removed
    if( saved ) {
        
        // Loop each removed machine type and make human readable message of machine types
        savedString = ''
        saved.each { savedString += splitCamelCase( it ) + ', ' }
    	savedString = savedString.substring( 0, savedString.lastIndexOf( "," ) )
        
        // Message
        message = "<div id='rule_machines_deleted' class='page_notice'>"
        
        	message += "<i class='material-icons notification'>notifications</i>"
        	message += "A machine type has been removed <strong>(" + savedString + ")</strong>. Please save the page options to update."
        message += "</div>"
        
        return message
    }
    else {
        
        if( logDebugEnable ) log.debug "No New Machines Found..."
        return false;
    }
}

// Check for new rules
def checkForNewRules( userRules ) {

    // Iterate user rules to build final array of keys
    newRules = []
    userRules.containers.each{ it.rules.each{ newRules.push( it.toString() ) } }
    
    // Get any new rules that have been added
    ruleMap.each{ if( ! newRules.contains( it.key.toString() ) ) { newRulesCheck.push( it ) } }

    // If any new rules found, add notice
    if( ! newRulesCheck.isEmpty() ) {

        if( logDebugEnable ) log.debug "New Rules Found..."
        
        // Build new rules found message
        messageNew = "<div id='rules_found' class='page_notice'>"

            messageNew += "<i class='material-icons notification'>notifications</i>"
        	messageNew += "New rules (${newRulesCheck.size()}) have been discovered in the Rule Manager App and added to the \"Original Rules\" container. Please click the \"Done\" button to save after any modifications."
        	messageNew += "<br /><br /><strong>NOTE:</strong> If the new rules are not visible in the original rules container; please visit App Options -> Global Options to ensure all rule machine types are displayed."
        messageNew += "</div>"
        
        return messageNew
    }
    // Else no new rules found
    else {

        if( logDebugEnable ) log.debug "No New Rules Found..."
        return false
    }
}

// Check for deleted rules
def checkForDeletedRules( userRules ) {

    // Define final array, compare with new rules and extract deleted rules
    deletedRules = []
    userRules.containers.each{ it.rules.each{ deletedRules.push( it.toString() ) } }
    ruleMap.each{ deletedRules.removeAll( it.key.toString() ) }

    // Check what is left in this array against allowed rules; to allow duplicates through
    ruleMap.each{ it.each{
			
        // If this is a duplicate rule; it still exists in the main rm array
        if( deletedRules.contains( it.key.toString() ) ) { deletedRules.remove( it.key.toString() ) }
    }}

    // If any deleted rules found, add notice
    if( ! deletedRules.isEmpty() ) {

        if( logDebugEnable ) log.debug "Deleted Rules Found..."
        
        // Build deleted rules message
        messageDeleted = "<div id='rules_deleted' class='page_notice'>"

            messageDeleted += "<i class='material-icons notification'>notifications</i>"
        	messageDeleted += "Some rules (${deletedRules.size()}) have been deleted in the Rule Manager App and removed from any containers. Please click the \"Done\" button to save after any modifications."
        messageDeleted += "</div>"
        
        return messageDeleted
    }
    // Else no deleted rules found
    else {

        if( logDebugEnable ) log.debug "No Deleted Rules Found..."
        return false
    }
}

// Endpoint used from javascript for quick saving options
def updateSettings() {
    
    // Get user options from ajax request
    userOpts = params.userOpts
    
    // If user options are found
    if( userOpts && userOpts != '' ) {
    
        // Update app settings with user options
    	app.updateSetting( 'userArray', params.userOpts )
        if( logDebugEnable ) log.debug "Updated Settings Successfully: " + params.userOpts
        return [status: "success", message: "Options saved successfully." ]
    }
    // Else no user options were found
    else {
        
        // Return error code
        if( logDebugEnable ) log.debug "Settings Error: Could Not Update"
        return [status: "error", message: "Data passed from ajax is empty." ]
    }
}

// Create access token
def createThisAccessToken() {
    
    if( logDebugEnable ) log.debug "Checking Access Token..."
    
    // Create token if not already found
    if ( ! state.accessToken ) {
		try {
			def accessToken = createAccessToken()
			if( accessToken ) { 
                state.accessToken = accessToken 
                if( logDebugEnable ) log.debug "Access Token Not Found; Created New Token: " + state.accessToken
            }
		} 
		catch(e) {
			state.accessToken = null
            if( logDebugEnable ) log.warn "Access Token Was Not Created... Token: " + state.accessToken
		}
    }
    // Else token was already found
    else {
        
        if( logDebugEnable ) log.debug "Found Exisiting Access Token: " + state.accessToken
    }
}

// Return a camel case string in capitals with spaces
def splitCamelCase(s) {
    
   return s.replaceAll( String.format("%s|%s|%s", "(?<=[A-Z])(?=[A-Z][a-z])", "(?<=[^A-Z])(?=[A-Z])", "(?<=[A-Za-z])(?=[^A-Za-z])" ), " " ).capitalize();
}

// Helper function to define rule list
def createRulelistSubmap( ruleName, camelName, array ) {
    
    attSubMap = [:]
    attSubMap['name'] = array.data.name
    attSubMap['disabled'] = array.data.disabled
    attSubMap['paused'] = array.data.name.contains( '(Paused)' ) ? true : false
    attSubMap['ruleType'] = camelName

    // Add submap to rulemap
    ruleMap[array.id] = attSubMap
}

// Populate rule list
def populateRuleList() {
    
    // Define rule map; built from httpget call and rebuilding array
    try {
        httpGet([ uri: "http://127.0.0.1:8080/hub2/appsList" ]) { resp ->
            if (resp.success) {  

                if( logDebugEnable ) log.debug "Getting Apps List..."
                
                // Set array of allowed machine types
                machineTypes = [:]
                machineTypes['ruleMachine'] = 'Rule Machine'
                machineTypes['roomLighting'] = 'Room Lighting'
                machineTypes['buttonControllers'] = 'Button Controllers'
                machineTypes['basicButtonControllers'] = 'Basic Button Controllers'
                machineTypes['motionAndModeLightingApps'] = 'Motion and Mode Lighting Apps'

                // Loop each app type
                resp.data.apps.each {
                    
                    // If this app is in our allowed list
                    if( machineTypes.containsValue( it.data.type ) ) {
                        
                        // Define variables
                        ruleName = it.data.type
                        camelName = machineTypes.find{ it.value == ruleName }?.key
                        
                        if( logDebugEnable ) log.debug "Adding ${ruleName} Rules..."

                        // Add to names map
                        ruleMapNames[camelName] = ruleName
                        
                        // If this apps rules are in the grandchildren
                        if( ruleName == "Button Controllers" ) {
                            
                            // Loop children
                            it.children.each{
                                
                                // Loop children again
                                it.children.each{

                                    // Create submap (define any needed variables)
                                    createRulelistSubmap( ruleName, camelName, it )
                                }
                            }
                        }
                        // Else app rules are in the children
                        else {

                            // Loop children
                            it.children.each{

                                // Create submap (define any needed variables)
                                createRulelistSubmap( ruleName, camelName, it )
                            }
                        }
                    }
                }
                if( logDebugEnable ) log.debug "Finished Getting Apps List..."
            }
        }
    } 
    catch (Exception e) { log.warn "Get Apps List Failed: ${e.message}" }
}

def installed() {
    
    log.trace "Installed Rule Machine Manager Application"
    updated()
}

def updated() {
    
    // Create access token
    if( ! state.accessToken) { createThisAccessToken() }
    
    log.trace "Updated Rule Machine Manager Application"
    if( logDebugEnable ) log.debug "Updated User Array: " + app.getSetting( 'userArray' )
    if( logDebugEnable ) runIn( 900, logDebugOff )
}

def logDebugOff() {
    
    log.warn "Debug Logging Disabled..."
    app.updateSetting("logDebugEnable", [value: "false", type: "bool"])
}