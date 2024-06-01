import React, { useState, useEffect, useMemo } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { Stage, Layer, Rect } from 'react-konva';

const Fractal = () => {
  const [contract, setContract] = useState(null);
  const [fractalData, setFractalData] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

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
        const provider = new BrowserProvider(window.ethereum);
        const signer = provider.getSigner();
        const fractalContract = new Contract(contractAddress, contractABI, signer);
        setContract(fractalContract);
      } else {
        console.error('Ethereum wallet not detected');
      }
    };

    initializeContract();
  }, [contractABI]);

  const generateFractalData = () => {
    const data = [];
    const width = 800;
    const height = 600;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let zx = (x - width / 2) / zoom + offsetX;
        let zy = (y - height / 2) / zoom + offsetY;
        let i = 0;
        let zx2 = zx * zx;
        let zy2 = zy * zy;

        while (zx2 + zy2 < 4 && i < 255) {
          zy = 2 * zx * zy + zy;
          zx = zx2 - zy2 + zx;
          zx2 = zx * zx;
          zy2 = zy * zy;
          i++;
        }

        data.push({ x, y, color: i === 255 ? 'black' : `rgb(${i}, ${i}, ${i})` });
      }
    }
    setFractalData(data);
  };

  useEffect(() => {
    generateFractalData();
  }, [zoom, offsetX, offsetY]);

  const handleZoom = (event) => {
    setZoom(prevZoom => prevZoom * (event.evt.deltaY > 0 ? 1.1 : 0.9));
  };

  const handleInteraction = async () => {
    if (contract) {
      try {
        const tx = await contract.performInteraction({
          value: ethers.parseEther('0.00001')
        });
        console.log('Transaction:', tx);
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    }
  };

  return (
    <div>
      <button onClick={handleInteraction}>Generate Fractals and Interact On-Chain</button>
      <Stage width={800} height={600} onWheel={handleZoom}>
        <Layer>
          {fractalData.map((pixel, index) => (
            <Rect key={index} x={pixel.x} y={pixel.y} width={1} height={1} fill={pixel.color} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Fractal;

