/**
 * ミネルヴァ書房「心理学実験」演習用プログラム
 * 
 * さまざまな感覚刺激の実験（ダブルフラッシュ錯覚）
 * 
 */

EXP_PARAM.Exp_Name = "ダブルフラッシュ錯覚";

// Factorial design
let factors = {
  //  angle: [30, 60, 120, 150], // arrow angle
  av_pair: [
    { v: 1, a: 0 }, { v: 1, a: 1 }, { v: 1, a: 2 }, { v: 1, a: 3 }, { v: 1, a: 4 },
    { v: 2, a: 0 }, { v: 2, a: 1 },
    { v: 3, a: 0 }, { v: 3, a: 1 },
    { v: 4, a: 0 }, { v: 4, a: 1 },
  ]
};

let stim_timings = {
  a: {
    0: [], 1: [-23], 2: [-23, 34], 3: [-23, 34, 91], 4: [-23, 34, 91, 148],
  },
  v: {
    1: [0], 2: [0, 67], 3: [0, 67, 134], 4: [0, 67, 134, 201]
  }
};

let n_repeat = 5; // num. of repetition for each condition

const jsPsych = initJsPsych();

// size of experiment canvas (px)
let canvas_width = 600;
let canvas_height = 600;

let a_dur = 7; // duration of auditory stimulus (ms)
let a_hz = 3500; // frequency of auditory stimulus (Hz)
let v_r = 20; // radius of visual stimulus (px)
let v_ecc = 200; // eccentricity of visual stimulus (px)
let v_dur = 1; // frames of visual stimulus duration (1 frame = 16.7 ms at 60 Hz)

let frame0;
// design for each trial
let full_design = jsPsych.randomization.factorial(factors, n_repeat);

/**
 * volume_adjust: 音量の調整、かつ、最初に音を鳴らしておかないと挙動は不安定なので、それを避ける
 */
let start_audio = {
  type: jsPsychP5,
  sketch: function (p) {
    let audioCtx;
    let iid = null;
    p.setup = function () {
      p.createCanvas(canvas_width, canvas_height);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(16);
      p.fill(255);
      p.text("マウスを１回クリックすると音が流れてきます。\n\n丁度良い音量に調整して、マウスをもう一回クリックしてください。", canvas_width / 2, canvas_height / 2);
      p.userStartAudio();
    };

    p.mousePressed = function () {
      if (iid == null) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        iid = setInterval(() => { playBeep(); }, 500)
      } else {
        clearInterval(iid);
        setTimeout(() => { p.trial.end_trial({ skip_record: true }); }, 500);
      }
    }
    function playBeep() {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = a_hz;
      osc.type = "sine";
      const t = audioCtx.currentTime;
      const duration = a_dur / 1000; // 7 ms
      const ramp = 0.001;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4, t + ramp);
      gain.gain.setValueAtTime(0.4, t + duration - ramp);
      gain.gain.linearRampToValueAtTime(0, t + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + duration);
    }
  }
};

/**
 * Stimulus presentation (p5)
 */
let trial_measure = {
  type: jsPsychP5,
  sketch: function (p) {
    let av_pair = jsPsych.evaluateTimelineVariable("av_pair");
    let cond_a = av_pair.a; // 聴覚刺激の回数
    let cond_v = av_pair.v; // 視覚刺激の回数
    let timings_a = stim_timings.a[cond_a]; // 聴覚刺激のタイミング（ms）
    let timings_v = stim_timings.v[cond_v]; // 視覚刺激のタイミング（ms）]
    let real_timiings_v = []; // 実際の視覚刺激提示タイミング（AudioContextのcurrentTimeで記録）
    let real_timiings_a = []; // 実際の聴覚刺激提示タイミング（AudioContextのcurrentTimeで記録）
    let stim_pos = p.random([0, 1, 2, 3]); // 刺激位置（ランダム）

    let nw0 = p.millis();

    // ボタンオブジェクト
    let b = [];

    // WebAudio（サンプル精度でスケジュール）
    let audioCtx;
    let trialStartFrame = null; // 刺激開始フレーム
    let trialStartAudioTime = null; // 聴覚刺激開始時間

    let flashDurationFrames = 1;  // 視覚刺激の提示時間（frame）
    let frameMs = 1000 / 60; // 1フレームあたりの時間（ms）
    let startDelayTime = p.random(800, 1000); // 刺激開始前の遅延（ランダム, ms）
    let startDelayFrames = p.round(startDelayTime / frameMs); // 刺激開始前の遅延（フレーム数）

    p.setup = function () {
      p.createCanvas(canvas_width, canvas_height);
      p.frameRate(60); // フレームレートを60にリクエスト

      // AudioContext
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      trialStartFrame = p.frameCount + startDelayFrames;
      // 音の基準時刻も同じ遅延にする
      trialStartAudioTime = audioCtx.currentTime + (startDelayFrames / 60);
      // 聴覚刺激のスケジュール
      scheduleBeeps(timings_a);

      // 回答ボタンの作成
      p.textAlign(p.CENTER, p.CENTER);
      let d = p.createDiv();
      for (let i = 0; i < 4; ++i) {
        b[i] = p.createButton(i + 1);
        b[i].mousePressed(() => { response(i + 1) });
        d.child(b[i]);
        d.child(p.createSpan("  "));
      }
    };

    p.draw = function () {
      // 現在のフレーム数
      let elapsedFrames = p.frameCount - trialStartFrame;

      // fixation
      p.background(0);
      p.fill(255);
      p.textSize(64);
      p.text("+", canvas_width / 2, canvas_height / 2);

      // 視覚刺激描画
      for (let flashTimeMs of timings_v) {
        let flashFrame = p.round(flashTimeMs / frameMs);
        if (elapsedFrames >= flashFrame && elapsedFrames < flashFrame + flashDurationFrames) {
          real_timiings_v.push(audioCtx.currentTime)
          p.noStroke();
          p.fill(255);
          switch (stim_pos) {
            case 0: // 上
              p.circle(canvas_width / 2, canvas_height / 2 - v_ecc, v_r * 2);
              break;
            case 1: // 右
              p.circle(canvas_width / 2 + v_ecc, canvas_height / 2, v_r * 2);
              break;
            case 2: // 下
              p.circle(canvas_width / 2, canvas_height / 2 + v_ecc, v_r * 2);
              break;
            case 3: // 左
              p.circle(canvas_width / 2 - v_ecc, canvas_height / 2, v_r * 2);
              break;
          }
        }
      }
    };

    p.keyReleased = function (e) {
      switch (e.key) {
        case "1": response(1); break;
        case "2": response(2); break;
        case "3": response(3); break;
        case "4": response(4); break;
      }
    }

    // 聴覚刺激のスケジュール
    function scheduleBeeps(beepTimesMs) {
      for (let tMs of beepTimesMs) {
        let startTime = trialStartAudioTime + tMs / 1000;
        scheduleBeep(startTime, 0.007, 3500);
        real_timiings_a.push(startTime);
      }
    }

    // 聴覚刺激のスケジュール
    function scheduleBeep(startTime, durationSec, frequency) {
      let osc = audioCtx.createOscillator();
      let gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      let amp = 0.4;
      let ramp = 0.001;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(amp, startTime + ramp);
      gain.gain.setValueAtTime(amp, startTime + durationSec - ramp);
      gain.gain.linearRampToValueAtTime(0, startTime + durationSec);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + durationSec);
    }
    // 回答処理
    response = function (r) {
      console.log(r);
      let data = {
        視覚刺激回数: cond_v,
        聴覚刺激回数: cond_a,
        回答: r,
        反応時間: p.round(p.millis() - nw0),
        視覚刺激予定タイミング: timings_v.join("+"),
        聴覚刺激予定タイミング: timings_a.join("+"),
        視覚刺激呈示タイミング: real_timiings_v.map(t => t.toFixed(3)).join("+"),
        聴覚刺激呈示タイミング: real_timiings_a.map(t => t.toFixed(3)).join("+"),
        刺激位置: ["上", "右", "下", "左"][stim_pos],
        type: "measure",
      };
      p.trial.end_trial(data);
    };
  }
};

/**
 * Blank before stimulus
 */
let trial_blank_before_stimulus = {
  type: jsPsychHtmlKeyboardResponse,
  choices: " ",
  post_trial_gap: 500,
  stimulus: "スペースキーを押すと実験が始まります",
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
画面中央の固視点（+）を見つめてください。<br/>
各試行で、画面の上下左右のどこかで白い丸が1〜4回、点滅します。<br/>
何回点滅したように見えたかを、ボタンをクリックして答えてください。<br/>
キーボードの1から4の数字キーを押して回答することもできます。<br/>
点滅と同時に音が鳴ることがありますが、音は無視して、点滅の回数だけに注意してください。<br/>
<br/>
全部で ${full_design.length} 回の試行があります。<br/>
<br/>
<b>スペースキー</b>を押して実験を開始してください。<br/>
      </div>`,
  on_start: function () {
    //    document.body.style.cursor = "none";
  },
  data: {
    skip_record: true,
  },
};

/**
 * save and finish
 */
let trial_bye = create_trial_save([
  "視覚刺激回数",
  "聴覚刺激回数",
  "回答",
  "反応時間",
  "視覚刺激予定タイミング",
  "聴覚刺激予定タイミング",
  "視覚刺激呈示タイミング",
  "聴覚刺激呈示タイミング",
  "刺激位置",
]);

/**
 * timeline 
 */
let proc_measure = {
  timeline: [trial_measure],
  timeline_variables: full_design,
};

jsPsych.run([
  create_enter_fullscreen(),
  create_get_userinfo(),
  trial_instruction,
  start_audio,
  trial_blank_before_stimulus,
  proc_measure,
  create_end_fullscreen(),
  trial_bye
]);

