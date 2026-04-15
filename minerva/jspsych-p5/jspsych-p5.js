var jsPsychP5 = (function (jspsych) {
  "use strict";

  let jsPsychP5_p5;

  const info = {
    name: "p5",
    version: "0.1",
    parameters: {
      trial_duration: {
        type: jspsych.ParameterType.INT,
        default: null,
      },
      sketch: {
        type: jspsych.ParameterType.FUNCTION,
        default: undefined,
      },
      end_trial: {
        type: jspsych.ParameterType.FUNCTION,
        default: null,
      },
    },
    data: {

    }
  };

  /**
   * ** p5 **
   *
   * plugin for use p5.js
   *
   * @author @kohske
   */
  class jsPsychP5Plugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      let end_trial = function (data) {
        jsPsych.pluginAPI.clearAllTimeouts();
        display_element.innerHTML = "";

        jsPsychP5_p5.remove();
        jsPsych.finishTrial(data);
      };

      trial.end_trial = end_trial;

      if (trial.trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function () {
          end_trial();
        }, trial.trial_duration);
      }

      let s = trial.sketch;
      jsPsychP5_p5 = new p5(s, display_element);
      jsPsychP5_p5.trial = trial;
    }
  }
  jsPsychP5Plugin.info = info;

  return jsPsychP5Plugin;
})(jsPsychModule);
