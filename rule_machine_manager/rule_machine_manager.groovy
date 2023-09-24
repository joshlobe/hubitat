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
 * ver. 1.0.2 2023-09-22 jlobe  - 
 */

def version() { "1.0.2" }
def js_version() { "1.0.2" }

import hubitat.helper.RMUtils
import groovy.json.JsonSlurper
import groovy.json.JsonOutput

definition(
    name: "Rule Machine Manager Alpha",
    namespace: "ruleMachineManagerAlpha",
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
    userRules = new JsonSlurper().parseText( userRules )
    
    // Loop each rule and create array of ids
    final_user_rule_ids = []
    userRules.containers.each{ it.rules.each{ final_user_rule_ids.push( it.toString() ) } }
    
    // Count how many times the rule exists in the array
    count = final_user_rule_ids.count { it == id }
    return count > 1 ? 'true' : 'false'
}

preferences {
    page(name: "mainPage", install: true, uninstall: true) {
        section {
            
            // Define variables
            userRules = ""
            resetRules = getRuleListArray()
            html = ""
            hide_counts = ""
            
            // Include jquery and sortable
            html += "<script src='https://code.jquery.com/jquery-3.6.0.js'></script>"
            html += "<script src='https://code.jquery.com/ui/1.13.2/jquery-ui.js'></script>"
            html += "<script src='https://cdn.jsdelivr.net/npm/spectrum-colorpicker@1.8.1/spectrum.min.js'></script>"
            html += "<link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/spectrum-colorpicker@1.8.1/spectrum.min.css'>"
            
            // Add scripts for page
            html += "<script src='http://${location.hub.localIP}/local/rule_machine_manager.js'></script>"
            
            // Check if there are user rules defined
            settings.each{ if( it.key == 'userArray' ) { userRules = it.value } }
            
            // Debug logging
            if( logDebugEnable ) log.debug "Obtaining Rule List From User Array"
            if( logDebugEnable ) log.debug userRules
            
            /**************************************************
            // Page notices (new, deleted rules)
            **************************************************/
            
            // Run checks to determine if rules have changed
            if( userRules != '' ) {
            
            
                /**************************************************
                // Options conversion
                **************************************************/
                convert = 'yes'
                
                real_rules = userRules
                test_rules = '[{"name":"Original Rules","slug":"original-rules","title_color":"","title_bold":"","visible":"true","rules":["217","245","246","218","216","220","107"]},{"name":"More Rules","slug":"more-rules","title_color":"","title_bold":"","visible":"true","rules":["247","211","208","212","171","210"]}]'
                
                TEST_SWITCH = real_rules
                
                convertSlurp = new JsonSlurper().parseText( TEST_SWITCH )
                
                try{ checkConvert = ! convertSlurp.contains( 'hide_counts' ) }
                catch(e) { convert = 'no' }
                
                if( convert == 'yes' ) {
                
                    html = '<div class="notice_block background-blue">'
                        html += 'This version of Rule Machine Manager has improved how settings are stored.<br />Settings will need to be modified in the database in order to continue.'
                    html += '</div>'
                    
                    paragraph html
                
                    paragraph 'Previous Settings Found...'
                    paragraph 'Previous Settings:<br />' + TEST_SWITCH
                    paragraph 'Attempting Conversion...'
                    
                    string = "{"
                    
                        string += '"hide_counts":"false",'
                        string += '"containers":'
                
                        string += "["
                        convertSlurp.each{
                            string += "{"
                            it.each{
                                if( it.key == 'rules' ) {
                                
                                    string += '"' + it.key + '":['
                                    it.value.each { string += '"' + it + '",' }
                                    string = string.substring( 0, string.lastIndexOf( "," ) );
                                    string += "]"
                                }
                                else {
                                
                                    string += '"' + it.key + '":"' + it.value + '",'
                                }
                            }
                            string += "},"
                        }
                        string = string.substring( 0, string.lastIndexOf( "," ) );
                        string += "]"
                    string += "}"
                    
                    string = string.replaceAll( '"','&quot;' )
                
                    paragraph 'Conversion Successful...'
                    
                    paragraph 'New Settings:<br />' + string
                    
                    paragraph '<strong>IMPORTANT!! Click the "Done" button to update the database.</strong>'
                    
                    
                    // Create hidden form input and variables
                    hidden_input = '<input type="hidden" name="userArray.type" value="text">'
                    hidden_input += '<input type="hidden" name="userArray.multiple" value="false">'
                    hidden_input += '<input type="hidden" name="settings[userArray]" class="mdl-textfield__input" id="userArray" value="' + string + '">'
                    
                    paragraph hidden_input
                    
                    return
                }
                
                /**************************************************
                // New Rules
                **************************************************/
                // Check if any new rules have been added
                check_addition_user = new JsonSlurper().parseText( userRules )
                check_addition_new = getRuleListArray()
                
                // Define global variables here; not sure why it has to be here; something with userRules
                hide_counts = check_addition_user.hide_counts
                
                // Iterate user rules to build final array of keys
                final_user_rule_ids = []
                check_addition_user.containers.each{ it.rules.each{ final_user_rule_ids.push( it.toString() ) } }
                
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
                /**************************************************
                // Deleted Rules
                **************************************************/
                // Check if any rules have been removed
                check_removal_user = new JsonSlurper().parseText( userRules )
                check_removal_new = getRuleListArray()
                
                // Define final array, compare with new rules and extract deleted rules
                final_user_rule_ids = []
                check_removal_user.containers.each{ it.rules.each{ final_user_rule_ids.push( it.toString() ) } }
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
            
            /**************************************************
            // Page options panel
            **************************************************/
            
            // Create new rule group input; options panel button
            html += "<div id='header_panel' class='mdl-grid'>"
                html += "<div id='header_left' class='mdl-cell mdl-cell--6-col graybox'>"
                    html += "<p>"
                        html += "Create a new Rule Group Container: <input type='text' id='new_group_name' placeholder='Container Title' /> "
                        html += "<span id='create_group_button' class='button'><i class='material-icons'>add_circle</i> Create Container</span>"
                    html += "</p>"
                html += "</div>"
                html += "<div id='header_right' class='mdl-cell mdl-cell--6-col graybox'>"
                    html += "<p>"
                        html += "<span id='options_panel' class='button'><i class='material-icons'>settings</i> Options Panel</button>"
                    html += "</p>"
                html += "</div>"
            html += "</div>"
            
            // Hidden options panel div
            html += "<div id='options_section'>"
                html += "<div id='main_panel'>"
            
                    html += "<div id='export_panel' class='mdl-grid'>"
                        html += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                            html += "<p>"
                                html += "<strong>Export Options</strong><br />"
                                html += "Click the button to generate the app settings into the textarea.<br />"
                                html += "Copy/paste the text and save in a text document for importing at a later time.<br />"
                                html += "Copy Options will copy the text to the browser clipboard which can then be pasted into a document."
                            html += "</p>"
                        html += "</div>"
                        html += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                            html += "<p>"
                                html += "<span id='generate_export' class='button'><i class='material-icons'>import_export</i> Export Options</span>"
                                html += "<span class='tooltip'>"
                                    html += "<span id='copy_export' class='button'>"
                                        html += "<span class='tooltiptext' id='exportTooltip'>Copy to clipboard</span>"
                                        html += "<i class='material-icons'>content_copy</i> Copy Options"
                                    html += "</span>"
                                html += "</span>"
                                html += "<textarea id='export_textarea'></textarea>"
                            html += "</p>"
                        html += "</div>"
                    html += "</div>"
            
                    html += "<hr />"
            
                    html += "<div id='import_panel' class='mdl-grid'>"
                        html += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                            html += "<p>"
                                html += "<strong>Import Options</strong><br />"
                                html += "Paste the contents from a previous export into the textarea.<br />"
                                html += "Click Import Options to populate the settings.<br />"
                                html += "<strong>NOTE:</strong> The page will reload automatically after clicking Import Options to save the settings."
                            html += "</p>"
                        html += "</div>"
                        html += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                            html += "<p>"
                                html += "<textarea id='import_textarea'></textarea><br />"
                                html += "<span id='generate_import' class='button'><i class='material-icons'>import_export</i> Import Options</span>"
                            html += "</p>"
                        html += "</div>"
                    html += "</div>"
            
                    html += "<hr />"
            
                    html += "<div id='global_panel' class='mdl-grid'>"
                        html += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                            html += "<p>"
                                html += "<strong>Global Options</strong><br />"
            
                                    check_counts = hide_counts == 'true' ? 'checked="checked"' : ''
                                    html += "Hide item count on each container? <input type='checkbox' id='hide_counts' ${check_counts} /><br />"
                            html += "</p>"
                        html += "</div>"
                        html += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                            html += "<p>"
                            html += "</p>"
                        html += "</div>"
                    html += "</div>"
            
                    html += "<hr />"
            
                    // Get default array and populate into hidden input (for resetting rules)
                    default_rules = "["
                    resetRules.each{ default_rules += '"' + it.key + '"' + "," }
                    default_rules = default_rules.substring( 0, default_rules.lastIndexOf( "," ) );
                    default_rules += "]"
                    main_defaults = '{"hide_counts":"false","containers":[{"name":"Original Rules","slug":"original-rules","title_color":"","title_bold":"","visible":true,"rules":' + default_rules + '}]}'
            
                    html += "<div id='reset_rules' class='mdl-grid'>"
                        html += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                            html += "<p>"
                                html += "<strong>Reset Options</strong><br />"
            
                                    html += "Use this tool to restore the app back to initial default values.<br />"
                                    html += "This can be useful if something is buggy, or to start a clean slate.<br />"
                            html += "</p>"
                        html += "</div>"
                        html += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                            html += "<p>"
                                html += "<strong>Note:</strong> Clicking the button will erase any customizations and reload the page.<br />"
                                html += "<span id='reset_opts' class='button'><i class='material-icons'>import_export</i> Reset Options</span>"
                                html += "<input type='hidden' id='load_default_opts' value='${main_defaults}' />"
                            html += "</p>"
                        html += "</div>"
                    html += "</div>"
            
                html += "</div>"
            html += "</div>"
            
            /**************************************************
            // Page containers
            **************************************************/
            
            // Begin page containers
            html += "<div id='rules_container'>"
            
            // If user rules are available
            if( userRules != '' ) {
                
                // Define count for iteration
                count = 0
                    
                // Create temp array for duplication comparisons
                tempArray = []
                
                // Decode rules
                userRules = new JsonSlurper().parseText( userRules )
                
                // Loop each rule
                userRules.containers.each{
                    
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
                    
                            // Hide rule counts if user selected
                            hide_counts = userRules.hide_counts == 'true' ? 'display: none;' : ''
                            html += "<span class='group_rule_count' style='${hide_counts}'></span>"
                    
                            // Submenu three dot
                            html += '<i class="material-icons submenu">more_vert</i>'

                            html += '<div class="dropdown-content">'
                    
                                // Add edit icon, but not to original rules container
                                if( it.slug != 'original-rules' ) {
                                
                                    html += '<div class="edit_title_div"><i class="material-icons edit">edit</i> Edit Title</div>'
                                }
                    
                                // Add expand/collapse icon
                                toggle_icon = it.visible == true ? 'file_upload' : 'file_download'
                                toggle_text = it.visible == true ? 'Collapse' : 'Expand'
                                html += "<div class='toggle_container'><i class='material-icons expand'>${toggle_icon}</i> ${toggle_text}</div>"
                    
                                // Add sort icons
                                html += '<div class="sortasc_container"><i class="material-icons">arrow_downward</i> Sort Asc</div>'
                                html += '<div class="sortdesc_container"><i class="material-icons">arrow_upward</i> Sort Desc</div>'
                    
                                // Add drag icon
                                html += '<div class="drag_container drag_handle"><i class="material-icons" title="Drag/Sort">open_with</i> Move</div>'
                    
                                // Add delete icon, but not to original rules container
                                if( it.slug != 'original-rules' ) {
                                
                                    html += '<div class="delete_container"><i class="material-icons delete_group">delete</i> Delete Container</div>'
                                }
                    
                            html += '</div>'
                    
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
                                        
                                        copy_or_delete = "<div class='delete_duplicate'><i class='material-icons'>delete</i> Delete Rule</div>"
                                    }
                                    // Else this is an original rule
                                    else {

                                        copy_or_delete = "<div class='copy_rule'><i class='material-icons'>content_copy</i> Copy Rule</div>"
                                    }
                                    
                                    // Create list item
                                    html += "<li id='${rule_id}' class='ui-state-default rule'>"
                                        html += "<span class='rule_name'>${getValue}</span>"
                                    
                                        html += '<i class="material-icons submenu rule">more_vert</i>'
                                        html += '<div class="dropdown-content">'
                                    
                                            html += copy_or_delete
                                            
                                            html += "<div class='view_rule' url='http://${location.hub.localIP}/installedapp/configure/${rule_id}'>"
                                                html += "<i class='material-icons'>launch</i> View Rule"
                                            html += '</div>'
                                    
                                        html += '</div>'
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
                                    
                                        html += '<i class="material-icons submenu rule">more_vert</i>'
                                        html += '<div class="dropdown-content">'
                                    
                                            html += "<div class='copy_rule'><i class='material-icons'>content_copy</i> Copy Rule</div>"
                                            
                                            html += "<div class='view_rule' url='http://${location.hub.localIP}/installedapp/configure/${rule_id}'>"
                                                html += "<i class='material-icons'>launch</i> View Rule"
                                            html += '</div>'
                                    
                                        html += '</div>'
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
                
                        html += '<i class="material-icons submenu">more_vert</i>'
                        html += '<div class="dropdown-content">'
                            html += '<div class="toggle_container"><i class="material-icons expand">file_upload</i> Collapse</div>'
                            html += '<div class="sortasc_container"><i class="material-icons">arrow_downward</i> Sort Asc</div>'
                            html += '<div class="sortdesc_container"><i class="material-icons">arrow_upward</i> Sort Desc</div>'
                            html += '<div class="drag_container drag_handle"><i class="material-icons" title="Drag/Sort">open_with</i> Move</div>'
                        html += '</div>'
                    html += "</h4>"
                
                    // Display initial rulelist
                    html += "<ul class='rulelist'>"
            
                    // Get rulelist and loop default rules
                    rules = getRuleList()
                    rules.each{ 
                        it.each{
                            html += "<li id='${it.key}' class='ui-state-default rule'>"
                                html += "<span class='rule_name'>${it.value}</span>"
                            
                                html += '<i class="material-icons submenu rule">more_vert</i>'
                                html += '<div class="dropdown-content">'
                                    
                                    html += "<div class='copy_rule'><i class='material-icons'>content_copy</i> Copy Rule</div>"
                                            
                                    html += "<div class='view_rule' url='http://${location.hub.localIP}/installedapp/configure/${it.key}'>"
                                        html += "<i class='material-icons'>launch</i> View Rule"
                                    html += '</div>'
                                    
                                html += '</div>'
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

            /**************************************************
            // Page styling
            **************************************************/
            
            // Add styling
            html += """
                <style type="text/css">
                    input#new_group_name { vertical-align: top; }
                    div#header_panel { padding: 0px; }
                    span#create_group_button, span#options_panel { padding: 3px 10px 5px 10px; }
                    span#create_group_button i, span#options_panel i, span#generate_export i, span#generate_import i, span#copy_export i, span#reset_opts i { vertical-align: middle; font-size: 20px; margin-top: -2px; }
                    div#header_right { text-align: right; }
                    div#options_section { display: none; }
                    div#rules_container { border: 1px solid #CCC; padding: 10px; }
                    div.rule_container { border: 1px solid #CCC; padding: 0px 10px 0px 10px; margin-bottom: 20px; }
                    span.group_rule_count { margin-left: 10px; }
                    ul.rulelist { list-style-type: none; padding: 5px; min-height: 40px; border: 1px solid #CCC; }
                    li.rule { padding: 5px 20px; cursor: pointer; margin-bottom: 2px; }
                    i.submenu, i.rule_submenu { cursor: pointer; float: right; margin-right: 5px; }
                    i.submenu { margin-top: -7px; font-size: 35px; }
                    i.submenu:hover { color: #1a77c9; }
                    i.submenu.rule { margin-top: -5px; font-size: 30px; }
                    .button { padding: 3px 10px; border: 1px solid #CCC; border-radius: 4px; background-color: #EEE; cursor: pointer; }
                    .button:hover { background-color: #DEDEDE; }
                    input.edit_title_input, span.submit_edit, span.cancel_edit, div.sp-light { margin-right: 10px; }
                    span.submit_edit { background-color: #f0fcf1; }
                    span.cancel_edit { background-color: #fcf2f0; }
                    span.submit_edit:hover { background-color: #d2facd; }
                    span.cancel_edit:hover { background-color: #faddd7; }
                    div.sp-preview { width: 20px !important; height: 16px !important; }
                    div.sp-replacer.sp-light { vertical-align: bottom; border: 1px solid #CCC; border-radius: 4px; padding: 4px 10px; }
                    div.sp-replacer.sp-light:hover { background-color: #DEDEDE; }
                    span.title_bold i { vertical-align: bottom; }
                    span.title_bold.active { background-color: #CCC; }
                    div#rules_found, div#rules_deleted, div.notice_block { border: 1px solid #8ac6eb; padding: 20px; border-radius: 4px; margin-bottom: 20px; background-color: #f2faff; }
                    i.notification { margin-right: 10px; vertical-align: bottom; }

                    div.dropdown-content { width: 200px; right: 30px; border: 1px solid #CCC; margin-top: 6px; min-height: 20px; }
                    div.dropdown-content div { display: block; border-bottom: 1px solid #CCC; padding: 5px 10px; }
                    div.dropdown-content div:hover { background-color: #f2faff; cursor: pointer; }
                    div.dropdown-content div i { margin-right: 10px; font-size: 20px; vertical-align: text-bottom; }
                    div.dropdown-content div.delete_container, div.delete_duplicate { color: red; }

                    div#main_panel { border: 1px solid #CCC; margin-bottom: 20px; }
                    textarea#export_textarea, textarea#import_textarea { width: 100%; margin-top: 10px; height: 80px; }
                    div#export_panel div p, div#import_panel div p { margin-bottom: 0px; }
                    span#generate_export { margin-right: 10px; }
                    input#hide_counts { height: 16px; width: 16px; vertical-align: top; }

                    .tooltip{ position: relative; display: inline-block; }
                    .tooltip .tooltiptext { visibility: hidden; width: 140px; background-color: #555; color: #fff; text-align: center; border-radius: 6px; padding: 5px; position: absolute; z-index: 1; bottom: 150%; left: 50%; margin-left: -75px; opacity: 0; transition: opacity 0.3s; }
                    .tooltip .tooltiptext::after { content: ""; position: absolute; top: 100%; left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: #555 transparent transparent transparent; }
                    .tooltip:hover .tooltiptext { visibility: visible; opacity: 1; }
                </style>
            """
            
            /**************************************************
            // Page render html
            **************************************************/
            
            // Display page
            paragraph "${html}"
            paragraph "<hr />"
            
            // Log file
            paragraph "<p>Use the debug tool to generate information for the log file.</p>"
            input "logDebugEnable", "bool", required: false, title: "Enable Debug Logging (auto off in 15 minutes)", defaultValue: false
            paragraph "<hr />"
            
            // Footer notes
            grid = "<div class='mdl-grid'>"
                grid += "<div class='mdl-cell mdl-cell--6-col graybox'>"
                    grid += "<p>"
                        grid += "<strong>NOTE:</strong> Remember to click \"Done\" after modifying any options or resetting the rules.<br />"
                        grid += "<strong>NOTE:</strong> Only rules from Rule Manager 5.0 are currently available using this application.<br />"
                    grid += "</p>"
                grid += "</div>"
                grid += "<div class='mdl-cell mdl-cell--6-col graybox'>"
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

// Get default rule list
def getRuleList() {
    
    // Get rule list
    return RMUtils.getRuleList("5.0")
}


// Get modified rule list (rebuilt for single array mapping lookup)
def getRuleListArray() {
    
    // Get rule list
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
