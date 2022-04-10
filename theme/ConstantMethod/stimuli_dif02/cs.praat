
################################################################
## 
## This script creates a synthesized series of pa/bas varying in 
## VOT (manipulates aspiration duration and prevoicing separately)
## and/or f0 onset frequency. 
##
## Prevoicing and burst are created as separate sounds 
## (the burst is identical for all tokens). 
## The relative amplitude of the various components is hard-coded 
## via amplitude scaling at the end of synthesis of each component.
##
## The durations for the burst and the vowel, as well as the ranges
## and numbers of steps, are user-defined in the "User Input" section.
##
## May 27, 2014 - jessamyn.schertz@gmail.com
##
################################################################


## USER INPUT ####################################################

## Set burst duration, vowel duration, formant transition duration
burst_dur = 0.004
v_dur = 0.315
f_transition_dur = 0.035

## Set minimum, maximum, and number of steps for aspiration, prevoicing, and f0.
## If you don't want to vary a parameter, set num_steps to 1,
## and the parameter will be set to the minimum value.
asp_min = 0
asp_max = 0.06
asp_num_steps = 31	

prev_min = 0
prev_max = 0.06
prev_num_steps = 31

f0_min = 100
f0_max = 120
f0_num_steps = 1

#f0_min = 90
#f0_max = 130
#f0_num_steps = 3
f0_stable = 100

## Set formant frequencies (onset and end-of-transition)
f1_onset = 220
f1_stable = 710
f1_bandwidth = 50
f2_onset = 900
f2_stable = 1240
f2_bandwidth = 70
f3_onset = 2000
f3_stable = 2500
f3_bandwidth = 110
f4_onset = 3600
f4_stable = 3600
f4_bandwidth = 170
f5_onset = 4500
f5_stable = 4500
f5_bandwidth = 250

## SYNTHESIS ###############################################################

## loops through all values of aspiration and f0 
## to create the changing part of each token

silence = Create Sound from formula... silence 1 0 0.05 44100 0
for i from 1 to asp_num_steps

	## figures out current value for aspiration duration
	if asp_num_steps == 1
		asp = asp_min
	else
		step_size = (asp_max - asp_min)/(asp_num_steps - 1)
		asp = asp_min + (i-1) * step_size
	endif
	for j from 1 to f0_num_steps

		## figures out current value for f0
		if f0_num_steps == 1
			f0 = f0_min
		else
			step_size = (f0_max - f0_min)/(f0_num_steps - 1)
			f0 = f0_min + (j-1) * step_size
		endif

		## figures out current value for prevoicing
		for k from 1 to prev_num_steps
			if prev_num_steps == 1
				prev = prev_min
			else
				step_size = (prev_max - prev_min)/(prev_num_steps - 1)
				prev = prev_min + (k-1) * step_size
			endif
			
			## creates sounds with prevoicing OR aspiration (not both)
			if asp == 0 or prev == 0
				## if prevoicing is present, create it
				if prev != 0
					call create_prevoicing
				endif

				## create burst
				call create_burst

				## create everything else
				call create_aspiration_and_vowel
	
				## concatenate prevoicing + burst + new token, rename, etc.
		
				if prev != 0
					select 'prev_sound'
					plus 'burst'
				else
					select 'burst'
				endif
				plus 'new_sound'
				almost_there = Concatenate
				if prev != 0
					prev_mult = prev * 1000
					prev_mult$ = "'prev_mult'"
					vot$ = "-" + prev_mult$
				else
					asp_mult = asp * 1000
					vot$ = "'asp_mult'"
				endif
				plus silence
				Concatenate
				Rename... 'vot$'_'f0'
				if prev != 0
					select 'prev_sound'
					Remove
					select 'prev_kg'
					Remove
				endif
				select 'new_sound'
				plus 'burst'
				plus 'almost_there'
				Remove
				select 'kg'
				plus 'burst_kg'
				Remove
			endif
		endfor
	endfor
endfor
select silence
Remove

##############################################

procedure create_burst
	burst_kg = Create KlattGrid... burst 0 burst_dur 0 0 0 1 0 0 0 
	Add frication formant frequency point... 1 0 300
	Add frication formant bandwidth point... 1 0 100
	Add frication formant amplitude point... 1 0 0.005
	Add frication amplitude point... 0 0
	Add frication amplitude point... 0.001 25
	Add frication amplitude point... 0.001 25
	Add frication amplitude point... burst_dur 0
	Add voicing amplitude point... 0 25
	burst = To Sound (special)... 0 0 44100 y n y y y y "Powers in tiers" y y y Cascade 1 5 1 1 1 1 1 1 1 1 1 1 1 1 1 6 y
	Scale intensity... 50
endproc

procedure create_aspiration_and_vowel
	## make initial KlattGrid
	kg = Create KlattGrid... creation 0 v_dur 5 0 0 1 0 0 0

	## add parameters for aspiration and vowel
	Add oral formant frequency point... 1 0 f1_onset
	Add oral formant frequency point... 1 f_transition_dur f1_stable 
	Add oral formant frequency point... 2 0 f2_onset 
	Add oral formant frequency point... 2 f_transition_dur f2_stable 
	Add oral formant frequency point... 3 0 f3_onset 
	Add oral formant frequency point... 3 f_transition_dur f3_stable 
	Add oral formant frequency point... 4 0 f4_onset 
	Add oral formant frequency point... 4 f_transition_dur f4_stable 
	Add oral formant frequency point... 5 0 f5_onset 
	Add oral formant frequency point... 5 f_transition_dur f5_stable
	
	Add oral formant bandwidth point... 1 0 f1_bandwidth
	Add oral formant bandwidth point... 2 0 f2_bandwidth
	Add oral formant bandwidth point... 3 0 f3_bandwidth
	Add oral formant bandwidth point... 4 0 f4_bandwidth
	Add oral formant bandwidth point... 5 0 f5_bandwidth

	Add pitch point... asp f0
	Add pitch point... asp+0.1 f0_stable
	Add pitch point... v_dur-0.04 90
	Add pitch point... v_dur 50
	Add voicing amplitude point... 0 0
	Add voicing amplitude point... asp 0
	Add voicing amplitude point... asp+0.00001 60
	Add voicing amplitude point... asp+0.02 60
	Add voicing amplitude point... v_dur 50
	Add aspiration amplitude point... burst_dur 20
	Add aspiration amplitude point... burst_dur+0.001 25
	Add aspiration amplitude point... asp-0.001 25
	Add aspiration amplitude point... asp 0
	new_sound = To Sound (special)... 0 0.315 44100 yes yes yes yes yes yes "Powers in tiers" yes yes yes Cascade 1 5 1 1 1 1 1 1 1 1 1 1 1 1 1 6 yes
endproc

procedure create_prevoicing
	prev_kg = Create KlattGrid... creation 0 prev 1 0 0 1 0 0 0
	Add oral formant frequency point... 1 0 120
	Add oral formant bandwidth point... 1 0 100
	Add pitch point... 0 120
	Add voicing amplitude point... 0 50
	prev_sound = To Sound (special)... 0 prev 44100 yes yes yes yes yes yes "Powers in tiers" yes yes yes Cascade 1 5 1 1 1 1 1 1 1 1 1 1 1 1 1 6 yes
	Scale intensity... 65
endproc