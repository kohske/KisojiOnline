# 必要なパッケージの読み込み
# インストールされていなければ、１度だけ`install.packages("seewave")`等とする。
library(seewave)
library(tuneR)
library(tidyverse)

## 音の設定
# サンプリング周波数
f = 44100
# 長さ（s）
adur = 0.5*f
# 周波数
hzs = c(250, 500, 1000, 2000, 4000, 8000)
# 振幅（音圧レベルに相当。最大音圧が0dB）
amps = -81:0
# 振幅（音圧に相当。最大音圧が1.0）
amprs = 10^(amps/20)

# 各周波数の
for (hz in hzs) {
  # 各振幅の刺激作成
  for (i in 1:length(amps)) {
    # dBと音圧
    amp = amps[i]
    ampr = amprs[i]
    # -81dBは音圧0とする。
    if (amp == -81) {ampr = 0}
    
    # 音作成
    # 正弦波作成 → fade-in/out → Wav化 → 振幅を変調（音を小さく）
    s1 = sine(hz, duration = adur, samp.rate = f) %>%
      fadew(f = f, din= 0.05, dout=0.05, shape = "cos") %>%  c() %>%
      Wave(., ., 44100, 32, FALSE) * ampr 
    
    # 音ファイル保存。 ファイル名は"LT_周波数_dB.wav"
    # "~/Downloads/stim/"を適当なフォルダ名に修正します。
    #writeWave(s1, sprintf("~/Downloads/stim/LT_%04d_%02d_%.04f.wav", hz, amp, ampr))
    writeWave(s1, sprintf("~/Downloads/stim/LT_%d_%d.wav", hz, amp, ampr))
    
    # 確認用コンソール出力
    cat(hz, amp, ampr, "\n")
  }
}


# 実験1の音刺激前後のノイズ
s1 = noise("pink", duration = 0.2*f, samp.rate = f) %>%
  fadew(f = f, din= 0.05, dout=0.05, shape = "cos") %>%  c() %>%
  Wave(., ., 44100, 32, FALSE) * 0.25

# 音ファイル保存。 
#writeWave(s1, sprintf("~/Downloads/stim/LT_%04d_%02d_%.04f.wav", hz, amp, ampr))
writeWave(s1, sprintf("~/Downloads/stim/LT_noise.wav"))
