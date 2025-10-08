import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RideBarChartProps {
  data: { hour: string; rides: number }[];
}

export default function RideBarChart({ data }: RideBarChartProps) {
  return (
    <Card className="glass">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5 text-blue-600" />
          Ride Volume by Hour
        </CardTitle>
        <Badge variant="outline" className="text-xs">
          24 Hour View
        </Badge>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="rides" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
