import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import './App.css';

function App() {
  const canvasRef = useRef(null);

  // State to hold an array of sides for each die
  const [numDice, setNumDice] = useState(1);  
  const [diceSides, setDiceSides] = useState([6]);  
  const [numDrop, setNumDrop] = useState(0);

  useEffect(() => {
    if (canvasRef.current) {
      const probDict = {};

      const calculateProbabilities = (diceSides) => {
        const probList = [];

        // Recursive function to calculate all combinations of dice rolls
        const rollDice = (diceIndex = 0, currentRolls = []) => {
          if (diceIndex === diceSides.length) {
            // Sort rolls, drop the lowest dice, and calculate the sum of the remaining
            const sortedRolls = currentRolls.sort((a, b) => a - b);
            const droppedRolls = sortedRolls.slice(numDrop); // Drop lowest 'numDrop' dice
            const sumOfRemaining = droppedRolls.reduce((acc, val) => acc + val, 0);
            probList.push(sumOfRemaining);
            return;
          }
          for (let i = 1; i <= diceSides[diceIndex]; i++) {
            rollDice(diceIndex + 1, [...currentRolls, i]);
          }
        };

        rollDice();

        probList.forEach(value => {
          probDict[value] = (probDict[value] || 0) + 1;
        });
      };

      calculateProbabilities(diceSides);

      const totalOutcomes = diceSides.reduce((a, b) => a * b, 1);
      const x = Object.keys(probDict);
      const y = Object.values(probDict).map(freq => freq / totalOutcomes);

      const ctx = canvasRef.current.getContext('2d');
      const diceChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: x,
          datasets: [{
            label: 'Probability Distribution',
            data: y,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1
          }]
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: 'Sum of Dice Rolls'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Probability'
              },
              beginAtZero: true
            }
          }
        }
      });

      return () => {
        diceChart.destroy();
      };
    }
  }, [diceSides, numDrop]);

  const handleNumDiceChange = (e) => {
    const newNumDice = Number(e.target.value);
    setNumDice(newNumDice);
    const newDiceSides = [...diceSides];
    if (newNumDice > diceSides.length) {
      for (let i = diceSides.length; i < newNumDice; i++) {
        newDiceSides.push(6);
      }
    } else {
      newDiceSides.length = newNumDice;
    }
    setDiceSides(newDiceSides);
  };

  const handleDieSidesChange = (index, value) => {
    const newDiceSides = [...diceSides];
    newDiceSides[index] = Number(value);
    setDiceSides(newDiceSides);
  };

  const handleNumDropChange = (e) => {
    const newNumDrop = Number(e.target.value);
    setNumDrop(newNumDrop);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dice Probability Calculator</h1>

        {/* Form to select number of dice, sides, and dice to drop */}
        <form>
          <label>
            Number of Dice:
            <input 
              type="number" 
              value={numDice} 
              onChange={handleNumDiceChange} 
              min="1" 
              max="10" 
            />
          </label>

          {diceSides.map((sides, index) => (
            <label key={index}>
              Sides for Die {index + 1}:
              <input 
                type="number" 
                value={sides} 
                onChange={(e) => handleDieSidesChange(index, e.target.value)} 
                min="2" 
                max="20" 
              />
            </label>
          ))}

          {/* Add input to select how many dice to drop */}
          <label>
            Number of Dice to Drop:
            <input 
              type="number" 
              value={numDrop} 
              onChange={handleNumDropChange} 
              min="0" 
              max={numDice - 1} 
            />
          </label>
        </form>

        <canvas ref={canvasRef}></canvas> {/* Canvas for Chart */}
      </header>
    </div>
  );
}

export default App;
