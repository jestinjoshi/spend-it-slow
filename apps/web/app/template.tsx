/**
 * A template (unlike a layout) re-mounts on every navigation, so the entry
 * animation below runs each time the user moves between the calculator and
 * settings, giving a smooth page transition. Disabled for reduced-motion users
 * via globals.css.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
