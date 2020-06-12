/**
 * キソジオンライン ミュラーリヤー錯視実験
 *
 * by kohske takahashi
 *
 * MIT License | https://github.com/kohske/KisojiOnline/blob/master/LICENSE
 */

// 表示領域サイズ
var canvas_width = 600;
var canvas_height = 600;

// 実験パラメータ
// 定数
var std_len = 150; // 標準刺激（直線）の長さ
var std_posY = 100; // 標準刺激（ML）のY座標
var std_arrow_len = 30; // 矢羽の長さ

var comp_len_min = 100; // 上昇系列の初期値
var comp_len_max = 230; // 下降系列の初期値
var comp_len_diff = 10; // 刻み幅
var comp_posY = 200; // 比較刺激のY座標

// 変数
var comp_len; // 比較刺激の長さ
var std_angle; // 標準刺激の角度

// 要因計画は親HTMLで。
//var fac = {
//  angles: [60, 120, 180, 240, 300], // 角度
//  up_down: ["up", "down"], // 系列
//  rept: [1,2],
//};

// 要因の直積
var factors = jsPsych.randomization.factorial(fac, 1, true);

// 制御用カウンター
// 試行数が固定ではないので、jsPsychのシーケンス制御は使えず、手動で管理。
var idx_fac = 0; // 系列インデクス
var idx_of_current_factor = 0; // 系列内のインデクス

// 標準刺激
var std_line = {
  obj_type: 'line',
  x1: canvas_width/4.0-std_len/2.0,
  y1: std_posY,
  x2: canvas_width/4.0+std_len/2.0,
  y2: std_posY,
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

// 標準刺激の矢羽
var std_arrow = {
  obj_type: 'line',
  x1: 0,
  y1: std_posY,
  x2: 0,
  y2: 0,
  line_width: 3,
  line_color: "#000000"
};

// 刺激提示
var trial = {
  type: 'psychophysics',
  stimuli: [comp_line, std_line, std_arrow, std_arrow, std_arrow, std_arrow],
  choices: ['leftarrow', 'rightarrow'],
  canvas_width: canvas_width,
  canvas_height:canvas_height,
  background_color: '#DDDDDD',

  // 試行の刺激を設定する
  on_start: function(trial){
    // 矢羽の角度
    std_angle = factors.angles[idx_fac];
    var rad = std_angle*Math.PI/180/2;

    // 系列最初は最大または最小
    var ud = factors.up_down[idx_fac];
    if (idx_of_current_factor == 0) {
      comp_len = (ud=="down" ? comp_len_max : comp_len_min);
    }

    // 刺激の座標指定
    trial.stimuli[0].x1 = canvas_width*3/4.0-comp_len/2.0,
    trial.stimuli[0].x2 = canvas_width*3/4.0+comp_len/2.0
    
    trial.stimuli[2].x1 = canvas_width/4.0-std_len/2.0,
    trial.stimuli[2].x2 = canvas_width/4.0-std_len/2.0+std_arrow_len*Math.cos(rad);
    trial.stimuli[2].y2 = std_posY+std_arrow_len*Math.sin(rad);

    trial.stimuli[3].x1 = canvas_width/4.0-std_len/2.0,    
    trial.stimuli[3].x2 = canvas_width/4.0-std_len/2.0+std_arrow_len*Math.cos(rad);
    trial.stimuli[3].y2 = std_posY-std_arrow_len*Math.sin(rad);

    trial.stimuli[4].x1 = canvas_width/4.0+std_len/2.0,    
    trial.stimuli[4].x2 = canvas_width/4.0+std_len/2.0-std_arrow_len*Math.cos(rad);
    trial.stimuli[4].y2 = std_posY+std_arrow_len*Math.sin(rad);

    trial.stimuli[5].x1 = canvas_width/4.0+std_len/2.0,    
    trial.stimuli[5].x2 = canvas_width/4.0+std_len/2.0-std_arrow_len*Math.cos(rad);
    trial.stimuli[5].y2 = std_posY-std_arrow_len*Math.sin(rad);
  },

  // 反応に対する処理
  on_finish: function(data) {
    
    var ud = factors.up_down[idx_fac];
    var sequence_completed = false;
    data.record = 1;
    data.sequence_index = idx_fac;
    data.response_index = idx_of_current_factor;
    data.std_angle = std_angle;
    data.up_down = ud;
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


// 反応間のブランク
var blank = {
  type: 'psychophysics',
  stimuli: [std_line, std_arrow, std_arrow, std_arrow, std_arrow],
  choices: jsPsych.NO_KEYS,
  trial_duration: 500,
  canvas_width: canvas_width,
  canvas_height:canvas_height,
  background_color: '#DDDDDD', // The HEX color means green.
  
  on_start: function(trial){
    std_angle = factors.angles[idx_fac];
    var rad = std_angle*Math.PI/180/2;

    trial.stimuli[1].x1 = canvas_width/4.0-std_len/2.0;
    trial.stimuli[1].x2 = canvas_width/4.0-std_len/2.0+std_arrow_len*Math.cos(rad);
    trial.stimuli[1].y2 = std_posY+std_arrow_len*Math.sin(rad);

    trial.stimuli[2].x1 = canvas_width/4.0-std_len/2.0;
    trial.stimuli[2].x2 = canvas_width/4.0-std_len/2.0+std_arrow_len*Math.cos(rad);
    trial.stimuli[2].y2 = std_posY-std_arrow_len*Math.sin(rad);

    trial.stimuli[3].x1 = canvas_width/4.0+std_len/2.0;
    trial.stimuli[3].x2 = canvas_width/4.0+std_len/2.0-std_arrow_len*Math.cos(rad);
    trial.stimuli[3].y2 = std_posY+std_arrow_len*Math.sin(rad);

    trial.stimuli[4].x1 = canvas_width/4.0+std_len/2.0;
    trial.stimuli[4].x2 = canvas_width/4.0+std_len/2.0-std_arrow_len*Math.cos(rad);
    trial.stimuli[4].y2 = std_posY-std_arrow_len*Math.sin(rad);
  },
}

// 1試行の手続き
var test_procedure = {
  timeline: [blank, trial],
}

// 開始時の画面
var start_experiment_procedure = {
  type: 'html-keyboard-response',
  stimulus: '<p>ミュラー・リヤーの実験</p>',
  choices: ['space'],
  prompt: "<p>左と右の横線が出てきます。左の横線には矢羽がついています。<br/><br/>"+
    "左右の横線の長さを比較して、矢印キーでどちらの横線が長く見えるか回答してください。つまり、<br/>"+
    "<br/>"+
    "<b>左側の横線の方が長いと思ったときは左矢印キー<br/><br/>"+
    "右側の横線の方が長いと思ったときは右矢印キー</b><br/>"+
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
  stimulus: "",
  choices: jsPsych.NO_KEYS,  
  on_start: function(trial) {
    var dt = jsPsych.data.get().filter([{record: 1}]);
    dt = dt.ignore(["response_type", "key_press", "avg_frame_time", "trial_type", "trial_index", "time_elapsed", "internal_node_id", "record"]);
    var txt = dt.csv().replace(/,/g, "\t").replace(/"/g,"");
    trial.stimulus = '<p>実験終了です。</p><p>下の枠の中のデータをエクセルなどに貼り付けて保存しましょう。</p>'+
      '<p>枠の中をクリックしてから、Ctrl+A (コントロールキーを押しながらAキーを押す)ですべて選択し、Ctrl+Cでクリップボードにコピーできます。</p>'+
      '<p>コピーしたら、新しいエクセルファイルを開き、Ctrl+Vで貼付けましょう。</p>'+
      '<textarea style="width:450px; height: 300px">'+txt+'</textarea>';
  }
};

jsPsych.init({
  timeline: [start_experiment_procedure]
});
