import { useState, useEffect, useRef } from 'react'
import './App.css'
import Timer from './components/Timer'
import Settings from './components/Settings'
import QuickTimeEntry from './components/QuickTimeEntry'
import { playSound } from './utils/sounds'

// Load preferences from localStorage
const loadPreference = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

// Save preference to localStorage
const savePreference = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore localStorage errors
  }
}

function App() {
  const [focusTime, setFocusTime] = useState(() => loadPreference('focusTime', 45))
  const [shortBreak, setShortBreak] = useState(() => loadPreference('shortBreak', 5))
  const [longBreak, setLongBreak] = useState(() => loadPreference('longBreak', 10))
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(() => loadPreference('sessionsBeforeLongBreak', 1))
  const [soundOption, setSoundOption] = useState(() => loadPreference('soundOption', 'success'))
  const [soundVolume, setSoundVolume] = useState(() => loadPreference('soundVolume', 20))
  const [soundRepeat, setSoundRepeat] = useState(() => loadPreference('soundRepeat', 2))
  const [currentTime, setCurrentTime] = useState(focusTime * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [mode, setMode] = useState('focus') // 'focus', 'shortBreak', 'longBreak', 'custom'
  const [sessionCount, setSessionCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showQuickEntry, setShowQuickEntry] = useState(false)
  const intervalRef = useRef(null)

  // Save preferences when they change
  useEffect(() => {
    savePreference('focusTime', focusTime)
  }, [focusTime])

  useEffect(() => {
    savePreference('shortBreak', shortBreak)
  }, [shortBreak])

  useEffect(() => {
    savePreference('longBreak', longBreak)
  }, [longBreak])

  useEffect(() => {
    savePreference('sessionsBeforeLongBreak', sessionsBeforeLongBreak)
  }, [sessionsBeforeLongBreak])

  useEffect(() => {
    savePreference('soundOption', soundOption)
  }, [soundOption])

  useEffect(() => {
    savePreference('soundVolume', soundVolume)
  }, [soundVolume])

  useEffect(() => {
    savePreference('soundRepeat', soundRepeat)
  }, [soundRepeat])

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, isPaused])

  const handleTimerComplete = () => {
    setIsRunning(false)
    setIsPaused(false)
    
    // Play sound when timer completes
    playSound(soundOption, soundVolume, soundRepeat)
    
    if (mode === 'focus') {
      // Focus always goes to short break, increment session count
      setSessionCount((prevCount) => prevCount + 1)
      setMode('shortBreak')
      setCurrentTime(shortBreak * 60)
    } else if (mode === 'shortBreak') {
      // Short break checks if we've met the session threshold
      // If yes, go to long break and reset count
      // If no, go back to focus
      setSessionCount((prevCount) => {
        if (prevCount >= sessionsBeforeLongBreak) {
          setMode('longBreak')
          setCurrentTime(longBreak * 60)
          return 0
        } else {
          setMode('focus')
          setCurrentTime(focusTime * 60)
          return prevCount
        }
      })
    } else if (mode === 'longBreak') {
      // Long break always goes back to focus
      setMode('focus')
      setCurrentTime(focusTime * 60)
    } else {
      // Custom timer - just reset
      setMode('focus')
      setCurrentTime(focusTime * 60)
    }
  }

  const startTimer = () => {
    setIsRunning(true)
    setIsPaused(false)
  }

  const pauseTimer = () => {
    setIsPaused(true)
  }

  const resumeTimer = () => {
    setIsPaused(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsPaused(false)
    if (mode === 'focus') {
      setCurrentTime(focusTime * 60)
    } else if (mode === 'shortBreak') {
      setCurrentTime(shortBreak * 60)
    } else if (mode === 'longBreak') {
      setCurrentTime(longBreak * 60)
    } else {
      // custom mode - keep current time
    }
  }

  const startFocus = () => {
    setMode('focus')
    setCurrentTime(focusTime * 60)
    setIsRunning(true)
    setIsPaused(false)
  }

  const startShortBreak = () => {
    setMode('shortBreak')
    setCurrentTime(shortBreak * 60)
    setIsRunning(true)
    setIsPaused(false)
  }

  const startLongBreak = () => {
    setMode('longBreak')
    setCurrentTime(longBreak * 60)
    setIsRunning(true)
    setIsPaused(false)
  }

  const setQuickTime = (minutes) => {
    setMode('custom')
    setCurrentTime(minutes * 60)
    setShowQuickEntry(false)
  }

  const fastForward = () => {
    // Stop the timer first
    setIsRunning(false)
    setIsPaused(false)
    // Jump to end and trigger completion (will play sound)
    setCurrentTime(0)
    // Use a small delay to ensure state updates are processed
    setTimeout(() => {
      handleTimerComplete()
    }, 10)
  }

  const skipToNext = () => {
    // Move to next item in sequence (same logic as timer completion)
    // and automatically start the next timer
    if (mode === 'focus') {
      // Focus always goes to short break, increment session count
      setSessionCount((prevCount) => prevCount + 1)
      setMode('shortBreak')
      setCurrentTime(shortBreak * 60)
      setIsRunning(true)
      setIsPaused(false)
    } else if (mode === 'shortBreak') {
      // Short break checks if we've met the session threshold
      setSessionCount((prevCount) => {
        if (prevCount >= sessionsBeforeLongBreak) {
          setMode('longBreak')
          setCurrentTime(longBreak * 60)
          setIsRunning(true)
          setIsPaused(false)
          return 0
        } else {
          setMode('focus')
          setCurrentTime(focusTime * 60)
          setIsRunning(true)
          setIsPaused(false)
          return prevCount
        }
      })
    } else if (mode === 'longBreak') {
      // Long break always goes back to focus
      setMode('focus')
      setCurrentTime(focusTime * 60)
      setIsRunning(true)
      setIsPaused(false)
    } else {
      // Custom timer - go to focus
      setMode('focus')
      setCurrentTime(focusTime * 60)
      setIsRunning(true)
      setIsPaused(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="app">
      <div className="app-header">
        <button 
          className="icon-button" 
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Settings"
        >
          ⚙️
        </button>
        <h1>Pomodoro Timer</h1>
        <button 
          className="icon-button" 
          onClick={() => setShowQuickEntry(!showQuickEntry)}
          aria-label="Quick Time Entry"
        >
          ⏱️
        </button>
      </div>

      {showSettings && (
        <Settings
          focusTime={focusTime}
          shortBreak={shortBreak}
          longBreak={longBreak}
          sessionsBeforeLongBreak={sessionsBeforeLongBreak}
          soundOption={soundOption}
          soundVolume={soundVolume}
          soundRepeat={soundRepeat}
          onFocusTimeChange={setFocusTime}
          onShortBreakChange={setShortBreak}
          onLongBreakChange={setLongBreak}
          onSessionsBeforeLongBreakChange={setSessionsBeforeLongBreak}
          onSoundOptionChange={setSoundOption}
          onSoundVolumeChange={setSoundVolume}
          onSoundRepeatChange={setSoundRepeat}
          onClose={() => setShowSettings(false)}
          onReset={() => {
            resetTimer()
            if (mode === 'focus') {
              setCurrentTime(focusTime * 60)
            } else if (mode === 'shortBreak') {
              setCurrentTime(shortBreak * 60)
            } else if (mode === 'longBreak') {
              setCurrentTime(longBreak * 60)
            }
          }}
        />
      )}

      {showQuickEntry && (
        <QuickTimeEntry
          onSetTime={setQuickTime}
          onClose={() => setShowQuickEntry(false)}
        />
      )}

      <Timer
        time={currentTime}
        mode={mode}
        isRunning={isRunning}
        isPaused={isPaused}
        onStart={startTimer}
        onPause={pauseTimer}
        onResume={resumeTimer}
        onReset={resetTimer}
        onFastForward={fastForward}
        onSkipToNext={skipToNext}
        onStartFocus={startFocus}
        onStartShortBreak={startShortBreak}
        onStartLongBreak={startLongBreak}
        formatTime={formatTime}
      />
    </div>
  )
}

export default App

