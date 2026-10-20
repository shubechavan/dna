import Scene from './three/Scene';
import Overlay from './ui/Overlay';
import PresenterView from './ui/PresenterView';
import { IS_PRESENTER } from './store';

export default function App() {
  if (IS_PRESENTER) return <PresenterView />;
  return (
    <>
      <Scene />
      <Overlay />
    </>
  );
}
