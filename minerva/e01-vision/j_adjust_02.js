/**
 * ミネルヴァ書房「心理学実験」演習用プログラム
 * 
 * 視覚実験02
 * 
 */

EXP_PARAM.Exp_Name = "ML錯視 調整法5条件";

// Factorial design
let factors = {
  //  angle: [30, 60, 120, 150], // arrow angle
  direction: ["up", "down"], // sequence
  angle: [60, 120, 180, 240, 300], // arrow angle
  std_len: [150], // length of ML
};

let n_repeat = 2; // num. of repetition for each condition

