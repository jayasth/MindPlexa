import React from 'react';
import { useEffect, useState } from 'react';
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
import { createClient } from '@/utils/supabase/supabaseClient';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CanvasDataPoint {
  date: string;
  count: number;
}

interface CanvasData {
  created_at: string;
}

const CanvasUsageChart = () => {
  const [canvasData, setCanvasData] = useState<CanvasDataPoint[]>([]);

  useEffect(() => {
    const fetchCanvasData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('canvases')
        .select('created_at')
        .order('created_at');

      if (error) {
        console.error('Error fetching canvas data:', error);
        return;
      }

      const processedData = processCanvasData(data as CanvasData[]);
      setCanvasData(processedData);
    };

    fetchCanvasData();
  }, []);

  const processCanvasData = (data: CanvasData[]): CanvasDataPoint[] => {
    // Group by month
    const groupedByMonth = data.reduce<Record<string, number>>(
      (acc, canvas) => {
        const date = new Date(canvas.created_at);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
      },
      {}
    );

    // Convert to array format for chart
    return Object.entries(groupedByMonth).map(([date, count]) => ({
      date,
      count
    }));
  };

  const data = {
    labels: canvasData.map((item) => item.date),
    datasets: [
      {
        label: 'Canvases Created',
        data: canvasData.map((item) => item.count),
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
    <Card title="Canvas Usage Over Time" className={styles.usageCard}>
      <div className={styles.chartContainer}>
        <Bar data={data} options={options} />
      </div>
    </Card>
  );
};

export default CanvasUsageChart;
