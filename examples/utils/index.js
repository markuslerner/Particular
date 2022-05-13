import { Vector3 } from 'three';

export const random = (min = 0, max = 1) => Math.random() * (max - min) + min;

export const updateMousePosition = (camera, pos) => (event) => {
  const vec = new Vector3(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
    0.5
  );

  vec.unproject(camera);

  vec.sub(camera.position).normalize();

  var distance = -camera.position.z / vec.z;

  pos.copy(camera.position).add(vec.multiplyScalar(distance));
};

export const addMouseListener = (renderer, camera, pos) => {
  const supportsPointerEvents = !!window.PointerEvent;

  if (supportsPointerEvents) {
    renderer.domElement.ownerDocument.addEventListener(
      'pointermove',
      updateMousePosition(camera, pos)
    );
  } else {
    renderer.domElement.ownerDocument.addEventListener(
      'mousemove',
      updateMousePosition(camera, pos)
    );
  }
};
