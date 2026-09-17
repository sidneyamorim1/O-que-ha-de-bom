import { useEffect, useRef, useState } from 'react'

export default function AudioPlayer({ src }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    setIsPlaying(false)
    setCurrentTime(0)

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration || 0)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [src])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleSeek = (e) => {
    if (!audioRef.current) return
    const time = Number(e.target.value)
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`custom-audio-player ${isPlaying ? 'custom-audio-player--playing' : ''}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        className="custom-audio-player__btn-play"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pausar narração' : 'Ouvir narração'}
        title={isPlaying ? 'Pausar narração' : 'Ouvir narração'}
      >
        <span className="custom-audio-player__icon">{isPlaying ? '⏸' : '▶'}</span>
      </button>

      <div className="custom-audio-player__waves" aria-hidden="true">
        <span className="wave-bar" />
        <span className="wave-bar" />
        <span className="wave-bar" />
        <span className="wave-bar" />
      </div>

      <div className="custom-audio-player__body">
        <div className="custom-audio-player__slider-wrap">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="custom-audio-player__slider"
            style={{ '--progress': `${progress}%` }}
          />
        </div>
        <div className="custom-audio-player__time">
          <span>{formatTime(currentTime)}</span>
          <span className="custom-audio-player__label-status">
            {isPlaying ? 'Narrando...' : 'Narração em áudio'}
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <button
        type="button"
        className="custom-audio-player__btn-mute"
        onClick={toggleMute}
        aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
        title={isMuted ? 'Ativar som' : 'Silenciar'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  )
}
