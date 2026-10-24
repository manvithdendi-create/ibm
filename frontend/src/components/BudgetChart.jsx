import { 
  PieChart, Pie, Cell, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

const CATEGORY_COLORS = {
  transportation: '#3b82f6',
  accommodation: '#8b5cf6',
  food: '#f97316',
  activities: '#22c55e',
  local_transport: '#ec4899',
  miscellaneous: '#6b7280',
}

const CATEGORY_LABELS = {
  transportation: 'Transportation',
  accommodation: 'Accommodation',
  food: 'Food & Dining',
  activities: 'Activities',
  local_transport: 'Local Transport',
  miscellaneous: 'Miscellaneous',
}

export function BudgetChart({ breakdown, currency, formatCurrency }) {
  if (!breakdown || breakdown.total === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No budget data available</p>
      </div>
    )
  }

  const formatCurrencyFn = formatCurrency || ((amount, curr) => {
    const symbols = {
      USD: '$', EUR: '€', GBP: '£', JPY: '¥',
      CHF: 'CHF ', CAD: 'C$', AUD: 'A$', CNY: '¥',
      INR: '₹', BRL: 'R$', MXN: '$', IDR: 'Rp',
      THB: '฿', VND: '₫', KRW: '₩', SGD: 'S$',
      HKD: 'HK$', NZD: 'NZ$', ZAR: 'R', PEN: 'S/',
      AED: 'د.إ'
    }
    const symbol = symbols[curr] || curr + ' '
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  })

  const chartData = [
    { name: 'Transportation', value: breakdown.transportation || 0, key: 'transportation' },
    { name: 'Accommodation', value: breakdown.accommodation || 0, key: 'accommodation' },
    { name: 'Food & Dining', value: breakdown.food || 0, key: 'food' },
    { name: 'Activities', value: breakdown.activities || 0, key: 'activities' },
    { name: 'Local Transport', value: breakdown.local_transport || 0, key: 'local_transport' },
    { name: 'Miscellaneous', value: breakdown.miscellaneous || 0, key: 'miscellaneous' },
  ].filter(item => item.value > 0)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-gray-600 text-sm">{formatCurrencyFn(item.value, currency)}</p>
          <p className="text-gray-500 text-xs mt-1">
            {breakdown.total > 0 ? `${((item.value / breakdown.total) * 100).toFixed(1)}% of total` : ''}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Pie Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.key]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical" 
              align="right" 
              verticalAlign="middle"
              iconType="circle"
              iconSize={8}
              formatter={(name) => {
                const entry = chartData.find(d => d.name === name)
                return entry ? `${name} (${formatCurrencyFn(entry.value, currency)})` : name
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Horizontal */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis type="number" tickFormatter={(value) => formatCurrencyFn(value, currency)} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100} 
              tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }} 
              axisLine={false} 
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
              maxBarSize={30}
            >
              {chartData.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={CATEGORY_COLORS[entry.key]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend List */}
      <div className="grid grid-cols-2 gap-2">
        {chartData.map((entry) => (
          <div 
            key={entry.key} 
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: CATEGORY_COLORS[entry.key] }} 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{entry.name}</p>
              <p className="text-xs text-gray-500">{formatCurrencyFn(entry.value, currency)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{formatCurrencyFn(entry.value, currency)}</p>
              <p className="text-xs text-gray-500">
                {breakdown.total > 0 ? `${((entry.value / breakdown.total) * 100).toFixed(1)}%` : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}