import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ECGDataPoint } from '../types';

interface ECGChartProps {
  data: ECGDataPoint[];
  color?: string;
  height?: number;
}

export const ECGChart: React.FC<ECGChartProps> = ({ data, color = "#ef4444", height = 200 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="time" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ display: 'none' }}
            formatter={(value: number) => [value.toFixed(2) + ' mV', 'Voltage']}
          />
          <Line 
            type="monotone" 
            dataKey="voltage" 
            stroke={color} 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false} // Performance optimization for frequent updates
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
