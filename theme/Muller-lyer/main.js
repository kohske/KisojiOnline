// 表示領域サイズ
var canvas_width = 600;
var canvas_height = 600;

// 実験パラメータ
// 定数
var standard_len = 150; // 標準刺激（直線）の長さ
var comp_len_min = 100; // 上昇系列の初期値
var comp_len_max = 200; // 下降系列の初期値
var comp_len_diff = 10; // 刻み幅
var comp_posY = 200; // 比較刺激のY座標
var comp_arrow_len = 30; // 矢羽の長さ

// 変数
var comp_len;
var comp_angle;
var ud; // 上昇 or 下降

// 要因計画は親HTMLで。
//var fac = {
//  angles: [60, 120, 180, 240, 300], // 角度
//  up_down: ["up", "down"], // 系列
//  rept: [1,2],
//};

var factors = jsPsych.randomization.factorial(fac, 1, true);

// 制御用カウンター
var idx_fac = 0; // 系列インデクス
var idx_of_current_factor = 0; // 系列内のインデクス


// 刺激提示前のブランク
var blank = {
  type: 'psychophysics',
  stimuli: [],
  choices: jsPsych.NO_KEYS,
  trial_duration: 500,
  canvas_width: canvas_width,
  canvas_height:canvas_height,
  background_color: '#DDDDDD', // The HEX color means green.
}

// 標準刺激
var standard_line = {
  obj_type: 'line',
  x1: canvas_width/4.0-standard_len/2.0,
  y1: 100,
  x2: canvas_width/4.0+standard_len/2.0,
  y2: 100,
  line_width: 3,
  line_color: "#000000"
};

// 比較刺激の線
var comp_line = {
  obj_type: 'line',
  x1: 0,
  y1: comp_posY,
  x2: 0,
  y2: comp_posY,
  line_width: 3,
  line_color: "#000000"
}

// 比較刺激の矢羽
var comp_arrow = {
  obj_type: 'line',
  x1: 0,
  y1: comp_posY,
  x2: 0,
  y2: 0,
  line_width: 3,
  line_color: "#000000"
};

// 刺激提示
var trial = {
  type: 'psychophysics',
  stimuli: [standard_line, comp_line, comp_arrow, comp_arrow, comp_arrow, comp_arrow],
  choices: ['leftarrow', 'rightarrow'],
  canvas_width: canvas_width,
  canvas_height:canvas_height,
  background_color: '#DDDDDD',

  // 試行の刺激を設定する
  on_start: function(trial){
    comp_angle = factors.angles[idx_fac];
    var rad = comp_angle*Math.PI/180/2;
    
    ud = factors.up_down[idx_fac];
    if (idx_of_current_factor == 0) {
      comp_len = (ud=="down" ? comp_len_max : comp_len_min);
    }

    // 普通にやるとうまく行かないので・・・
    trial.stimuli[1].x1 = canvas_width*3/4.0-comp_len/2.0,
    trial.stimuli[1].x2 = canvas_width*3/4.0+comp_len/2.0
    
    trial.stimuli[2].x1 = canvas_width*3/4.0-comp_len/2.0,
    trial.stimuli[2].x2 = canvas_width*3/4.0-comp_len/2.0+comp_arrow_len*Math.cos(rad);
    trial.stimuli[2].y2 = comp_posY+comp_arrow_len*Math.sin(rad);

    trial.stimuli[3].x1 = canvas_width*3/4.0-comp_len/2.0,    
    trial.stimuli[3].x2 = canvas_width*3/4.0-comp_len/2.0+comp_arrow_len*Math.cos(rad);
    trial.stimuli[3].y2 = comp_posY-comp_arrow_len*Math.sin(rad);

    trial.stimuli[4].x1 = canvas_width*3/4.0+comp_len/2.0,    
    trial.stimuli[4].x2 = canvas_width*3/4.0+comp_len/2.0-comp_arrow_len*Math.cos(rad);
    trial.stimuli[4].y2 = comp_posY+comp_arrow_len*Math.sin(rad);

    trial.stimuli[5].x1 = canvas_width*3/4.0+comp_len/2.0,    
    trial.stimuli[5].x2 = canvas_width*3/4.0+comp_len/2.0-comp_arrow_len*Math.cos(rad);
    trial.stimuli[5].y2 = comp_posY-comp_arrow_len*Math.sin(rad);
  },

  // 反応に対する処理
  on_finish: function(data) {
    
    var ud = factors.up_down[idx_fac];
    var sequence_completed = false;
    data.record = 1;
    data.sequence_index = idx_fac;
    data.response_index = idx_of_current_factor;
    data.comp_angle = comp_angle;
    data.up_down = factors.up_down[idx_fac];
    data.comp_len = comp_len;
    
    // 左矢印 (「短い」反応)
    if (data.key_press == 37) {
      data.response = "short";
      // 系列終了
      if (ud == "down") {
	sequence_completed  = true;
      }
      // 系列継続
      else {
	comp_len = comp_len + comp_len_diff;
	++idx_of_current_factor;	
      }
    }

    // 右矢印 (「長い」反応)
    else if (data.key_press == 39) {
      data.response = "long";      
      // 系列終了
      if (ud == "up") {
	sequence_completed  = true;	
      } else {
	comp_len = comp_len - comp_len_diff;
	++idx_of_current_factor;	
      }
    }

    // 系列終了
    if (sequence_completed) {
      ++idx_fac;      
      if (idx_fac == factors.angles.length) {
	//実験終了
	jsPsych.pauseExperiment();      
	jsPsych.addNodeToEndOfTimeline(
	  finish_experiment_procedure,
	  jsPsych.resumeExperiment)
      } else {
	idx_of_current_factor = 0;
	jsPsych.pauseExperiment();      
	jsPsych.addNodeToEndOfTimeline(
	  before_block_procedure,
	  jsPsych.resumeExperiment)
      }
    }
    // 系列継続
    else {
      jsPsych.pauseExperiment();      
      jsPsych.addNodeToEndOfTimeline(
	test_procedure,
	jsPsych.resumeExperiment)
    }
  }
}

// 実験
var test_procedure = {
  timeline: [blank, trial],
}

// 開始時の画面
var start_experiment_procedure = {
  type: 'html-keyboard-response',
  stimulus: '<p>ミュラー・リヤーの実験</p>',
  choices: ['space'],
  prompt: "<p>左と右の横線が出てきます。右の横線には矢羽がついています。<br/>"+
"横線の長さを比較して、<br/>"+
"<br/>"+
"<b>右側の矢羽付きの横線の方が短いと思ったときは左矢印キー<br/><br/>"+
"右側の矢羽付きの横線の方が長いと思ったときは右矢印キー</b><br/>"+
"<br/>"+
"を押して回答してください。<br/>"+
"<br/>"+
"スペースキーを押すと始まります。"+
"</p>",
  on_finish: function(data) {
    jsPsych.pauseExperiment();      
    jsPsych.addNodeToEndOfTimeline(
      test_procedure,
      jsPsych.resumeExperiment)
  }
};

// 系列切り替え時の画面
var before_block_procedure = {
  type: 'html-keyboard-response',
  stimulus: "<p>スペースキーを押してください。</p>",
  choices: ['space'],
  prompt: "",
  on_start: function(trial) {
    trial.prompt = "<p>"+factors.angles.length+" 系列中 "+(idx_fac+1)+" 系列目を開始します。</p>";
  },
  on_finish: function(data) {
    jsPsych.pauseExperiment();      
    jsPsych.addNodeToEndOfTimeline(
      test_procedure,
      jsPsych.resumeExperiment)
  }
};

// 実験終了時の画面
var finish_experiment_procedure = {
  type: 'html-keyboard-response',
  stimulus: '<p>実験終了です。</p>',
};


jsPsych.init({
  timeline: [start_experiment_procedure],
  on_finish: function(){
    document.getElementById("result").style.display = "block";

    var dt = jsPsych.data.get().filter([{record: 1}]);
    dt = dt.ignore(["response_type", "key_press", "avg_frame_time", "trial_type", "trial_index", "time_elapsed", "internal_node_id", "record"]);
    var txt = dt.csv().replace(/,/g, "\t").replace(/"/g,"")
    document.getElementById("result").value=txt;
  }
});
