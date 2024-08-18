import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Card from '@/ui/Card/Card';
import styles from './CanvasUsageChart.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CanvasUsageChart = () => {
  // Replace with actual data fetching logic
  const data = {
    labels: ['Canvas 1', 'Canvas 2', 'Canvas 3', 'Canvas 4', 'Canvas 5'],
    datasets: [
      {
        label: 'Number of Nodes',
        data: [12, 19, 3, 5, 2],
        backgroundColor: 'rgba(152, 159, 240, 0.6)',
        borderColor: 'rgba(152, 159, 240, 1)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };

  return (
    <Card title="Canvas Usage" className={styles.usageCard}>
      <div className={styles.chartContainer}>
        <Bar data={data} options={options} />
      </div>
    </Card>
  );
};

export default CanvasUsageChart;
