export default function GalaxyBackground() {
  return (
    <div
      aria-hidden="true"
      className="galaxy-background"
      data-density="0.5"
      data-glow-intensity="0.12"
      data-twinkle-intensity="0.1"
      data-rotation-speed="very-slow"
      data-star-speed="very-slow"
      data-mouse-interaction="false"
      data-mouse-repulsion="false"
    >
      <div className="galaxy-background__beams" />
      <div className="galaxy-background__glow" />
      <div className="galaxy-background__stars galaxy-background__stars--near" />
      <div className="galaxy-background__stars galaxy-background__stars--far" />
      <div className="galaxy-background__noise" />
      <div className="galaxy-background__veil" />
    </div>
  );
}
