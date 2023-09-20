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
 */

def version() { "1.0.0" }
import hubitat.helper.RMUtils

definition(
    name: "Rule Machine Manager",
    namespace: "ruleMachineManager",
    author: "Josh Lobe",
    description: "Visual interface for Managing Rule Machine Rules.",
    category: "Convenience",
    importUrl: "https://raw.githubusercontent.com/joshlobe/hubitat_rule_manager/main/rule_machine_manager.groovy",
    iconUrl: "",
    iconX2Url: ""
)

preferences {
    page(name: "mainPage", install: true, uninstall: true) {
        section {
            
            // Define variables
            userRules = ''
            html = ""
            
            // Include jquery and sortable
            html += "<script src='https://code.jquery.com/jquery-3.6.0.js'></script>"
            html += "<script src='https://code.jquery.com/ui/1.13.2/jquery-ui.js'></script>"
            
            // Create new group button
            html += '<div id="create_group">'
                html += '<p>'
                    html += 'Use the tool below to create a new Rule Group. The group will be added; and items can then be dragged to the new area.<br />'
                    html += 'Type a name for the new group and click "Create". <input type="text" id="new_group_name" /> <span id="create_group_button" class="button">Create</span>'
                html += '</p>'
            html += '</div>'
            
            // Begin page html
            html += "<div id='rules_container'>"
            
            // Check if there are user rules defined
            settings.each{
                if( it.key == 'userArray' ) {
                        userRules = it.value
                }
            }
                
            // Debug logging
            if( logDebugEnable ) log.debug "Obtaining User Rule List"
            if( logDebugEnable ) log.debug userRules
            
            // If user rules are available
            if( userRules != '' ) {
                
                // Define count for iteration
                count = 0
                
                // Decode rules
                userRules = parseJson( userRules )
                
                // Loop each rule
                userRules.each{
                    
                    html += "<div id='${it.slug}' class='rule_container'>"

                        // Create title
                        html += "<h4>"
                            html += "<span class='group_name'>${it.name}</span>"
                            html += "<span class='group_rule_count'></em></span>"
                    
                            if( it.slug != 'original-rules' ) {
                                html += '<i class="material-icons delete_group" title="Delete Group">delete</i>'
                            }
                    
                            toggle = it.visible == true ? 'file_upload' : 'file_download'
                            html += "<i class='material-icons expand' title='Toggle Open/Close'>${toggle}</i>"
                            html += '<i class="material-icons drag_handle" title="Drag/Sort">reorder</i>'
                    
                            if( it.slug != 'original-rules' ) {
                                html += '<i class="material-icons edit" title="Edit Title">edit</i>'
                            }
                        html += "</h4>"

                        // Create rulelist
                        visible = it.visible == false ? 'display:none;' : ''
                        html += "<ul class='rulelist' style='${visible}'>"

                            // Loop each rule
                            it.rules.each{ 
                                
                                rule_id = it
                                userMap = getRuleListArray()
                                getValue = userMap.find{it.key == rule_id.toInteger()}.value
                                
                                // Create list item
                                html += "<li id='${rule_id}' class='ui-state-default rule'>"
                                    html += getValue
                                    html += "<i class='material-icons view_rule' title='View Rule'><a target='_blank' href='http://${location.hub.localIP}/installedapp/configure/${rule_id}'>launch</a></i>"
                                html += "</li>"
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
            
                    html += "<h4>"
                        html += "<span class='group_name'>Original Rules</span>"
                        html += "<span class='group_rule_count'></span>"
                
                        html += '<i class="material-icons expand" title="Toggle Open/Close">file_upload</i>'
                        html += '<i class="material-icons drag_handle" title="Drag/Sort">reorder</i>'
                    html += "</h4>"
                
                    // Display initial rulelist
                    html += "<ul class='rulelist'>"
            
                    rules = getRuleList()
                    rules.each{ 
                        it.each{
                            html += "<li id='${it.key}' class='ui-state-default rule'>"
                                html += it.value
                                html += "<i class='material-icons view_rule' title='View Rule'><a target='_blank' href='http://${location.hub.localIP}/installedapp/configure/${it.key}'>launch</a></i>"
                            html += "</li>"
                        }
                    }
                
                    // Debug logging
                    if( logDebugEnable ) log.debug "Obtaining Initial Rule List"
                    if( logDebugEnable ) log.debug rules
            
                    html += "</ul>"
                html += "</div>"
            }
            html += "</div>"
            
            // Create hidden form input and variables
            html += '<input type="hidden" name="userArray.type" value="text">'
            html += '<input type="hidden" name="userArray.multiple" value="false">'
            html += '<input type="hidden" name="settings[userArray]" class="mdl-textfield__input" id="userArray">'
            
            // Add scripts for page
            html += '<script src="//joshlobe.com/hubitat/rule_machine_manager/rule_machine_manager.js"></script>'
            
            // Add styles for page
            html += "<style type='text/css'>"
                html += "div.rule_container { border: 1px solid #CCC; padding: 0px 10px 0px 10px; margin-bottom: 20px; }"
                html += "span.group_rule_count { margin-left: 10px; }"
                html += "ul.rulelist { list-style-type: none; padding: 5px; min-height: 40px; border: 1px solid #CCC; }"
                html += "li.rule { padding: 5px 20px; cursor: pointer; margin-bottom: 2px; }"
                html += "li.rule:hover { background-color: #EEE; }"
                html += "div#create_group { margin-bottom: 20px; }"
                html += "i.delete_group, i.expand, i.view_rule, i.drag_handle, i.edit { cursor: pointer; float: right; margin-right: 5px; }"
                html += "i.delete_group:hover { color: red; }"
                html += "i.expand:hover, i.drag_handle:hover, i.edit:hover { color: #1a77c9; }"
                html += ".button { padding: 3px 10px; border: 1px solid #CCC; border-radius: 4px; background-color: #EEE; cursor: pointer; }"
                html += ".button:hover { background-color: #DEDEDE; }"
            html += "</style>"
            
            // Display page
            paragraph "${html}"
            
            paragraph "<hr />"
            
            paragraph "<p>Use the debug tool to generate information for the log file.</p>"
            input "logDebugEnable", "bool", required: false, title: "Enable Debug Logging<br>(auto off in 15 minutes)", defaultValue: false
            
            paragraph "<hr />"
            
            paragraph "<p>Use the button below to restore all default values.<br />This can be useful if something is buggy, or to start a clean slate.</p>"
            input "resetRules", "button", required: false, title: "Reset Rules", defaultValue: false
            
            paragraph "<hr />"
            
            paragraph "<p><strong>NOTE:</strong> Remember to click \"Done\" after modifying any options or resetting the rules.</p>"
            
            paragraph "<hr />"
            
            paragraph "<p>App Version: ${version()}</p>"
            
            paragraph "<hr />"
        }
    }
}

// Handle reset rules button
def appButtonHandler( resetRules ) {
    
    if( logDebugEnable ) log.debug "Removing user array setting"
    app.removeSetting( 'userArray' )
}

// Get default rule list
def getRuleList() {
    
    return RMUtils.getRuleList("5.0")
}

// Get modified rule list (rebuilt for single array mapping lookup)
def getRuleListArray() {
    
    rules = RMUtils.getRuleList("5.0")
            
    customMap = [:]
    rules.each{
        it.each{
            customMap.put( it.key, it.value )
        }
    }
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
