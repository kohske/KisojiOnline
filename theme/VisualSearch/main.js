// 表示領域サイズ
var canvas_width = 600;
var canvas_height = 600;

// 実験パラメータ
// 定数
var max_stim_n = 36; // 刺激グリッドの最大の枠の数
var stim_nx = 6; // 列数
var stim_ny = 6; // 行数
var stim_area_w = canvas_width / stim_nx; // 各グリッドの幅
var stim_area_h = canvas_height / stim_ny; // 各グリッドの高さ

var line_width = 2; // 現在無効（調べる（）
var line_length = 24;

// 要因計画
var factors = {
  setsize: [8, 16, 32], // セットサイズ
  target: [0, 1], // 1: ターゲットあり, 0: ターゲットなし
  conjunction: [0, 1],  // 1: 結合探索、 0: 特徴探索
};

// デザイン (最後の数字は各条件の反復数。本番は30くらいに。)
var full_design = jsPsych.randomization.factorial(factors, 2);

// シャローコピーなので、かなり変な回避をしてる。
var lines;
var line = {
  obj_type: 'line',
  startX: 0,
  startY: 0,
  line_width: line_width,
  angle: 45,
  line_length: line_length,
  line_color: "#000000"
};

// 最大提示枠数の数だけ、線分刺激（ただし同じモノを参照）
// 多分、search_trialのコンストラクタでディープコピーが走る。
var lines = Array.from({length: max_stim_n}, (v, k) => line);

// 刺激提示
var search_trial = {
  type: 'psychophysics',
  stimuli: lines,
  choices: ['leftarrow', 'rightarrow'],
  canvas_width: canvas_width,
  canvas_height:canvas_height,
  background_color: '#000000',
  setsize: jsPsych.timelineVariable("setsize"),
  target: jsPsych.timelineVariable("target"),
  conj: jsPsych.timelineVariable("conjunction"),
  data: { // 記録用（上と重複）
    setsize: jsPsych.timelineVariable("setsize"),
    target: jsPsych.timelineVariable("target"),
    conj: jsPsych.timelineVariable("conjunction"),
  },

  // 試行の刺激を設定する
  on_start: function(trial){
    // 0..枠の数をシャッフルして、先頭の必要数だけ使う。残りは透明に。
    stim_seed = Array.from({length: max_stim_n}, (v, k) => k);
    stim_seed = jsPsych.randomization.shuffle(stim_seed);

    // セットサイズ分は真面目に刺激設定
    for (var i=0; i<trial.setsize; ++i) {

      // 座標（本当はもっと外のスコープでやっていいけど、コピーが面倒なのでここで）
      var nr = stim_seed[i]%stim_nx;
      var nc = Math.floor(stim_seed[i]/stim_nx);
      trial.stimuli[stim_seed[i]].startX=(nc+0.5)*stim_area_w;
      trial.stimuli[stim_seed[i]].startY=(nr+0.5)*stim_area_h;

      // 刺激のタイプ・・・1: 赤の右上がり、2: 緑の右下がり、3: 緑の右上がり
      // 特徴探索ならデストラクタは全部、緑の右下がり
      stim_type = (trial.conj == 1)? jsPsych.randomization.sampleWithoutReplacement([1, 2, 3], 1) : 2;

      // ターゲット（あるなら）は赤の右下がり
      if (i==0 && trial.target == 1) {
	trial.stimuli[stim_seed[i]].line_color = "#FF0000";
	trial.stimuli[stim_seed[i]].angle = 45; // 最終的には45に。
      } else {
	if (stim_type == 1) {
	  trial.stimuli[stim_seed[i]].line_color = "#FF0000";
	  trial.stimuli[stim_seed[i]].angle = -45;
	} else if (stim_type == 2) {
	  trial.stimuli[stim_seed[i]].line_color = "#00FF00";
	  trial.stimuli[stim_seed[i]].angle = 45;
	} else if (stim_type == 3) {
	  trial.stimuli[stim_seed[i]].line_color = "#00FF00";
	  trial.stimuli[stim_seed[i]].angle = -45;
	}
      }
    }
    // 残りは透明に
    for (var i=trial.setsize; i<max_stim_n;++i) {
      trial.stimuli[stim_seed[i]].line_color = "#00000000";      
    }
    // デバッグ用
    lines=trial.stimuli;
  },

  // 反応に対する処理
  on_finish: function(data) {
    data.record = 1;
    // 左矢印 (「ない」反応)
    if (data.key_press == 37) {
      data.resp = 0;
    }
    // 右矢印 (「ある」反応)
    else if (data.key_press == 39) {
      data.resp = 1;      
    }
  }
};

// 刺激提示前のブランク
var blank = {
  type: 'psychophysics',
  stimuli: [],
  choices: jsPsych.NO_KEYS,
  trial_duration: 500,
  canvas_width: canvas_width,
  canvas_height:canvas_height,
  background_color: '#000000', // The HEX color means green.
};

// 開始時の画面
var start_experiment_procedure = {
  type: 'html-keyboard-response',
  stimulus: '<p>視覚探索実験</p>',
  choices: ['space'],
  prompt: "<p>画面上に斜めの線がたくさん出てきます。<br/>"+
    "<br/>"+
    "<b>赤色の右下がりの線がある場合・・・右矢印キー<br/><br/>"+
    "ない場合・・・左矢印キー</b/><br/><br/>"+    
    "<br/>"+
    "できるだけ素早く回答してください。<br/>"+
    "全部で"+full_design.length+"回あります。<br/>"+
    "<br/>"+
    "スペースキーを押すと始まります。"+
    "</p>",
};

// 手続き
var search_procedure = {
  timeline: [blank, search_trial],
  timeline_variables: full_design,
};

jsPsych.init({
  timeline: [start_experiment_procedure, search_procedure],
  on_finish: function(){
    document.getElementById("result").style.display = "block";
    
    var dt = jsPsych.data.get().filter([{record: 1}]);
    dt = dt.ignore(["response_type", "key_press", "avg_frame_time", "trial_type", "trial_index", "time_elapsed", "internal_node_id", "record"]);
    var txt = dt.csv().replace(/,/g, "\t").replace(/"/g,"")
    document.getElementById("result").value=txt;
  }
});
