import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Mail, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const statusColors = {
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  refunded: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

// Mock data
const mockPayment = {
  id: '1',
  transactionId: 'TXN-2024-001234',
  invoiceNumber: 'INV-2024-001234',
  date: '2024-02-03T10:30:00',
  member: {
    id: '1',
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Apt 4B, New York, NY 10001',
  },
  amount: 99.00,
  tax: 8.91,
  total: 107.91,
  type: 'membership',
  status: 'completed' as const,
  paymentMethod: 'credit_card',
  cardLast4: '4242',
  description: 'Monthly Premium Membership',
  billingPeriod: {
    start: '2024-02-01',
    end: '2024-02-29',
  },
  items: [
    {
      description: 'Premium Membership - Monthly',
      quantity: 1,
      unitPrice: 99.00,
      total: 99.00,
    },
  ],
};

export function PaymentDetail() {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In real app, generate and download PDF
    console.log('Downloading invoice...');
  };

  const handleSendEmail = () => {
    // In real app, send email with invoice
    console.log('Sending invoice via email...');
  };

  return (
    <div className="space-y-6">
      {/* Header - Hidden on print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/payments')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Payment Details
            </h1>
            <p className="text-gray-400 mt-2">Transaction #{mockPayment.transactionId}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleSendEmail}
            variant="outline"
            className="border-dark-700 text-gray-300 hover:bg-dark-800"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Invoice
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="border-dark-700 text-gray-300 hover:bg-dark-800"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
      <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm print:bg-white print:border-gray-300">
        <CardContent className="p-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white print:text-black">INVOICE</h2>
              <p className="text-gray-400 mt-1 print:text-gray-600">
                #{mockPayment.invoiceNumber}
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-white print:text-black">SD Fitness</h3>
              <p className="text-gray-400 text-sm mt-1 print:text-gray-600">
                456 Fitness Avenue
                <br />
                Los Angeles, CA 90001
                <br />
                contact@sdfitness.com
                <br />
                +1 (555) 987-6543
              </p>
            </div>
          </div>

          <Separator className="my-6 print:bg-gray-300" />

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3 print:text-gray-600">
                BILL TO
              </h4>
              <div className="text-white print:text-black">
                <p className="font-semibold">{mockPayment.member.name}</p>
                <p className="text-sm text-gray-400 print:text-gray-600 mt-1">
                  {mockPayment.member.email}
                </p>
                <p className="text-sm text-gray-400 print:text-gray-600">
                  {mockPayment.member.phone}
                </p>
                <p className="text-sm text-gray-400 print:text-gray-600 mt-2">
                  {mockPayment.member.address}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-400 print:text-gray-600">Invoice Date:</span>
                  <p className="text-white font-semibold print:text-black">
                    {new Date(mockPayment.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400 print:text-gray-600">Payment Method:</span>
                  <p className="text-white font-semibold print:text-black capitalize">
                    {mockPayment.paymentMethod.replace('_', ' ')} ****{mockPayment.cardLast4}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400 print:text-gray-600">Status:</span>
                  <div className="mt-1">
                    <Badge className={cn(statusColors[mockPayment.status], 'print:bg-green-100 print:text-green-800 print:border-green-300')}>
                      {mockPayment.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6 print:bg-gray-300" />

          {/* Billing Period */}
          {mockPayment.billingPeriod && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-2 print:text-gray-600">
                BILLING PERIOD
              </h4>
              <p className="text-white print:text-black">
                {new Date(mockPayment.billingPeriod.start).toLocaleDateString()} -{' '}
                {new Date(mockPayment.billingPeriod.end).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700 print:border-gray-300">
                  <th className="text-left py-3 text-sm font-semibold text-gray-400 print:text-gray-600">
                    DESCRIPTION
                  </th>
                  <th className="text-center py-3 text-sm font-semibold text-gray-400 print:text-gray-600">
                    QTY
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-400 print:text-gray-600">
                    UNIT PRICE
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-400 print:text-gray-600">
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockPayment.items.map((item, index) => (
                  <tr key={index} className="border-b border-dark-800 print:border-gray-200">
                    <td className="py-4 text-white print:text-black">{item.description}</td>
                    <td className="py-4 text-center text-white print:text-black">
                      {item.quantity}
                    </td>
                    <td className="py-4 text-right text-white print:text-black">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-4 text-right text-white font-semibold print:text-black">
                      ${item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-gray-400 print:text-gray-600">
                <span>Subtotal:</span>
                <span className="text-white print:text-black">${mockPayment.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400 print:text-gray-600">
                <span>Tax (9%):</span>
                <span className="text-white print:text-black">${mockPayment.tax.toFixed(2)}</span>
              </div>
              <Separator className="print:bg-gray-300" />
              <div className="flex justify-between text-xl font-bold">
                <span className="text-white print:text-black">Total:</span>
                <span className="text-white print:text-black">${mockPayment.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-dark-800 print:border-gray-300">
            <p className="text-sm text-gray-400 text-center print:text-gray-600">
              Thank you for your business! For any questions, contact us at support@sdfitness.com
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info - Hidden on print */}
      <div className="grid gap-6 md:grid-cols-2 print:hidden">
        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Member Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm text-gray-400">Member ID</label>
              <p className="text-white font-mono">{mockPayment.member.id}</p>
            </div>
            <Button
              onClick={() => navigate(`/members/${mockPayment.member.id}`)}
              variant="outline"
              className="w-full border-dark-700 text-gray-300 hover:bg-dark-800"
            >
              View Member Profile
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm text-gray-400">Transaction ID</label>
              <p className="text-white font-mono text-sm">{mockPayment.transactionId}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Payment Type</label>
              <p className="text-white capitalize">{mockPayment.type.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Processed At</label>
              <p className="text-white">
                {new Date(mockPayment.date).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
