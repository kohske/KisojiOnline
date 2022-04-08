

/* 
   パラメータ
*/
var jsPsych = initJsPsych({
  show_progress_bar: true,
  auto_update_progress_bar: false,
});

let sound_adjust = sounds["LT_1000_-30"]; // 音量調整のための音声ファイル
let sound_standard = sounds["LT_1000_-30"]; // 標準刺激のための音声ファイル
let CS_freqs = [250, 500, 4000]; // 比較刺激の周波数

let CS_levesl, n_reps;
// 練習用
if (jsPsych.data.getURLVariable("prac") == "1") {
  CS_levels = [-30-10, -30-2, -30+2, -30+10]; // 刺激強度  
  n_reps = 1;
}
// 本番用
else {
  CS_levels = [-30-10, -30-8, -30-6, -30-4, -30-2, -30, -30+2, -30+4, -30+6, -30+8, -30+10]; // 刺激強度
  n_reps = 10;
}
//let CS_levels = [-30-10, -30+10]; // 刺激強度
let n_trials = CS_freqs.length * CS_levels.length * n_reps; // 全試行数

/*
  変数
*/
// 最初のブロック? （教示用）
let cur_trial = 0;
let first_block = true;


var timeline = [];

var preload = {
  type: jsPsychPreload,
  //  images: ['img/blue.png', 'img/orange.png']
};

var welcome = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "等ラウドネスレベル計測の実験です。スペースキーを押してください。",
  choices: [' '],  
};

/* 音量調整 */
var tl_adjust_volume = {
  type: jsPsychAudioKeyboardResponse,
  stimulus: sound_adjust,
  choices: [' '],
  prompt: `
<p>現在再生されている音が、快適な大きさに聞こえるようにパソコンの音量を調整してください。</p>
<p>ちょうどよい音量に調整したら、スペースキーを押してください。`,
  response_ends_trial: true,
  trial_ends_after_audio: true  
};

/* 音量調整ループ */
var loop_adjust_volume = {
  timeline: [tl_adjust_volume],
  loop_function: function(data){
    if (data.last(1).trials[0].response != null) {
      return false;
    } else {
      return true;
    }
  }
}

/* 教示 */
var instruction = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
<p>
これから実験を始めます。<br/><br/>
実験では、毎回、スペースキーを押すと直後に短い音が2回続けて再生されます。<br/>
どちらの音が大きく聞こえたか判断してください。<br/>
<br/>
<b>1番目の大きいと感じたら → 'f'（エフ）キー</b><br/>
<b>2番目が大きかと感じたら → 'j'（ジェイ）キー</b><br/>
<br/>
を押してください（日本語入力はOFFにしてください）。<br/>
<br/>
スペースキーを押すと、実験が始まります。
</p>
`,
  choices: [' '],
};


var tl_wait = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "スペースキーを押してください",
  choices: [' '],  
};

var tl_stimulus1 = {
  type: jsPsychAudioKeyboardResponse,
  stimulus: sound_standard,
  choices: "NO_KEYS",
  trial_ends_after_audio: true,
  post_trial_gap: 250,  
};

var tl_stimulus2 = {
  type: jsPsychAudioKeyboardResponse,
  stimulus: function() {
    return sounds["LT_"+String(jsPsych.timelineVariable('freq'))+"_"+String(jsPsych.timelineVariable('stimulus'))];
  },
  choices: "NO_KEYS",
  trial_ends_after_audio: true
};

var tl_response = {
  type: jsPsychHtmlKeyboardResponse,
  data: {
    CS_freq: jsPsych.timelineVariable('freq'),
    CS_level: jsPsych.timelineVariable('stimulus'),
    record: 1,
  },
  stimulus: `
<p>
1番目の音の方が大きく聞こえた→ 'f'キー<br/>
2番目の音の方が大きく聞こえた→ 'j'キー
</p>
`,
  choices: ['f', 'j'],
  on_finish: function(data) {
    ++cur_trial;
    jsPsych.setProgressBar(cur_trial/n_trials);
    if(jsPsych.pluginAPI.compareKeys(data.response, 'j')){
      data.resp = 1;
    } else {
      data.resp = 0;
    }
  }
};


var loop_trial = {
  timeline: [tl_wait, tl_stimulus1, tl_stimulus2, tl_response],
  timeline_variables: CS_levels.map(function(x){return {stimulus: x};}),
  repetitions: n_reps,  
  randomize_order: true  
};

var inst_freq = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function() {
    if (first_block == true) {
      first_block = false;
      return "準備ができたら'a'キーを押してください。";
    }
    else {
      return `
<p>
次のブロックに進みます。休憩をとってください。準備ができたら'a'キーを押してください。
</p>
`
    }
  },
  choices: ['a'],
};

var loop_freq = {
  timeline: [inst_freq, loop_trial],
  //  timeline_variables: [250, 500, 4000].map(function(x){return {freq: x};}),
  timeline_variables: CS_freqs.map(function(x){return {freq: x};}),  
  randomize_order: true
}

// 実験終了時の画面
var tl_finish_experiment = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "",
  choices: "NO_KEYS",
  on_start: function(trial) {
    var dt = jsPsych.data.get().filter([{record: 1}]);
    dt = dt.ignore(['stimulus', 'record', 'trial_type', 'trial_index', 'time_elapsed', 'internal_node_id', 'response']);
    dt.localSave('csv','mydata.csv');
    var txt = dt.csv().replace(/,/g, "\t").replace(/"/g,"");
    trial.stimulus = '<p>実験終了です。</p><p>データファイル（mydata.csv）が自動的にダウンロードされます。ダウンロードされたら、エクセルなどで開いて正しくデータが取得できているか確認してください。</p><p>ダウンロードが上手く行かない場合は、下の枠の中のデータをエクセルなどに貼り付けて保存しましょう。</p>'+
      '<p>枠の中をクリックしてから、Ctrl+A (コントロールキーを押しながらAキーを押す)ですべて選択し、Ctrl+Cでクリップボードにコピーできます。</p>'+
      '<p>コピーしたら、新しいエクセルファイルを開き、Ctrl+Vで貼付けましょう。</p>'+
      '<textarea style="width:450px; height: 300px">'+txt+'</textarea>';
  }
};


timeline = [welcome, loop_adjust_volume, instruction, loop_freq, tl_finish_experiment];

/* start the experiment */
jsPsych.run(timeline);
