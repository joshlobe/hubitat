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

definition(
    name: "Rule Machine Manager",
    namespace: "ruleMachineManager",
    author: "Josh Lobe",
    description: "Visual interface for Managing Rule Machine Rules.",
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
def version() { "2.0" }
def js_version() { "2.0" }
def css_version() { "2.0" }

// Define globals (note: do not use def (scope))
ruleMap = [:]
newRulesCheck = []

// Define rule map; built from httpget call and rebuilding array
try {
    httpGet([ uri: "http://127.0.0.1:8080/hub2/appsList" ]) { resp ->
        if (resp.success) {  
            if( logDebugEnable ) log.debug "Getting Apps List..."
            resp.data.apps.each {
                // Only scrape rule machine data
                if( it.data.type == "Rule Machine" ) {
                    // Loop children (these are all rule app ids)
                    it.children.each{
                        
                        // Create submap (define any needed variables)
                        attSubMap = [:]
                        attSubMap['name'] = it.data.name
                        attSubMap['disabled'] = it.data.disabled
                        attSubMap['paused'] = it.data.name.contains( '(Paused)' ) ? true : false
                        
                        // Add submap to rulemap
                        ruleMap[it.id] = attSubMap
                    }
                }
            }
            if( logDebugEnable ) log.debug "Finished Getting Apps List..."
        }
    }
} 
catch (Exception e) { if( logDebugEnable ) log.debug "Get Apps List Failed: ${e.message}" }

preferences {
    page(name: "mainPage", install: true, uninstall: true) {
        section {
            
            if( logDebugEnable ) log.debug "Beginning Page HTML..."
            
            // Begin page HTML
            html = ""
            
            // Check if there are user rules defined
            userRules = settings?.userArray ? settings?.userArray : ''
            
            /**************************************************
            // Page notices (new rules, deleted rules)
			// These are only executed when user rules are stored; not when app is first installed
            **************************************************/
            
            // If user rules are found
            if( userRules != '' ) {
                
                if( logDebugEnable ) log.debug "Using User Created Rules for Containers..."
                
                // Check for new rules
                checkNewRules = checkForNewRules( userRules )
                if( checkNewRules ) { html += checkNewRules }
                
                // Check for deleted rules
                checkDeletedRules = checkForDeletedRules( userRules )
                if( checkDeletedRules ) { html += checkDeletedRules }
                
                // Decode rules
                userRules = new JsonSlurper().parseText( userRules )
            
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
            // Page options panel
            **************************************************/
            
            // Create page options panel
            html += pageOptionsPanel( userRules )
            
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

                rgb = hubitat.helper.ColorUtils.hexToRGB( container_color )
                rgba_string = "rgba(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ", " + container_opacity + ")"

                html += "<div id='${it.slug}' class='rule_container' style='background-color:${rgba_string};'>"

                    // These are applied after the container; and are tied to javascript functions in this hierarchy
                    title_color = ( it.title_color && it.title_color != '' && it.title_color != 'null' ) ? it.title_color : '#000'
                    title_opacity = ( it.title_opacity && it.title_opacity != '' && it.title_opacity != 'null' ) ? it.title_opacity : '1'
                    title_bold = ( it.title_bold && it.title_bold == 'true' ) ? 'true' : 'false'
                	font_weight = ( it.title_bold && it.title_bold == 'true' ) ? 'bold' : 'normal'

                    html += "<input type='hidden' class='title_color' value='${title_color}' />"
                    html += "<input type='hidden' class='title_opacity' value='${title_opacity}' />"
                    html += "<input type='hidden' class='title_bold' value='${title_bold}' />"
                    html += "<input type='hidden' class='container_color' value='${container_color}' />"
                    html += "<input type='hidden' class='container_opacity' value='${container_opacity}' />"

                    // Create title
                    html += "<h4>"
                        html += "<span class='group_name' style='color:${title_color};font-weight:${font_weight};opacity:${title_opacity};'>${it.name}</span>"
                        html += "<span class='group_name_edit'></span>"

                        // Add rule count (hide if user selected )
                        hide_counts = userRules.hide_counts == 'true' ? 'display: none;' : ''
                        html += "<span class='group_rule_count' style='${hide_counts}'></span>"
                
                		// Add container filter (hide if user selected ) 
                        hide_filters = userRules.hide_filters == 'true' ? 'display: none;' : ''
                		html += "<span class='container_filter' style='${hide_filters}'><input type='text' placeholder='Filter Container...'></span>"

                        // Submenu three dot
                        html += '<span class="tooltip moreOpts"><i class="material-icons submenu">more_vert</i><span class="tooltiptext">More Options</span></span>'

                        // Expand/Collapse container
                        toggle_icon = it.visible == true ? 'file_upload' : 'file_download'
                        toggle_text = it.visible == true ? 'Collapse' : 'Expand'
                        html += "<span class='tooltip toggleContainer'><i class='material-icons toggleContainer'>${toggle_icon}</i><span class='tooltiptext'>${toggle_text}</span></span>"

                        // Add drag icon
                        html += '<span class="tooltip drag_container drag_handle"><i class="material-icons drag_container">open_with</i><span class="tooltiptext">Move</span></span>'

                		// Begin submenu dropdown menu
                        html += '<div class="dropdown-content">'

                            // Add edit container
                            html += '<div class="edit_container_div"><i class="material-icons edit_container">edit</i> Edit Container</div>'

                            // Add edit icon, but not to original rules container
                            if( it.slug != 'original-rules' ) {

                                html += '<div class="edit_title_div"><i class="material-icons edit">edit</i> Edit Title</div>'
                            }

                            // Add sort icons
                            html += '<div class="sortasc_container"><i class="material-icons">arrow_downward</i> Sort Asc</div>'
                            html += '<div class="sortdesc_container"><i class="material-icons">arrow_upward</i> Sort Desc</div>'

                            // Add delete icon, but not to original rules container
                            if( it.slug != 'original-rules' ) {

                                html += '<div class="delete_container"><i class="material-icons delete_group">delete</i> Delete Container</div>'
                            }

                        html += '</div>'

                    html += "</h4>"

                    // Create rulelist
                	if( logDebugEnable ) log.debug "Creating Rule List For Container ${it.name}..."
                    visible = it.visible == false ? 'display:none;' : ''
                    html += "<ul class='rulelist' style='${visible}'>"

                        // Loop each rule
                        it.rules.each{ 

                            // Setup vars
                            rule_id = it

                            // First ensure key exists (used when rules have been deleted from RM)
                            if( ruleMap.find{ it.key == rule_id.toInteger() } ) {

                                // Add this item to temp array
                                tempArray.push( it )

                                // If this is a duplicate; and it has already been rendered on page, it is a duplicate
                                if( tempArray.count( rule_id ) > 1 ) {

                                    copy_or_delete = "<span class='tooltip delete_duplicate'>"
                                    	copy_or_delete += "<i class='material-icons duplicate_rule rule'>delete_outline</i><span class='tooltiptext'>Remove Duplicate Rule</span>"
                                    copy_or_delete += "</span>"
                                }
                                // Else this is an original rule
                                else {

                                    copy_or_delete = "<span class='tooltip copy_rule'>"
                                    	copy_or_delete += "<i class='material-icons copy_rule rule'>content_copy</i><span class='tooltiptext'>Create Duplicate Rule</span>"
                                    copy_or_delete += "</span>"
                                }

                                // Get status for paused and/or disabled
                                getAtts = ruleMap[rule_id.toInteger()]
                                name = getAtts?.name
                                paused = getAtts?.paused == true ? ' <span class="paused">(Paused)</span>' : ''
                                disabled = getAtts?.disabled == true ? ' <span class="disabled">(Disabled)</span>' : ''

                                // Create list item
                                html += "<li id='${rule_id}' class='ui-state-default rule'>"
                                
                                	// Rule name
                                    html += "<span class='rule_name'>${name}${disabled}</span>"
                                
                                	// Rule action buttons
                                    html += "<span class='tooltip ruleView' url='http://${location.hub.localIP}/installedapp/configure/${rule_id}'>"
                                		html += '<i class="material-icons view_rule rule">launch</i><span class="tooltiptext">View Rule</span>'
                                	html += '</span>'
                                    html += copy_or_delete
                                html += "</li>"
                            }
                        }

                    html += "</ul>"
                	if( logDebugEnable ) log.debug "Finished Creating Rule List for Container ${it.name}..."
                html += "</div>"
                if( logDebugEnable ) log.debug "Finished Creating Container ${it.name}..."
            }
               
            html += '</div>'
            
            
            // Create hidden form input and variables
            html += '<input type="hidden" name="userArray.type" value="text">'
            html += '<input type="hidden" name="userArray.multiple" value="false">'
            html += '<input type="hidden" name="settings[userArray]" class="mdl-textfield__input" id="userArray">'
            
            // Include jquery
            html += "<script defer src='https://code.jquery.com/jquery-3.6.0.js'></script>"
            html += "<script defer src='https://code.jquery.com/ui/1.13.2/jquery-ui.js'></script>"
            
            // Include confirm overlay
            html += "<script defer src='https://cdn.jsdelivr.net/npm/sweetalert2@11.15.10/dist/sweetalert2.all.min.js'></script>"
            html += "<link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/sweetalert2@11.15.10/dist/sweetalert2.min.css'>"
            
            // Include material icons
            html += "<link rel='stylesheet' href='https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined'>"
            

            // Add scripts/styles for page
			html += "<script defer src='http://${location.hub.localIP}/local/rule_machine_manager.js'></script>"
            html += "<link rel='stylesheet' href='http://${location.hub.localIP}/local/rule_machine_manager.css'>"
            
            /**************************************************
            // Page render html
            **************************************************/
            
            // Display page
            paragraph "${html}"
            paragraph "<hr />"
            
            if( logDebugEnable ) log.debug "Creating Page Footer..."
            
            // Log file
            paragraph "<p>Use the debug tool to generate information for the log file.</p>"
            input "logDebugEnable", "bool", required: false, title: "Enable Debug Logging (auto off in 15 minutes)", defaultValue: false
            paragraph "<hr />"
            
            // Footer notes
            grid = "<div class='mdl-grid'>"
                grid += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                    grid += "<p>"
                        grid += "<strong>NOTE:</strong> Remember to click \"Done\" after modifying any options or resetting the rules.<br />"
                        grid += "<strong>NOTE:</strong> Only rules from Rule Manager 5.0+ are currently available using this application.<br />"
                        grid += "<strong>Community Thread:</strong> "
            			grid += "<a href='https://community.hubitat.com/t/initial-release-rule-machine-manager-new-rule-machine-interface/124689' target='_blank' />Hubitat Community Thread</a><br />"
                    grid += "</p>"
                grid += "</div>"
                grid += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                    grid += "<p>"
            
                        // Check if js and css files are stored locally
                        js_installed = '<span class="not_installed">(Not Found in File Manager)</span>'
                        css_installed = '<span class="not_installed">(Not Found in File Manager)</span>'
                            
                        try {
                            httpGet([ uri: "http://127.0.0.1:8080/local/rule_machine_manager.js", contentType: "text/html" ]) { resp ->
                                if (resp.success) {  js_installed = '<span class="installed">(Found in File Manager)</span>' }
                            }
                        } 
                        catch (Exception e) { if( logDebugEnable ) log.debug "Call to check js file in file manager failed: ${e.message}" }
                            
                        try {
                            httpGet([ uri: "http://127.0.0.1:8080/local/rule_machine_manager.css", contentType: "text/html" ]) { resp ->
                                if (resp.success) {  css_installed = '<span class="installed">(Found in File Manager)</span>' }
                            }
                        } 
                        catch (Exception e) { if( logDebugEnable ) log.debug "Call to check css file in file manager failed: ${e.message}" }
            
            
                        grid += "<strong>App Version:</strong> ${version()}<br />"
                        grid += "<strong>JS File:</strong> ${js_installed}<br />"
                        grid += "<strong>CSS File:</strong> ${css_installed}"
                    grid += "</p>"
                grid += "</div>"
            grid += "</div>"
            
            paragraph "${grid}"
            if( logDebugEnable ) log.debug "Finished Page Footer..."
            if( logDebugEnable ) log.debug "Finished Page HTML..."
        }
    }
}

// Create page options panel
def pageOptionsPanel( optsUserRules) {
    
    if( logDebugEnable ) log.debug "Creating Page Options Panel..."
    
    // Define variables
    check_counts = optsUserRules && optsUserRules.hide_counts == 'true' ? 'checked="checked"' : ''
    check_filters = optsUserRules && optsUserRules.hide_filters == 'true' ? 'checked="checked"' : ''
    hideGlobalFilter = check_filters != '' ? 'display:none;' : ''
    
    // Begin options panel
	panel = "<div id='header_panel' class='mdl-grid'>"
        panel += "<div id='header_left' class='mdl-cell mdl-cell--8-col graybox'>"
            panel += "<p>"
                panel += "<span id='new_group_info'>Create Rule Container:</span> <input type='text' id='new_group_name' placeholder='Container Title...' /> "
                panel += "<span id='create_group_button' class='button'><i class='material-icons'>add_circle</i> Create Container</span>"
    			panel += "<span id='global_filter' style='${hideGlobalFilter}'><input type='text' placeholder='Filter All Containers...' /></span>"
            panel += "</p>"
        panel += "</div>"
        panel += "<div id='header_right' class='mdl-cell mdl-cell--4-col graybox'>"
            panel += "<p>"
                panel += "<span id='options_panel' class='button'><i class='material-icons'>settings</i> Options Panel</span>"
                panel += "<span id='help_welcome' class='button'><i class='material-icons'>help</i> Help</span>"
                panel += "<span id='done_submit' class='button'><i class='material-icons'>check_circle</i> Done</span>"
            panel += "</p>"
        panel += "</div>"
    panel += "</div>"

    // Hidden options panel div
    panel += "<div id='options_section'>"

        panel += '<h2>Options Panel</h2>'
        panel += "<div id='main_panel'>"

    		// Export and Import options
            panel += "<div id='export_panel' class='mdl-grid'>"
                panel += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                    panel += "<p>"
                        panel += "<strong>Export Options</strong><br />"
                        panel += "Click the button to generate the app settings into the textarea.<br />"
                        panel += "Copy/paste the text and save in a text document for importing at a later time.<br />"
                        panel += "Copy Options will copy the text to the browser clipboard which can then be pasted into a document."
                    panel += "</p>"
                panel += "</div>"
                panel += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                    panel += "<p>"
                        panel += "<span id='generate_export' class='button'><i class='material-icons'>import_export</i> Export Options</span>"
                        panel += "<span class='tooltip'>"
                            panel += "<span id='copy_export' class='button'>"
                                panel += "<span class='tooltiptext' id='exportTooltip'>Copy to clipboard</span>"
                                panel += "<i class='material-icons'>content_copy</i> Copy Options"
                            panel += "</span>"
                        panel += "</span>"
                        panel += "<textarea id='export_textarea'></textarea>"
                    panel += "</p>"
                panel += "</div>"
            panel += "</div>"

            panel += "<hr />"

            panel += "<div id='import_panel' class='mdl-grid'>"
                panel += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                    panel += "<p>"
                        panel += "<strong>Import Options</strong><br />"
                        panel += "Paste the contents from a previous export into the textarea.<br />"
                        panel += "Click Import Options to populate the settings.<br />"
                        panel += "<strong>NOTE:</strong> The page will reload automatically after clicking Import Options to save the settings."
                    panel += "</p>"
                panel += "</div>"
                panel += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                    panel += "<p>"
                        panel += "<textarea id='import_textarea'></textarea><br />"
                        panel += "<span id='generate_import' class='button'><i class='material-icons'>import_export</i> Import Options</span>"
                    panel += "</p>"
                panel += "</div>"
            panel += "</div>"

            panel += "<hr />"

    		// Global options
            panel += "<div id='global_panel' class='mdl-grid'>"
                panel += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                    panel += "<p>"
                        panel += "<strong>Global Options</strong><br />"
                            panel += "<input type='checkbox' id='hide_counts' ${check_counts} /> Hide item counts on containers?<br />"
                            panel += "<input type='checkbox' id='hide_filters' ${check_filters} /> Hide all filter boxes (containers and global)?<br />"
    
    						// Hidden input for tracking welcome nag
    						welcome_nag = optsUserRules.welcome_nag ? optsUserRules.welcome_nag : 'true'
    						panel += "<input type='hidden' id='welcome_nag' value='${welcome_nag}' />"
                    panel += "</p>"
                panel += "</div>"
                panel += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                    panel += "<p>"
                    panel += "</p>"
                panel += "</div>"
            panel += "</div>"

            panel += "<hr />"

    		// Reset rules
            panel += "<div id='reset_rules' class='mdl-grid'>"
                panel += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                    panel += "<p>"
                        panel += "<strong>Reset Options</strong><br />"

                            panel += "Use this tool to restore the app back to initial default values.<br />"
                            panel += "This can be useful if something is buggy, or to start a clean slate.<br />"
                    panel += "</p>"
                panel += "</div>"
                panel += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                    panel += "<p>"
                        panel += "<strong>Note:</strong> Clicking the button will erase any customizations and reload the page.<br />"
                        panel += "<span id='reset_opts' class='button'><i class='material-icons'>import_export</i> Reset Options</span>"
                        panel += "<input type='hidden' id='load_default_opts' value='${defaultUserArrayText()}' />"
                    panel += "</p>"
                panel += "</div>"
            panel += "</div>"

        panel += "</div>"
    panel += "</div>"
    
    if( logDebugEnable ) log.debug "Finished Page Options Panel..."
    
    return panel
}

// Define default container and array of rules not yet saved in the user settings
def defaultUserArrayText() {
    
    // Get original rule list array
    origRules = ruleMap
                
    // Build string of rule ids, remove trailing comma
    buildRules = '['
    if( origRules ) {
        origRules.each{ buildRules += '"' + it.key + '",' }
        buildRules = buildRules.substring( 0, buildRules.lastIndexOf( "," ) )
    }
    buildRules += ']'
    
    // Create text string of plugin defaults
    text = '''{
        "hide_counts":"false",
        "hide_filters":"false",
		"welcome_nag": "true",
        "containers":[{
			"name":"Original Rules",
            "slug":"original-rules",
            "title_color":"",
            "title_opacity":"",
            "title_bold":"",
            "container_color":"",
            "container_opacity":"",
            "visible":true,
			"rules": ''' + buildRules + '''
		}]
	}'''
    
    return text
}

// Check for new rules
def checkForNewRules( userRules ) {
    
    // Parse user rules
    parseUserRules = new JsonSlurper().parseText( userRules )

    // Iterate user rules to build final array of keys
    newRules = []
    parseUserRules.containers.each{ it.rules.each{ newRules.push( it.toString() ) } }
    
    // Get any new rules that have been added
    ruleMap.each{ if( ! newRules.contains( it.key.toString() ) ) { newRulesCheck.push( it ) } }

    // If any new rules found, add notice
    if( ! newRulesCheck.isEmpty() ) {

        if( logDebugEnable ) log.debug "New Rules Found..."
        messageNew = "<div id='rules_found'>"

            messageNew += "<i class='material-icons notification'>notifications</i>"
        messageNew += "New rules (${newRulesCheck.size()}) have been discovered and added to the \"Original Rules\" container. Please click the \"Done\" button to save after any modifications."
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
    
    // Check if any rules have been removed
    parseUserRules = new JsonSlurper().parseText( userRules )

    // Define final array, compare with new rules and extract deleted rules
    deletedRules = []
    parseUserRules.containers.each{ it.rules.each{ deletedRules.push( it.toString() ) } }
    ruleMap.each{ deletedRules.removeAll( it.key.toString() ) }

    // Check what is left in this array against allowed rules; to allow duplicates through
    ruleMap.each{
        it.each{
			
            // If this is a duplicate rule; it still exists in the main rm array
            if( deletedRules.contains( it.key.toString() ) ) { deletedRules.remove( it.key.toString() ) }
        }
    }

    // If any deleted rules found, add notice
    if( ! deletedRules.isEmpty() ) {

        if( logDebugEnable ) log.debug "Deleted Rules Found..."
        messageDeleted = "<div id='rules_deleted'>"

            messageDeleted += "<i class='material-icons notification'>notifications</i>"
        messageDeleted += "Some rules (${deletedRules.size()}) have been deleted. Please click the \"Done\" button to save after any modifications."
        messageDeleted += "</div>"
        
        return messageDeleted
    }
    // Else no deleted rules found
    else {

        if( logDebugEnable ) log.debug "No Deleted Rules Found..."
        return false
    }
}

def installed() {
    
    log.trace "Installed Rule Machine Manager Application"
    updated()
}

def updated() {
    
    log.trace "Updated Rule Machine Manager Application"
    if( logDebugEnable ) log.debug app.getSetting( 'userArray' )
    if( logDebugEnable ) runIn( 900, logDebugOff )
}

def logDebugOff() {
    
    log.warn "Debug Logging Disabled..."
    app.updateSetting("logDebugEnable", [value: "false", type: "bool"])
}
