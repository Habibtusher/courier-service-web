import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThermalLabelModal } from '@/components/ThermalLabelModal';
import { Package, Store, User, MapPin, Calculator, Printer, Building2, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface MerchantOption {
  id: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  address: string;
  district: string;
  deliveryCharge: number;
  codCharge: number;
}

interface BranchOption {
  id: string;
  name: string;
  code: string;
}

export const NewBooking: React.FC = () => {
  const [merchants, setMerchants] = useState<MerchantOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');

  // Branch Selection
  const [originBranchId, setOriginBranchId] = useState<string>('');
  const [destinationBranchId, setDestinationBranchId] = useState<string>('');

  // Sender Fields
  const [senderName, setSenderName] = useState('Alice Smith');
  const [senderPhone, setSenderPhone] = useState('+1 555-0100');
  const [senderAddress, setSenderAddress] = useState('123 Market St, San Francisco, CA');

  // Recipient Fields
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [district, setDistrict] = useState('New York');
  const [thana, setThana] = useState('Downtown Thana');

  // Item Specs
  const [parcelType, setParcelType] = useState('Package');
  const [weight, setWeight] = useState('1.5');
  const [qty, setQty] = useState('1');
  const [declaredValue, setDeclaredValue] = useState('100.00');
  const [codAmount, setCodAmount] = useState('100.00');
  const [specialInstruction, setSpecialInstruction] = useState('Handle with care - Call before delivery');
  const [remarks, setRemarks] = useState('');

  // Auto-calculated rates
  const [deliveryFee, setDeliveryFee] = useState('12.50');
  const [codRatePct, setCodRatePct] = useState('1.5');

  // Modal & Response State
  const [submitting, setSubmitting] = useState(false);
  const [createdParcel, setCreatedParcel] = useState<any | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    fetchMerchants();
    fetchBranches();
  }, []);

  const fetchMerchants = async () => {
    try {
      const res: any = await api.get('/merchants');
      if (res.success && Array.isArray(res.data)) {
        setMerchants(res.data);
      }
    } catch (_err) {}
  };

  const fetchBranches = async () => {
    try {
      const res: any = await api.get('/branches');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setBranches(res.data);
        setOriginBranchId(res.data[0].id);
        setDestinationBranchId(res.data[1]?.id || res.data[0].id);
      }
    } catch (_err) {}
  };

  const handleMerchantSelect = (merchantId: string) => {
    setSelectedMerchantId(merchantId);
    const m = merchants.find((m) => m.id === merchantId);
    if (m) {
      setSenderName(m.businessName);
      setSenderPhone(m.mobile);
      setSenderAddress(m.address);
      setDeliveryFee(m.deliveryCharge.toString());
      setCodRatePct(m.codCharge.toString());
    }
  };

  // Financial Auto-Calculations
  const parsedDeliveryFee = parseFloat(deliveryFee) || 0;
  const parsedCodAmount = parseFloat(codAmount) || 0;
  const parsedCodRate = parseFloat(codRatePct) || 0;
  const calculatedCodFee = (parsedCodAmount * parsedCodRate) / 100;
  const totalCollectible = parsedDeliveryFee + parsedCodAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !recipientName || !recipientAddress || !district) {
      toast.error('Please fill in required fields (Sender, Recipient, Address, District).');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        merchantId: selectedMerchantId || undefined,
        originBranchId: originBranchId || undefined,
        destinationBranchId: destinationBranchId || undefined,
        senderName,
        senderPhone,
        senderAddress,
        recipientName,
        recipientPhone,
        recipientAddress,
        district,
        thana,
        parcelType,
        specialInstruction,
        remarks,
        weight: parseFloat(weight) || 1.0,
        qty: parseInt(qty) || 1,
        declaredValue: parseFloat(declaredValue) || undefined,
        deliveryFee: parsedDeliveryFee,
        codAmount: parsedCodAmount,
      };

      const res: any = await api.post('/parcels', payload);
      if (res.success && res.data) {
        toast.success(`Consignment ${res.data.cnNumber || res.data.trackingNumber} booked successfully!`);
        setCreatedParcel({
          ...res.data,
          merchantName: merchants.find((m) => m.id === selectedMerchantId)?.businessName,
        });
        setShowPrintModal(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to book parcel');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" /> Core Consignment Booking Engine
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Full-featured booking form taking origin/destination hubs, Thana/Upazila, parcel type, instructions, and real-time fee calculations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Main Booking Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Merchant & Branch Routing Card */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="p-4 pb-3 border-b">
              <CardTitle className="text-xs font-bold uppercase flex items-center gap-2 text-slate-800">
                <Building2 className="w-4 h-4 text-primary" /> Hub Routing & Merchant Account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Select Merchant Account (Optional)</label>
                <select
                  value={selectedMerchantId}
                  onChange={(e) => handleMerchantSelect(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold mt-1"
                >
                  <option value="">Manual / General Customer Entry</option>
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.businessName} (Owner: {m.ownerName}) - Fee: ৳{m.deliveryCharge.toFixed(2)}, COD: {m.codCharge}%
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Origin Branch / Hub *</label>
                  <select
                    value={originBranchId}
                    onChange={(e) => setOriginBranchId(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold mt-1"
                    required
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Destination Branch / Hub *</label>
                  <select
                    value={destinationBranchId}
                    onChange={(e) => setDestinationBranchId(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold mt-1"
                    required
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sender & Recipient Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Sender Box */}
            <Card className="bg-white border shadow-sm">
              <CardHeader className="p-4 pb-2 border-b">
                <CardTitle className="text-xs font-extrabold uppercase text-slate-600 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" /> Sender Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Sender Name *</label>
                  <Input
                    placeholder="e.g. Alice Smith"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="mt-1 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Sender Mobile *</label>
                  <Input
                    placeholder="+1 555-0100"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="mt-1 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Sender Address</label>
                  <Input
                    placeholder="Street, City, State"
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recipient Box */}
            <Card className="bg-white border shadow-sm">
              <CardHeader className="p-4 pb-2 border-b">
                <CardTitle className="text-xs font-extrabold uppercase text-slate-600 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" /> Receiver / Recipient Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Receiver Name *</label>
                  <Input
                    placeholder="e.g. Bob Johnson"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="mt-1 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Receiver Mobile *</label>
                  <Input
                    placeholder="+1 555-0199"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="mt-1 text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">District *</label>
                    <Input
                      placeholder="e.g. New York"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="mt-1 font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Thana / Upazila</label>
                    <Input
                      placeholder="e.g. Downtown Thana"
                      value={thana}
                      onChange={(e) => setThana(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Receiver Address *</label>
                  <Input
                    placeholder="House/Street address"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="mt-1 text-xs"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consignment Specifications & Instructions */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-xs font-extrabold uppercase text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-600" /> Specifications & Special Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Parcel Type</label>
                  <select
                    value={parcelType}
                    onChange={(e) => setParcelType(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-2.5 py-2 text-xs font-semibold mt-1"
                  >
                    <option value="Package">Package</option>
                    <option value="Document">Document</option>
                    <option value="Fragile">Fragile / Glassware</option>
                    <option value="Liquid">Liquid Items</option>
                    <option value="Box">Box Container</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Weight (KG)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Quantity (PCS)</label>
                  <Input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">COD Amount (৳)</label>
                  <Input
                    type="number"
                    step="1"
                    value={codAmount}
                    onChange={(e) => setCodAmount(e.target.value)}
                    className="mt-1 font-bold text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Declared Value</label>
                  <Input
                    type="number"
                    step="1"
                    value={declaredValue}
                    onChange={(e) => setDeclaredValue(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Special Instructions</label>
                  <Input
                    placeholder="e.g. Call before delivery, handle with care..."
                    value={specialInstruction}
                    onChange={(e) => setSpecialInstruction(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Remarks / Internal Notes</label>
                  <Input
                    placeholder="Operational remarks for dispatch operators..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 3: Auto-Calculated Summary & Submit Actions */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white shadow-xl border border-slate-800/80 sticky top-20 overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-800/80 bg-slate-950/90">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-sky-400" /> Rate Auto-Calculations
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Real-time delivery charges and collectible totals
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium">Delivery Charge (৳)</label>
                <Input
                  type="number"
                  step="0.5"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white font-mono text-base"
                />
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Base Delivery Charge:</span>
                  <span className="font-mono font-bold text-white">৳{parsedDeliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>COD Amount:</span>
                  <span className="font-mono font-bold text-white">৳{parsedCodAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>COD Charge Rate ({parsedCodRate}%):</span>
                  <span className="font-mono text-emerald-400">৳{calculatedCodFee.toFixed(2)}</span>
                </div>
              </div>

              {/* Total Collectible Box */}
              <div className="p-4 bg-primary/40 rounded-xl border border-blue-500/40 text-center space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                  TOTAL COLLECTIBLE AMOUNT
                </div>
                <div className="text-3xl font-extrabold font-mono text-white">
                  ৳{totalCollectible.toFixed(2)}
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold gap-2 shadow-lg"
              >
                {submitting ? (
                  'Booking Consignment...'
                ) : (
                  <>
                    <Printer className="w-5 h-5" /> Save & Print Label
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Thermal Label Modal Preview */}
      <ThermalLabelModal
        open={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        parcel={createdParcel}
      />
    </div>
  );
};

export default NewBooking;
