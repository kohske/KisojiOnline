/**
 * キソジオンライン 顔認知実験
 *
 * by kohske takahashi
 *
 * MIT License | https://github.com/kohske/KisojiOnline/blob/master/LICENSE
 */

// 実験パラメータ
var learn_dur = 3000; // 学習画像の呈示時間
var learn_eval_dur = 3000; // 学習セッションの回答時間

//var learn_dur = 30; // 学習画像の呈示時間
//var learn_eval_dur = 30; // 学習セッションの回答時間


// 刺激は親HTMLの方で定義（練習用もできるように）
// var n_learn = 24; // 学習セッションの試行数（刺激を全部使うとは限らない）
// 刺激シャッフル
// var upface_images = [];
// var invface_images = [];
//
// exp_type: b => 両方, s => 形状のみ, m => 意味のみ
// var exp_type = ""; // both
var upfaces = jsPsych.randomization.shuffle(upfaces_images); // 正立顔
var invfaces = jsPsych.randomization.shuffle(invfaces_images); // 倒立顔

// それぞれ呈示刺激と未呈示刺激のペア
var upface_pairs = [];
for (var i=0; i<upfaces.length/2; ++i) {
  upface_pairs.push({updown: "正立", f: upfaces[i], s: upfaces[i+upfaces.length/2]});
}
var invface_pairs = [];
for (var i=0; i<invfaces.length/2; ++i) {
  invface_pairs.push({updown: "倒立", f: invfaces[i], s: invfaces[i+upfaces.length/2]});
}

var shape_stim = []; // 形状課題での刺激
var mean_stim = []; // 意味課題での刺激
for (var i=0; i<upface_pairs.length/2; ++i) {
  shape_stim.push(upface_pairs[i]);
  shape_stim.push(invface_pairs[i]);
  mean_stim.push(upface_pairs[i+upface_pairs.length/2]);
  mean_stim.push(invface_pairs[i+invface_pairs.length/2]);  
}

shape_stim = jsPsych.randomization.shuffle(shape_stim); // 形状学習用
shape_recall_stim = jsPsych.randomization.shuffle(shape_stim); // 形状再認用
mean_stim = jsPsych.randomization.shuffle(mean_stim); // 意味学習用
mean_recall_stim = jsPsych.randomization.shuffle(mean_stim); // 意味再認用


// 手続き

// 形状学習セッションの教示
var shape_learn_inst = {
  type: 'html-keyboard-response',
  stimulus: '<p>顔の形態判断 -　学習セッション</p>',
  choices: ['space'],
  prompt: "<p>画面に顔写真が一枚ずつ出てきます。<br/><br/>"+
    "顔の「鼻の高さ」を10段階（1:とても低い〜10:とても高い）で評価してください。<br/><br/>"+
    "顔写真が消えた後、マウスで数字のボタンをクリックしてください。<br/><br/>"+
    "スペースキーを押すと始まります。"+
    "</p>",
  post_trial_gap: 500,      
};

// 意味学習セッションの教示
var mean_learn_inst = {
  type: 'html-keyboard-response',
  stimulus: '<p>顔の意味判断 -　学習セッション</p>',
  choices: ['space'],
  prompt: "<p>画面に顔写真が一枚ずつ出てきます。<br/><br/>"+
    "顔の「信頼性の高さ」を10段階（1:とても低い〜10:とても高い）で評価してください。<br/><br/>"+
    "顔写真が消えた後、マウスで数字のボタンをクリックしてください。<br/><br/>"+
    "スペースキーを押すと始まります。"+
    "</p>",
  post_trial_gap: 500,    
};

// 再認セッションの教示
var recall_inst = {
  type: 'html-keyboard-response',
  stimulus: '再認セッション',
  prompt: "<p>画面に顔写真が左右に2枚ずつ出てきます。<br/><br/>"+
    "どちらか一方は、先程の学習セッションで呈示されたものです。<br/><br/>"+
    "左右の矢印キーで、どちらの顔写真が呈示されたものか回答してください。<br/><br/>"+
    "スペースキーを押すと始まります。"+
    "</p>",
  choices: ['space'],
  post_trial_gap: 500,      
};

// 学習セッションの画像呈示
var learn_show = {
  type: 'html-keyboard-response',
  stimulus: "",
  img: jsPsych.timelineVariable('f'),
  choices: jsPsych.NO_KEYS,
  trial_duration: learn_dur,
  
  on_start: function(trial){
    trial.stimulus = '<img src="imgs/use/'+trial.img+'"/>';
    ct = trial;
  },
};

// 学習セッションの回答画面
var learn_eval = {
  type: 'html-button-response',
  stimulus: "",
  choices: ["1","2","3","4","5","6","7","8","9","10"],
  prompt: "",
  response_ends_trial: false,
  trial_duration: learn_eval_dur,
 
  data: {
    record: 1,
    task: jsPsych.timelineVariable("task"),
    type: "eval",
    img: jsPsych.timelineVariable('f'),
  },
  on_start: function(trial){
    if (trial.data.task == "形態") {
      trial.prompt = "<br/>鼻の高さは？(1: とても低い - 10: とても高い)";
    } else if (trial.data.task == "意味") {
      trial.prompt = "<br/>信頼性は？(1: とても低い - 10: とても高い)";
    }
    ct = trial;
  },
};


// 再認セッションの画像呈示＋反応取得
var recall_show = {
  type: 'html-keyboard-response',
  stimulus: "",
  img1: jsPsych.timelineVariable('f'),
  img2: jsPsych.timelineVariable('s'),
  choices: ['leftarrow', 'rightarrow'],
  post_trial_gap: 500,
  data: {
    record: 1,
    task: jsPsych.timelineVariable("task"),
    type: "recall",
    updown: jsPsych.timelineVariable('updown'),    
  },
  on_start: function(trial){
    var cr = Math.random()>0.5 ? "L": "R";
    trial.data.correct = cr;
    trial.data.img1 = trial.img1;
    trial.data.img2 = trial.img2;   
    if (cr=="L") {
      trial.stimulus = '<img src="imgs/use/'+trial.img1+'"/>'+' '+'<img src="imgs/use/'+trial.img2+'"/>';
    } else {
      trial.stimulus = '<img src="imgs/use/'+trial.img2+'"/>'+' '+'<img src="imgs/use/'+trial.img1+'"/>';      
    }
  },
  on_finish: function(data) {
    // 左矢印
    if (data.key_press == 37) {
      data.resp = "L";
    }
    // 右矢印
    else if (data.key_press == 39) {
      data.resp = "R";      
    }
    if (data.correct == data.resp) {data.answer = 1;}
    else {data.answer = 0;}    
  },
};

// 形状学習セッション
var shape_learn_proc = {
  timeline: [learn_show, learn_eval],
  timeline_variables: shape_stim,
}

// 意味学習セッション
var mean_learn_proc = {
  timeline: [learn_show, learn_eval],
  timeline_variables: mean_stim,  
}

// 形状再認セッション
var shape_recall_proc = {
  timeline: [recall_show],
  timeline_variables: shape_recall_stim,
}

// 意味再認セッション
var mean_recall_proc = {
  timeline: [recall_show],
  timeline_variables: mean_recall_stim,  
}

// 形状セッション
var shape_proc = {
  timeline: [shape_learn_inst, shape_learn_proc, recall_inst, shape_recall_proc],
  timeline_variables: [{task: "形態"}],
};

// 意味セッション
var mean_proc = {
  timeline: [mean_learn_inst, mean_learn_proc, recall_inst, mean_recall_proc],
  timeline_variables: [{task: "意味"}],  
};


var tl;
if (exp_type == "b") {
  tl = Math.random()>0.5 ? [shape_proc, mean_proc] : [mean_proc, shape_proc];
} else if (exp_type == "s") {
  tl = [shape_proc];
} else if (exp_type == "m") {
  tl = [mean_proc];
}

// 実験終了時の画面
var finish_experiment_procedure = {
  type: 'html-keyboard-response',
  stimulus: "",
  choices: jsPsych.NO_KEYS,  
  on_start: function(trial) {
    var txt = "";
    var dt = jsPsych.data.get().filter([{record: 1}]);
    dt = dt.ignore(["rt", "stimulus", "response_type", "key_press", "avg_frame_time", "trial_type", "trial_index", "time_elapsed", "internal_node_id", "record"]);

    txt += "判断課題\t顔の向き\t正答率\n";    
    var tasks  = exp_type == "b" ? ["意味", "形態"] : (exp_type == "s" ? ["形態"] : ["意味"]);
    var ud = ["正立", "倒立"];
    for (t in tasks) {
      for (v in ud) {
	var ave = jsPsych.data.get().filter([{task: tasks[t], updown: ud[v]}]).select("answer").mean();
	txt += tasks[t]+"\t"+ud[v]+"\t"+ave+"\n";
      }
    }
    txt += "\n\n---------------------\n\n";
    txt += dt.csv().replace(/,/g, "\t").replace(/"/g,"");
    
    trial.stimulus = '<p>実験終了です。</p><p>下の枠の中のデータをエクセルなどに貼り付けて保存しましょう。</p>'+
      '<p>枠の中をクリックしてから、Ctrl+A (コントロールキーを押しながらAキーを押す)ですべて選択し、Ctrl+Cでクリップボードにコピーできます。</p>'+
      '<p>コピーしたら、新しいエクセルファイルを開き、Ctrl+Vで貼付けましょう。</p>'+
      '<textarea style="width:450px; height: 300px">'+txt+'</textarea>';

    
  }
};

tl.push(finish_experiment_procedure);

var preload_images = upfaces_images.map(v => "imgs/use/"+v);
preload_images = preload_images.concat(invfaces_images.map(v => "imgs/use/"+v));

jsPsych.init({
  timeline: tl,
  preload_images: preload_images,
});
