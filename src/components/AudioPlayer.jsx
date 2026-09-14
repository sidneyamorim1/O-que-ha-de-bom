export default function AudioPlayer({ src }) {
  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <audio className="audio-player" controls src={src}>
      Seu navegador não suporta reprodução de áudio.
    </audio>
  )
}
