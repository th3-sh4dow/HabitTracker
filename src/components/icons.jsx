export default function Icon({
  name,
  fill = false,
  size = 24,
  className = "",
  style = {},
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0",
        fontSize: size,
        ...style,
      }}
    >
      {name}
    </span>
  );
}