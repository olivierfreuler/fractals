import React, { useState, useEffect } from 'react';
import { BrowserProvider, parseEther, Contract } from 'ethers';
import { Stage, Layer, Rect } from 'react-konva';
import { useSpring, animated } from '@react-spring/web';

const Fractal = () => {
  const [mandelbrotValue, setMandelbrotValue] = useState(0);
  const [juliaValue, setJuliaValue] = useState(0);
  const [contract, setContract] = useState(null);

  const contractAddress = '0x4c1fF993E16b493aEC456117d1B515567118188e';
  const contractABI = [
    {
      "inputs": [],
      "name": "performInteraction",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ];

  useEffect(() => {
    const initializeContract = async () => {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const fractalContract = new Contract(contractAddress, contractABI, signer);
        setContract(fractalContract);
      } else {
        console.error('Ethereum wallet not detected');
      }
    };

    initializeContract();
  }, []);

  const calculateFractals = async () => {
    const newMandelbrotValue = calculateMandelbrot(0.5, 0.5, 1000);
    const newJuliaValue = calculateJulia(0.5, 0.5, 0.355, 0.355, 1000);

    setMandelbrotValue(newMandelbrotValue);
    setJuliaValue(newJuliaValue);

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

  const calculateMandelbrot = (x, y, maxIterations) => {
    let zx = 0.0;
    let zy = 0.0;
    let iteration = 0;

    while (zx * zx + zy * zy <= 4.0 && iteration < maxIterations) {
      const tmp = zx * zx - zy * zy + x;
      zy = 2.0 * zx * zy + y;
      zx = tmp;
      iteration += 1;
    }

    return iteration;
  };

  const calculateJulia = (x, y, cx, cy, maxIterations) => {
    let zx = x;
    let zy = y;
    let iteration = 0;

    while (zx * zx + zy * zy <= 4.0 && iteration < maxIterations) {
      const tmp = zx * zx - zy * zy + cx;
      zy = 2.0 * zx * zy + cy;
      zx = tmp;
      iteration += 1;
    }

    return iteration;
  };

  const drawMandelbrot = () => {
    const width = 800;
    const height = 600;
    const magnificationFactor = 200;
    const panX = 2;
    const panY = 1.5;
    const rects = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let zx = 0;
        let zy = 0;
        const cx = (x / magnificationFactor) - panX;
        const cy = (y / magnificationFactor) - panY;
        let iteration = 0;
        const maxIteration = 1000;
        while (zx * zx + zy * zy < 4 && iteration < maxIteration) {
          const tmp = zx * zx - zy * zy + cx;
          zy = 2 * zx * zy + cy;
          zx = tmp;
          iteration++;
        }
        const color = iteration === maxIteration ? 0 : iteration * 255 / maxIteration;
        rects.push(<Rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={`rgb(${color}, ${color}, ${color})`} />);
      }
    }
    return rects;
  };

  return (
    <div>
      <h1>Fractal Generator</h1>
      <button onClick={calculateFractals}>Generate Fractals and Interact On-Chain</button>
      <div>
        <h2>Mandelbrot Value: {mandelbrotValue}</h2>
        <h2>Julia Value: {juliaValue}</h2>
      </div>
      <Stage width={800} height={600}>
        <Layer>
          {drawMandelbrot()}
        </Layer>
      </Stage>
    </div>
  );
};

export default Fractal;

