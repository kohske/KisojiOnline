/**
 * Experiment Setting
 */
let EXP_PARAM = {};

/**
 * start fullscreen
 */
function create_enter_fullscreen(
    message = `<p>実験がフルスクリーンモードに切り替わります<br/>ボタンを押してください</p>`
) {
    return {
        type: jsPsychFullscreen,
        fullscreen_mode: true,
        message: message,
        data: { skip_record: true },
    };
}

/**
 * end fullscreen
 */
function create_end_fullscreen() {
    return {
        type: jsPsychFullscreen,
        fullscreen_mode: false,
        delay_after: 0,
        data: { skip_record: true },
    };
}

/**
 * participant ID and demographics
 */
function create_get_userinfo(id = true, age = true, gender = true) {
    let ret = `<div style="text-align: left">`;
    if (id) ret += `<p>ID: <input name="id" type="text" width="10"/></p>`;
    if (age)
        ret += `<p>年齢: <input type="number" name="age" min="0" max="99"></p>`;
    if (gender)
        ret += `<p>性別<br/>
    <label for="male" style="display: inline-block; margin-right: 10px;"><input type="radio" id="male" name="gender" value="男性" />男性</label>
    <label for="female" style="display: inline-block; margin-right: 10px;"><input type="radio" id="female" name="gender" value="女性" />女性</label>
    <label for="other" style="display: inline-block; margin-right: 10px;"><input type="radio" id="other" name="gender" value="その他" />その他</label>
    <label for="PNA" style="display: inline-block; margin-right: 10px;"><input type="radio" id="PNA" name="gender" value="回答しない" />回答しない</label>
    </p>
    `;
    ret += "</div>";
    return {
        type: jsPsychSurveyHtmlForm,
        preamble: `<h3>${EXP_PARAM.Exp_Name}</h3><p>参加者情報を入力してください</p>`,
        html: ret,
        on_finish: function (trial) {
            if (id) EXP_PARAM.Participant_ID = trial.response.id;
            if (age) EXP_PARAM.Participant_age = trial.response.age;
            if (gender) EXP_PARAM.Participant_gender = trial.response.gender;
        },
        data: {
            type: "Participant_info",
            skip_record: true,
        },
    };
}

/**
 * return header text for data file
 */
function create_data_header() {
    let ret = "";
    ret += "# Experiment Name: " + EXP_PARAM.Exp_Name + "\n";
    if (EXP_PARAM.Participant_ID)
        ret += "# Participant ID: " + EXP_PARAM.Participant_ID + "\n";
    if (EXP_PARAM.Participant_age)
        ret += "# Participant Age: " + EXP_PARAM.Participant_age + "\n";
    if (EXP_PARAM.Participant_gender)
        ret += "# Participant Gender: " + EXP_PARAM.Participant_gender + "\n";
    ret += "# Date: " + new Date().toLocaleString() + "\n";
    return ret;
}

/**
 * return unique filename from experiment name, participant ID, and timestamp.
 */
function save_data(data) {
    let fn =
        `${EXP_PARAM.Exp_Name.replace(/\s+/g, '')}_` +
        `${EXP_PARAM.Participant_ID.replace(/\s+/g, '')}_` +
        `${new Date()
            .toISOString()
            .replace(/[-:]/g, "")
            .slice(0, 15)}UTC.csv`;

    let data_string = create_data_header() + data.csv().replace(/"/g, "");
    saveTextToFile(data_string, fn);
    //    data.localSave("csv", fn);
}

/**
 * save and finish
 */
function create_trial_save(column = null) {
    if (null == EXP_PARAM.Participant_ID) {
        EXP_PARAM.Participant_ID = "noID";
    }

    return {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: EXP_PARAM.Exp_Name,
        choices: "NO_KEYS",
        on_start: function (trial) {
            document.body.style.cursor = "default";
            let dt = jsPsych.data
                .get()
                .filterCustom(trial => (trial.skip_record != true));
            if (column != null) {
                dt = dt.filterColumns(column);
            }
            let txt = create_data_header() + dt.csv().replace(/,/g, "\t").replace(/"/g, "");
            trial.prompt = `<div class="instruction">
実験が完了しました。CSV形式のデータファイルが自動的にダウンロードされます。<br/>
TSV形式のデータが下記のテキストエリアにも表示されています。すべて選択してExcelにコピーペーストできます。<br/>
<br/>
<textarea id="dataTextarea" style="width:600px; height: 300px">${txt}</textarea>
<button id="copyBtn">コピー</button>
      </div>`;
            save_data(dt);
            // コピーボタンのイベントリスナーを追加
            setTimeout(() => {
                document.getElementById('copyBtn').addEventListener('click', async function () {
                    const textarea = document.getElementById('dataTextarea');
                    try {
                        await navigator.clipboard.writeText(textarea.value);
                        alert('コピーされました');
                    } catch (err) {
                        console.error('コピーに失敗しました: ', err);
                        alert('コピーに失敗しました');
                    }
                });
            }, 100); // 少し遅延して要素がレンダリングされるのを待つ
        },
    }
}

/**
 * repeat and shuffule array
 */
const rep_shuffle = (array, n) =>
    Array(n)
        .fill(array)
        .flat()
        .sort(() => Math.random() - 0.5);

/** 
 * save text to file (from jspsych)
 */

function saveTextToFile(textstr, filename) {
    const blobToSave = new Blob([textstr], {
        type: "text/plain"
    });
    let blobURL = "";
    if (typeof window.webkitURL !== "undefined") {
        blobURL = window.webkitURL.createObjectURL(blobToSave);
    } else {
        blobURL = window.URL.createObjectURL(blobToSave);
    }
    const link = document.createElement("a");
    link.id = "jspsych-download-as-text-link";
    link.style.display = "none";
    link.download = filename;
    link.href = blobURL;
    link.click();
}