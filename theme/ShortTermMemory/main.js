/**
 * キソジオンライン 短期記憶実験
 *
 * by kohske takahashi
 *
 * MIT License | https://github.com/kohske/KisojiOnline/blob/master/LICENSE
 */


// 実験パラメータ
// HTMLで設定
//var rep_item_min = 2;
//var rep_item_max = 3;
//var n_conditions = 6;
//var stim_list = []; // しげいリスト

// 開始時の画面
var start_experiment_procedure = {
  type: 'html-keyboard-response',
  stimulus: '<p>短期記憶</p>',
  choices: ['space'],
  prompt: `<p>かならず指示に従って紙とペンが用意してください。</p><p>スペースキーを押すと始まります。</p>`,
  // デバッグ用 (最初の画面で回答チェックシート用データを出す)
  /*
    on_start: function(trial) {
    trial.stimulus = '<p>実験終了です。</p><p>下の枠の中のデータを回答チェック用のエクセルファイルに貼り付けてください。</p>'+
    '<p>枠の中をクリックしてから、Ctrl+A (コントロールキーを押しながらAキーを押す)ですべて選択し、Ctrl+Cでクリップボードにコピーできます。</p>'+
    '<p>コピーしたら、エクセルファイルの左上のセルを選択して、Ctrl+Vで貼付けましょう。</p>'+
    '<textarea style="width:450px; height: 300px">'+answer_txt+'</textarea>';
    }
  */
};


// 実験終了時の画面
var finish_experiment_procedure = {
  type: 'html-keyboard-response',
  stimulus: "",
  choices: jsPsych.NO_KEYS,
  on_start: function(trial) {
    trial.stimulus = '<p>実験終了です。</p><p>下の枠の中のデータを回答チェック用のエクセルファイルに貼り付けてください。</p>'+
      '<p>枠の中をクリックしてから、Ctrl+A (コントロールキーを押しながらAキーを押す)ですべて選択し、Ctrl+Cでクリップボードにコピーできます。</p>'+
      '<p>コピーしたら、エクセルファイルの左上のセルを選択して、Ctrl+Vで貼付けましょう。</p>'+
      '<textarea style="width:450px; height: 300px">'+answer_txt+'</textarea>';
  }
};

// JSON化
var item_list = [];
var cond_list = [];

var words = [];
for (var i=0; i<n_conditions; ++i) {
  var ws = stim_list.filter(v => v[0] == i); // 条件の刺激セット
  var cn = ws[0][1]; // 条件名
  var dur = ws[0][2]; // 提示時間
  var aws = jsPsych.randomization.shuffle(ws.map(v => v[3])); // 単語リスト (各条件の単語リストをシャッフル)
  
  item_list.push(Array.from(aws));
  cond_list.push(cn);
  
  var stim = [];
  for (var n=rep_item_min; n<=rep_item_max; ++n) {
    var w = aws.splice(0, n);
    stim.push({cond: cn, dur: dur, items: n, words: w.map(v => ({word: v}))});
  }
  words.push({cond: cn, dur: dur, stim: stim});
}
words = jsPsych.randomization.shuffle(words);

// 回答チェック用紙用出力
var count = [];
for (var n=rep_item_min; n<=rep_item_max; ++n) for (var i=0; i<n; ++i) {count.push(n);}
var answer_txt = "\t";
for (var c=0; c<n_conditions; ++c) answer_txt += cond_list[c] + "\t\t";
answer_txt += "\n";
answer_txt += "\t";
for (var c=0; c<n_conditions; ++c) answer_txt += "正解\t正誤\t";
answer_txt += "\n";
for (var r=0; r<item_list[0].length; ++r) {
  answer_txt += count[r]+"\t";  
  for (var c=0; c<n_conditions; ++c) {
    answer_txt += item_list[c][r] + "\t\t";
  }
  answer_txt += "\n";
}
answer_txt += "\t";
for (var c=0; c<n_conditions; ++c) answer_txt += "スコア\t\t";




// timeline作成（結構複雑）
// 条件（文字種・提示時間）ごとに、リストサイズ2〜10（練習では2〜3）を順番に提示。
// 条件はランダム、条件内のリストサイズは固定（1ずつ増える）
// 条件実施前に教示
// リスト終了後に回答画面提示
var tl = [];
for (var i=0; i<words.length; ++i) {
  var ws = words[i].stim;

  // リストサイズ2〜順番にTLに追加
  for (var j=0; j<ws.length; ++j) {
    // 条件提示（必要？）
    tl.push ({
      type: 'html-keyboard-response',
      stimulus: "<p>画面に次々に文字や単語が提示されます。<br/>できるだけたくさんのアイテムを覚えてください。</p>",
      choices: ['space'],
      post_trial_gap: 500,
    });

    // 単語提示
    tl.push ({
      timeline: [{
	type: 'html-keyboard-response',
	stimulus: jsPsych.timelineVariable('word'),
	trial_duration: 500, //ws[j].dur*1000.0/1000.0,
	post_trial_gap: 100,	
	data: {
	  cond: ws[j].cond,
	  dur: ws[j].dur,
	  items: ws[j].items,
	  record: 1,
	}
      }],
      timeline_variables: ws[j].words,
    });

    // 回答画面
    tl.push ({
      type: 'html-keyboard-response',
      stimulus:"<p><b>「"+ws[j].cond+"」</b> (アイテム数: "+ws[j].items+")</p>",
      choices: ['space'],
      post_trial_gap: 500,
      prompt:  "<p>覚えたものを、回答用紙の指定の箇所に、提示順に記入してください。<br/>回答を終えたらスペースキーを押してください。</p>",
    });
  }
}

jsPsych.init({
  timeline: [start_experiment_procedure, {timeline: tl}, finish_experiment_procedure],
});
