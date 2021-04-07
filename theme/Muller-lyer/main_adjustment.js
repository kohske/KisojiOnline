/**
 * キソジオンライン ミュラーリヤー錯視実験
 * 
 * 調整法
 * - 内向 or 外向
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
var std_arrow_len = 50; // 矢羽の長さ


var comp_len0_min = 50; // 上昇系列の初期値
var comp_len0_max = 250; // 下降系列の初期値
var comp_len_min = 0; // 比較刺激の最小値
var comp_len_max = 300; // 比較刺激の最大値
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
var factors = jsPsych.randomization.factorial(fac, 5);

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
  //  x1: 0,
  //  y1: comp_posY,
  //  x2: 0,
  //  y2: comp_posY,
  startX: 3*canvas_width/4.0,
  startY: comp_posY,
  line_length: 0,
  angle: 0,
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
  response_type: 'key',
  std_angle: jsPsych.timelineVariable('angles'),
  up_down: jsPsych.timelineVariable('up_down'),
  data :{
    std_angle: jsPsych.timelineVariable('angles'),
    up_down: jsPsych.timelineVariable('up_down'),
    comp_len: 0,
    record: 1
  },
  choices: [' '],
  canvas_width: canvas_width,
  canvas_height:canvas_height,
  background_color: '#DDDDDD',

  // 試行の刺激を設定する
  on_start: function(trial){
    // 矢羽の角度
    var rad = trial.std_angle*Math.PI/180/2;
    comp_len = (trial.up_down=="down" ? comp_len0_max : comp_len0_min);

    // 刺激の座標指定
    trial.stimuli[0].line_length = comp_len;
    
    trial.stimuli[2].x1 = canvas_width/4.0-std_len/2.0;
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

  // キー押しで調整
  key_down_func: function(event){  
    if (event.key === 'ArrowUp') {
      comp_len += comp_len_diff;
      if (comp_len > comp_len_max) comp_len = comp_len_max;
    }
    else if (event.key === 'ArrowDown') {
      comp_len -= comp_len_diff;
      if (comp_len < comp_len_min) comp_len = comp_len_min;
    }

    // 刺激の長さ変更
    jsPsych.currentTrial().stim_array[0].line_length = comp_len;
  },    
  // 反応に対する処理
  on_finish: function(data) {
    data.comp_len = comp_len;
  }
};

var test_procedure = {
  timeline: [trial],
  timeline_variables: factors,
  randomize_order: true
}

// 開始時の画面
var start_experiment_procedure = {
  type: 'html-keyboard-response',
  stimulus: '<p><b>ミュラー・リヤーの実験（調整法）</b></p>',
  choices: [" "],
  prompt: "<p>左と右の横線が出てきます。左の横線には矢羽がついています。<br/><br/>"+
    "右の横線は、上矢印キーを押すと少しずつ長く、下矢印キーを押すと少しずつ短くなります。<br/><br/>"+
    "上下の矢印キーを押して右の横線の長さが左の横線の長さと同じに見えるように調整してください。<br/>"+
    "同じ長さに見えるようになったらスペースキーを押してください。"+
    "<br/><br/>"+
    "スペースキーを押すと始まります。"+
    "</p>"
};

// 実験終了時の画面
var finish_experiment_procedure = {
  type: 'html-keyboard-response',
  stimulus: "",
  choices: jsPsych.NO_KEYS,
  on_start: function(trial) {
    var dt = jsPsych.data.get().filter([{record: 1}]);    
    dt = dt.ignore(["response", "response_type", "key_press", "avg_frame_time", "trial_type", "trial_index", "time_elapsed", "internal_node_id", "stimulus", "center_x", "center_y", "record"]);
    var txt = dt.csv().replace(/,/g, "\t").replace(/"/g,"");
    trial.stimulus = '<p>実験終了です。</p><p>ML-adjustment.csvというファイル名のデータファイルが自動的にダウンロードされています。Excelで開けるので確認してください。</p>'+
      '<p>データファイルがダウンロードできていない場合は、下の枠の中のデータをエクセルなどに貼り付けて保存しましょう。</p>'+
      '<p>枠の中をクリックしてから、Ctrl+A (コントロールキーを押しながらAキーを押す)ですべて選択し、Ctrl+Cでクリップボードにコピーできます。</p>'+
      '<p>コピーしたら、新しいエクセルファイルを開き、Ctrl+Vで貼付けましょう。</p>'+
      '<textarea style="width:450px; height: 300px">'+txt+'</textarea>';
    dt.localSave('csv', 'ML-adjustment.csv');    
  }
};

jsPsych.init({
  override_safe_mode: true,
  default_iti: 250,
  timeline: [start_experiment_procedure, test_procedure, finish_experiment_procedure]
});
