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
 * ver. 1.0.0 2023-09-20 jlobe  - Initial public release
 * ver. 1.0.1 2023-09-22 jlobe  - Fixed sorting and added sorting features. Logic for new rules and deleted rules. Added copy functionality.
 */

def version() { "1.0.1" }
def js_version() { "1.0.1" }

import hubitat.helper.RMUtils

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

def isDuplicate( id ) {
    
    userRules = ''
    
    // Get user settings
    settings.each{ if( it.key == 'userArray' ) { userRules = it.value } }
    userRules = parseJson( userRules )
    
    // Loop each rule and create array of ids
    final_user_rule_ids = []
    userRules.each{ it.rules.each{ final_user_rule_ids.push( it.toString() ) } }
    
    // Count how many times the rule exists in the array
    count = final_user_rule_ids.count { it == id }
    return count > 1 ? 'true' : 'false'
}

preferences {
    page(name: "mainPage", install: true, uninstall: true) {
        section {
            
            // Define variables
            userRules = ""
            html = ""
            
            // Include jquery and sortable
            html += "<script src='https://cdn.jsdelivr.net/npm/spectrum-colorpicker@1.8.1/spectrum.min.js'></script>"
            html += "<script src='https://code.jquery.com/jquery-3.6.0.js'></script>"
            html += "<script src='https://code.jquery.com/ui/1.13.2/jquery-ui.js'></script>"
            html += "<link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/spectrum-colorpicker@1.8.1/spectrum.min.css'>"
            
            // Add scripts for page
            html += "<script src='http://${location.hub.localIP}/local/rule_machine_manager.js'></script>"
            
            // Check if there are user rules defined
            settings.each{ if( it.key == 'userArray' ) { userRules = it.value } }
                
            // Debug logging
            if( logDebugEnable ) log.debug "Obtaining Rule List From User Array"
            if( logDebugEnable ) log.debug userRules
                
            // Run checks to determine if rules have changed
            if( userRules != '' ) {
                
                // Check if any new rules have been added
                check_addition_user = parseJson( userRules )
                check_addition_new = getRuleListArray()

                // Iterate user rules to build final array of keys
                final_user_rule_ids = []
                check_addition_user.each{ it.rules.each{ final_user_rule_ids.push( it.toString() ) } }

                // Get any new rules that have been added
                add_new_rules = []
                check_addition_new.each{ if( ! final_user_rule_ids.contains( it.key.toString() ) ) { add_new_rules.push( it ) } }

                // If any new rules found, add notice
                if( ! add_new_rules.isEmpty() ) {
                    
                    html += "<div id='rules_found'>"

                        html += "<i class='material-icons notification'>notifications</i>"
                    html += "New rules (${add_new_rules.size()}) have been discovered and added to the \"Original Rules\" container. Please click the \"Done\" button to save after any modifications."
                    html += "</div>"
                }
                
                
                // Check if any rules have been removed
                check_removal_user = parseJson( userRules )
                check_removal_new = getRuleListArray()
                
                // Define final array, compare with new rules and extract deleted rules
                final_user_rule_ids = []
                check_removal_user.each{ it.rules.each{ final_user_rule_ids.push( it.toString() ) } }
                check_removal_new.each{ final_user_rule_ids.removeAll( it.key.toString() ) }
                
                // Check what is left in this array against allowed rules; to allow duplicates through
                check_removal_new.each{
                    it.each{
                        
                        // If this is a duplicate rule; it still exists in the main rm array
                        if( final_user_rule_ids.contains( it.key.toString() ) ) { final_user_rule_ids.remove( it.key.toString() ) }
                    }
                }

                // If any deleted rules found, add notice
                if( ! final_user_rule_ids.isEmpty() ) {
                    
                    html += "<div id='rules_deleted'>"

                        html += "<i class='material-icons notification'>notifications</i>"
                    html += "Some rules (${final_user_rule_ids.size()}) have been deleted. Please click the \"Done\" button to save after any modifications."
                    html += "</div>"
                }
            }

            // Create new group button
            html += '<div id="create_group">'
                html += '<p>'
                    html += 'Use the tool below to create a new Rule Group. The group will be added; and items can then be dragged to the new area.<br />'
                    html += 'Type a name for the new group and click "Create". <input type="text" id="new_group_name" /> <span id="create_group_button" class="button">Create</span>'
                html += '</p>'
            html += '</div>'
            
            // Begin page html
            html += "<div id='rules_container'>"
            
            // If user rules are available
            if( userRules != '' ) {
                
                // Define count for iteration
                count = 0
                    
                // Create temp array for duplication comparisons
                tempArray = []
                
                // Decode rules
                userRules = parseJson( userRules )
                
                // Loop each rule
                userRules.each{
                    
                    html += "<div id='${it.slug}' class='rule_container'>"
                
                    html += "<input type='hidden' class='title_color' value='${it.title_color}' />"
                    html += "<input type='hidden' class='title_bold' value='${it.title_bold}' />"
                    
                        // Check vars
                        title_color = ( it.title_color != '' && it.title_color != null ) ? it.title_color : '#000'
                        title_bold = ( it.title_bold == 'true' ) ? 'bold' : 'normal'

                        // Create title
                        html += "<h4>"
                            html += "<span class='group_name' style='color:${title_color};font-weight:${title_bold};'>${it.name}</span>"
                            html += "<span class='group_name_edit'></span>"
                            html += "<span class='group_rule_count'></span>"
                    
                            // Add delete icon, but not to original rules container
                            if( it.slug != 'original-rules' ) {
                                html += '<i class="material-icons delete_group" title="Delete Group">delete</i>'
                            }
                    
                            toggle = it.visible == true ? 'file_upload' : 'file_download'
                            html += "<i class='material-icons expand' title='Toggle Open/Close'>${toggle}</i>"
                            html += '<i class="material-icons drag_handle" title="Drag/Sort">reorder</i>'
                    
                            // Add edit icon, but not to original rules container
                            if( it.slug != 'original-rules' ) {
                                html += '<i class="material-icons edit" title="Edit Title">edit</i>'
                            }
                        html += "</h4>"

                        // Create rulelist
                        visible = it.visible == false ? 'display:none;' : ''
                        html += "<ul class='rulelist' style='${visible}'>"

                            // Loop each rule
                            it.rules.each{ 
                                
                                // Setup vars
                                rule_id = it
                                userMap = getRuleListArray()
                                
                                // First ensure key exists (used when rules have been deleted from RM)
                                if( userMap.find{it.key == rule_id.toInteger()} ) {
                                    
                                    // Get array value
                                    getValue = userMap.find{it.key == rule_id.toInteger()}.value
                                    
                                    // Add this item to temp array
                                    tempArray.push( it )
                                    
                                    // If this is a duplicate; and it has already been rendered on page, it is a duplicate
                                    if( isDuplicate( rule_id ) == 'true' && tempArray.count( rule_id ) > 1 ) {
                                        
                                        copy_or_delete = "<i class='material-icons delete_duplicate' title='Delete Duplicate Rule'>delete</i>"
                                    }
                                    // Else this is an original rule
                                    else {

                                        copy_or_delete = "<i class='material-icons copy_rule' title='Copy Rule'>content_copy</i>"
                                    }
                                    
                                    // Create list item
                                    html += "<li id='${rule_id}' class='ui-state-default rule'>"
                                        html += "<span class='rule_name'>${getValue}</span>"
                                        html += "<i class='material-icons view_rule' title='View Rule'><a target='_blank' href='http://${location.hub.localIP}/installedapp/configure/${rule_id}'>launch</a></i>"
                                        html += copy_or_delete
                                    html += "</li>"
                                }
                            }
                    
                            // Add any newly found rules (only add to original container)
                            if( it.slug == 'original-rules' ) {
                                
                                // Loop new rules
                                add_new_rules.each{
                        
                                    // Setup vars and match to rulelist array
                                    rule_id = it.key
                                    userMap = getRuleListArray()
                                    getValue = userMap.find{it.key == rule_id.toInteger()}.value
                                
                                    // Create list item
                                    html += "<li id='${rule_id}' class='ui-state-default rule'>"
                                        html += "<span class='rule_name'>${getValue}</span>"
                                        html += "<i class='material-icons view_rule' title='View Rule'><a target='_blank' href='http://${location.hub.localIP}/installedapp/configure/${rule_id}'>launch</a></i>"
                                        html += "<i class='material-icons copy_rule' title='Copy Rule'>content_copy</i>"
                                    html += "</li>"
                                }
                            }

                        html += "</ul>"
                    html += "</div>"
                    
                    // Increase count by 1
                    count++
                }
            }
            // Else use defaults
            else {

                html += "<div id='original_rules' class='rule_container'>"
                
                    html += '<input type="hidden" class="title_color" />'
                    html += "<input type='hidden' class='title_bold' />"
            
                    html += "<h4>"
                        html += "<span class='group_name'>Original Rules</span>"
                        html += "<span class='group_rule_count'></span>"
                        html += '<i class="material-icons expand" title="Toggle Open/Close">file_upload</i>'
                        html += '<i class="material-icons drag_handle" title="Drag/Sort">reorder</i>'
                    html += "</h4>"
                
                    // Display initial rulelist
                    html += "<ul class='rulelist'>"
            
                    // Get rulelist and loop default rules
                    rules = getRuleList()
                    rules.each{ 
                        it.each{
                            html += "<li id='${it.key}' class='ui-state-default rule'>"
                                html += "<span class='rule_name'>${it.value}</span>"
                                html += "<i class='material-icons view_rule' title='View Rule'><a target='_blank' href='http://${location.hub.localIP}/installedapp/configure/${it.key}'>launch</a></i>"
                                html += "<i class='material-icons copy_rule' title='Copy Rule'>content_copy</i>"
                            html += "</li>"
                        }
                    }
                
                    // Debug logging
                    if( logDebugEnable ) log.debug "Obtaining Initial Rule List From RM"
                    if( logDebugEnable ) log.debug rules
            
                    html += "</ul>"
                html += "</div>"
            }
               
            html += '</div>'
            
            // Create hidden form input and variables
            html += '<input type="hidden" name="userArray.type" value="text">'
            html += '<input type="hidden" name="userArray.multiple" value="false">'
            html += '<input type="hidden" name="settings[userArray]" class="mdl-textfield__input" id="userArray">'
            
            // Add styles for page
            html += "<style type='text/css'>"
                html += "div#rules_container { border: 1px solid #CCC; padding: 10px; }"
                html += "div.rule_container { border: 1px solid #CCC; padding: 0px 10px 0px 10px; margin-bottom: 20px; }"
                html += "span.group_rule_count { margin-left: 10px; }"
                html += "ul.rulelist { list-style-type: none; padding: 5px; min-height: 40px; border: 1px solid #CCC; }"
                html += "li.rule { padding: 5px 20px; cursor: pointer; margin-bottom: 2px; }"
                html += "div#create_group { margin-bottom: 20px; }"
                html += "i.delete_group, i.expand, i.view_rule, i.drag_handle, i.edit, i.copy_rule, i.delete_duplicate { cursor: pointer; float: right; margin-right: 5px; }"
                html += "i.delete_group:hover, i.delete_duplicate:hover { color: red; }"
                html += "i.expand:hover, i.drag_handle:hover, i.edit:hover, i.copy_rule:hover { color: #1a77c9; }"
                html += ".button { padding: 3px 10px; border: 1px solid #CCC; border-radius: 4px; background-color: #EEE; cursor: pointer; }"
                html += ".button:hover { background-color: #DEDEDE; }"
                html += "input.edit_title_input, span.submit_edit, span.cancel_edit, div.sp-light { margin-right: 10px; }"
                html += "div.sp-preview { width: 20px !important; height: 16px !important; }"
                html += "div.sp-replacer.sp-light { vertical-align: bottom; border: 1px solid #CCC; border-radius: 4px; padding: 4px 10px; }"
                html += "div.sp-replacer.sp-light:hover { background-color: #DEDEDE; }"
                html += "span.title_bold i { vertical-align: bottom; }"
                html += "span.title_bold.active { background-color: #CCC; }"
                html += "div#rules_found, div#rules_deleted { border: 1px solid #8ac6eb; padding: 20px; border-radius: 4px; margin-bottom: 20px; background-color: #f2faff; }"
                html += "i.notification { margin-right: 10px; vertical-align: bottom; }"
            html += "</style>"
            
            // Display page
            paragraph "${html}"
            paragraph "<hr />"
            
            // Log file
            paragraph "<p>Use the debug tool to generate information for the log file.</p>"
            input "logDebugEnable", "bool", required: false, title: "Enable Debug Logging<br>(auto off in 15 minutes)", defaultValue: false
            paragraph "<hr />"
            
            // Reset rules button
            paragraph "<p>Use the button below to restore all default values.<br />This can be useful if something is buggy, or to start a clean slate.</p>"
            input "resetRules", "button", required: false, title: "Reset Rules", defaultValue: false
            paragraph "<hr />"
            
            // Footer notes
            grid = "<div class = 'mdl-grid'>"
                grid += "<div class = 'mdl-cell mdl-cell--6-col graybox'>"
                    grid += "<p>"
                        grid += "<strong>NOTE:</strong> Remember to click \"Done\" after modifying any options or resetting the rules.<br />"
                        grid += "<strong>NOTE:</strong> Only rules from Rule Manager 5.0 are currently available using this application.<br />"
                    grid += "</p>"
                grid += "</div>"
                grid += "<div class = 'mdl-cell mdl-cell--6-col graybox'>"
                    grid += "<p>"
                        grid += "<strong>App Version:</strong> ${version()}<br />"
                        grid += "<strong>JS Version:</strong> ${js_version()}"
                    grid += "</p>"
                grid += "</div>"
            grid += "</div>"
            
            paragraph "${grid}"
        }
    }
}

// Handle reset rules button
def appButtonHandler( resetRules ) {
    
    if( logDebugEnable ) log.debug "Removing User Array Setting"
    app.removeSetting( 'userArray' )
}

// Get default rule list
def getRuleList() {
    
    // Get rule list
    return RMUtils.getRuleList("5.0")
}

// Get modified rule list (rebuilt for single array mapping lookup)
def getRuleListArray() {
    
    rules = RMUtils.getRuleList("5.0")
    
    // Create new array
    customMap = [:]
    
    // Loop rules and add to rray
    rules.each{ it.each{ customMap.put( it.key, it.value ) } }
    
    // Return custom array
    return customMap
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
