/**
 * キソジオンライン 最小可聴閾
 * 
 * by kohske takahashi
 *
 * MIT License | https://github.com/kohske/KisojiOnline/blob/master/LICENSE
 */


/* 
   パラメータ
*/
var jsPsych = initJsPsych({
  show_progress_bar: true,
  auto_update_progress_bar: false,
});

let sound_adjust = sounds["LT_1000_0"]; // 音量調整のための音声ファイル
//let CS_UD = ["UP", "DOWN"];
let CS_UD = ["DOWN"];
//let CS_UD_start = {UP: -55, DOWN: -30};
let CS_UD_start = {DOWN: -30};
let level_interval = 3;
let level_min = -81;
let level_max = 0;
let CS_levesl, n_reps, CS_freqs, n_max_rev;
// 練習用
if (jsPsych.data.getURLVariable("prac") == "1") {
  CS_freqs  = [1000]
  n_max_rev = 2;
  n_reps = 1;
}
// 本番用
else {
  CS_freqs  = [250, 500, 1000, 4000];
  n_max_rev = 6;
  n_reps = 1;
}

let CS_cond = [];
for (var f of CS_freqs) {
  for (var u of CS_UD) {
    CS_cond.push({freq: f, UD: u});
  }
}
let n_trials = CS_freqs.length * CS_UD.length * n_reps;

/*
  変数
*/
// 現在の試行番号
let cur_trial = 0;
// 最初のブロック? （教示用）
let first_block = true;


var timeline = [];

var welcome = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function() {
    if (jsPsych.data.getURLVariable("prac") == "1") {
      return "最小可聴閾計測の実験（練習）です。スペースキーを押してください。";
    } else {
      return "最小可聴閾計測の実験（本番）です。スペースキーを押してください。";
    }
  },
  choices: [' '],  
};

/* 音量調整 */
var tl_adjust_volume = {
  type: jsPsychAudioKeyboardResponse,
  stimulus: sound_adjust,
  choices: [' '],
  prompt: `
<p>現在再生されている音が、快適な大きさよりも少し小さめの音に聞こえるようにパソコンの音量を調整してください。</p>
<p>音量に調整したら、スペースキーを押してください。`,
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
実験では、毎回、スペースキーを押すと、2回の「ザッ」という音の間に「ピ」や「ポ」という小さな音がなります。<br/>
音は小さいので、聞こえない場合も聞こえる場合もあります。<br/>
<br/>
<b>音が聞こえなかったら → 'f'（エフ）キー</b><br/>
<b>音が聞こえたら → 'j'（ジェイ）キー</b><br/>
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
  stimulus: sounds["LT_noise"],
  choices: "NO_KEYS",
  trial_ends_after_audio: true,
  post_trial_gap: 250,  
};

var tl_stimulus2 = {
  type: jsPsychAudioKeyboardResponse,
  stimulus: function() {
    return sounds["LT_"+String(jsPsych.timelineVariable('freq'))+"_"+String(cur_level)];
  },
  choices: "NO_KEYS",
  trial_ends_after_audio: true
};

var tl_response = {
  type: jsPsychHtmlKeyboardResponse,
  data: {
    CS_freq: jsPsych.timelineVariable('freq'),
    CS_UD: jsPsych.timelineVariable('UD'),
    record: 1,
  },
  stimulus: `
<p>
音が聞こえない→ 'f'キー<br/>
音が聞こえた→ 'j'キー
</p>
`,
  choices: ['f', 'j'],
  on_finish: function(data) {

    data.trial = cur_trial;
    data.CS_level = cur_level;    
    if(jsPsych.pluginAPI.compareKeys(data.response, 'j')){
      data.resp = 1;
      cur_level = cur_level - level_interval;
      if (cur_level < level_min) {
	cur_level = level_min;
      }
    } else {
      data.resp = 0;
      cur_level = cur_level + level_interval;
      if (cur_level > level_max) {
	cur_level = level_max;
      }
    }
    // 前試行の反応と違っていたらカウンタ++
    if (prev_resp > -1 && data.resp != prev_resp) {
      ++n_resp_reverse;
      data.resp_reverse = 1;
    } else {
      data.resp_reverse = 0;      
    }

    data.n_resp_rev = n_resp_reverse;
    // 前試行の反応を現在の反応に設定
    prev_resp = data.resp;

//    console.log(data.CS_level, data.resp, data.n_resp_rev);
  }
};

let cur_level;
let prev_resp;
let n_resp_reverse = 0;

var loop_trial = {
  timeline: [tl_wait, tl_stimulus1, tl_stimulus2, tl_stimulus1, tl_response],
  loop_function: function(data){
    if (n_resp_reverse >= n_max_rev) {
      ++cur_trial;
      jsPsych.setProgressBar(cur_trial/n_trials);
      
      return false;
    } else {
      return true;
    }
  },
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
  on_start: function() {
    n_resp_reverse = 0;
    prev_resp = -1;
    cur_level = CS_UD_start[jsPsych.timelineVariable('UD', true)];
  }  
};

var loop_freq = {
  timeline: [inst_freq, loop_trial],
  timeline_variables: CS_cond,
  repetitions: n_reps,
  randomize_order: true,
}

// 実験終了時の画面
var tl_finish_experiment = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "",
  choices: "NO_KEYS",
  on_start: function(trial) {
    var dt = jsPsych.data.get().filter([{record: 1}]);
    dt = dt.ignore(['stimulus', 'record', 'trial_type', 'trial_index', 'time_elapsed', 'internal_node_id', 'response']);
    if (jsPsych.data.getURLVariable("prac") != "1") {
      dt.localSave('csv','LAT_min.csv');
    }
    var txt = dt.csv().replace(/,/g, "\t").replace(/"/g,"");
    trial.stimulus = '<p>実験終了です。</p><p>データファイル（mydata.csv）が自動的にダウンロードされます。ダウンロードされたら、エクセルなどで開いて正しくデータが取得できているか確認してください。</p><p>ダウンロードが上手く行かない場合は、下の枠の中のデータをエクセルなどに貼り付けて保存しましょう。</p>'+
      '<p>枠の中をクリックしてから、Ctrl+A (コントロールキーを押しながらAキーを押す)ですべて選択し、Ctrl+Cでクリップボードにコピーできます。</p>'+
      '<p>コピーしたら、新しいエクセルファイルを開き、Ctrl+Vで貼付けましょう。</p>'+
      '<textarea style="width:450px; height: 300px">'+txt+'</textarea>';
  }
};


timeline = [welcome, loop_adjust_volume, instruction, loop_freq, tl_finish_experiment];
//timeline = [loop_freq, tl_finish_experiment];

/* start the experiment */
jsPsych.run(timeline);
