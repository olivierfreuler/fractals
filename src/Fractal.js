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
    const newMandelbrotValue = calculateMandelbrot(-0.5, 0, 1000);
    const newJuliaValue = calculateJulia(0, 0, -0.4, 0.6, 1000);

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

  const calculateMandelbrot = (x0, y0, maxIterations) => {
    let x = 0;
    let y = 0;
    let iteration = 0;

    while (x*x + y*y <= 4 && iteration < maxIterations) {
      let xtemp = x*x - y*y + x0;
      y = 2*x*y + y0;
      x = xtemp;
      iteration += 1;
    }

    return iteration;
  };

  const calculateJulia = (x, y, cx, cy, maxIterations) => {
    let iteration = 0;

    while (x*x + y*y <= 4 && iteration < maxIterations) {
      let xtemp = x*x - y*y + cx;
      y = 2*x*y + cy;
      x = xtemp;
      iteration += 1;
    }

    return iteration;
  };

  const drawMandelbrot = () => {
    const width = 800;
    const height = 600;
    const magnificationFactor = 400;
    const panX = 2;
    const panY = 1.5;
    const rects = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const mandelbrotValue = calculateMandelbrot((x / magnificationFactor) - panX, (y / magnificationFactor) - panY, 1000);
        const color = mandelbrotValue === 1000 ? 0 : mandelbrotValue * 255 / 1000;
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

