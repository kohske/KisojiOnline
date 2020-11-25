 /* global jsPsych, getDateStr */


let isDrawing;
let x;
let y;
let clickY;
let current_point;
let start_time;


// pattern = 0; 反転なし
// pattern = 1; 前テスト（利き手）  練習（利き手）      後テスト（利き手）
// pattern = 2; 前テスト（利き手）  練習（非利き手）    後テスト（利き手）
// pattern = 3; 前テスト（利き手）  休憩１０分          後テスト（利き手）

let pattern = jsPsych.data.getURLVariable('pattern');
if (typeof pattern === "undefined") {
    pattern = 1 
} else {
    pattern = Number(pattern);
}

// mouse_style = 1; クリックした状態のままなぞる
// mouse_style = 2; クリックを解除（mouse up）してなぞる
let mouse_style = jsPsych.data.getURLVariable('mouse_style');
console.log(mouse_style)
console.log(typeof mouse_style)
if (typeof mouse_style === "undefined") {
    mouse_style = 1 
} else {
    mouse_style = Number(mouse_style);
}

let rest_time = jsPsych.data.getURLVariable('rest_time');
if (typeof rest_time === "undefined") {
    rest_time = 10 // 休憩の初期値は10分
} else {
    rest_time = Number(rest_time);
}


const inst_message = mouse_style === 1 ? 'クリックした状態のままで星形をなぞってください。' : 'クリックして、指をあげてから星形をなぞってください。'

const star_obj = { // 星
    obj_type: 'image',
    file: 'star.png',
    scale: 0.5,
}

const check_points = [
  [124, 255],
  [253, 252],
  [295, 137],
  [336, 250],
  [466, 255],
  [364, 329],
  [400, 443],
  [295, 378],
  [189, 446],
  [225, 329]
];
check_points.push(check_points[0]); // 開始位置を一番最後に追加

const arrow_obj = {
    obj_type: 'image',
    file: 'arrow.png',
    scale: 0.4,
    startX: check_points[0][0] + 20,
    startY: check_points[0][1] - 50,
}


const experiment = [];

const instruction = {
    type: 'html-button-response',
    stimulus: `<p>本日は実験にご協力いただきありがとうございます。</p>
        <p>この実験では、マウスまたはタッチパッドを使用して星形をなぞっていただきます。</p>
        <p>実験を続けられないと感じたときは、いつでも実験を中断していただいて構いません。</p>
        <p>実験への参加に同意いただける場合は、ご利用中のブラウザ以外のウィンドウ<br>およびブラウザ内の実験に関係のないタブをすべて閉じて「次へ」をクリックしてください。</p>`,
    choices: ['次へ'],
    data:{phase:1},
    on_finish: function(){
        jsPsych.data.addProperties({
            date: getDateStr(),
            randomID: myrandID,
            pattern: pattern
        });
    }
};

experiment.push(instruction)

const fullscreen_trial = {
    type: 'fullscreen',
    fullscreen_mode: true,
    message: `<p>下のボタンを押すとブラウザがフルスクリーンになります。</p>
    <p>実験を中断したい場合をのぞき、フルスクリーンモードを解除しないでください。</p>
    <p>実験が終わりましたらフルスクリーンは自動で解除されます。</p>`,
    button_label: '次へ'
}

const fullscreen_trial_exit = {
    type: 'fullscreen',
    fullscreen_mode: false
}

experiment.push(fullscreen_trial)

function init_val(){
    isDrawing = false;
    x = 0;
    y = 0;
    clickY = 0;
    current_point = 0;
}

function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}

function mouse_down(e){
    if (mouse_style === 1) {
        init_trial(e);
    }
}

function init_trial(e){
    console.log('init_trial')
    x = e.offsetX;
    y = e.offsetY;
    clickY = y;
    console.log(`x=${e.offsetX}; y=${e.offsetY};`)
    isDrawing = true;
    jsPsych.currentTrial().canvas.style.cursor = `none`;
    // console.log(jsPsych.currentTrial().canvas.style.cursor)
    // document.body.style.cursor = `none`; // いいけど消えすぎ
}

function mouse_move(e){
    if (isDrawing === false) return

    let currentY
    if (pattern === 0) { // 動きを反転させない
        currentY = e.offsetY
    } else {
        currentY = clickY - (e.offsetY - clickY); // 上下反転
    }
    // console.log(jsPsych.currentTrial().canvas.style.cursor) // カーソルが表示されるときもnoneになっていた。原因不明
    const context = jsPsych.currentTrial().context;
    drawLine(context, x, y, e.offsetX, currentY);
    x = e.offsetX;
    y = currentY;

    // 事前に指定した座標の一定範囲内に入ったら赤丸をつける
    const checkX = check_points[current_point][0];
    const checkY = check_points[current_point][1];
    const range = 10;
    if (checkX - range < x && checkX + range > x && checkY - range < y && checkY + range > y){
        context.fillStyle = 'red';
        context.arc(checkX, checkY, 5, 0, Math.PI*2, false);
        context.fill();
        if (current_point === 0) {
            start_time = performance.now();
        }
        current_point++;

        if (current_point == check_points.length){
            // finish the trial.
            // after_response2();
            jsPsych.finishTrial({
                // correct_response: true,
                reaction_time: (performance.now() - start_time)/1000, // 秒
            });
        }
    }
}

function mouse_up(e){
    if (mouse_style === 1) {
        if (isDrawing === false) return

        // let currentY
        // if (pattern === 0) {
        //     currentY = e.offsetY
        // } else {
        //     currentY = clickY - (e.offsetY - clickY);
        // }            
        // drawLine(jsPsych.currentTrial().context, x, y, e.offsetX, currentY);
        x = 0;
        y = 0;
        isDrawing = false;
        jsPsych.currentTrial().canvas.style.cursor = ``;
    } else {
        init_trial(e)
    }
    
}

function trial_finish(data){
    const base64 = jsPsych.currentTrial().canvas.toDataURL("image/png");
    const png_file_name = `${data.trial_num}.png`
    jsPsych.getDisplayElement().insertAdjacentHTML('beforeend', `<a id="jspsych-download-as-text-link" style="display:none;" 
        download="${png_file_name}" href="${base64}">click to download</a>`);
    document.getElementById('jspsych-download-as-text-link').click();

}

const myrandID = jsPsych.randomization.randomID(8);

const nPreTest = 2;
const nPractice = 10;
const nPostTest = 2;

let trial_cnt = 1;

const pre_variables = [];
for (let i = 0; i < nPreTest; i++){
    pre_variables.push(
        {inst: `<p>前テストの${i+1}回目を始めます。</p>
            <p><span class="red">利き手</span>で操作してください。</p>
            <p>次へをクリックしてください。</p>`,
        num: trial_cnt}
    );
    trial_cnt++;
}

const practice_variables = [];
const hand_type = pattern === 1 ? '利き手':'非利き手';
for (let i = 0; i < nPractice; i++){
    practice_variables.push(
        {inst: `<p>練習の${i+1}回目を始めます。</p>
            <p><span class="red">${hand_type}</span>で操作してください。</p>
            <p>次へをクリックしてください。</p>`,
        num: trial_cnt}
    );
    trial_cnt++;
}

const post_variables = [];
for (let i = 0; i < nPostTest; i++){
    post_variables.push(
        {inst: `<p>後テストの${i+1}回目を始めます。</p>
            <p><span class="red">利き手</span>で操作してください。</p>
            <p>次へをクリックしてください。</p>`,
        num: trial_cnt}
    );
    trial_cnt++;
}

const instruction3 = {
    type: 'html-button-response',
    stimulus: jsPsych.timelineVariable('inst'),
    choices: ['次へ'],
    data:{phase:2},
};

const task = {
    type: 'psychophysics',
    canvas_height: 600, // 異なるサイズのディスプレイで動作するようにcanvasの大きさを指定しておく
    canvas_width: 600,  // canvasの左上の座標が(0,0)になる
    prompt: `<p>${inst_message}<br>最後までなぞると画像が保存されます。</p>`,
    stimuli: [star_obj, arrow_obj], 
    data: {phase: 3, trial_num: jsPsych.timelineVariable('num')},
    clear_canvas: false,
    background_color: `white`,
    choices: jsPsych.NO_KEYS,
    on_load: init_val,
    mouse_down_func: mouse_down,
    mouse_move_func: mouse_move,
    mouse_up_func: mouse_up,
    on_finish: trial_finish
}

const rest_ms = rest_time * 60 * 1000; // 休憩時間（ms）

const text_obj = {
    obj_type: 'text',
    font: "40px 'Open Sans', 'Arial', sans-serif",
    // font: "48px serif",
    content: "Hello, world!",
    text_space: 100,
    change_attr: function(stim, times){
        stim.content = `休憩をしてください。\n残り時間は${Math.round((rest_ms - times)/1000)}秒です。`;
    }
}

const rest2 = {
    type: 'psychophysics',    
    canvas_height: 600, // 異なるサイズのディスプレイで動作するようにcanvasの大きさを指定しておく
    canvas_width: 600,  // canvasの左上の座標が(0,0)になる
    trial_duration: rest_ms,
    background_color: `white`,
    stimuli: [text_obj],
    data:{phase:4},
    choices: jsPsych.NO_KEYS,
}

const pre_trials = {
    timeline:[instruction3, task],
    timeline_variables: pre_variables
}
experiment.push(pre_trials)

if (pattern == 1 || pattern == 2){
    const practice_trials = {
        timeline:[instruction3, task],
        timeline_variables: practice_variables
    }
    experiment.push(practice_trials)
} else {
    experiment.push(rest2)
}

const post_trials = {
    timeline:[instruction3, task],
    timeline_variables: post_variables
}
experiment.push(post_trials)


const end_message = {
    type: 'html-button-response',
    // choices: ['enter'],
    choices: ['次へ'],
    // post_trial_gap: 0,
    stimulus: `実験が終わりました。<br>「次へ」をクリックすると実験の結果が自動的にダウンロードされるか、ダウンロードの画面が表示されます。<br>
        実験者の指示に従ってファイルを提出してください。`
};
experiment.push(end_message);
experiment.push(fullscreen_trial_exit)

/* start the experiment */
jsPsych.init({
  timeline: experiment,
  preload_images: ['star.png', 'arrow.png'], // The image data should be preloaded.
  on_finish: function(){
        // jsPsych.data.displayData();}
        // 文字化けをするデータを削除して保存
        let output_data = jsPsych.data.get().ignore('stimulus');
        // output_data = output_data.ignore('string');
        // output_data = output_data.ignore('color');
        output_data.localSave('csv', myrandID + '.csv');
    }
});