import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RevenueLineChartProps {
  data: { date: string; revenue: number }[];
  timeRange: string;
}

export default function RevenueLineChart({ data, timeRange }: RevenueLineChartProps) {
  return (
    <Card className="glass">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Revenue Trends
        </CardTitle>
        <Badge variant="outline" className="text-xs">
          {timeRange === '7d' ? 'Weekly' : timeRange === '30d' ? 'Monthly' : 'Daily'} View
        </Badge>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#4ade80" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
