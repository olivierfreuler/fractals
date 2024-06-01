import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { providers, Contract } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { Stage, Layer, Rect } from 'react-konva';

const Fractal = () => {
  const [contract, setContract] = useState(null);
  const [fractalData, setFractalData] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const stageRef = useRef(null);

  const contractAddress = "0x4c1fF993E16b493aEC456117d1B515567118188e";
  const contractABI = useMemo(() => [
    {
      "inputs": [],
      "name": "performInteraction",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ], []);

  useEffect(() => {
    const initializeContract = async () => {
      if (window.ethereum) {
        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const fractalContract = new Contract(contractAddress, contractABI, signer);
        setContract(fractalContract);
      } else {
        console.error('Ethereum wallet not detected');
      }
    };

    initializeContract();
  }, [contractABI]);

  const calculateFractals = async () => {
    if (contract) {
      try {
        const tx = await contract.performInteraction({
          value: parseEther('0.00001')
        });
        console.log('Transaction:', tx);
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    }
  };

  const generateFractalData = useCallback(() => {
    const worker = new Worker(new URL('./fractalWorker.js', import.meta.url));
    worker.postMessage({ zoom, offsetX, offsetY });

    worker.onmessage = (e) => {
      setFractalData(e.data);
    };

    return () => {
      worker.terminate();
    };
  }, [zoom, offsetX, offsetY]);

  useEffect(() => {
    generateFractalData();
  }, [generateFractalData]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setZoom(newScale);
    setOffsetX(pointer.x / newScale - mousePointTo.x);
    setOffsetY(pointer.y / newScale - mousePointTo.y);
  };

  return (
    <div>
      <button onClick={calculateFractals}>Calculate Fractals</button>
      <Stage width={800} height={600} onWheel={handleWheel} ref={stageRef}>
        <Layer>
          {fractalData.map((point, index) => (
            <Rect
              key={index}
              x={point.x}
              y={point.y}
              width={1}
              height={1}
              fill={point.color}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Fractal;

