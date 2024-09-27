import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Card from '@/ui/Card/Card';
import styles from './NodeTypeDistribution.module.css';
import { createClient } from '@/utils/supabase/supabaseClient';

ChartJS.register(ArcElement, Tooltip, Legend);

interface NodeTypeDataPoint {
  type: string;
  count: number;
}

const NodeTypeDistribution = () => {
  const [nodeTypeData, setNodeTypeData] = useState<NodeTypeDataPoint[]>([]);

  useEffect(() => {
    const fetchNodeTypeData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('nodes')
        .select('type')
        .not('type', 'is', null);

      if (error) {
        console.error('Error fetching node type data:', error);
        return;
      }
      const countByType = data.reduce<Record<string, number>>((acc, node) => {
        if (node.type) {
          acc[node.type] = (acc[node.type] || 0) + 1;
        }
        return acc;
      }, {});

      const processedData = Object.entries(countByType).map(
        ([type, count]) => ({ type, count })
      );
      setNodeTypeData(processedData);
    };

    fetchNodeTypeData();
  }, []);

  const data = {
    labels: nodeTypeData.map((item) => item.type),
    datasets: [
      {
        data: nodeTypeData.map((item) => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <Card title="Node Type Distribution" className={styles.distributionCard}>
      <div className={styles.chartContainer}>
        <Pie data={data} options={options} />
      </div>
    </Card>
  );
};

export default NodeTypeDistribution;
