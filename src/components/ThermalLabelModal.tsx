import React from 'react';
import { createPortal } from 'react-dom';
import { Barcode } from './Barcode';
import { Button } from './ui/Button';
import { Printer, X, Truck, MapPin, Package } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ThermalLabelModalProps {
  open: boolean;
  onClose: () => void;
  parcel: {
    cnNumber: string;
    senderName: string;
    senderPhone: string;
    senderAddress: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    district: string;
    weight: number;
    qty?: number;
    deliveryFee: number;
    codAmount: number;
    createdAt?: string;
    merchantName?: string;
  } | null;
}

export const ThermalLabelModal: React.FC<ThermalLabelModalProps> = ({ open, onClose, parcel }) => {
  if (!open || !parcel) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalCollectible = (parcel.codAmount || 0) + (parcel.deliveryFee || 0);

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden animate-fadeIn my-6 print:shadow-none print:border-none print:rounded-none print:max-w-none print:w-full">
        {/* Screen Header (Hidden during print) */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center print:hidden border-b">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Printer className="w-4 h-4 text-sky-400" /> Thermal Printer Preview (4" x 6" Shipping Label)
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4" x 6" Thermal Label Body Container */}
        <div className="p-6 bg-white text-black font-sans space-y-4 border-4 border-black m-2 rounded-lg print:border-2 print:m-0">
          {/* Header Bar */}
          <div className="flex justify-between items-center border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-black text-white rounded">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-extrabold text-xl tracking-tighter">SWIFTCOURIER</h2>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-700">EXPRESS DISPATCH</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-500">DATE</div>
              <div className="text-xs font-bold font-mono">{formatDate(parcel.createdAt || new Date().toISOString())}</div>
            </div>
          </div>

          {/* Barcode Section */}
          <div className="py-2 border-b-2 border-black bg-slate-50 rounded text-center">
            <Barcode value={parcel.cnNumber} width={2.2} height={45} />
          </div>

          {/* Sender & Receiver Split */}
          <div className="grid grid-cols-2 gap-3 border-b-2 border-black pb-3">
            {/* FROM */}
            <div className="pr-2 border-r border-slate-400">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">FROM (SENDER)</div>
              <div className="font-bold text-sm">{parcel.merchantName || parcel.senderName}</div>
              <div className="text-xs">{parcel.senderPhone}</div>
              <div className="text-xs text-slate-700 leading-tight mt-1">{parcel.senderAddress}</div>
            </div>

            {/* TO */}
            <div className="pl-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">TO (RECIPIENT)</div>
              <div className="font-extrabold text-base text-black">{parcel.recipientName}</div>
              <div className="text-xs font-bold text-black">{parcel.recipientPhone}</div>
              <div className="text-xs text-slate-900 leading-tight mt-1 font-medium">{parcel.recipientAddress}</div>
            </div>
          </div>

          {/* Destination District & Specs */}
          <div className="grid grid-cols-2 gap-2 border-b-2 border-black pb-3 items-center">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">DESTINATION DISTRICT</div>
              <div className="text-lg font-black uppercase tracking-wide bg-black text-white px-2 py-1 rounded inline-block mt-0.5">
                {parcel.district || 'GENERAL'}
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs font-bold flex justify-between">
                <span className="text-slate-500">WEIGHT:</span>
                <span className="font-mono">{parcel.weight} KG</span>
              </div>
              <div className="text-xs font-bold flex justify-between">
                <span className="text-slate-500">QTY:</span>
                <span className="font-mono">{parcel.qty || 1} PCS</span>
              </div>
            </div>
          </div>

          {/* Financial Settlement Box */}
          <div className="bg-slate-100 p-3 rounded border-2 border-black flex justify-between items-center">
            <div>
              <div className="text-[10px] font-black uppercase text-slate-700">COLLECTIBLES (COD + FEE)</div>
              <div className="text-2xl font-black font-mono tracking-tight text-black">
                ৳{totalCollectible.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-600">COD: ৳{parcel.codAmount.toFixed(2)}</div>
              <div className="text-[10px] font-bold text-slate-600">FEE: ৳{parcel.deliveryFee.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Screen Footer Buttons (Hidden during print) */}
        <div className="p-4 bg-slate-50 border-t flex justify-end gap-3 print:hidden">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
          <Button onClick={handlePrint} className="bg-primary text-white font-bold gap-2">
            <Printer className="w-4 h-4" /> Print Thermal Label
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
