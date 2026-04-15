/**
 * ミネルヴァ書房「心理学実験」演習用プログラム
 * 
 * 視覚実験
 * 
 */
const jsPsych = initJsPsych();

// size of experiment canvas (px)
let canvas_width = 600;
let canvas_height = 300;

// exp parameters (constants);
let std_arrow_len = 30; // length of ML arrow

// design for each trial
let full_design = jsPsych.randomization.factorial(factors, n_repeat);

/**
 * Stimulus presentation (p5)
 */
let trial_measure = {
  type: jsPsychP5,
  sketch: function (p) {
    let dir = jsPsych.evaluateTimelineVariable("direction");
    let angle = jsPsych.evaluateTimelineVariable("angle");
    let std_len = jsPsych.evaluateTimelineVariable("std_len");
    let nw0 = p.millis();
    let sy, cy;
    let comp_len0, comp_len;

    p.setup = function () {
      p.createCanvas(canvas_width, canvas_height);
      p.strokeWeight(3);
      p.angleMode(p.DEGREES);
      sy = p.random(100, 200);
      cy = p.random(100, 200);
      if (dir == "up") {
        comp_len0 = 50;
      } else {
        comp_len0 = 250;
      }
      comp_len = comp_len0;
    };

    p.draw = function () {
      let angle2 = angle/2;
      p.background(192);
      let sxL = canvas_width / 4 - std_len / 2,
        sxR = canvas_width / 4 + std_len / 2;
      let cxL = (canvas_width / 4) * 3 - comp_len / 2,
        cxR = (canvas_width / 4) * 3 + comp_len / 2;
      p.line(sxL, sy, sxR, sy);
      p.line(sxR, sy, sxR - std_arrow_len * p.cos(angle2), sy + std_arrow_len * p.sin(angle2));
      p.line(sxR, sy, sxR - std_arrow_len * p.cos(angle2), sy - std_arrow_len * p.sin(angle2));
      p.line(sxL, sy, sxL + std_arrow_len * p.cos(angle2), sy + std_arrow_len * p.sin(angle2));
      p.line(sxL, sy, sxL + std_arrow_len * p.cos(angle2), sy - std_arrow_len * p.sin(angle2));
      p.line(cxL, cy, cxR, cy);

      if (p.keyIsPressed) {
        if (p.keyCode == 37 && comp_len > 10) comp_len -= 2; // left arrow
        if (p.keyCode == 39 && comp_len < 290) comp_len += 2; // right arrow
      }
    };

    // finish trial on response
    p.keyPressed = function (event) {
      if (p.keyCode == 32) { // space
        let data = {
          狭角: angle,
          系列: dir,
          回答: p.round(comp_len),
          比較刺激の初期長さ: comp_len,
          標準刺激の長さ: p.round(std_len),
          標準刺激の縦の位置: p.round(sy),
          比較刺激の縦の位置: p.round(cy),
          反応時間: p.round(p.millis() - nw0),
          type: "measure",
        };
        p.trial.end_trial(data);
      }
    };
  },
};

/**
 * Blank before stimulus
 */
let trial_blank_before_stimulus = {
  type: jsPsychHtmlKeyboardResponse,
  choices: "NO_KEYS",
  stimulus: "",
  trial_duration: 500,
  data: {
    skip_record: true,
  },
};

/**
 * instruction
 */
let trial_instruction = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: EXP_PARAM.Exp_Name,
  choices: [" "],
  prompt: `<div class="instruction">
各試行でミュラーリヤー図形 (<b>&lt;&mdash;&gt;</b>) が左側に、横線（<b>&mdash;</b>）が右側に提示されます。<br/>
左右の矢印キーを押すと、右側の横線の長さを調整できます。<br/>
ミュラーリヤー図形の主線の長さと横線の長さが同じ長さに見えるように調整して、スペースキーを押してください。
<br/>
全部で ${full_design.length} 回の試行があります。<br/>
<br/>
<b>スペースキー</b>を押して実験を開始してください。<br/>
      </div>`,
  on_start: function () {
    document.body.style.cursor = "none";
  },
  data: {
    skip_record: true,
  },
};

/**
 * save and finish
 */
let trial_bye = create_trial_save([
  "狭角",
  "系列",
  "回答",
  "反応時間",
/*  "標準刺激の長さ",
  "比較刺激の縦の位置",
  "標準刺激の縦の位置",
  "type",
  "time_elapsed",
  "trial_index",*/
]);

/**
 * timeline 
 */
let proc_measure = {
  timeline: [trial_blank_before_stimulus, trial_measure],
  timeline_variables: full_design,
};

jsPsych.run([
  create_enter_fullscreen(),
  create_get_userinfo(),
  trial_instruction,
  proc_measure,
  create_end_fullscreen(),
  trial_bye
]);

