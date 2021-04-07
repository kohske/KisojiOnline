---
permalink: /pluginParams/
title: "Plugin parameters"
---

Only the 'stimuli' parameter is required; Other parameters can be left unspecified if the default value is acceptable. Note that the prameter of *choices*, *prompt*, *trial_duration*, and *response_ends_trial* is the same as that of the plugins included in the jsPsych.

# Main parameters

|Parameter|Type|Default Value|Description|
|---|---|---|---|
|stimuli|array|undefined|An array of objects, each object represents a stimulus to be presented in the trial. The properties (parameters) of each object are depend on the type of the object. See [Stimulus parameters](objectProperties.md).|
|response_type|string|'key'|How participants will respond. You can specify 'key', 'mouse', or 'button'.|
|response_start_time|numeric|0|The defalut value (0) means that the participant can respond to the stimuli from the start of the trial, and the reaction time is the time from the start of the trial until the participant's response. If the response_start_time is set to 1000, the participant can respond to the stimuli 1000 ms after from the start of the trial, and the reaction time is the time from 1000 ms after the start of the trial until the participant's response.|
|response_ends_trial|boolean|true|If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the trial_duration parameter). If false, then the trial will continue until the value for trial_duration is reached. You can use this parameter to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete.|
|prompt|string|null|This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key(s) to press).|
|trial_duration|numeric|null|How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial will wait for a response indefinitely.|
|~~stepFunc~~|function|null|**This can't be used since v2.0. Please use the raf_func instead.**|
|raf_func|function|null|This function takes three arguments which are, in order, `trial`, `elapsed time in terms of milliseconds`. and `elapsed time in terms of frames`. This function is called by the *requestAnimationFrame* method, and excuted synchronized with the refresh of the display. Wnen you use the *raf_func* called by the requestAnimationFrame method, you have to specify the stimuli as an empty array. If you would like to draw stimuli using the canvas-drawing methods manually, the *raf_func* would be benefit. See, the [raf_func.html](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/raf_func.html) and [draw two images repeatedly.html](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/draw_two_images_repeatedly.html).|

# Parameters related to canvas

|Parameter|Type|Default Value|Description|
|---|---|---|---|
|background_color|string|'grey'|The background color of the canvas.The color can be specified using the HTML color names, hexadecimal (HEX) colors, and RGB values that are often used in a general HTML file. |
|canvas_width|numeric|window.innerWidth|The width of the canvas in which stimuli are drawn. If it is not specified, the width of the canvas is identical to that of the window.|
|canvas_height|numeric|window.innerHeight|The height of the canvas in which stimuli are drawn. If it is not specified, the height of the canvas is identical to that of the window.|
|clear_canvas|boolean|true|If true, the canvas is cleared every frame. There are not many cases where this should be false, but if you want to draw the trajectory of the mouse, for example, you need to set it false. Note that in that case, the show_end_time property can not be used.  See the [mouse drawing.html](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/mouse_drawing.html)|

# Parameters related to a key response

|Parameter|Type|Default Value|Description|
|---|---|---|---|
|choices|array of keycodes|jsPsych.ALL_KEYS|This array contains the keys that the participant is allowed to press in order to respond to the stimulus. Keys can be specified as their [numeric key code](https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g., 'a', 'q'). The default value of jsPsych.ALL_KEYS means that all keys will be accepted as valid responses. Specifying jsPsych.NO_KEYS will mean that no responses are allowed.|

# Parameters related to a button response

The following parameters are enabled when the `response_type` is 'button'.

|Parameter|Type|Default Value|Description|
|---|---|---|---|
|button_choices|array of strings|['Next']|Labels for the buttons. Each different string in the array will generate a different button.|
|button_html|HTML string|`<button class="jspsych-btn">%choice%</button>`| A template of HTML for generating the button elements. You can override this to create customized buttons of various kinds. The string %choice% will be changed to the corresponding element of the choices array. You may also specify an array of strings, if you need different HTML to render for each button. If you do specify an array, the choices array and this array must have the same length. The HTML from position 0 in the button_html array will be used to create the button for element 0 in the choices array, and so on.|
|vert_button_margin|string|'0px'|Vertical margin of the button(s).|
|horiz_button_margin|string|'8px'|Horizontal margin of the button(s).|

# Parameters related to event handlers

|Parameter|Type|Default Value|Description|
|---|---|---|---|
|mouse_down_func|function|null|This is the event handler of the mousedown on the canvas. See the [mouse_drawing.html](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/mouse_drawing.html) and [mouse_event.html](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/mouse_event.html).|
|mouse_up_func|function|null|This is the event handler of the mouseup on the canvas.|
|mouse_move_func|function|null|This is the event handler of the mousemove on the canvas.|
|key_down_func|function|null|This is the event handler of the keydown on the document. See the [keyboard_event.html](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/keyboard_event.html).|
|key_up_func|function|null|This is the event handler of the keyup on the canvas.|

# Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/plugins/overview/#data-collected-by-plugins), this plugin collects the following data for each trial.

|Name|Type|Value|
|---|---|---|
|rt|numeric|The response time in milliseconds for the participant to make a response. The start time of the measurement depends on the 'response_start_time'.|
|response_type|string|'key', 'mouse', or 'button'|
|key_press|numeric|Indicates which key the participant pressed. The value is the [numeric key code](https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the participant's response. '-1' means thant the participant respond using a mouse.|
|avg_frame_time|numeric|Averaged interframe interval.|
|click_x/click_y|numeric|Horizontal/Vertical clicked position. The origin of the coordinate is the top left of the canvas, and the unit is the pixel.|
|center_x/center_y|numeric|Horizontal/Vertical position of the center of the window. The origin of the coordinate is the top left of the canvas, and the unit is the pixel.|
|button_pressed|numeric|Indicates which button the subject pressed. The first button in the choices array is 0, the second is 1, and so on.|

# Read only parameters

|Parameter|Description|
|---|---|
|canvas|You can access the element of the canvas via the `jsPsych.currentTrial().canvas`.|
|context|You can access the context of the canvas via the `jsPsych.currentTrial().context`.|
|centerX|You can access the horizontal center of the canvas via the `jsPsych.currentTrial().centerX`.|
|centerY|You can access the vertical center of the canvas via the `jsPsych.currentTrial().centerY`.|
|stim_array|You can access the stimuli via the `jsPsych.currentTrial().stim_array`.|