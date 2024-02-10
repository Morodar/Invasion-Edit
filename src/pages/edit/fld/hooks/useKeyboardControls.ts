import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Camera } from "three";
import { OrbitControls } from "three-stdlib";
import * as THREE from "three";

export const useKeyboardControls = (orbitControlsRef?: React.RefObject<OrbitControls>) => {
    const [keys, setKeys] = useState(new Set<string>());
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const { camera } = useThree();

    useEffect(() => {
        const trackPressedKeys = (event: KeyboardEvent) => setKeys((old) => new Set(old).add(event.key));
        const trackReleasedKeys = (event: KeyboardEvent) =>
            setKeys((old) => {
                const updated = new Set(old);
                updated.delete(event.key);
                return updated;
            });

        window.addEventListener("keydown", trackPressedKeys);
        window.addEventListener("keyup", trackReleasedKeys);

        return () => {
            window.removeEventListener("keydown", trackPressedKeys);
            window.addEventListener("keyup", trackReleasedKeys);
        };
    }, []);

    useFrame(() => {
        const now = new Date();
        const diff = now.getTime() - lastUpdate.getTime();
        setLastUpdate(now);
        if (keys.size === 0) {
            return;
        }
        if (orbitControlsRef?.current) {
            updateCameraPosition(diff, keys, camera, orbitControlsRef.current);
        }
    });
};

const speed = 0.1;
const rotateSpeed = 0.002;

function updateCameraPosition(timeMs: number, pressedKeys: Set<string>, camera: Camera, orbit: OrbitControls) {
    const target = orbit.target;
    const moveBy = speed * timeMs;
    const rotateBy = rotateSpeed * timeMs;

    const direction = new THREE.Vector3().subVectors(camera.position, target).normalize();
    const left = new THREE.Vector3().crossVectors(direction, up);
    const forward = new THREE.Vector3().crossVectors(left, up);

    const moveVector = new THREE.Vector3();

    for (const key of pressedKeys) {
        switch (key) {
            case "w":
                moveVector.addScaledVector(forward, moveBy);
                break;

            case "a":
                moveVector.addScaledVector(left, moveBy);
                break;

            case "s":
                moveVector.addScaledVector(forward, -moveBy);
                break;

            case "d":
                moveVector.addScaledVector(left, -moveBy);
                break;

            case "e":
                // Rotate counter clock wise
                camera.position.sub(target).applyAxisAngle(up, rotateBy).add(target);
                break;

            case "q":
                // Rotate clock wise
                camera.position.sub(target).applyAxisAngle(up, -rotateBy).add(target);
                break;

            default:
                break;
        }
    }
    camera.position.add(moveVector);
    orbit.target.add(moveVector);
    orbit.update();
}

const up = new THREE.Vector3(0, 1, 0);