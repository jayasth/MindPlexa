import React, { useEffect, useState } from 'react';
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
import styles from './ProjectProgress.module.css';
import { createClient } from '@/utils/supabase/supabaseClient';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProjectDataPoint {
  name: string;
  progress: number;
}

const ProjectProgress = () => {
  const [projectData, setProjectData] = useState<ProjectDataPoint[]>([]);

  useEffect(() => {
    const fetchProjectData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('canvases')
        .select('id, name')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching project data:', error);
        return;
      }

      // Fetch node counts for each canvas
      const canvasesWithNodeCounts = await Promise.all(
        data.map(async (canvas) => {
          const { count } = await supabase
            .from('nodes')
            .select('*', { count: 'exact', head: true })
            .eq('canvas_id', canvas.id);

          return {
            ...canvas,
            nodeCount: count || 0
          };
        })
      );

      // Calculate progress (this is a simplistic approach)
      const processedData = canvasesWithNodeCounts.map((canvas) => ({
        name: canvas.name,
        progress: Math.min(100, canvas.nodeCount * 5) // 5% progress per node, max 100%
      }));

      setProjectData(processedData);
    };

    fetchProjectData();
  }, []);

  const data = {
    labels: projectData.map((project) => project.name),
    datasets: [
      {
        label: 'Project Progress',
        data: projectData.map((project) => project.progress),
        backgroundColor: 'rgba(152, 159, 240, 0.5)',
        borderColor: 'rgb(152, 159, 240)',
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
        max: 100,
        ticks: {
          font: {
            size: 10
          },
          callback: function (value) {
            return value + '%';
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
    <Card title="Project Progress" className={styles.progressCard}>
      <div className={styles.chartContainer}>
        <Bar data={data} options={options} />
      </div>
    </Card>
  );
};

export default ProjectProgress;
