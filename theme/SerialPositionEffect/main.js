// 実験パラメータ
// var words = ["ルケ", "ニロ", "コハ", "エレ", "ヌテ", "アタ", "モセ", "クナ", "サウ", "ヤハ"]; // HTMLで定義する
var max_stim_n = words.length;

var correct_answer = "";
for (var i=0; i<max_stim_n; ++i) {
  correct_answer+=(""+(i+1)+": 「"+words[i]+"」<br/> ");
}

// 刺激
var stimuli = [];
for (var i=0; i<max_stim_n; ++i) {
  stimuli.push({position: i, word: words[i]});
};

var trials = {
  timeline: [{
    type: "html-keyboard-response",
    trial_duration: stimulus_duration,
    choices: jsPsych.NO_KEYS,    
    stimulus: jsPsych.timelineVariable('word'),
    prompt: ""
  }],
  randomize_order: false
};

// 刺激提示前のブランク
var blank = {
  type: 'html-keyboard-response',
  stimulus: [""],
  choices: jsPsych.NO_KEYS,
  trial_duration: interval_duration,
};

// 開始時の画面
var start_experiment_procedure = {
  type: 'html-keyboard-response',
  stimulus: '<p>系列位置効果</p>',
  choices: ['space'],
  prompt: "<p>まず、紙とペンを用意してください。<br/><br/>"+
    "<p>画面上に次々に無意味なつづりが出てくるので、できるだけたくさん覚えてください。<br/>"+
    "<b>終わったら、覚えているつづりをできるだけたくさん、紙に書き出してください。<br/>"+
    "<b>覚えているものをすべて書き出したら、正解を表示しますので、答え合わせをしてください。<br/>"+
    "<br/>"+
    "スペースキーを押すと始まります。"+
    "</p>",
};

// 回答中の画面
var wait_response_procedure = {
  type: 'html-keyboard-response',
  stimulus: '<p>系列位置効果</p>',
  choices: ['space'],
  prompt: "<p>覚えたつづりをできるだけたくさん書き出してください。<br/><br/>"+
    "すべて書き終わったら、スペースキーを押してください。"+
    "</p>",
};

// 答え合わせ
var check_answer_procedure = {
  type: 'html-keyboard-response',
  stimulus: '<p>系列位置効果</p>',
  choices: ['space'],
  prompt: "<p>書き出すことができたものをチェックしてください。<br/><br/>"+
    "以下の正解のうち、書き出せたものの番号を記録しましょう。<br/><br/><br/>"+
    correct_answer+
    "</p>",
};


// 手続き
var trial_procedure = {
  timeline: [blank, trials],
  timeline_variables: stimuli,  
};

jsPsych.init({
  timeline: [start_experiment_procedure, trial_procedure, wait_response_procedure, check_answer_procedure],
});
