import './Settings.css'
import { soundOptions, playSound } from '../utils/sounds'

function Settings({
  focusTime,
  shortBreak,
  longBreak,
  sessionsBeforeLongBreak,
  soundOption,
  soundVolume,
  soundRepeat,
  onFocusTimeChange,
  onShortBreakChange,
  onLongBreakChange,
  onSessionsBeforeLongBreakChange,
  onSoundOptionChange,
  onSoundVolumeChange,
  onSoundRepeatChange,
  onClose,
  onReset
}) {
  const handleTestSound = () => {
    playSound(soundOption, soundVolume, soundRepeat)
  }
  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          <div className="setting-item">
            <label htmlFor="focus-time">
              Focus Time (minutes)
            </label>
            <input
              id="focus-time"
              type="number"
              min="1"
              max="120"
              value={focusTime}
              onChange={(e) => onFocusTimeChange(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="setting-item">
            <label htmlFor="short-break">
              Short Break (minutes)
            </label>
            <input
              id="short-break"
              type="number"
              min="1"
              max="60"
              value={shortBreak}
              onChange={(e) => onShortBreakChange(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="setting-item">
            <label htmlFor="long-break">
              Long Break (minutes)
            </label>
            <input
              id="long-break"
              type="number"
              min="1"
              max="120"
              value={longBreak}
              onChange={(e) => onLongBreakChange(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="setting-item">
            <label htmlFor="sessions-before-long">
              Sessions Before Long Break
            </label>
            <input
              id="sessions-before-long"
              type="number"
              min="1"
              max="10"
              value={sessionsBeforeLongBreak}
              onChange={(e) => onSessionsBeforeLongBreakChange(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="setting-item">
            <label htmlFor="sound-option">
              Timer End Sound
            </label>
            <div className="sound-controls">
              <select
                id="sound-option"
                value={soundOption}
                onChange={(e) => onSoundOptionChange(e.target.value)}
                className="sound-select"
              >
                {soundOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <button 
                className="test-sound-button" 
                onClick={handleTestSound}
                disabled={soundOption === 'none'}
                title="Test sound"
              >
                🔊
              </button>
            </div>
          </div>

          <div className="setting-item">
            <label htmlFor="sound-volume">
              Sound Volume: {soundVolume}%
            </label>
            <div className="volume-control">
              <input
                id="sound-volume"
                type="range"
                min="0"
                max="100"
                value={soundVolume}
                onChange={(e) => onSoundVolumeChange(parseInt(e.target.value))}
                className="volume-slider"
              />
              <span className="volume-value">{soundVolume}%</span>
            </div>
          </div>

          <div className="setting-item">
            <label htmlFor="sound-repeat">
              Sound Repeat: {soundRepeat} {soundRepeat === 1 ? 'time' : 'times'}
            </label>
            <input
              id="sound-repeat"
              type="number"
              min="1"
              max="10"
              value={soundRepeat}
              onChange={(e) => onSoundRepeatChange(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-button" onClick={onReset}>
            Reset Timer
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings

