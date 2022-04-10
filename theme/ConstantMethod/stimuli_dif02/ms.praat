# # ## ### ##### ########  #############  ##################### 
# Praat Script
# save all selected sounds
#    Note: this script might fail for networked computers, 
#       or some operating systems.
#       I don't use a Mac, so I'm not sure if it works on a Mac. 
#
# Matthew Winn
# August 2014
##################################
##################### 
############# 
######## 
#####
###
##
#
#
save_directory$ = "/Users/takahashi/Downloads/so"

clearinfo
pause select all sounds to be used for this operation
numberOfSelectedSounds = numberOfSelected ("Sound")

for thisSelectedSound to numberOfSelectedSounds
	sound'thisSelectedSound' = selected("Sound",thisSelectedSound)
endfor

for thisSound from 1 to numberOfSelectedSounds
    select sound'thisSound'
	name$ = selected$("Sound")

    Save as WAV file... 'save_directory$'/'name$'.wav

endfor

#re-select the sounds
select sound1
for thisSound from 2 to numberOfSelectedSounds
    plus sound'thisSound'
endfor