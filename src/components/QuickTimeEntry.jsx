import { useState } from 'react'
import './QuickTimeEntry.css'

function QuickTimeEntry({ onSetTime, onClose }) {
  const [minutes, setMinutes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const mins = parseInt(minutes)
    if (mins > 0 && mins <= 999) {
      onSetTime(mins)
      setMinutes('')
    }
  }

  const quickTimes = [5, 10, 15, 20, 25, 30, 45, 60]

  return (
    <div className="quick-entry-overlay">
      <div className="quick-entry-panel">
        <div className="quick-entry-header">
          <h2>Quick Time Entry</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="quick-entry-form">
          <div className="quick-entry-input-group">
            <input
              type="number"
              min="1"
              max="999"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Enter minutes"
              autoFocus
              className="quick-entry-input"
            />
            <span className="quick-entry-label">minutes</span>
          </div>
          
          <button 
            type="submit" 
            className="quick-entry-button"
            disabled={!minutes || parseInt(minutes) <= 0 || parseInt(minutes) > 999}
          >
            Start Timer
          </button>
        </form>

        <div className="quick-times">
          <p className="quick-times-label">Quick select:</p>
          <div className="quick-times-grid">
            {quickTimes.map((time) => (
              <button
                key={time}
                className="quick-time-button"
                onClick={() => {
                  onSetTime(time)
                  setMinutes('')
                }}
              >
                {time}m
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickTimeEntry

