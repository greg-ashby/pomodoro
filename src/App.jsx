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
  const endTimeRef = useRef(null) // Store the timestamp when timer should end

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

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Timer logic using end timestamp (catches up after sleep)
  useEffect(() => {
    if (isRunning && !isPaused && endTimeRef.current) {
      const updateTimer = () => {
        const now = Date.now()
        const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000))
        
        if (remaining <= 0) {
          handleTimerComplete()
          setCurrentTime(0)
        } else {
          setCurrentTime(remaining)
        }
      }
      
      // Update immediately
      updateTimer()
      
      // Then update every second
      intervalRef.current = setInterval(updateTimer, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, isPaused, mode, focusTime, shortBreak, longBreak])

  const handleTimerComplete = () => {
    setIsRunning(false)
    setIsPaused(false)
    endTimeRef.current = null
    
    // Clear timer data from storage and service worker
    try {
      localStorage.removeItem('timerEndTime')
      localStorage.removeItem('timerMode')
      
      // Clear service worker timer
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.active?.postMessage({
            type: 'TIMER_CLEAR'
          })
        })
      }
    } catch {}
    
    // Play sound when timer completes
    playSound(soundOption, soundVolume, soundRepeat)
    
    // Show notification
    showNotification(mode)
    
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

  const showNotification = (timerMode) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const modeNames = {
        focus: 'Focus Time',
        shortBreak: 'Short Break',
        longBreak: 'Long Break',
        custom: 'Custom Timer'
      }
      
      const title = `${modeNames[timerMode] || 'Timer'} Complete!`
      const body = timerMode === 'focus' 
        ? 'Time for a break! 🎉'
        : timerMode === 'longBreak'
        ? 'Ready to focus again? 🚀'
        : 'Break time is over!'
      
      // Show notification and also send to service worker
      new Notification(title, {
        body: body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'pomodoro-timer',
        requireInteraction: false
      })
      
      // Also send message to service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body: body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            tag: 'pomodoro-timer',
            requireInteraction: false
          })
        })
      }
    }
  }

  const updateServiceWorker = (endTime, timerMode) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'TIMER_UPDATE',
          endTime: endTime,
          mode: timerMode
        })
      })
    }
  }

  const startTimer = () => {
    const duration = currentTime
    endTimeRef.current = Date.now() + (duration * 1000)
    setIsRunning(true)
    setIsPaused(false)
    
    // Store timer info for service worker
    try {
      localStorage.setItem('timerEndTime', endTimeRef.current.toString())
      localStorage.setItem('timerMode', mode)
      updateServiceWorker(endTimeRef.current, mode)
    } catch {}
  }

  const pauseTimer = () => {
    // Adjust end time based on remaining time when paused
    if (endTimeRef.current) {
      const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000))
      endTimeRef.current = null
      setCurrentTime(remaining)
    }
    setIsPaused(true)
  }

  const resumeTimer = () => {
    // Set new end time based on current remaining time
    const duration = currentTime
    endTimeRef.current = Date.now() + (duration * 1000)
    setIsPaused(false)
    
    // Update stored timer info
    try {
      localStorage.setItem('timerEndTime', endTimeRef.current.toString())
      localStorage.setItem('timerMode', mode)
      updateServiceWorker(endTimeRef.current, mode)
    } catch {}
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
    const duration = focusTime * 60
    setCurrentTime(duration)
    endTimeRef.current = Date.now() + (duration * 1000)
    setIsRunning(true)
    setIsPaused(false)
    
    try {
      localStorage.setItem('timerEndTime', endTimeRef.current.toString())
      localStorage.setItem('timerMode', 'focus')
      updateServiceWorker(endTimeRef.current, 'focus')
    } catch {}
  }

  const startShortBreak = () => {
    setMode('shortBreak')
    const duration = shortBreak * 60
    setCurrentTime(duration)
    endTimeRef.current = Date.now() + (duration * 1000)
    setIsRunning(true)
    setIsPaused(false)
    
    try {
      localStorage.setItem('timerEndTime', endTimeRef.current.toString())
      localStorage.setItem('timerMode', 'shortBreak')
      updateServiceWorker(endTimeRef.current, 'shortBreak')
    } catch {}
  }

  const startLongBreak = () => {
    setMode('longBreak')
    const duration = longBreak * 60
    setCurrentTime(duration)
    endTimeRef.current = Date.now() + (duration * 1000)
    setIsRunning(true)
    setIsPaused(false)
    
    try {
      localStorage.setItem('timerEndTime', endTimeRef.current.toString())
      localStorage.setItem('timerMode', 'longBreak')
      updateServiceWorker(endTimeRef.current, 'longBreak')
    } catch {}
  }

  const setQuickTime = (minutes) => {
    setMode('custom')
    const duration = minutes * 60
    setCurrentTime(duration)
    setShowQuickEntry(false)
    // Don't auto-start quick time entries
  }
  
  // Check for timer completion on mount (in case app was closed)
  useEffect(() => {
    try {
      const storedEndTime = localStorage.getItem('timerEndTime')
      const storedMode = localStorage.getItem('timerMode')
      
      if (storedEndTime && storedMode) {
        const endTime = parseInt(storedEndTime, 10)
        const now = Date.now()
        
        if (now >= endTime) {
          // Timer completed while app was closed
          endTimeRef.current = null
          localStorage.removeItem('timerEndTime')
          localStorage.removeItem('timerMode')
          
          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            showNotification(storedMode)
          }
        } else {
          // Timer still running, restore it
          endTimeRef.current = endTime
          setMode(storedMode)
          const remaining = Math.floor((endTime - now) / 1000)
          setCurrentTime(remaining)
          setIsRunning(true)
          setIsPaused(false)
        }
      }
    } catch {}
  }, [])

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

