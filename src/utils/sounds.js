// Sound generator using Web Audio API
export const soundOptions = [
  { id: 'beep', name: 'Beep' },
  { id: 'chime', name: 'Chime' },
  { id: 'bell', name: 'Bell' },
  { id: 'ding', name: 'Ding' },
  { id: 'alarm', name: 'Alarm' },
  { id: 'buzzer', name: 'Buzzer' },
  { id: 'notification', name: 'Notification' },
  { id: 'success', name: 'Success' },
  { id: 'alert', name: 'Alert' },
  { id: 'none', name: 'None' }
]

export function playSound(soundId, volume = 50, repeatCount = 1) {
  if (soundId === 'none' || volume === 0 || repeatCount < 1) {
    return
  }

  // Play the sound multiple times with delay between repeats
  const playSingleSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported')
        return
      }

      const audioContext = new AudioContextClass()
      const gainNode = audioContext.createGain()
      const oscillator = audioContext.createOscillator()
      
      gainNode.connect(audioContext.destination)
      oscillator.connect(gainNode)
      
      // Set volume (0-100 to 0-1)
      gainNode.gain.value = volume / 100
      
      // Set sound type
      switch (soundId) {
        case 'beep':
          oscillator.type = 'sine'
          oscillator.frequency.value = 800
          oscillator.start()
          oscillator.stop(audioContext.currentTime + 0.2)
          break
          
        case 'chime':
          // Play a pleasant chime (two tones)
          oscillator.type = 'sine'
          oscillator.frequency.value = 523.25 // C5
          oscillator.start()
          oscillator.stop(audioContext.currentTime + 0.3)
          
          setTimeout(() => {
            const osc2 = audioContext.createOscillator()
            const gain2 = audioContext.createGain()
            gain2.connect(audioContext.destination)
            osc2.connect(gain2)
            gain2.gain.value = volume / 100
            osc2.type = 'sine'
            osc2.frequency.value = 659.25 // E5
            osc2.start()
            osc2.stop(audioContext.currentTime + 0.3)
          }, 150)
          break
          
        case 'bell':
          // Bell-like sound with harmonics
          oscillator.type = 'sine'
          oscillator.frequency.value = 440
          oscillator.start()
          oscillator.stop(audioContext.currentTime + 0.5)
          
          // Add harmonics for bell effect
          setTimeout(() => {
            const osc2 = audioContext.createOscillator()
            const gain2 = audioContext.createGain()
            gain2.connect(audioContext.destination)
            osc2.connect(gain2)
            gain2.gain.value = (volume / 100) * 0.5
            osc2.type = 'sine'
            osc2.frequency.value = 880
            osc2.start()
            osc2.stop(audioContext.currentTime + 0.3)
          }, 50)
          break
          
        case 'ding':
          // Short, pleasant ding
          oscillator.type = 'triangle'
          oscillator.frequency.value = 600
          oscillator.start()
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2)
          oscillator.stop(audioContext.currentTime + 0.2)
          break
          
        case 'alarm':
          // Urgent alarm sound (repeating beeps)
          oscillator.type = 'square'
          oscillator.frequency.value = 800
          oscillator.start()
          oscillator.stop(audioContext.currentTime + 0.15)
          
          setTimeout(() => {
            const osc2 = audioContext.createOscillator()
            const gain2 = audioContext.createGain()
            gain2.connect(audioContext.destination)
            osc2.connect(gain2)
            gain2.gain.value = volume / 100
            osc2.type = 'square'
            osc2.frequency.value = 800
            osc2.start()
            osc2.stop(audioContext.currentTime + 0.15)
          }, 200)
          break
          
        case 'buzzer':
          // Buzzer sound (harsh, attention-grabbing)
          oscillator.type = 'sawtooth'
          oscillator.frequency.value = 400
          oscillator.start()
          oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3)
          oscillator.stop(audioContext.currentTime + 0.3)
          break
          
        case 'notification':
          // Gentle notification sound (soft, pleasant)
          oscillator.type = 'sine'
          oscillator.frequency.value = 660
          oscillator.start()
          oscillator.stop(audioContext.currentTime + 0.15)
          
          setTimeout(() => {
            const osc2 = audioContext.createOscillator()
            const gain2 = audioContext.createGain()
            gain2.connect(audioContext.destination)
            osc2.connect(gain2)
            gain2.gain.value = (volume / 100) * 0.8
            osc2.type = 'sine'
            osc2.frequency.value = 880
            osc2.start()
            osc2.stop(audioContext.currentTime + 0.2)
          }, 100)
          break
          
        case 'success':
          // Success sound (upward arpeggio)
          oscillator.type = 'sine'
          oscillator.frequency.value = 523.25 // C5
          oscillator.start()
          oscillator.stop(audioContext.currentTime + 0.2)
          
          setTimeout(() => {
            const osc2 = audioContext.createOscillator()
            const gain2 = audioContext.createGain()
            gain2.connect(audioContext.destination)
            osc2.connect(gain2)
            gain2.gain.value = volume / 100
            osc2.type = 'sine'
            osc2.frequency.value = 659.25 // E5
            osc2.start()
            osc2.stop(audioContext.currentTime + 0.2)
            
            setTimeout(() => {
              const osc3 = audioContext.createOscillator()
              const gain3 = audioContext.createGain()
              gain3.connect(audioContext.destination)
              osc3.connect(gain3)
              gain3.gain.value = volume / 100
              osc3.type = 'sine'
              osc3.frequency.value = 783.99 // G5
              osc3.start()
              osc3.stop(audioContext.currentTime + 0.25)
            }, 150)
          }, 150)
          break
          
        case 'alert':
          // Alert sound (attention-grabbing, two-tone)
          oscillator.type = 'square'
          oscillator.frequency.value = 880
          oscillator.start()
          oscillator.stop(audioContext.currentTime + 0.2)
          
          setTimeout(() => {
            const osc2 = audioContext.createOscillator()
            const gain2 = audioContext.createGain()
            gain2.connect(audioContext.destination)
            osc2.connect(gain2)
            gain2.gain.value = volume / 100
            osc2.type = 'square'
            osc2.frequency.value = 1108.73 // C#6
            osc2.start()
            osc2.stop(audioContext.currentTime + 0.2)
          }, 150)
          break
          
        default:
          oscillator.type = 'sine'
          oscillator.frequency.value = 800
          oscillator.start()
          oscillator.stop(audioContext.currentTime + 0.2)
      }
    } catch (error) {
      console.warn('Error playing sound:', error)
    }
  }

  // Calculate the duration of the sound to determine delay between repeats
  // Most sounds are around 0.2-0.5 seconds, we'll use 0.5s as a safe default
  const soundDuration = 0.5
  const delayBetweenRepeats = 0.3 // 300ms gap between sounds

  // Play the sound the specified number of times
  for (let i = 0; i < repeatCount; i++) {
    setTimeout(() => {
      playSingleSound()
    }, i * (soundDuration * 1000 + delayBetweenRepeats * 1000))
  }
}

