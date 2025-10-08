import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Car } from 'lucide-react';

interface DriverAreaChartProps {
  data: { date: string; activeDrivers: number }[];
}

export default function DriverAreaChart({ data }: DriverAreaChartProps) {
  return (
    <Card className="glass lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5 text-purple-600" />
          Driver Activity Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="activeDrivers" stroke="#a78bfa" fill="#ede9fe" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
