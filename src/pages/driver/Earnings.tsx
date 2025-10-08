import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  CreditCard,
  Banknote,
  Wallet,
  Target,
  Clock,
  Receipt
} from 'lucide-react';

const Earnings = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisWeek');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Mock earnings data
  const earningsStats = {
    today: 245.50,
    thisWeek: 1540.25,
    thisMonth: 6240.80,
    totalEarnings: 15240.75,
    pendingPayments: 320.50,
    completedPayments: 14920.25,
    averagePerRide: 22.80,
    totalRides: 1247,
    taxableIncome: 13716.68
  };

  // Weekly earnings breakdown
  const weeklyData = [
    { day: 'Monday', base: 120, surge: 45, tips: 15, total: 180 },
    { day: 'Tuesday', base: 150, surge: 55, tips: 25, total: 230 },
    { day: 'Wednesday', base: 140, surge: 35, tips: 20, total: 195 },
    { day: 'Thursday', base: 180, surge: 80, tips: 30, total: 290 },
    { day: 'Friday', base: 200, surge: 120, tips: 40, total: 360 },
    { day: 'Saturday', base: 220, surge: 160, tips: 45, total: 425 },
    { day: 'Sunday', base: 190, surge: 140, tips: 35, total: 365 }
  ];

  // Monthly comparison
  const monthlyData = [
    { month: 'Jan', earnings: 4250, rides: 185 },
    { month: 'Feb', earnings: 4680, rides: 201 },
    { month: 'Mar', earnings: 5120, rides: 224 },
    { month: 'Apr', earnings: 4890, rides: 215 },
    { month: 'May', earnings: 5340, rides: 234 },
    { month: 'Jun', earnings: 6240, rides: 274 }
  ];

  // Earnings breakdown by type
  const earningsBreakdown = [
    { name: 'Base Fare', value: 65, amount: 9906.49, color: '#3B82F6' },
    { name: 'Surge Pricing', value: 25, amount: 3810.19, color: '#10B981' },
    { name: 'Tips', value: 8, amount: 1219.26, color: '#F59E0B' },
    { name: 'Bonuses', value: 2, amount: 304.81, color: '#8B5CF6' }
  ];

  // Transaction history
  const transactions = [
    {
      id: 'TXN001',
      date: '2024-03-15',
      type: 'ride_earnings',
      description: 'Ride #R156 - Airport Transfer',
      amount: 45.50,
      status: 'completed',
      paymentMethod: 'card'
    },
    {
      id: 'TXN002',
      date: '2024-03-15',
      type: 'tip',
      description: 'Tip from Sarah Johnson',
      amount: 8.00,
      status: 'completed',
      paymentMethod: 'cash'
    },
    {
      id: 'TXN003',
      date: '2024-03-15',
      type: 'surge_bonus',
      description: 'Surge pricing bonus - Peak hours',
      amount: 12.25,
      status: 'completed',
      paymentMethod: 'digital'
    },
    {
      id: 'TXN004',
      date: '2024-03-14',
      type: 'ride_earnings',
      description: 'Ride #R155 - Downtown to Mall',
      amount: 22.75,
      status: 'pending',
      paymentMethod: 'wallet'
    },
    {
      id: 'TXN005',
      date: '2024-03-14',
      type: 'weekly_bonus',
      description: 'Weekly completion bonus',
      amount: 50.00,
      status: 'completed',
      paymentMethod: 'digital'
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'ride_earnings': return DollarSign;
      case 'tip': return Banknote;
      case 'surge_bonus': return TrendingUp;
      case 'weekly_bonus': return Target;
      default: return Receipt;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return CreditCard;
      case 'cash': return Banknote;
      case 'wallet': return Wallet;
      case 'digital': return CreditCard;
      default: return DollarSign;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600">Track your income and payment history</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <Receipt className="mr-2 h-4 w-4" />
            Tax Summary
          </Button>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earningsStats.today}</div>
            <p className="text-xs text-muted-foreground">
              +15% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earningsStats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">
              ${earningsStats.thisWeek / 7} avg/day
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earningsStats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((earningsStats.thisMonth / new Date().getDate()) * 10) / 10} avg/day
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earningsStats.totalEarnings}</div>
            <p className="text-xs text-muted-foreground">
              {earningsStats.totalRides} rides completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="tax">Tax Info</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Earnings Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Earnings Breakdown</CardTitle>
                <CardDescription>
                  Daily earnings with base fare, surge, and tips
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value: string | number | (string | number)[], name: string) => [`$${value}`, name]} />
                    <Bar dataKey="base" stackId="a" fill="#3B82F6" name="Base Fare" />
                    <Bar dataKey="surge" stackId="a" fill="#10B981" name="Surge" />
                    <Bar dataKey="tips" stackId="a" fill="#F59E0B" name="Tips" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
                <CardDescription>
                  Earnings growth over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: string | number | (string | number)[], name: string) => [name === 'earnings' ? `$${value}` : value, name === 'earnings' ? 'Earnings' : 'Rides']} />
                    <Line type="monotone" dataKey="earnings" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${earningsStats.pendingPayments}</div>
                <p className="text-xs text-muted-foreground">
                  Processing within 24hrs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                <Wallet className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${earningsStats.completedPayments}</div>
                <p className="text-xs text-muted-foreground">
                  Ready for withdrawal
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg per Ride</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${earningsStats.averagePerRide}</div>
                <p className="text-xs text-muted-foreground">
                  Based on all rides
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings Breakdown</CardTitle>
                <CardDescription>
                  Income distribution by source
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={earningsBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {earningsBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: string | number | (string | number)[]) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Breakdown Details */}
            <Card>
              <CardHeader>
                <CardTitle>Income Sources</CardTitle>
                <CardDescription>
                  Detailed breakdown of earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earningsBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.value}% of total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Complete record of your earnings and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="period">Period:</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="thisWeek">This Week</SelectItem>
                      <SelectItem value="thisMonth">This Month</SelectItem>
                      <SelectItem value="lastMonth">Last Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="payment">Payment:</Label>
                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const TransactionIcon = getTransactionIcon(transaction.type);
                    const PaymentIcon = getPaymentMethodIcon(transaction.paymentMethod);
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-1 h-3 w-3 text-gray-400" />
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <TransactionIcon className="h-4 w-4 text-gray-500" />
                            <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{transaction.description}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <PaymentIcon className="h-4 w-4 text-gray-500" />
                            <span className="capitalize">{transaction.paymentMethod}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${transaction.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Information</CardTitle>
                <CardDescription>
                  Important tax-related information for your earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Gross Income (2024)</span>
                  <span className="text-sm">${earningsStats.totalEarnings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Platform Fees</span>
                  <span className="text-sm">-${(earningsStats.totalEarnings * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Vehicle Expenses (Est.)</span>
                  <span className="text-sm">-${(earningsStats.totalEarnings * 0.15).toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center font-medium">
                  <span>Taxable Income</span>
                  <span>${earningsStats.taxableIncome}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Documents</CardTitle>
                <CardDescription>
                  Download your tax forms and summaries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  1099-NEC Form (2024)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Annual Tax Summary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Expense Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Mileage Log
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Earnings;
