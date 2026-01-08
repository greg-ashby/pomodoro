import './Timer.css'

function Timer({ 
  time, 
  mode, 
  isRunning, 
  isPaused, 
  onStart, 
  onPause, 
  onResume, 
  onReset,
  onFastForward,
  onSkipToNext,
  onStartFocus,
  onStartShortBreak,
  onStartLongBreak,
  formatTime 
}) {
  const getModeLabel = () => {
    switch (mode) {
      case 'focus':
        return 'Focus Time'
      case 'shortBreak':
        return 'Short Break'
      case 'longBreak':
        return 'Long Break'
      case 'custom':
        return 'Custom Timer'
      default:
        return 'Timer'
    }
  }

  const getModeColor = () => {
    switch (mode) {
      case 'focus':
        return '#e53e3e'
      case 'shortBreak':
        return '#3182ce'
      case 'longBreak':
        return '#38a169'
      case 'custom':
        return '#805ad5'
      default:
        return '#4a5568'
    }
  }

  return (
    <div className="timer-container">
      <div className="timer-mode" style={{ color: getModeColor() }}>
        {getModeLabel()}
      </div>
      
      <div className="timer-display" style={{ color: getModeColor() }}>
        {formatTime(time)}
      </div>

      <div className="timer-controls">
        {!isRunning && !isPaused && (
          <button className="timer-button primary" onClick={onStart}>
            Start
          </button>
        )}
        {(isRunning || isPaused) && (
          <div className="timer-control-icons">
            <button 
              className="timer-icon-button" 
              onClick={onReset}
              aria-label="Reset"
              title="Reset timer"
            >
              ⏹️
            </button>
            <button 
              className="timer-icon-button" 
              onClick={isPaused ? onResume : onPause}
              aria-label={isPaused ? "Resume" : "Pause"}
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? '▶️' : '⏸️'}
            </button>
            <button 
              className="timer-icon-button" 
              onClick={onFastForward}
              aria-label="Fast Forward"
              title="Fast Forward to end"
            >
              ⏩
            </button>
            <button 
              className="timer-icon-button" 
              onClick={onSkipToNext}
              aria-label="Skip to Next"
              title="Skip to next timer"
            >
              ⏭️
            </button>
          </div>
        )}
      </div>

      {!isRunning && !isPaused && (
        <div className="quick-start-buttons">
          <button 
            className="quick-button" 
            onClick={onStartFocus}
            style={{ borderColor: '#e53e3e', color: '#e53e3e' }}
          >
            Focus
          </button>
          <button 
            className="quick-button" 
            onClick={onStartShortBreak}
            style={{ borderColor: '#3182ce', color: '#3182ce' }}
          >
            Short Break
          </button>
          <button 
            className="quick-button" 
            onClick={onStartLongBreak}
            style={{ borderColor: '#38a169', color: '#38a169' }}
          >
            Long Break
          </button>
        </div>
      )}
    </div>
  )
}

export default Timer

